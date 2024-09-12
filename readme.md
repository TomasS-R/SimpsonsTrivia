<div align="center">

# Trivia Simpsons 🍩

[![NodeJS](https://img.shields.io/badge/node-V20.9.0-success?color=yellow&logo=node.js&style=for-the-badge)](https://nodejs.org/)
[![Npm](https://img.shields.io/badge/npm-V10.1.0-success?color=red&label=npm&logo=npm&style=for-the-badge)](https://www.npmjs.com/)
[![Nodemon](https://img.shields.io/badge/nodemon-V3.1.4-success?color=76d04b&label=nodemon&logo=nodemon&style=for-the-badge)](https://www.nodemon.io/)
[![Jest](https://img.shields.io/badge/jest-V29.7.0-success?color=c21325&label=Jest&logo=Jest&style=for-the-badge)](https://www.npmjs.com/)
[![Express](https://img.shields.io/badge/express-V4.20.0-success?color=0d1117&label=express&logo=express&style=for-the-badge)](https://expressjs.com/)

[![Actions](https://img.shields.io/static/v1?style=for-the-badge&message=Actions&color=555&logo=githubactions&logoColor=3333&label=)](https://docs.github.com/en/actions)
[![Supabase](https://img.shields.io/static/v1?style=for-the-badge&message=Supabase&color=555&logo=supabase&logoColor=3333&label=)](https://supabase.com/)
[![Render](https://img.shields.io/static/v1?style=for-the-badge&message=Render&color=555&logo=Render&logoColor=3333&label=)](https://render.com/)
[![Jest](https://img.shields.io/static/v1?style=for-the-badge&message=Jest&color=555&logo=jest&logoColor=3333&label=)](https://jest.com/)

![OpenSource](https://img.shields.io/badge/-open%20source-informational?style=for-the-badge)
![Free](https://img.shields.io/badge/-free-success?style=for-the-badge)

</div>

<div align="center"><img src="./media/homerDonut.png" width="300" height="300"></div>

<div align= "center" >

### Este proyecto es un trabajo universitario presentado en la materia DevOps de la universidad de palermo.

</div>

# 🤓 Objetivo

### Implementar diferentes herramientas en un proyecto que contemple el correcto funcionamiento de un servicio en la nube.

### Esto nos va a servir para poder controlar y verificar el funcionamiento del mismo asi como tambien analizar las metricas, los testeos entre tantas otras cosas

# 🙋‍♂️ Preguntas y Respuestas

<details close><summary><h2>De que trata el proyecto? 🤔</h2></summary>

### El proyecto contempla la creacion de una trivia usando una frases de los simpsons, la idea es adivinar la mayor cantidad de personajes en base a las frases brindadas en cada ronda.

### El mismo cuenta con una base de datos que almacena la informacion de los jugadores/participantes.

</details>

<details close><summary><h2>Que recursos se usaron? 🛠️</h2></summary>

### Se usaron diferentes herramientas las cuales son:

- **Servidor:** Node, Express, Nodemon, NPM 

- **Base de datos:** Supabase (Postgres)

- **Testing:** Jest

- **Host:** Render

</details>

<details close><summary><h2>Funcionalidades</h2></summary>

- [x] Consultar frases iconicas y famosas de la serie

- [x] Acceder a los diferentes endpoints

- [x] Consultar todos los personajes

- [ ] Posibilidad de jugar, sumar puntos (ranking)

- [ ] Consultar a que capitulo/temporada pertenece la frase

</details>

<details close><summary><h2>Quienes participaron? 👨‍💻</h2></summary>

- #### Back end: Tomás Saint Romain

- #### Front end: 👀

</details>

# 📖 Documentacion

###### Por mas que parezca tentador por favor no se coma la documentacion 🤤

### Clonar el repositorio:

``` bash
git clone https://github.com/TomasS-R/SimpsonsTrivia
```

### Instalar los requerimientos:

``` bash 
npm install
```

### Correr el proyecto en local:
``` bash
nodemon --env-file .env src/routes/routes.js
```
### O tambien puedes usar:
``` bash
npm run start
```

## Variables de entorno 💡

<summary><h3>Base de datos</h3></summary>

> [!IMPORTANT]
> Al correr este proyecto puedes agregar las siguientes variables de entorno al archivo .env (debes crear este archivo, o cambiarle el nombre al archivo .env.template) ya sea que lo corras de forma local o en la nube ☁️ si completas los campos debes cambiar la variable `CONNECTPOSTGRES` y colocarla en `True` ya que si no, no tomara las variables de la Base de datos.

Variables de entorno para la conexion con postgress

| Nombre | Valor default | Descripcion |
| - | - | - |
| DATABASEUSER | - | Campo usuario de la base de datos |
| DATABASEPASS | Tu constraseña | La contraseña de la base de datos |
| DATABASEHOST| - | El host que te provee la base de datos|
| DATABASEPORT| - | El puerto que te provee|
| DATABASENAME| postgress | El nombre que te provee|

<summary><h3>Puerto</h3> <h5>(donde correra la aplicacion)</h5></summary>

> [!NOTE]
> Por defecto si no tiene valor correra en el puerto 3000

`PORT=`

<summary><h3>Host</h3> <h5>(donde se aloja la aplicacion)</h5></summary>

> [!NOTE]
> Por defecto tiene 'localhost:' debes cambiarlo al subirlo a la nube

`HOST`

<summary><h3>JWT</h3> <h5>(Seguridad login)</h5></summary>

> [!NOTE]
> JWT_SECRET es para generar un json web token este lo debes generar tu mismo, puedes combinar letras y numeros o usar un generador de contraseñas

`JWT_SECRET=`

<summary><h3>CONNECTPOSTGRES</h3></h3> <h5>(conexion a base de datos)</h5></summary>

> [!NOTE]
> Por defecto si no tiene valor asignado esta en `False`, en caso de haber cargado las variables colocarlo en `True`

`CONNECTPOSTGRES=`

### Testing

Para realizar testing del proyecto ejecutar el siguiente comando:

``` bash 
npm test
```
Esto ejecutara los tests que se encuentran dentro de la carpeta tests.

# 📚 Mucha mas Documentacion

#### En este archivo podras encontrar todo el instructivo relaccionado al proyecto en si.

#### Para mas info del proyecto y comprender mejor el codigo dirigirse a la documantacion correspondiente ->  (proximamente)

# 🤩 Te gusto el proyecto?

#### Regalame una estrella ⭐ es gratis!

#### Me agradaria saber que te gusto y ademas asi sabre que el proyecto te sirvio y fue de utilidad para ti!

# 🎬 Creditos

#### Las frases y la info para crear este proyecto fueron obtenidas gracias a la [wiki de los simpsons](https://simpsons.fandom.com/es/wiki/Simpson_Wiki_en_Espa%C3%B1ol:Portada)

# 📝 Licencia

#### Este proyecto está bajo licencia. Consulte el archivo [Licencia](license) para más detalles.