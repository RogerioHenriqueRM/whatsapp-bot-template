const path =
  require("path");

const qrcode =
  require("qrcode-terminal");

const {
  Client,
  LocalAuth,
  MessageMedia,
} = require("whatsapp-web.js");

let clientePronto =
  false;

const caminhoSessao =
  process.env
    .WHATSAPP_SESSION_PATH
    ? path.resolve(
        process.env
          .WHATSAPP_SESSION_PATH,
      )
    : path.resolve(
        __dirname,
        "../../.wwebjs_auth",
      );

const clientId =
  process.env
    .WHATSAPP_CLIENT_ID ||
  "whatsapp-bot-template";

const client =
  new Client({
    authStrategy:
      new LocalAuth({
        clientId,
        dataPath:
          caminhoSessao,
      }),

    puppeteer: {
      headless:
        true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    },
  });


/*
 * =========================================
 * EVENTOS
 * =========================================
 */

client.on(
  "qr",
  (qr) => {
    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "Leia o QR Code abaixo com o WhatsApp:",
    );

    console.log(
      "=========================================",
    );

    qrcode.generate(
      qr,
      {
        small:
          true,
      },
    );
  },
);


client.on(
  "authenticated",
  () => {
    console.log(
      "[WHATSAPP] Autenticado.",
    );
  },
);


client.on(
  "loading_screen",
  (
    percent,
    message,
  ) => {
    console.log(
      `[WHATSAPP] Carregando ${percent}% - ${message}`,
    );
  },
);


client.on(
  "ready",
  () => {
    clientePronto =
      true;

    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "[WHATSAPP] Bot conectado e pronto.",
    );

    console.log(
      "=========================================",
    );
  },
);


client.on(
  "auth_failure",
  (mensagem) => {
    clientePronto =
      false;

    console.error(
      "[WHATSAPP] Falha de autenticação:",
      mensagem,
    );
  },
);


client.on(
  "disconnected",
  (motivo) => {
    clientePronto =
      false;

    console.error(
      "[WHATSAPP] Desconectado:",
      motivo,
    );
  },
);


/*
 * =========================================
 * INICIALIZAÇÃO
 * =========================================
 */

async function iniciarWhatsApp() {
  console.log(
    "[WHATSAPP] Inicializando...",
  );

  await client.initialize();
}


function estaPronto() {
  return clientePronto;
}


/*
 * =========================================
 * ENVIO DE MENSAGEM
 * =========================================
 */

async function enviarMensagem(
  destino,
  mensagem,
) {
  if (!clientePronto) {
    throw new Error(
      "O WhatsApp ainda não está pronto.",
    );
  }

  if (!destino) {
    throw new Error(
      "Destino não informado.",
    );
  }

  if (!mensagem) {
    throw new Error(
      "Mensagem não informada.",
    );
  }

  const resultado =
    await client.sendMessage(
      destino,
      mensagem,
    );

  return (
    resultado?.id
      ?._serialized ||
    null
  );
}


/*
 * =========================================
 * ENVIO DE ARQUIVO
 * =========================================
 */

async function enviarArquivo(
  destino,
  caminhoArquivo,
  legenda = "",
) {
  if (!clientePronto) {
    throw new Error(
      "O WhatsApp ainda não está pronto.",
    );
  }

  if (!destino) {
    throw new Error(
      "Destino não informado.",
    );
  }

  if (!caminhoArquivo) {
    throw new Error(
      "Arquivo não informado.",
    );
  }

  const media =
    MessageMedia.fromFilePath(
      caminhoArquivo,
    );

  const resultado =
    await client.sendMessage(
      destino,
      media,
      {
        caption:
          legenda,

        waitUntilMsgSent:
          true,
      },
    );

  return (
    resultado?.id
      ?._serialized ||
    null
  );
}


/*
 * =========================================
 * ENVIO COMO DOCUMENTO
 * =========================================
 */

async function enviarDocumento(
  destino,
  caminhoArquivo,
  legenda = "",
) {
  if (!clientePronto) {
    throw new Error(
      "O WhatsApp ainda não está pronto.",
    );
  }

  const media =
    MessageMedia.fromFilePath(
      caminhoArquivo,
    );

  const resultado =
    await client.sendMessage(
      destino,
      media,
      {
        caption:
          legenda,

        sendMediaAsDocument:
          true,

        waitUntilMsgSent:
          true,
      },
    );

  return (
    resultado?.id
      ?._serialized ||
    null
  );
}


/*
 * =========================================
 * ENCERRAMENTO
 * =========================================
 */

async function encerrarWhatsApp() {
  clientePronto =
    false;

  await client.destroy();

  console.log(
    "[WHATSAPP] Cliente encerrado.",
  );
}

function aguardarWhatsAppPronto() {
  return new Promise(
    (resolve) => {
      if (clientePronto) {
        resolve();
        return;
      }

      client.once(
        "ready",
        () => {
          resolve();
        },
      );
    },
  );
}

module.exports = {
  client,
  iniciarWhatsApp,
  encerrarWhatsApp,
  aguardarWhatsAppPronto,
  estaPronto,
  enviarMensagem,
  enviarArquivo,
  enviarDocumento,
};
