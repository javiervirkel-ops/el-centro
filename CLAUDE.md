# EL CENTRO — contexto del proyecto

App de un viaje grupal a Mykonos (2 al 9 de septiembre de 2026, 15 amigos) que además
funciona como MVP de **"cercano"**, una red social privada que estoy desarrollando.

La idea de cercano: como el Instagram original — subir fotos y stories, estar al día con
amigos y familia, conocer gente de la vida real — pero **sin publicidad, sin influencers y
sin feed algorítmico**. Estoy en Argentina, aplican las regulaciones locales.

La app en sí es un chiste interno: un partido político ficticio, "El Centro — Partido del
Pueblo del Medio", que ridiculiza por igual a izquierda y derecha.

**Hablame siempre en español rioplatense.**

**Nunca uses ni toques la cuenta de Global-e para nada de este proyecto** (git, deploys,
credenciales, config). Es la cuenta laboral del usuario y no tiene que mezclarse con este
proyecto personal. Git de este repo ya está configurado localmente con su mail personal
(`javiervirkel@gmail.com`); si hace falta configurar algo (git, Netlify, Firebase, etc.),
usar siempre cuenta/mail personal.

---

## Cómo está armado

- **Un solo archivo**: `index.html` (~3200 líneas) con HTML, CSS y JS embebidos. No hay build,
  ni npm, ni framework. Se abre y funciona.
- **Backend**: Firebase Realtime Database (SDK compat 9.23 por CDN). Sin auth: las reglas
  están en `.read: true` / `.write: true`.
- **Hosting**: Netlify. Se deploya arrastrando un zip a la web y eligiendo "Deploy anyway".
  No hay CI ni conexión con git.
- **Sin service worker, a propósito** (ver Trampas).
- Assets al lado del `index.html`: `perfiles/*.jpg` (15 avatares), `icon-192.png`,
  `icon-512.png`, y las fotos de las cartas del Código Secreto.

### Config de Firebase (ya está en el archivo)

Proyecto `mykonos-pibes---el-centro`, base
`https://mykonos-pibes---el-centro-default-rtdb.firebaseio.com`.

### Ramas de la base

| Rama | Qué guarda |
|---|---|
| `jugadores` | quién está conectado |
| `posts` | el feed. Cada post puede tener `coms` (hilo de comentarios) |
| `chat` | chat grupal, solo texto |
| `notif` | toasts en tiempo real |
| `puntos` | tabla de posiciones |
| `partida` | Código Secreto |
| `equipos` | equipos del Código Secreto |
| `tateti` | TA TE TI |
| `truco` | Truco |
| `album` + `album_orden` | Novios Panini |

### localStorage

`ec_nombre`, `ec_tablet`, `ec_chat_leido`, `ec_notifs`.

### Pantallas

Son divs `.scr`, y se muestra una sola con la clase `.on`. La navegación pasa por `goTab()`
(las 5 pestañas), `goJuego()` (los juegos) y `goSub()` (chat y detalle de post).

Pestañas: **Inicio (feed) · Juegos · Tabla · Calendario · Sortear**.

---

## TRAMPAS — leer antes de tocar nada

Estos cinco errores ya nos costaron horas. Son la razón principal de este documento.

1. **Firebase convierte los arrays en objetos.** Un array guardado vuelve como
   `{0:'a', 1:'b'}`, así que `.includes()`, `.filter()` y `.map()` explotan. Siempre normalizar:
   `const toArr = v => v ? (Array.isArray(v) ? v : Object.values(v)) : [];`

2. **Firebase rechaza `undefined`.** Un `set()` con cualquier campo en `undefined` falla
   entero y en silencio. Usar `?? null` antes de escribir. Este fue el bug de "el botón
   Aprobar no hace nada mientras Rechazar sí".

3. **Nada de service worker.** Ya hubo uno y dejaba a los celulares pegados a versiones
   viejas durante horas. Se eliminó a propósito. No reintroducirlo sin una razón muy fuerte.

4. **Una constante declarada dos veces rompe TODO el script.** Como es un solo archivo, un
   `const` duplicado tira un SyntaxError y la app entera queda muerta con la pantalla en
   blanco. Pasó varias veces.

5. **Verificar el archivo ANTES de entregarlo.** Que estén todas las funciones, que no haya
   duplicados, que cierre en `</html>` y que `node --check` pase sobre el bloque `<script>`.
   No entregar y debuggear en loop.

---

## Los 15 y sus nombres griegos

| Apodo | Nombre griego |
|---|---|
| Antonio | Tonos Fridminides |
| Javi IAS | Javos Iaschinopulos |
| Beker | Matiades Bekeros |
| Pako | Pakostoles |
| Tomi | Tomos Mindlinides |
| Javi Vir | Javos Virkelias |
| Harry | Harriclito |
| Keke | Kekos Matzkagoras |
| Litka | Kevos Litvinopulos |
| Tute | Tuton Eskuarzagoras |
| Naros | Naros Narosquides |
| MP | Morcos Plohnagoras |
| Ray | Raymonides |
| Gasti | Esternides |
| Juan | Juanos Esteineas |

Los cinco **novios** (para el álbum y el sorteo de 5 equipos): Juan, Pako, Ray, Antonio, Harry.

### Dónde va cada forma del nombre

- **Apodo** — la pastilla del header y su menú, el chat, todo el Código Secreto, todo el
  TA TE TI y todo el Truco. O sea: adentro de los juegos, donde se opera rápido.
- **Nombre griego** — todo lo demás: bienvenida, autor y comentarios del feed, noticias,
  tabla de posiciones, álbum, sorteo y rifa de camas.

En el código: `ng(apodo)` devuelve el nombre griego.

---

## Qué hace la app

### Feed (Inicio)
Tres tipos de contenido mezclados en orden cronológico inverso, **sin ranking**:
fotos, "pensamientos" (texto suelto, tipo tweet) y **noticias automáticas** de los juegos.
Todo es comentable — cada post tiene su propio hilo, que reemplaza al chat por tema.

Al publicar hay un check **"Que desaparezca en 24 horas"**. Si no se marca, el post queda
para siempre. Los efímeros se borran solos al abrir la app y cada 5 minutos. Las noticias
no vencen nunca y conservan sus comentarios.

Las noticias no tienen autor (son del sistema) y se guardan en **texto plano**: nada de HTML
adentro, porque un dispositivo con la versión vieja cacheada muestra los tags crudos.

### Chat
Grupal, **solo texto**. Las fotos van al feed. Tiene badge de no leídos.

### Juegos

**Código Secreto (Versión Pibes)** — tablero de 25 cartas en la tablet. Los capitanes ven
los colores en su celular, la tablet no. En la tablet: un toque abre la carta en grande,
doble toque la revela. Timer configurable. Gana +1 punto por jugador.

**Novios Panini** — álbum de 9 figuritas por novio. Hay que fotografiar el tatuaje de la
novia puesto en la parte del cuerpo que pide cada casilla. **NO VALE GRUPO PIBES**: tiene
que ser gente de afuera. El primero en completar suma 5 puntos, el segundo 4, y así.

**TA TE TI (Misiones del Centro)** — **un solo tablero 3×3 compartido**, sin turnos. Cada
casilla tiene una misión, con distinto target según el equipo que la agarre. Los dos equipos
pueden correr la misma casilla: el primero que la completa se la queda y al otro se le libera
la elección, sin castigo. La tablet aprueba las misiones. Tres en línea = +5 puntos.

**Truco** — contador a 30 con malas y buenas, 6 jugadores. +1 punto a cada ganador.

### Sortear
Tres modos: **1 persona** (dado 3D con las fotos girando), **2 equipos**, y
**5 equipos novios** (un novio por equipo, el resto repartido parejo al azar).

### Rifa de Sábanas
Sorteo de camas con animación de gorro y papelito. Al terminar publica el reparto completo
en el feed.

### Notificaciones (nivel 1)
Aviso del sistema y numerito en el ícono, **solo cuando la app no está en pantalla**.
Fuentes: chat, noticias de juegos, posts nuevos y comentarios en tus posts. Hay un
interruptor para silenciar en el menú. Sin push server ni service worker: si el celular
cerró la app del todo, no llega nada — es una limitación aceptada.

En iPhone las notificaciones **solo funcionan con la app instalada en la pantalla de inicio**
(iOS 16.4+). Desde una pestaña de Safari no llegan nunca.

### Admin
Clave `holis123`. Permite agregar y borrar jugadores, resetear cada juego, vaciar el feed
y poner los puntos en cero. El **modo tablet** también entra con esa clave.

---

## El viaje

| Día | Plan |
|---|---|
| Mié 2 | Llegada |
| Jue 3 | Desayuno · Playa/Casa · Asado · Centro |
| Vie 4 | Desayuno · Playa/Casa · Alemagou · **Jodita picante** |
| Sáb 5 | Desayuno · Playa/Casa · Centro |
| Dom 6 | Desayuno · Almuerzo en casa · Scorpios · **Jodita picante** |
| Lun 7 | Desayuno · Playa/Casa · Mega asado |
| Mar 8 | Desayuno · Barco · Libre |
| Mié 9 | Check out |

---

## PENDIENTES

### Listo para programar
- **Banco de misiones del TA TE TI**: cargar las 12 que están en `PENDIENTES.md` y hacer que
  el juego sortee 9 al azar por partida (hoy tiene 9 fijas viejas).
- **Novios Panini — eliminar foto propia**: quien subió una figurita tiene que poder
  eliminarla. Si la subió otro jugador, solo la puede ver — no eliminarla.
- **Consignas en el feed**: nuevo tipo de post, "consigna". Se arma parecido a un post
  normal, pero al publicarla le llega una notificación a todos ("fulano tiró una consigna")
  y abre su propio hilo de comentarios, igual que cualquier post. La app tiene que incitar a
  participar en dos momentos: (a) cuando alguien va a armar un post nuevo, ofrecerle/incitarlo
  a que sea una consigna en vez de un post común; (b) cuando ya hay una consigna activa,
  incitar a que el resto la siga/responda.

### Frenado, lo estoy pensando
- **Cuestionario del login**: 3 preguntas de 2 opciones al elegir tu nombre, que te clasifican
  como de izquierda o derecha y cierran con "tus características políticas se identifican con
  la izquierda/derecha, pero el Partido del Centro te eligió para que lo representes en este
  viaje". Es **puro chiste**, no define equipos. Las preguntas tienen que ser situaciones
  largas de convivencia (2-3 frases), con nombres del grupo. El eje del grupo:
  **derecha** = gastadores, "solo se vive una vez", pagan servicios y lujitos;
  **izquierda** = les gusta el lujo pero lo miden, se hacen los que no les sale gastar
  aunque tienen con qué, y escatiman en lo que sienten al pedo.

### Esperando material mío
- **Cartas del Código Secreto**: van 80 situaciones absurdas de a dos personas
  ("besándose en un glaciar", "cambiando figuritas en un boliche"). Yo genero las imágenes
  con IA y las subo al lado del `index.html`. Hoy hay solo 2 cartas con foto real y el resto
  son emojis de relleno.
- **Logos de los equipos**: un monstruo con látigo para Derecha y un vago fumando para
  Izquierda. Reemplazan los emojis ☭ y 🎩.

### Sin definir
- **"Facts" políticos**: que ser de un bando te dé un beneficio o un costo dentro de cada
  juego. Ideas tiradas: nacionalizar una carta neutral, tercerizar una misión, comprarle una
  casilla al rival.
- **Castigo del TA TE TI**: que el equipo ganador elija un castigo para los perdedores.
- **Video en el feed**: postergado hasta que el flujo de fotos esté probado. Va a requerir
  activar Firebase Storage, porque hoy las imágenes se guardan en base64 dentro de la base y
  con video eso no escala.

---

## Cómo trabajo

- Entregame los archivos **en un zip**, no sueltos: si bajo un archivo suelto, el navegador
  le agrega sufijos al nombre y rompe el deploy.
- **Acumulá varios cambios antes de cada deploy**, para no gastar créditos de Netlify.
- Cuando te digo una idea, **anotala; no la programes** hasta que te diga
  "programá lo pendiente".
- Verificá el archivo antes de dármelo. Nada de entregar y debuggear en loop.
