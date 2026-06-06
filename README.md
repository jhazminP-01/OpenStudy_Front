# OpenStudy

OpenStudy es una aplicación móvil desarrollada en React Native con Expo, orientada a apoyar sesiones de estudio mediante salas colaborativas y temporizador Pomodoro.

## Descripción

La aplicación permite a los usuarios registrarse, iniciar sesión, crear salas de estudio, unirse a salas existentes y participar en sesiones Pomodoro compartidas. El proyecto fue desarrollado por sprints e integra funcionalidades relacionadas con autenticación, salas, participantes, temporizador, estadísticas y recursos visuales.

## Tecnologías utilizadas

- React Native
- Expo
- JavaScript
- Supabase
- EAS Build
- Git y GitHub

## Estructura del proyecto

```text
OpenStudy_Front/
├── assets/              # Imágenes, íconos, sonidos y recursos multimedia
├── lib.example/         # Archivo de ejemplo para configuración de Supabase
├── src/                 # Código fuente principal
├── App.js               # Componente principal de la aplicación
├── app.json             # Configuración general de Expo
├── eas.json             # Configuración para compilación con EAS
├── package.json         # Dependencias y scripts del proyecto
├── package-lock.json    # Versiones exactas de dependencias
├── README.md            # Documentación del proyecto
└── .gitignore           # Archivos excluidos del control de versiones
Organización de src
src/
├── components/      # Componentes reutilizables
├── context/         # Contextos globales de la aplicación
├── hooks/           # Hooks personalizados
├── navigation/      # Configuración de navegación
├── screens/         # Pantallas principales
├── services/        # Servicios y conexión con datos
├── styles/          # Colores, tipografía y estilos globales
└── utils/           # Funciones auxiliares y validaciones
## Instalación y ejecución

Para instalar y ejecutar el proyecto OpenStudy se deben seguir los siguientes pasos:

1. Descargar o clonar el repositorio.

```bash
git clone <URL_DEL_REPOSITORIO>
Ingresar a la carpeta del proyecto.
cd OpenStudy_Front
Instalar las dependencias del proyecto.
npm install
Ejecutar la aplicación con Expo.
npx expo start
Abrir la aplicación desde Expo Go escaneando el código QR o ejecutarla en un emulador Android.

Funcionalidades principales
Registro de usuario.
Inicio de sesión.
Creación de salas de estudio.
Listado y acceso a salas.
Temporizador Pomodoro.
Participantes dentro de una sala.
Estadísticas de estudio.
Recursos visuales y sonoros para mejorar la experiencia de usuario.
Instalación y ejecución
Instalar dependencias:
npm install
Ejecutar el proyecto:
npx expo start
Abrir la aplicación con Expo Go o un emulador Android.
Configuración de Supabase

El proyecto incluye un archivo de ejemplo en:

lib.example/supabase.example.js

Para ejecutar el proyecto con conexión real, se debe crear un archivo de configuración propio con la URL y la clave pública correspondiente de Supabase.
Por seguridad, los archivos reales de configuración no deben subirse al repositorio.

Compilación APK

Para generar una APK con Expo EAS:

npm install -g eas-cli
eas login
eas build -p android --profile preview

El archivo eas.json contiene la configuración necesaria para realizar la compilación.

Seguridad

No se incluyen archivos .env, claves privadas, contraseñas ni tokens sensibles dentro del repositorio.
El archivo .gitignore evita subir archivos innecesarios o privados como node_modules, configuraciones locales y archivos sensibles.
