# OpenStudy_Front

Frontend de la aplicación OpenStudy desarrollada con React Native y Expo.

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Copia el archivo de configuración:
```bash
cp lib.example/supabase.example.js lib/supabase.js
```

2. Ve a tu dashboard de Supabase
3. Settings -> API -> copia Project URL y anon public key
4. Reemplaza los valores en `lib/supabase.js`

### 3. Ejecutar la app
```bash
npm start
```

## Notas importantes
- **Nunca subas `lib/supabase.js` a git** - contiene credenciales privadas
- La carpeta `lib/` está en `.gitignore` por seguridad
- Cada desarrollador debe tener su propio archivo de configuración

El frontend del sistema Pomodoro grupal es la parte visual con la que interactúan los usuarios. Permite gestionar sesiones de estudio, visualizar el temporizador en tiempo real, participar en salas y comunicarse mediante chat. Consume los servicios del backend para mostrar la información de forma dinámica y ofrecer una experiencia intuitiva y organizada.
