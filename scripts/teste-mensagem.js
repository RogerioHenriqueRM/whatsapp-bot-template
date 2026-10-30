require("dotenv").config();

const {
  iniciarWhatsApp,
  aguardarWhatsAppPronto,
  enviarMensagem,
  encerrarWhatsApp,
} = require(
  "../src/services/whatsapp.service",
);


async function executar() {
  let inicializado =
    false;

  try {
    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "          TESTE DE MENSAGEM",
    );

    console.log(
      "=========================================",
    );

    const grupoId =
      process.env
        .WHATSAPP_GROUP_ID
        ?.trim();

    if (!grupoId) {
      throw new Error(
        "WHATSAPP_GROUP_ID não foi configurado no .env.",
      );
    }

    if (
      !grupoId.endsWith(
        "@g.us",
      )
    ) {
      throw new Error(
        "WHATSAPP_GROUP_ID não possui formato de grupo válido.",
      );
    }

    console.log(
      "[TESTE] Inicializando WhatsApp...",
    );

    /*
     * Começamos a inicialização
     * sem bloquear a criação do
     * listener do evento ready.
     */
    const inicializacao =
      iniciarWhatsApp();

    await aguardarWhatsAppPronto();

    await inicializacao;

    inicializado =
      true;

    console.log(
      "[TESTE] WhatsApp pronto.",
    );

    const mensagem = [
      "🤖 *WhatsApp Bot Template*",
      "",
      "Mensagem de teste enviada com sucesso.",
      "",
      `Data: ${new Date().toLocaleString(
        "pt-BR",
      )}`,
    ].join("\n");

    console.log(
      `[TESTE] Enviando para ${grupoId}...`,
    );

    const mensagemId =
      await enviarMensagem(
        grupoId,
        mensagem,
      );

    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "✅ MENSAGEM ENVIADA COM SUCESSO",
    );

    console.log(
      "=========================================",
    );

    console.log(
      `ID: ${mensagemId || "não informado"}`,
    );

    console.log("");

  } catch (erro) {
    console.error(
      "[TESTE] Falha:",
      erro,
    );

    process.exitCode =
      1;

  } finally {
    /*
     * Pequeno intervalo para garantir
     * que a mensagem terminou de ser
     * processada antes de fechar
     * o navegador.
     */
    if (inicializado) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500,
          ),
      );
    }

    try {
      await encerrarWhatsApp();
    } catch (
      erro
    ) {
      console.error(
        "[TESTE] Erro ao encerrar WhatsApp:",
        erro,
      );
    }
  }
}


executar();

