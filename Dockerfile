## Stage dev 💻
FROM node:20-alpine AS dev
WORKDIR /app

COPY package*.json ./

# Instalar dependencias y limpiar cache de npm
RUN npm ci && npm cache clean --force

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

## Stage build 🛠️
FROM dev AS build

# Limpiar dependencias de desarrollo e instalar solo las de producción
RUN npm ci --only=production && npm cache clean --force

## Stage prod 🚀
FROM node:20-alpine AS prod

# Definir argumentos que se pasarán durante la construcción
ARG DATABASEUSER DATABASEPASS DATABASEHOST DATABASEPORT DATABASENAME JWT_SECRET CONNECTPOSTGRES

# Establecer las variables de entorno
ENV DATABASEUSER=$DATABASEUSER \
    DATABASEPASS=$DATABASEPASS \
    DATABASEHOST=$DATABASEHOST \ 
    DATABASEPORT=$DATABASEPORT \
    DATABASENAME=$DATABASENAME \
    JWT_SECRET=$JWT_SECRET \
    CONNECTPOSTGRES=$CONNECTPOSTGRES \
    # Establecer NODE_ENV en production
    NODE_ENV=production \
    PORT=$PORT

WORKDIR /app

# Copiar los archivos necesarios desde la etapa de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY config.js ./config.js
COPY --from=build /app/src ./src

# Exponer el puerto en el que la aplicación escucha
EXPOSE ${PORT}

# Comando para ejecutar la aplicación
ENTRYPOINT ["npm", "start"]