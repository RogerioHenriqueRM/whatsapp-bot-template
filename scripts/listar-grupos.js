require("dotenv").config();

const {
  client,
  iniciarWhatsApp,
  aguardarWhatsAppPronto,
  encerrarWhatsApp,
} = require(
  "../src/services/whatsapp.service",
);


async function listarGrupos() {
  try {
    console.log("");
    console.log(
      "=========================================",
    );

    console.log(
      "          LISTAR GRUPOS WHATSAPP",
    );

    console.log(
      "=========================================",
    );

    console.log("");

    /*
     * Inicializa o mesmo cliente
     * utilizado pelo bot.
     */
    const inicializacao =
      iniciarWhatsApp();

    await aguardarWhatsAppPronto();

    await inicializacao;

    console.log("");
    console.log(
      "[GRUPOS] Buscando grupos...",
    );

    /*
     * Não usamos client.getChats().
     *
     * getChats() tenta serializar todas
     * as conversas da conta.
     *
     * Uma conversa incompatível pode
     * fazer toda a operação falhar.
     *
     * Aqui buscamos somente os dados
     * mínimos necessários dos grupos.
     */
    const grupos =
      await client.pupPage.evaluate(
        () => {
          const colecao =
            window.require(
              "WAWebCollections",
            );

          const chats =
            colecao.Chat
              .getModelsArray();

          return chats
            .filter(
              (chat) => {
                /*
                 * Grupos possuem
                 * groupMetadata.
                 */
                return Boolean(
                  chat.groupMetadata,
                );
              },
            )
            .map(
              (chat) => {
                const id =
                  chat.id
                    ?._serialized ||
                  chat.id?.$1 ||
                  chat.id
                    ?.toString?.() ||
                  "";

                const nome =
                  chat.formattedTitle ||
                  chat.name ||
                  chat.groupMetadata
                    ?.subject ||
                  "Grupo sem nome";

                return {
                  nome,
                  id,
                };
              },
            );
        },
      );

    grupos.sort(
      (a, b) =>
        String(a.nome)
          .localeCompare(
            String(b.nome),
            "pt-BR",
          ),
    );

    console.log("");

    console.log(
      `Encontrados ${grupos.length} grupo(s).`,
    );

    console.log("");

    console.log(
      "=========================================",
    );

    for (
      const grupo of grupos
    ) {
      console.log(
        `Nome: ${grupo.nome}`,
      );

      console.log(
        `ID:   ${grupo.id}`,
      );

      console.log(
        "-----------------------------------------",
      );
    }

    console.log("");

    console.log(
      "Copie o ID completo terminado em @g.us.",
    );

    console.log("");

  } catch (erro) {
    console.error(
      "[GRUPOS] Não foi possível listar os grupos:",
      erro,
    );

    process.exitCode =
      1;

  } finally {
    try {
      await encerrarWhatsApp();
    } catch (
      erro
    ) {
      console.error(
        "[GRUPOS] Erro ao encerrar:",
        erro,
      );
    }
  }
}


listarGrupos();