# Changelog

## Version 0.6.0: - 2024-12- -

### Agregado:
   - Archivo [deleteUsersAuth](./src/account/deleteUsersAuth.js) que elimina usuarios del sistema de Auth de supabase, este archivo se ejecuta automaticamente y elimina los usuarios anonimos que no se registraron en las ultimas 3 horas, la llamada al cronjob se encuentra en [app](./src/app.js).
   - Ruta [account](./src/views/account.ejs) se separo el login y el registro del inicio de la api, para una interfaz mas limpia, asi mismo tambien se separo para que los tokens de los usuarios se creen al momento de ingresar a una pagina especial (como la trivia).
   - Variable de entorno nueva SERVICE_ROLE_KEY en [.env](.env.template) va a servir para realizar determinadas modificaciones en nuestro proyecto que requieran una key con altos privilegios.
   - Token refresh y su configuracion en el archivo [tokenRefresh](./src/account/tokenRefresh.js).
   - Sesiones anonimas, se crean, modifican y cierran en el archivo [sessionHandler](./src/account/sessionHandler.js) que actua como middleware, este middelware se debe colocar en la ruta donde se va a usar (verifyUserSession) y tambien en el registro.
   - Conexion con Redis y manejo de conexion en el archivo [redisManager](/src/dbFiles/redisManager.js) los usuarios no registrados pasaran por auth -> redis (almacena dicha informacion temporalmente hasta el registro) -> tabla usuarios supabase.
   - Se agrego la ruta /quotes/:id/answer en el archivo [routes](./src/routes/routes.js) la cual recibe la respuesta de una pregunta/frase.
   - Creado el archivo [trivia](./src/views/trivia.ejs) para poder realizar pruebas con los datos y el frontend del juego.
   - Se agrego una nueva tabla en [userTables](./src/dbFiles/creatingTables/userTables.js) esta tabla va a guardar las imagenes de perfil de los usuarios (estas van a estar almacenadas en supabase storage).
   - Los usuarios en esta actualizacion tendran un user tag para en el futuro implementar una busqueda de usuarios de ser necesario, esto se genera en [register](./src/account/register.js) tomando como referencia el nombre del usuario.
   - Se agrego y se mejoro el uso de variables de entorno, a partir de ahora las variables de entorno se llaman 1 sola vez en el archivo [config](./config.js) para evitar llamadas repetitivas en diferentes partes del proyecto.
   - Creado el flujo del juego (usuarios registrados) con los datos de puntaje: ultimo, maximo, reciente, respuestas: correctas, incorrectas, totales, tiempo promedio en el archivo [triviaControllers](./src/controllers/triviaControllers.js) funcion *answerQuestion*. (Mas info en el [diagrama](./media/esqSimpsonsApiUserDataGame.svg)).
   - Agregadas las rutas /gameover, /user/stats (estadisticas de juego X usuario), /user/data (informacion del perfil del usuario con estadisticas de juego) en [routes](./src/routes/routes.js).
   - Libreria ioredis para el uso de upstash en [package](./package.json) y congigurado en [redisManager](./src/dbFiles/redisManager.js).
   - Archivo [queriesRedis](./src/dbFiles/queriesRedis.js) para manejar todas las consultas a travez de este archivo, actua de igual forma que el archivo de postgresSQL.

### Modificado:
   - El archivo app se modifico el applimiter para que pudiera procesar las solicitudes de JMeter sin ningun problema, a partir de ahora deberas configurar en JMeter que el encabezado sea de tipo (nombre) User-Agent y (valor) Apache-HttpClient/4.5.13 para que pueda realizar las pruebas correctamente, de otro modo saltara que haz realizado demasiadas solicitudes.
   - Archivo [fly](./fly.toml) el cual a llegar a determinado punto la aplicacion realizara un esalado automatico activando la segunda maquina virtual (VM) y se disminuyo la memoria asignada de 512 > 256 mb.
   - A partir de esta actualizacion el login y el registro no seran visibles en produccion solo estaran disponibles en local y en modo desarrollo.
   - Ahora en el archivo [register](./src/account/register.js) si un usuario se registra, automaticamente va actualizar el supabaseUserId para que no haya que crear usuarios de supabase sin sentido.
   - Se mejoro la ui del archivo [index](./src/views/index.ejs) ahora solo los usuarios en localhost van a poder realizar pruebas y cualquier usuario podra acceder a la documentacion de [swaggerDocs](./src/routes/swaggerDocs.js) desde la ruta principal.
   - Se mejoro la documentacion de las rutas en el archivo [apiRoutesDoc](./src/routes/apiRoutesDoc.yaml) y se agregaron nuevas rutas.
   - Se arreglo la consulta de getQuotesByCharacter en el archivo [queries](./src/dbFiles/queries.js) debido a que no devolvia las frases de los personajes correctamente.
   - Se arreglo la funcion getRandomQuestion en [queries](./src/dbFiles/queries.js) para que ademas de que mostrara los pesonajes tambien envie los id de cada personaje, esto permitira poder manejar y armar el juego de trivia.
   - Se establecio un nuevo sistema de seguridad para las rutas, robusteciendo el sistema ya previsto anteriormente en [securityRoutes](./src/routes/securityRoutes.js) y se redujo la cantidad de intentos de fuerza bruta de 5 a 3 intentos, asi tambien se establecio los nuevos api limiter para endpoints críticos, para el servidor, API con token y API pública.
   - Se mejoro el archivo [userTables](./src/dbFiles/creatingTables/userTables.js) ahora los nombres de las tablas se asignan al comienzo del archivo para evitar romper la estructura de las tablas y asi poder modificarlo de manera mas comoda y rapida.
   - Se mejoro el archivo [protected](./src/views/protected.ejs), para poder moverse entre los diferentes paneles, se agregaron ls estadisticas del usuario logeado asi como tambien la informacion del perfil del mismo.

### Obsoleto:
   - Se elimino la tabla users_anonimus de [userTables](./src/dbFiles/creatingTables/userTables.js)

## Version 0.5.9: - 2024-10-23 -

### Modificado:
   - Agregadas las variables de entorno supabase al [workflow](.github/workflows/node.js.yml)

## Version 0.5.8: - 2024-10-23 -

### Modificado:
   - Actualizado [package-lock](./package-lock.json)

## Version 0.5.7: - 2024-10-23 -

### Agregado:
   - Supabase Authentication: Se movio la logica y la autenticacion a supabase ya que ofrece una base solida en cuanto a seguridad para login y registro asi como tambien ofrece oAuth con otras apps.
   - Se agrego supabaseAuth en [triviaControllers](./src/controllers/triviaControllers.js) para poder obtener determinados datos de la autenticacion y asi aprobar o no a los usuarios.
   - 2 variables de entorno para la conexion con supabase SUPABASE_URL y SUPABASE_ANON_KEY
   - Se agrego informacion en el [readme](readme.md) sobre como implementar las nuevas variables de entorno.
   - Mas informacion al momento de logearse/autenticarse en [login](./src/account/login.js).
   - Dependencia Cookie Parser para manejo de tokens en login y registro.
   - Dependencia Zod para mejorar la seguridad y y las validaciones en el registro.
   - Dependencia ejs para la implementacion y manejo del login y registro.
   - [Index](./src/account/index.ejs) para poder manejar correctamente la implementacion con el front end en cuanto a login y registro.
   - Ruta logout para cerrar sesion de la cuenta y ruta protected la cual permite acceder a recursos que solo usuarios registrados/logeados (rol: user) pueden ver en [routes](./src/routes/routes.js).
   - Archivo [protected](./src/views/protected.ejs) en el se podra ver informacion solo para usuarios logeados con el rol requerido (user).
   - Se genero el archivo [authSupabase](./src/account/authSupabase.js) el cual maneja la conexion con la api de supabase.
   - La tabla user_anonimus para una futura implementacion de usuarios no logeados que quieran jugar sin tener que perder el progreso en esa sesion, tabla agregada en [userTables](./src/dbFiles/creatingTables/userTables.js).

### Modificado:
   - Se modificaron las rutas protegidas para que funcionen correctamente con supabase en [routes](./src/routes/routes.js).
   - Modificado el archivo [roleMiddleware](./src/account/roles/roleMiddleware.js) para manejar adecuadamente los roles.
   - [register](./src/account/register.js) para el uso correcto con supabase auth.
   - Memoria de la virtual machine de flyio reducida de 1024mb a 512mb para evitar costos mayores en la facturacion, cambio realizado en el archivo [fly.toml](fly.toml).
   - Mejorado la ruta home, ahora se visualiza el login y el registro en esta ruta, asi tambien se mejoro el mensaje con respecto a la redireccion de la documentacion.
   - La tabla usuarios del archivo [userTables](./src/dbFiles/creatingTables/userTables.js) se cambio el campo password_hash a supabase_user_id y de tipo UUID para conectar los usuarios creados mediante Supabase Auth a los usuarios de la tabla users_trivia.
   - Se reestructuro el archivo [userTables](./src/dbFiles/creatingTables/userTables.js) para que se puedan crear nuevas tablas sin tener que modificar parametros en otros archivos como lo era en el archivo [app](./src/app.js).
   - Se reestructuro la funcion createDatabaseTables del archivo [app](./src/app.js) para que automaticamente detecte las tablas del archivo [userTables](./src/dbFiles/creatingTables/userTables.js) de esta forma allí se pueden crear muchas tablas y el sistema automaticamente las creara en la base de datos.
   - Mejorado y arreglado un bug en [queries](./src/dbFiles/queries.js) que no reconocia las tablas al modificar el archivo userTables.

### Obsoleto:
   - Se elimino el archivo PassportConfig
   - Se quito la configuracion de JWT de las rutas protegidas
   - Se quitaron las dependencias bcryptjs, passport-jwt, passport-local, passport y se remplazaron por el sistema de Supabase.
   - Test de verificacion de email (esto lo verificara ahora de ahora en adelante supabase).

## Version 0.5.6: - 2024-10-11 -

### Agregado:
   - Dependencia swagger-themes para personalizar la documentacion de swagger (modo oscuro y mas temas) en [swaggerDocs](./src/routes/swaggerDocs.js)

### Modificado:
   - Agregados mas detalles al momento de hacer deploy y ver en la consola/terminal en [app](./src/app.js)
   - Exportada y acortada la routeapi del archivo [routes](./src/routes/routes.js)
   - Se mejoro la ruta "home" para que muestre correctamente la url segun el entorno de desarrollo en [routes](./src/routes/routes.js)
   - [docker-compose](./docker-compose.yml) mejorado
   - Se arreglo un bug que al consultar la frase y personajes devolvia siempre los mismos 3 personajes erroneos, ahora obtiene 10 personajes y de esos 10 obtiene 3 como incorrectos en el archvio [queries](./src/dbFiles/queries.js)
   - Corregida la identacion del archivo [triviaControllers](./src/controllers/triviaControllers.js)
   - Arreglados los nombres de algunos personajes en [characters_simpsons](./src/scrapQuotes/characters_simpson.csv)
   - Al ejecutar el comando npm run dev se modifico para que antes de ejecutar la api se realicen los tests correspondientes en [package](./package.json)
   - Todos los usuarios al registrarse/logearse recibiran un token, esta modificacion fue realizada en [login](./src/account/login.js) y [register](./src/account/register.js)

### Obsoleto:
   - Se retiro la implementacion del deploy en render y se transfirio definitivamente a flyio en [workflows](.github/workflows/node.js.yml)

## Version 0.5.5: - 2024-10-05 -

### Agregado:
   - Ignorar todo git mediante **/.git en el archivo [dockerignore](.dockerignore)
   - Configuracion de Sentry para su uso y reportes en el archivo [sentryConfig](./src/monitoring/sentryConfig.js)
   - Dependencias de Sentry: @sentry/node y @sentry/profiling-node al archivo [package](package.json)
   - 3 variables de entorno en [.env](.env.template) CORS_ORIGIN, URLHOST y SENTRY_DSN
   - Esquema de funcionamiento y del flujo de la api hacho con excalidraw en [readme](./readme.md) y en [svg](./media/esqSimpsonsApi.svg)
   - Archivo [fly.toml](./fly.toml) el cual contiene la configuracion para hacer el deploy en fly.io

### Modificado:
   - Optimizado el [dockerfile](./Dockerfile)
   - Agregada la estructura del proyecto en el [readme](readme.md)
   - El archivo [node](.github/workflows/node.js.yml) en el cual se realizo la configuracion para desplegar en fly.io y se comento/quito la configuracion de despliegue en render
   - Se cambio en el [dockerfile](./Dockerfile) el comando CMD a ENTRYPOINT para una mejor optimizacion
   - Realizadas varias modificaciones en el archivo [app](./src/app.js):
      - Se mejoro el manejo de CORS
      - Inicializacion de Sentry
      - Modificada la funcion de las rutas de setupRoutes > setupRoutesV1
   - Se insertaron las rutas del archivo [routes](./src/routes/routes.js) dentro de una funcion para su correcto funcionamiento al iniciarse la api.
   - Mejorada la logica y el manejo de CORS en [app](./src/app.js) a partir de ahora maneja una o varias rutas

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
