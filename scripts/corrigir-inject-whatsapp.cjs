const fs = require("fs");
const path = require("path");

const arquivo = path.resolve(
  __dirname,
  "../node_modules/whatsapp-web.js/src/Client.js"
);

if (!fs.existsSync(arquivo)) {
  throw new Error(
    `Client.js não encontrado em: ${arquivo}`
  );
}

let conteudo = fs.readFileSync(
  arquivo,
  "utf8"
);

const backup = `${arquivo}.backup`;

if (!fs.existsSync(backup)) {
  fs.copyFileSync(
    arquivo,
    backup
  );

  console.log(
    "[PATCH] Backup criado:",
    backup
  );
}


/*
 * =====================================================
 * PATCH 1
 * Corrige espera por window.Debug.VERSION
 * =====================================================
 */

const antigo1 = `        let start = Date.now();
        let timeout = this.options.authTimeoutMs;
        let res = false;
        while (start > Date.now() - timeout) {
            res = await this.pupPage.evaluate(
                'window.Debug?.VERSION != undefined',
            );
            if (res) {
                break;
            }
            await new Promise((r) => setTimeout(r, 200));
        }
        if (!res) {
            throw 'auth timeout';
        }`;

const novo1 = `        try {
            await this.pupPage.waitForFunction(
                'window.Debug?.VERSION != undefined',
                {
                    timeout: this.options.authTimeoutMs,
                    polling: 200,
                },
            );
        } catch (_e) {
            throw 'auth timeout';
        }`;

if (conteudo.includes(antigo1)) {
  conteudo =
    conteudo.replace(
      antigo1,
      novo1
    );

  console.log(
    "[PATCH] Polling de autenticação corrigido."
  );
} else if (
  conteudo.includes(
    "waitForFunction(\n                'window.Debug?.VERSION != undefined'"
  )
) {
  console.log(
    "[PATCH] Correção de autenticação já aplicada."
  );
} else {
  throw new Error(
    "Não foi possível localizar o bloco de autenticação."
  );
}


/*
 * =====================================================
 * PATCH 2
 * Corrige espera por window.WWebJS
 * =====================================================
 */

const antigo2 = `                    let start = Date.now();
                    let res = false;
                    while (start > Date.now() - 30000) {
                        // Check window.WWebJS Injection
                        res = await this.pupPage.evaluate(
                            'window.WWebJS != undefined',
                        );
                        if (res) {
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 200));
                    }
                    if (!res) {
                        throw 'ready timeout';
                    }`;

const novo2 = `                    try {
                        await this.pupPage.waitForFunction(
                            'window.WWebJS != undefined',
                            {
                                timeout: 30000,
                                polling: 200,
                            },
                        );
                    } catch (_e) {
                        throw 'ready timeout';
                    }`;

if (conteudo.includes(antigo2)) {
  conteudo =
    conteudo.replace(
      antigo2,
      novo2
    );

  console.log(
    "[PATCH] Polling de WWebJS corrigido."
  );
} else if (
  conteudo.includes(
    "waitForFunction(\n                            'window.WWebJS != undefined'"
  )
) {
  console.log(
    "[PATCH] Correção de WWebJS já aplicada."
  );
} else {
  throw new Error(
    "Não foi possível localizar o bloco WWebJS."
  );
}


/*
 * =====================================================
 * PATCH 3
 * Registra framenavigated antes do primeiro inject()
 * =====================================================
 */

const antigo3 = `        await this.inject();
        this.pupPage.on('framenavigated', async (frame) => {
            if (frame.url().includes('post_logout=1') || this.lastLoggedOut) {
                this.emit(Events.DISCONNECTED, 'LOGOUT');
                await this.authStrategy.logout();
                await this.authStrategy.beforeBrowserInitialized();
                await this.authStrategy.afterBrowserInitialized();
                this.lastLoggedOut = false;
            }
            await this.inject();
        });`;

const novo3 = `        this.pupPage.on('framenavigated', async (frame) => {
            if (frame.url().includes('post_logout=1') || this.lastLoggedOut) {
                this.emit(Events.DISCONNECTED, 'LOGOUT');
                await this.authStrategy.logout();
                await this.authStrategy.beforeBrowserInitialized();
                await this.authStrategy.afterBrowserInitialized();
                this.lastLoggedOut = false;
            }

            await this.inject();
        });

        await this.inject();`;

if (conteudo.includes(antigo3)) {
  conteudo =
    conteudo.replace(
      antigo3,
      novo3
    );

  console.log(
    "[PATCH] Evento framenavigated movido antes do inject."
  );
} else {
  const posListener =
    conteudo.indexOf(
      "this.pupPage.on('framenavigated'"
    );

  const posInject =
    conteudo.lastIndexOf(
      "await this.inject();"
    );

  if (
    posListener !== -1 &&
    posInject !== -1 &&
    posListener < posInject
  ) {
    console.log(
      "[PATCH] Ordem do framenavigated já corrigida."
    );
  } else {
    throw new Error(
      "Não foi possível localizar o bloco framenavigated."
    );
  }
}


fs.writeFileSync(
  arquivo,
  conteudo,
  "utf8"
);

console.log("");
console.log(
  "[PATCH] Correção do whatsapp-web.js concluída."
);
console.log(
  "[PATCH] Arquivo:",
  arquivo
);
