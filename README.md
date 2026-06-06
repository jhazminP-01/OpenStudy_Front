# OpenStudy_Front
# OpenStudy Front

OpenStudy Front es la aplicación móvil desarrollada con React Native y Expo para apoyar sesiones de estudio colaborativo mediante salas, temporizador Pomodoro, participantes, chat, sonidos ambientales, estadísticas y control básico de moderación.

Este repositorio corresponde al frontend integrado del proyecto OpenStudy. Se tomó como base la versión del Sprint 3 y se incorporaron archivos útiles de las ramas de historias de usuario individuales del Sprint 1 y Sprint 2, manteniendo una estructura organizada para revisión académica.

## 1. Información general del proyecto

| Dato | Descripción |
|---|---|
| Nombre del proyecto | OpenStudy |
| Repositorio | OpenStudy_Front |
| Tipo de aplicación | Aplicación móvil |
| Tecnología principal | React Native con Expo |
| Backend utilizado | Supabase |
| Gestión de navegación | React Navigation |
| Plataforma principal de entrega | Android |
| Estado de entrega | Código fuente integrado, organizado y comentado |

## 2. Objetivo del sistema

El objetivo de OpenStudy es permitir que los usuarios puedan organizar sesiones de estudio mediante salas colaborativas. Dentro de una sala, los participantes pueden visualizar información del grupo, usar un temporizador Pomodoro sincronizado, comunicarse mediante chat y acceder a recursos de apoyo como sonidos ambientales y estadísticas de estudio.

## 3. Funcionalidades implementadas

El proyecto integra funcionalidades desarrolladas durante los sprints del frontend. Entre las principales se encuentran:

| Funcionalidad | Descripción |
|---|---|
| Registro de usuario | Permite crear una cuenta desde la aplicación mediante un formulario de registro. |
| Inicio de sesión | Permite autenticar usuarios usando Supabase. |
| Términos y condiciones | Incluye pantallas para mostrar y aceptar condiciones de uso. |
| Pantalla de bienvenida | Presenta la entrada inicial de la aplicación. |
| Navegación principal | Organiza el flujo entre autenticación, inicio, salas, perfil y otras pantallas. |
| Creación de sala | Permite crear una sala de estudio con datos como nombre, descripción, materia y capacidad. |
| Lista de salas | Muestra salas disponibles con búsqueda, filtros y tarjetas visuales. |
| Sala creada | Confirma la creación de una sala y permite continuar al flujo correspondiente. |
| Detalle de sala | Muestra información principal de la sala, participantes y datos relacionados. |
| Participantes | Permite visualizar usuarios dentro de una sala. |
| Chat de sala | Incluye componentes para lista de mensajes, entrada de texto, burbujas y separadores de fecha. |
| Temporizador Pomodoro | Permite manejar ciclos de estudio y descanso dentro de la sala. |
| Configuración del temporizador | Permite ajustar tiempos de estudio, descanso y ciclos. |
| Sonidos ambientales | Incluye sonidos de apoyo para concentración o descanso. |
| Estadísticas | Presenta información relacionada con el avance o actividad de estudio. |
| Perfil de usuario | Permite mostrar información general del usuario. |
| Moderación | Incluye componentes para reportar usuarios, reportar mensajes y panel de moderación. |
| Manejo de conexión | Incluye un banner para indicar estado sin conexión. |
| Manejo de errores | Incluye componentes visuales para mostrar errores y confirmaciones. |

## 4. Tecnologías y dependencias principales

El proyecto usa las siguientes tecnologías y librerías principales:

| Tecnología / Librería | Uso dentro del proyecto |
|---|---|
| React Native | Desarrollo de la interfaz móvil. |
| Expo | Ejecución, configuración y compilación de la aplicación. |
| Supabase | Autenticación, base de datos y comunicación con servicios del backend. |
| React Navigation | Navegación entre pantallas. |
| Expo AV | Reproducción de sonidos ambientales. |
| Expo Notifications | Soporte para notificaciones. |
| Expo Haptics | Retroalimentación táctil. |
| Expo Network | Detección del estado de conexión. |
| Expo Linear Gradient | Apoyo visual para fondos y componentes. |
| Async Storage | Almacenamiento local cuando corresponde. |
| React Native SVG | Soporte para recursos gráficos SVG. |

Las dependencias completas están especificadas en:

```text
package.json
package-lock.json
```

## 5. Estructura general del repositorio

```text
OpenStudy_Front/
|
├── assets/
│   ├── sounds/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
|
├── lib.example/
│   └── supabase.example.js
|
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── styles/
│   └── utils/
|
├── DOCUMENTACION_ENTREGA/
│   ├── ARCHIVOS_COMENTADOS.md
│   ├── GUIA_ESTRUCTURA_CODIGO.md
│   ├── REVISION_SEGURIDAD.md
│   └── REFERENCIAS_SPRINT1/
|
├── App.js
├── app.json
├── eas.json
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 6. Descripción de carpetas principales

| Carpeta / Archivo | Descripción |
|---|---|
| `assets/` | Contiene recursos visuales y multimedia de la aplicación, como íconos, splash, favicon y sonidos. |
| `assets/sounds/` | Contiene audios usados como sonidos ambientales o sonidos del temporizador. |
| `lib.example/` | Contiene un archivo de ejemplo para configurar Supabase sin exponer credenciales reales. |
| `src/` | Contiene el código fuente principal de la aplicación. |
| `src/components/` | Contiene componentes reutilizables de interfaz, como botones, tarjetas, modales, chat, timer y moderación. |
| `src/context/` | Contiene contextos globales usados por la aplicación. |
| `src/hooks/` | Contiene hooks personalizados para reutilizar lógica de autenticación, salas, sonidos, temporizador, conexión y baneos. |
| `src/navigation/` | Contiene la navegación de la aplicación: autenticación, pestañas y navegación principal. |
| `src/screens/` | Contiene las pantallas principales de la aplicación. |
| `src/services/` | Contiene la lógica de comunicación con Supabase y servicios relacionados con usuarios, salas, mensajes, reportes y temporizador. |
| `src/styles/` | Contiene estilos globales, colores, espaciado y tipografía. |
| `src/utils/` | Contiene constantes, validadores, helpers y funciones auxiliares. |
| `DOCUMENTACION_ENTREGA/` | Contiene documentación adicional para revisión académica del código. |
| `App.js` | Componente raíz de la aplicación. |
| `index.js` | Punto de entrada del proyecto Expo/React Native. |
| `app.json` | Configuración general de Expo, nombre de la app, íconos y configuración Android. |
| `eas.json` | Configuración para compilación mediante EAS Build. |
| `package.json` | Lista dependencias, scripts y configuración base del proyecto Node/Expo. |
| `.gitignore` | Indica archivos y carpetas que no deben subirse al repositorio, como `node_modules` y configuraciones sensibles. |

## 7. Organización interna de `src`

```text
src/
|
├── components/
│   ├── common/
│   ├── layout/
│   ├── moderation/
│   └── ui/
|
├── context/
│   └── BanContext.js
|
├── hooks/
│   ├── useAmbientSound.js
│   ├── useAuth.js
│   ├── useAuthValidation.js
│   ├── useBan.js
│   ├── useCycleNotification.js
│   ├── useNetworkStatus.js
│   ├── useRooms.js
│   └── useTimer.js
|
├── navigation/
│   ├── AppNavigator.js
│   ├── AuthNavigator.js
│   └── TabNavigator.js
|
├── screens/
│   ├── auth/
│   ├── profile/
│   ├── room/
│   ├── RoomsListScreen/
│   ├── CreateRoomScreen.js
│   └── RoomCreatedScreen.js
|
├── services/
│   ├── auth.js
│   ├── bans.js
│   ├── messages.js
│   ├── profile.js
│   ├── reports.js
│   ├── rooms.js
│   └── timer.js
|
├── styles/
│   ├── authStyles.js
│   ├── colors.js
│   ├── spacing.js
│   └── typography.js
|
└── utils/
    ├── ambientSoundControl.js
    ├── constants.js
    ├── helpers.js
    ├── roomValidators.js
    └── validators.js
```

## 8. Pantallas principales

| Pantalla | Ubicación | Propósito |
|---|---|---|
| Bienvenida | `src/screens/auth/WelcomeScreen.js` | Presenta la entrada inicial a la aplicación. |
| Registro | `src/screens/auth/RegisterScreen.js` | Permite registrar nuevos usuarios. |
| Login | `src/screens/auth/LoginScreen.js` | Permite iniciar sesión. |
| Términos | `src/screens/auth/TermsScreen.js` y `TermsAndConditionsScreen.js` | Presenta términos y condiciones de uso. |
| Usuario baneado | `src/screens/auth/BannedScreen.js` | Muestra restricciones cuando corresponde. |
| Inicio | `src/screens/profile/HomeScreen.js` | Pantalla principal después de iniciar sesión. |
| Perfil | `src/screens/profile/ProfileScreen.js` | Muestra información del usuario. |
| Estadísticas | `src/screens/profile/StatsScreen.js` | Muestra avance o datos de estudio. |
| Sonidos | `src/screens/profile/SoundsScreen.js` | Permite acceder a sonidos ambientales. |
| Crear sala | `src/screens/CreateRoomScreen.js` | Permite crear una sala de estudio. |
| Sala creada | `src/screens/RoomCreatedScreen.js` | Confirma la creación de sala. |
| Lista de salas | `src/screens/RoomsListScreen/index.js` | Muestra salas disponibles con búsqueda y filtros. |
| Sala | `src/screens/room/RoomScreen/index.js` | Integra información de sala, chat, participantes y temporizador. |
| Chat | `src/screens/room/ChatScreen.js` | Pantalla o sección relacionada con mensajes de la sala. |
| Participantes | `src/screens/room/ParticipantsScreen.js` | Muestra los usuarios dentro de una sala. |
| Detalle de sala | `src/screens/room/RoomDetailsScreen.js` | Muestra datos específicos de una sala. |

## 9. Servicios principales

| Servicio | Ubicación | Función |
|---|---|---|
| Autenticación | `src/services/auth.js` | Centraliza registro, inicio de sesión y cierre de sesión. |
| Salas | `src/services/rooms.js` | Gestiona creación, consulta, unión y detalle de salas. |
| Mensajes | `src/services/messages.js` | Gestiona mensajes del chat de sala. |
| Temporizador | `src/services/timer.js` | Controla estado, inicio, pausa y configuración del Pomodoro. |
| Perfil | `src/services/profile.js` | Gestiona datos relacionados con el perfil del usuario. |
| Reportes | `src/services/reports.js` | Gestiona reportes de usuarios o mensajes. |
| Baneos | `src/services/bans.js` | Maneja restricciones o validaciones relacionadas con usuarios baneados. |

## 10. Hooks principales

| Hook | Función |
|---|---|
| `useAuth.js` | Maneja el estado de autenticación del usuario. |
| `useAuthValidation.js` | Centraliza validaciones de formularios de autenticación. |
| `useRooms.js` | Maneja lógica de consulta y gestión de salas. |
| `useTimer.js` | Controla el estado del temporizador Pomodoro en la interfaz. |
| `useAmbientSound.js` | Maneja reproducción y control de sonidos ambientales. |
| `useCycleNotification.js` | Gestiona notificaciones relacionadas con ciclos del temporizador. |
| `useNetworkStatus.js` | Detecta si el dispositivo tiene conexión a internet. |
| `useBan.js` | Maneja validaciones relacionadas con restricciones de usuario. |

## 11. Componentes reutilizables destacados

| Componente / Carpeta | Propósito |
|---|---|
| `src/components/ui/Button.js` | Botón reutilizable de la interfaz. |
| `src/components/ui/Input.js` | Campo de entrada reutilizable. |
| `src/components/ui/Card.js` | Tarjeta visual reutilizable. |
| `src/components/ui/ErrorModal.js` | Modal para mostrar errores. |
| `src/components/ui/ConfirmModal.js` | Modal de confirmación. |
| `src/components/ui/InAppNotification.js` | Notificación interna de la app. |
| `src/components/ui/Chat/` | Componentes visuales del chat. |
| `src/components/ui/Timer/` | Componentes del temporizador Pomodoro. |
| `src/components/moderation/` | Componentes para reportes y moderación. |
| `src/components/common/OfflineBanner.js` | Aviso visual para estado sin conexión. |
| `src/components/common/LoadingScreen.js` | Pantalla de carga reutilizable. |

## 12. Flujo general de la aplicación

El flujo principal del sistema puede resumirse de la siguiente forma:

```text
Inicio de la aplicación
        |
        v
Validación de sesión
        |
        +-- Usuario sin sesión -> Pantallas de autenticación
        |
        +-- Usuario autenticado -> Navegación principal
                                  |
                                  +-- Inicio
                                  +-- Lista de salas
                                  +-- Crear sala
                                  +-- Sala de estudio
                                  |      |
                                  |      +-- Información de sala
                                  |      +-- Participantes
                                  |      +-- Chat
                                  |      +-- Temporizador Pomodoro
                                  |
                                  +-- Perfil
                                  +-- Estadísticas
                                  +-- Sonidos
```

## 13. Configuración de Supabase

Por seguridad, el archivo real de conexión a Supabase no se incluye en el repositorio. En su lugar se incluye un archivo de ejemplo:

```text
lib.example/supabase.example.js
```

Para configurar el proyecto localmente se debe crear la carpeta `lib` y copiar el archivo de ejemplo:

```bash
mkdir lib
cp lib.example/supabase.example.js lib/supabase.js
```

Luego se deben reemplazar los valores de ejemplo por los datos correspondientes del proyecto Supabase:

```javascript
const supabaseUrl = 'https://TU_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'TU_PUBLISHABLE_KEY';
```

Importante: no se debe subir el archivo real `lib/supabase.js` al repositorio, porque puede contener datos de configuración del backend.

## 14. Instalación y ejecución del proyecto

Para ejecutar el proyecto en un entorno local:

### 1. Instalar Node.js

Se recomienda tener instalado Node.js y npm.

### 2. Instalar dependencias

Desde la raíz del proyecto:

```bash
npm install
```

### 3. Configurar Supabase

Crear el archivo real de configuración a partir del ejemplo:

```bash
mkdir lib
cp lib.example/supabase.example.js lib/supabase.js
```

Luego editar `lib/supabase.js` con los datos correspondientes.

### 4. Ejecutar Expo

```bash
npm start
```

También se puede usar:

```bash
npx expo start
```

### 5. Ejecutar en Android

```bash
npm run android
```

O desde Expo, escanear el código QR con Expo Go si el entorno lo permite.

## 15. Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo de Expo. |
| `npm run android` | Ejecuta la app en Android. |
| `npm run ios` | Ejecuta la app en iOS, si el entorno lo permite. |
| `npm run web` | Ejecuta la app en navegador web. |

## 16. Generación de APK

Para cumplir con la entrega de aplicación compilada en Android, se debe generar un archivo APK.

El proyecto incluye configuración EAS en:

```text
eas.json
```

Para generar un APK con Expo EAS, se recomienda configurar el perfil `preview` de la siguiente forma:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

Luego ejecutar:

```bash
npm install
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Al finalizar, Expo generará un enlace para descargar el APK.

## 17. Seguridad del repositorio

Durante la revisión de la entrega integrada se consideraron los siguientes puntos:

| Elemento | Estado |
|---|---|
| Archivo `.env` | No incluido. |
| Archivo `.env.local` | No incluido. |
| Archivo real `lib/supabase.js` | No incluido. |
| Archivo de ejemplo de Supabase | Incluido como referencia segura. |
| `node_modules/` | No incluido. |
| Credenciales privadas visibles | No se identificaron credenciales privadas evidentes. |

El archivo `.gitignore` mantiene fuera del repositorio archivos y carpetas que no deberían entregarse, como dependencias instaladas o configuraciones locales sensibles.

## 18. Documentación incluida para revisión académica

Además del código fuente, se agregó documentación de apoyo en:

```text
DOCUMENTACION_ENTREGA/
```

| Documento | Propósito |
|---|---|
| `GUIA_ESTRUCTURA_CODIGO.md` | Explica la organización general de carpetas y archivos. |
| `ARCHIVOS_COMENTADOS.md` | Resume los archivos comentados y el criterio usado. |
| `REVISION_SEGURIDAD.md` | Detalla la revisión básica de seguridad del repositorio. |
| `REFERENCIAS_SPRINT1/` | Conserva referencias útiles tomadas de ramas individuales del Sprint 1. |


