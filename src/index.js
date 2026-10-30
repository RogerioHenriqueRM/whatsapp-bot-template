require("dotenv").config();

const {
  iniciarWhatsApp,
  encerrarWhatsApp,
} = require(
  "./services/whatsapp.service"
);


async function iniciar() {
  try {
    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "       WHATSAPP BOT TEMPLATE",
    );

    console.log(
      "=========================================",
    );

    console.log("");

    await iniciarWhatsApp();

  } catch (erro) {
    console.error(
      "[BOT] Não foi possível iniciar:",
      erro,
    );

    process.exit(1);
  }
}


let encerrando =
  false;


async function encerrar(
  sinal,
) {
  if (encerrando) {
    return;
  }

  encerrando =
    true;

  console.log(
    `\n[BOT] Encerrando. Sinal: ${sinal}`,
  );

  try {
    await encerrarWhatsApp();
  } catch (
    erro
  ) {
    console.error(
      "[BOT] Erro ao encerrar WhatsApp:",
      erro,
    );
  }

  process.exit(0);
}


process.on(
  "SIGINT",
  () => {
    encerrar(
      "SIGINT",
    );
  },
);


process.on(
  "SIGTERM",
  () => {
    encerrar(
      "SIGTERM",
    );
  },
);


process.on(
  "unhandledRejection",
  (erro) => {
    console.error(
      "[BOT] Promise rejeitada:",
      erro,
    );
  },
);


process.on(
  "uncaughtException",
  (erro) => {
    console.error(
      "[BOT] Erro não tratado:",
      erro,
    );

    process.exit(1);
  },
);


iniciar();

