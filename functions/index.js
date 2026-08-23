const { onValueCreated } = require("firebase-functions/v2/database");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

// Limite de gasto: mantener todo en la region mas barata / default y sin memoria extra
setGlobalOptions({ maxInstances: 5 });

// Se dispara cada vez que se crea un aviso nuevo en /notif
// (lo mismo que ya usa la app para el toast/badge en primer plano)
exports.enviarPush = onValueCreated("/notif/{notifId}", async (event) => {
  const data = event.data.val();
  if (!data) return;
  if (data.push === false) return; // marcado explicitamente para no mandar push (solo toast en pantalla)

  const texto = data.texto || "";
  const emoji = data.emoji || "📣";
  const de = data.de || "";

  const db = admin.database();
  const tokensSnap = await db.ref("fcmTokens").get();
  if (!tokensSnap.exists()) return;

  const tokensObj = tokensSnap.val();
  const tokens = [];
  for (const nombre in tokensObj) {
    if (nombre === de) continue; // no avisarle a quien lo genero
    const t = tokensObj[nombre];
    if (t) tokens.push({ nombre, token: t });
  }
  if (tokens.length === 0) return;

  // Se manda SOLO data (sin bloque "notification") para que el navegador no la muestre solo
  // y quede una unica via de aviso: onBackgroundMessage en el service worker.
  const mensaje = {
    data: {
      titulo: "El Centro",
      texto: `${emoji} ${texto}`,
    },
  };

  console.log(`enviarPush: mandando a ${tokens.length} token(s): ${tokens.map(t=>t.nombre).join(', ')}`);

  const resp = await admin.messaging().sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    ...mensaje,
  });

  console.log(`enviarPush: exito=${resp.successCount} fallo=${resp.failureCount}`);
  resp.responses.forEach((r, i) => {
    if (!r.success) {
      console.log(`enviarPush: fallo para ${tokens[i].nombre} - ${r.error && r.error.code} - ${r.error && r.error.message}`);
    }
  });

  // Limpiar tokens invalidos/vencidos para no acumular basura ni gastar de mas
  const borrar = [];
  resp.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error && r.error.code;
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        borrar.push(tokens[i].nombre);
      }
    }
  });
  await Promise.all(borrar.map((nombre) => db.ref("fcmTokens/" + nombre).remove()));
});
