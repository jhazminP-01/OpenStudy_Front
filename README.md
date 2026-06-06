# OpenStudy - Aplicación de Estudio Colaborativo

## Descripción

Aplicación móvil desarrollada con React Native y Expo que permite crear salas de estudio colaborativo con temporizador Pomodoro grupal, chat en tiempo real y gestión de participantes.

## Tecnologías

- **React Native** (v0.81.5) - Framework móvil
- **Expo** (v54.0.34) - Plataforma de desarrollo
- **Supabase** (v2.103.0) - Backend y autenticación
- **React Navigation** (v7.2.2) - Navegación

## Instalación

```bash
npm install
cp lib.example/supabase.example.js lib/supabase.js
# Configura las credenciales de Supabase en lib/supabase.js
```

## Ejecución

```bash
npm start
```

Escanea el código QR con Expo Go en tu dispositivo móvil.

## Dependencias

Todas las dependencias están especificadas en `package.json`. Ver archivo para versiones exactas.

## Configuración Necesaria

**Supabase:**
1. Copia `lib.example/supabase.example.js` a `lib/supabase.js`
2. Reemplaza `SUPABASE_URL` y `SUPABASE_ANON_KEY` con tus credenciales
3. ⚠️ No subas `lib/supabase.js` a Git (está en .gitignore)

## Aplicación Compilada

**APK Android:** Disponible en https://expo.dev/artifacts/eas/bgzKTjDTP6kbgGjjBEbDiB.apk

Para generar nuevo build:
```bash
eas build --platform android
```

## Autor(es)

- **Josué** - Desarrollador Principal
