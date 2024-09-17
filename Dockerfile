# 
## Stage dev 💻
#
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# 
## Stage build 🛠️
#
FROM dev AS build

# Limpiar dependencias de desarrollo e instalar solo las de producción
RUN npm prune --production

# 
## Stage prod 🚀
#
FROM node:20-alpine AS prod

# Establecer NODE_ENV en production
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiar los archivos necesarios desde la etapa de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

COPY .env ./

# Exponer el puerto en el que la aplicación escucha
EXPOSE ${PORT}

# Comando para ejecutar la aplicación
CMD ["npm", "start"]