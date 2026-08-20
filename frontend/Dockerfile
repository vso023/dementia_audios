# Sin nginx (indicacion del administrador del servidor: el proxy inverso
# con dominio/SSL lo maneja el a nivel de sistema, delante del puerto
# 5014). Se sirve el build de produccion con `vite preview`, que ademas
# reemplaza el rol de proxy hacia /api que antes hacia nginx (ver
# vite.config.js, seccion "preview") — un solo proceso, un solo puerto
# publicado, todo lo demas se resuelve dentro de la red interna de
# Docker.
#
# Un solo stage (no multi-stage): a diferencia de nginx, `vite preview`
# necesita el propio Vite (esta en devDependencies) presente en runtime,
# asi que no hay nada que "descartar" de node_modules despues del build.
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]
