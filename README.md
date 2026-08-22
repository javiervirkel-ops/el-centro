# El Centro

App del viaje a Mykonos (2-9 septiembre 2026) + MVP de la red social "cercano".

## Estructura

```
index.html          la app entera: HTML + CSS + JS
CLAUDE.md           contexto del proyecto (Claude Code lo lee solo)
PENDIENTES.md       material escrito que todavía no entró al código
perfiles/           15 fotos de perfil, 256px
icon-192.png        íconos de la PWA
icon-512.png
bondi_andrea.jpeg   cartas del Código Secreto
gasti_alfaro.jpeg
```

## Probar

Abrir `index.html` en el navegador. No hay build ni dependencias.
Se conecta a Firebase directo, así que dos pestañas ya sincronizan entre sí.

## Deploy

Zipear todo y arrastrarlo a Netlify → "Deploy anyway".
URL: https://benevolent-croissant-fd9ea5.netlify.app

## Antes de entregar cualquier cambio

```bash
# el script no puede tener errores de sintaxis
python3 -c "import re;open('/tmp/c.js','w').write(re.findall(r'<script>(.*?)</script>',open('index.html',encoding='utf-8').read(),re.DOTALL)[0])"
node --check /tmp/c.js

# y el archivo tiene que cerrar bien
tail -c 20 index.html
```

Leer las **Trampas** en `CLAUDE.md` antes de tocar el código.
