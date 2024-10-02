# Changelog

## Version 0.5.4: - 2024-10-01 -

### Modificado:
   - Modificado el puerto del [dockerfile](./Dockerfile) en produccion para que lo detecte de las variables de entorno.

## Version 0.5.3: - 2024-10-01 -

### Modificado
   - Modificado el archivo [app.js](./src/app.js) para su correcto deploy.
   - Reconfigurado el archivo [routes](./src/routes/routes.js) para un mejor manejo y evitar problemas en el deploy

## Version 0.5.2: - 2024-10-01 -

### Modificado
   - Redeploy en render

## Version 0.5.1: - 2024-10-01 -

### Modificado
   - Comando npm start modificado para correcto deploy. Archivo [package](package.json).

## Version 0.5.0: - 2024-10-01 -

### Modificado
   - Se corrigio el error que se producia al iniciar la aplicacion al ejecutar node src/app.js y hacia que se cayera a los minutos de haber realizado el deploy. Archivo [package](package.json).
   - Configuracion de passport mejorada y arreglada en [passportConfig](./src/account/passportConfig.js).
   - Inicializado passport al correr la aplicacion en [app](./src/app.js).

## Version 0.4.9d, 0.4.9b, 0.4.9a y 0.4.9c: - 2024-09-30 -

### Modificado
   - Commit de correccion del archivo [release](.github/workflows/release.yml)

## Version 0.4.9: - 2024-09-30 -

### Modificado
   - Nombre del archivo changelog a CHANGELOG

## Version 0.4.8, 0.4.7, 0.4.5 y 0.4.4: - 2024-09-30 -

### Modificado
   - Commit de correccion del archivo [release](.github/workflows/release.yml)

## Version 0.4.6: - 2024-09-30 -

### Modificado
   - Commit de correccion del archivo [release](.github/workflows/release.yml)
   - Ruta host del servidor

## Version 0.4.3: - 2024-09-30 -

### Modificado
   - Archivo de [release](.github/workflows/release.yml).
   - La ruta al ingresar a la home de la api.

## Version 0.4.2: - 2024-09-30 -

> [!IMPORTANT]
> A partir de esta actualizacion se trabajara en obtener metricas usando sentry y se mejorara la seguridad de la api para hacerla mas robusta en cuestiones de seguridad.

### Agregado
   - Dependencias eslint, @eslint/js, globals, express-rate-limit, passport, passport-jwt y passport-local en [package](./package.json)
   - Se creo el archivo [eslint](eslint.config.mjs) el cual contiene la configuracion de eslint para el proyecto.
   - Instalada la dependencia CORS para realizar solicitudes sin problema.
   - Configurado CORS en el archivo [app](./src/app.js).
   - El comando npm lint al archivo [Workflows](./.github/workflows/node.js.yml).
   - Mas de 350 [frases](./src/scrapQuotes/quotes_simpson.csv) añadidas al archivo.
   - Archivo [passportConfig](./src/account/passportConfig.js) para la autenticacion y proteccion de rutas.
   - Se limitaron la cantidad de solicitudes a realizar para controlar mejor la seguridad de la api.
   - Se crearon las funciones [getUserByEmail](./src/dbFiles/queries.js) y [getUserById](./src/dbFiles/queries.js) para la autenticacion mediante passport.
   - Archivo [securityRoutes](./src/routes/securityRoutes.js) para manejar la seguridad de las rutas adecuadamente.
   - Medidas de fuerza bruta y limites de intentos a las rutas para evitar colapsar la api.
   - Archivo [release](.github/workflows/release.yml) que se encarga de hacer una release automaticamente cuando el commit contiene un tag asignado, el workflow se encarga de colocar la ultima version del changelog en la release.
   - URLHOST en las variables de entorno del archivo [env](.env).
   - Sistema de roles, se creo un sistema basado en roles para poder acceder a diferentes puntos de los endpoints, el sistema es jerarquico y se implementaron medidas de seguridad adicionales a las rutas.
   - Archivo [rolesManager](./src/account/roles/rolesManager.js) clase que se encarga de manejar los roles, asi como tambien las comprobaciones y jerarquia.
   - Archivo [roleMiddleware](./src/account/roles/roleMiddleware.js) se encarga de comprobar si el usuario tiene o no los permisos necesarios para poder realizar consultas/cambios.

### Modificado
   - Ahora al solicitar las frases por personaje mostrara la cantidad total de frases que tiene ese determinado personaje.
   - Readme correcciones varias y agregados nueva info
   - Se modificaron los archivos los cuales eslint sugeria arreglos o configuraciones adicionales
   - Se arreglaron nombres de personajes
   - Se optimizo el archivo [Docker](./Dockerfile)
   - Se mejoro el archivo de la documentacion de [swagger](./src/routes/apiRoutesDoc.yaml)

## Version 0.4.1: - 2024-09-24 -
### Modificado
   - Se mejoro el changelog siguiendo las recomendaciones de [Keepachangelog](https://keepachangelog.com/es-ES)
   - Mejorado la descripcion al ejecutar en produccion
   - Mejorado el readme

## Version 0.4.0: - 2024-09-24 -
### Agregado
   - Estado de la api en vivo: a partir de esta version en el archivo [Readme](./readme.md) se podra visualizar el estado de la api, si esta activa o esta caida.
   - Agregada la documentacion via swagger
   - Se creo el archivo [swaggerDocs](./src/routes/swaggerDocs.js) el cual contiene las librerias para correr la documentacion y la conexion con los archivos respectivos.
   - Se agregaron las dependencias swagger-ui-express y yamljs al proyecto en el archivo [package](./package.json)
   - Agregada la ruta /quotesbycharacter/:characterId (solicita el id del personaje) se agrego una nueva funcion en [triviaControllers](./src/controllers/triviaControllers.js) y en [queries](./src/dbFiles/queries.js)
   - Sa agregaron las funciones para obtener los personajes
   - Agregada la ruta /characters para obtener todos los personajes con su respectivo id

### Modificado
   - Se movio el archivo [apiRoutesDoc](./src/routes/apiRoutesDoc.yaml) dentro de la carpeta [routes](./src/routes)
   - Corregida la ruta /random-quote

### Eliminado
   - Se quito un test repetido

## Version 0.3.9: - 2024-09-20 -
### Agregado
   - Creado flujo de preguntas con respuestas
   - Se agrego la ruta /random/quote la cual contiene una frase, el id de la frase y 4 opciones de respuestas (3 incorrectas + 1 correcta).
   - Agregado 1 test nuevo en [queries.test.js](./tests/queries.test.js) el cual realiza las comprobaciones de si el procedimiento random quote es correcto

### Modificado
   - Mejorado los logs de la conexion a la base de datos agregados emojis para una mejora visual

## Version 0.3.8: - 2024-09-19 -
### Modificado
   - El registro y el login: a partir de esta actualizacion el usuario que se registre debera colocar username, email y password para poder ingresar. Al momento de mostrar los usuarios se mostrara el username para no revelar datos sensibles como puede ser el email.

## Version 0.3.7: - 2024-09-18 -
### Agregado
   - Creada la ruta de health check para verificar el estado de la api [routes.js](./src/routes/routes.js)

## Version 0.3.6: -- 2024-09-18 --
### Modificado
   - Arregladas las versiones de las acciones debido a warnings en el deploy hacia render en el archivo [node.js.yml](.github/workflows/node.js.yml)

## Version 0.3.5: - 2024-09-18 -
### Modificado
   - Arreglado descripcion de la ruta home en [routes.js](./src/routes/routes.js)

## Version 0.3.4: - 2024-09-18 -
### Agregado
   - Agregado deploy automatico a render (Actions) al realizar un commit hacia github [node.js.yml](.github/workflows/node.js.yml)

## Version 0.3.3: - 2024-09-17 -
### Agregado
   - Se agrego la variable de entorno NODE_ENV al archivo [.env.template](.env.template)
   - Se creo el archivo [dockerfile](./Dockerfile)
   - Se creo el archivo [docker-compose.yml](./docker-compose.yml)

### Modificado
   - Mejorado la logica en [app.js](./src/app.js)
   - Mas informacion sobre docker en el [readme](readme.md)

## Version 0.3.2: - 2024-09-11 -
### Modificado
   - Se corrigió el flujo de actions

### Eliminado
   - Se elimino el archivo node.js.yaml

## Version 0.3.1: - 2024-09-11 -
### Agregado
   - Se agrego el archivo node.js.yaml

## Version 0.3.0: - 2024-09-11 -
### Modificado
   - Se corrigió el archivo readme

## Version 0.2.0: - 2024-09-11 -
### Agregado
   - Se agrego la carpeta media para subir imagenes, gif, etc...
   - Se agrego la libreria jest para pruebas unitarias.
   - Se agrego la carpeta tests junto con un archivo (queries.test.js) el cual realiza las pruebas unitarias.
   - Se agregó el archivo character_simpsons para los personajes en la DB
   - Se agregó el archivo quotes_simspon contiene las frases de la serie para la DB
   - Se agrego el archivo .env.template
   - Se agregaron/mejoraron los codigos de error al registrarse en el archivo register.js
   - Se agrego el archivo apiRoutesDoc.yaml el cual contiene la informacion de las rutas y como comunicarse con ellas de manera correcta, asi como tambien las respuestas a recibir de las mismas.
   - El proyecto cuenta con licensia MIT
   - Agregada la libreria axios

### Modificado
   - Se mejoro y perfecciono el archivo app.js dando a entender cuando se trabaja en local y en la nube.
   - Se actualizo la version de express de la 4.19.2 a la 4.20.0
   - Simplificada la logica de iniciar el proyecto
   - Se modifico el host en el archivo app para que se pueda modificar el host de manera rapida y que aparezca correctamente al correr el proyecto.
   - Se movio la logica de las rutas al archivo triviaControllers.
   - Mas informacion en el archivo readme.

### Eliminado
   - Se elimino y se remplazo los archivos changelog por changelog.md y license por license.md para poder documentar en el formato markdown

## Version 0.1.0:  - 2024-08-28 -
### Agregado
   - Primer release
