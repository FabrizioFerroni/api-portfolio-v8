# Backend - Portfolio Personal

Este repositorio contiene el **backend** de mi portfolio personal, desarrollado con [NestJS](https://nestjs.com/) y [MongoDB](https://www.mongodb.com/) usando [Mongoose](https://mongoosejs.com/). Su propósito es proporcionar la capa de servicios y API que respalda el frontend de mi portfolio, gestionando la información de proyectos, datos personales, mensajes de contacto y cualquier otra funcionalidad dinámica.

## Tabla de Contenidos

- [Backend - Portfolio Personal](#backend---portfolio-personal)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción](#descripción)
  - [Características](#características)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Instalación y Configuración](#instalación-y-configuración)
    - [Requisitos Previos](#requisitos-previos)
    - [Pasos](#pasos)
  - [Uso](#uso)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Contribución](#contribución)
  - [Licencia](#licencia)
  - [Contacto](#contacto)

## Descripción

El backend proporciona una API RESTful segura y organizada para consumir desde el frontend del portfolio. Administra recursos como proyectos, usuarios, y formularios de contacto. Este servicio facilita el almacenamiento persistente en una base de datos NoSQL MongoDB y el acceso a través de controladores protegidos.

## Características

- API RESTful desarrollada en NestJS.
- CRUD para proyectos, usuarios y mensajes.
- Validación y serialización de datos con `class-validator` y `class-transformer`.
- Conexión a base de datos MongoDB mediante Mongoose.
- Arquitectura modular escalable.
- Middleware y pipes personalizados.
- Posibilidad de desplegarse fácilmente con Docker.

## Tecnologías Utilizadas

- **Framework:** NestJS
- **Base de datos:** MongoDB con Mongoose
- **Lenguaje:** TypeScript
- **Herramientas:** Docker, Node.js, npm/yarn

## Instalación y Configuración

### Requisitos Previos

- Node.js v20 o superior
- MongoDB local o remoto
- Nest CLI
- Docker (opcional)

### Pasos

```bash
git clone https://github.com/tu-usuario/api-portfolio.git
cd api-portfolio
npm install
```

Copia el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus propias variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/portfolio
```

## Uso

Para levantar el servidor en modo desarrollo:

```bash
npm run start:dev
```

La API estará disponible en: [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
api-portfolio/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── projects/         # Módulo de proyectos
│   ├── users/            # Módulo de usuarios
│   └── contact/          # Módulo de formularios de contacto
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama:
   ```bash
   git checkout -b mi-nueva-característica
   ```
3. Realiza los cambios y confirma tus commits.
4. Envía una Pull Request para revisión.

> Se agradecen todas las sugerencias y mejoras que ayuden a potenciar el proyecto.

## Licencia

Distribuido bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

- **Correo:** [hola@fabriziodev.tech](mailto:hola@fabriziodev.tech)
- **GitHub:** [Fabrizio Ferroni](https://github.com/FabrizioFerroni)
