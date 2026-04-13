# Estructura del Proyecto OpenStudy

## Descripción de Carpetas

### `/components`
Componentes UI reutilizables organizados por funcionalidad:
- `auth/` - Componentes de autenticación
- `rooms/` - Componentes para gestión de salas
- `chat/` - Componentes de chat
- `timer/` - Componentes del temporizador Pomodoro
- `profile/` - Componentes de perfil y estadísticas
- `moderation/` - Componentes de moderación
- `common/` - Componentes genéricos reutilizables
- `layout/` - Componentes estructurales

### `/screens`
Pantallas completas que combinan múltiples componentes:
- `auth/` - Pantallas de autenticación (Login, Register, Welcome)
- `rooms/` - Pantallas de salas (List, Create, Detail)
- `chat/` - Pantallas de chat
- `profile/` - Pantallas de perfil y estadísticas

### `/navigation`
Configuración de rutas y navegación:
- `AppNavigator.js` - Navegación principal (Auth vs App)
- `AuthNavigator.js` - Rutas de autenticación
- `TabNavigator.js` - Navegación por pestañas principal

### `/services`
Lógica de negocio y comunicación con APIs:
- `auth.js` - Servicios de autenticación
- `rooms.js` - CRUD de salas
- `chat.js` - Mensajes y real-time
- `timer.js` - Lógica Pomodoro
- `notifications.js` - Push notifications
- `supabase/` - Configuración de cliente Supabase

### `/hooks`
Custom hooks para manejo de estado y lógica compartida:
- `useAuth.js` - Estado de autenticación
- `useRooms.js` - Gestión de salas
- `useChat.js` - Estado del chat
- `useTimer.js` - Estado del Pomodoro

### `/utils`
Funciones utilitarias y constantes:
- `constants.js` - Constantes globales
- `helpers.js` - Funciones helper
- `validators.js` - Validaciones de formularios

### `/styles`
Estilos globales y tema de la aplicación:
- `colors.js` - Paleta de colores
- `typography.js` - Fuentes y tamaños
- `spacing.js` - Márgenes, padding y dimensiones

### `/assets`
Recursos estáticos:
- `images/` - Imágenes y logos
- `icons/` - Iconos de la app
- `sounds/` - Archivos de audio

## Flujo de Datos Típico

```
Screen Component
    Hook (useAuth, useRooms, etc.)
        Service (authService, roomsService, etc.)
            Supabase Client
```

## Convenciones

1. **Componentes**: PascalCase (`WelcomeScreen.js`)
2. **Servicios**: camelCase (`authService.js`)
3. **Hooks**: camelCase con prefijo `use` (`useAuth.js`)
4. **Utils**: camelCase (`validators.js`)
5. **Estilos**: camelCase (`colors.js`)

## Import Recommendations

```javascript
// Para estilos
import { COLORS, FONTS } from '../styles';

// Para utilidades
import { validateEmail, formatTime } from '../utils';

// Para servicios
import { authService } from '../services';

// Para hooks
import { useAuth } from '../hooks';
```
