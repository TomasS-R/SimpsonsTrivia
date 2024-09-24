# Changelog

# Version 0.4.0: -- /09/2024 --
### Agregado o modificado
   - Estado de la api en vivo: a partir de esta version en el archivo [Readme](./readme.md) se podra visualizar el estado de la api, si esta activa o esta caida.
   - Corregida la ruta /random-quote
   - Agregada la documentacion via swagger
   - Se movio el archivo [apiRoutesDoc](./src/routes/apiRoutesDoc.yaml) dentro de la carpeta [routes](./src/routes)
   - Se creo el archivo [swaggerDocs](./src/routes/swaggerDocs.js) el cual contiene las librerias para correr la documentacion y la conexion con los archivos respectivos.
   - Se agregaron las dependencias swagger-ui-express y yamljs al proyecto en el archivo [package](./package.json)
   - Agregada la ruta /quotesbycharacter/:characterId (solicita el id del personaje) se agrego una nueva funcion en [triviaControllers](./src/controllers/triviaControllers.js) y en [queries](./src/dbFiles/queries.js)
   - Sa agregaron las funciones para obtener los personajes
   - Agregada la ruta /characters para obtener todos los personajes con su respectivo id

### Eliminado
   - Se quito un test repetido

# Version 0.3.9: -- 20/09/2024 --
### Agregado o modificado
   - Mejorado los logs de la conexion a la base de datos agregados emojis para una mejora visual
   - Creado flujo de preguntas con respuestas
   - Se agrego la ruta /random/quote la cual contiene una frase, el id de la frase y 4 opciones de respuestas (3 incorrectas + 1 correcta).
   - Agregado 1 test nuevo en [queries.test.js](./tests/queries.test.js) el cual realiza las comprobaciones de si el procedimiento random quote es correcto

# Version 0.3.8: -- 19/09/2024 --
### Agregado o modificado
   - Modificado el registro y el login: a partir de esta actualizacion el usuario que se registre debera colocar username, email y password para poder ingresar. Al momento de mostrar los usuarios se mostrara el username para no revelar datos sensibles como puede ser el email.

# Version 0.3.7: -- 18/09/2024 --
### Agregado o modificado
   - Creado la ruta de health check para verificar el estado de la api [routes.js](./src/routes/routes.js)

# Version 0.3.6: -- 18/09/2024 --
### Agregado o modificado
   - Arregladas las versiones de las acciones debido a warnings en el deploy hacia render en el archivo [node.js.yml](.github/workflows/node.js.yml)

# Version 0.3.5: -- 18/09/2024 --
### Agregado o modificado
   - Arreglado descripcion de la ruta home en [routes.js](./src/routes/routes.js)

# Version 0.3.4: -- 18/09/2024 --
### Agregado o modificado
   - Agregado deploy automatico a render (Actions) al realizar un commit hacia github [node.js.yml](.github/workflows/node.js.yml)

# Version 0.3.3: -- 17/09/2024 --
### Agregado o modificado
   - Se agrego la variable de entorno NODE_ENV al archivo [.env.template](.env.template)
   - Se creo el archivo [dockerfile](./Dockerfile)
   - Se creo el archivo [docker-compose.yml](./docker-compose.yml)
   - Mejorado la logica en [app.js](./src/app.js)
   - Mas informacion sobre docker en el [readme](readme.md)

# Version 0.3.2: -- 11/09/2024 --
### Agregado o modificado
   - Se elimino el archivo node.js.yaml
   - Se corrigió el flujo de actions

# Version 0.3.1: -- 11/09/2024 --
### Agregado o modificado
   - Se agrego el archivo node.js.yaml

# Version 0.3.0: -- 11/09/2024 --
### Agregado o modificado
   - Se corrigió el archivo readme

## Version 0.2.0: -- 11/09/2024 --
### Agregado o modificado
   - Mas informacion en el archivo readme.
   - Se agrego la carpeta media para subir imagenes, gif, etc...
   - Se movio la logica de las rutas al archivo triviaControllers.
   - Se agrego la libreria jest para pruebas unitarias.
   - Se modifico el host en el archivo app para que se pueda modificar el host de manera rapida y que aparezca correctamente al correr el proyecto.
   - Se agrego la carpeta tests junto con un archivo (queries.test.js) el cual realiza las pruebas unitarias.
   - Se agregó el archivo character_simpsons para los personajes en la DB
   - Se agregó el archivo quotes_simspon contiene las frases de la serie para la DB
   - Se agrego el archivo .env.template
   - Se agregaron/mejoraron los codigos de error al registrarse en el archivo register.js
   - Se agrego el archivo apiRoutesDoc.yaml el cual contiene la informacion de las rutas y como comunicarse con ellas de manera correcta, asi como tambien las respuestas a recibir de las mismas.
   - Se mejoro y perfecciono el archivo app.js dando a entender cuando se trabaja en local y en la nube.
   - Se actualizo la version de express de la 4.19.2 a la 4.20.0
   - El proyecto cuenta con licensia MIT
   - Agregada la libreria axios
   - Simplificada la logica de iniciar el proyecto

### Eliminado
   - Se elimino y se remplazo los archivos changelog por changelog.md y license por license.md para poder documentar en el formato markdown

## Version 0.1.0:  -- 28/08/2024 --
   - Primer release
