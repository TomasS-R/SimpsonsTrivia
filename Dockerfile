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

# Definir argumentos que se pasarán durante la construcción
ARG DATABASEUSER
ARG DATABASEPASS
ARG DATABASEHOST
ARG DATABASEPORT
ARG DATABASENAME
ARG JWT_SECRET
ARG CONNECTPOSTGRES

# Establecer las variables de entorno
ENV DATABASEUSER=$DATABASEUSER
ENV DATABASEPASS=$DATABASEPASS
ENV DATABASEHOST=$DATABASEHOST
ENV DATABASEPORT=$DATABASEPORT
ENV DATABASENAME=$DATABASENAME
ENV JWT_SECRET=$JWT_SECRET
ENV CONNECTPOSTGRES=$CONNECTPOSTGRES

# Establecer NODE_ENV en production
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiar los archivos necesarios desde la etapa de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

# Exponer el puerto en el que la aplicación escucha
EXPOSE ${PORT}

# Comando para ejecutar la aplicación
CMD ["npm", "start"]