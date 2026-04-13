# OpenStudy_Front

Frontend de la aplicación OpenStudy desarrollada con React Native y Expo.

## Estado Actual del Proyecto

### **Funcionalidades Implementadas** 
- **Autenticación completa** con Supabase (Login, Register, Logout)
- **Navegación estructurada** y automática
- **Gestión de estado** con hooks personalizados
- **Arquitectura escalable** y modular

### **Próximas Funcionalidades** (Listas para desarrollar)
- Salas de estudio colaborativo
- Temporizador Pomodoro grupal
- Chat en tiempo real
- Estadísticas de estudio

---

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

---

## Estructura del Proyecto

```
src/
components/     # Componentes UI reutilizables
screens/        # Pantallas completas
navigation/     # Configuración de rutas
services/       # Lógica de negocio (Supabase)
hooks/          # Custom hooks
utils/          # Funciones utilitarias
styles/         # Estilos globales
assets/         # Recursos estáticos
```

---

## Notas importantes
- **Nunca subas `lib/supabase.js` a git** - contiene credenciales privadas
- La carpeta `lib/` está en `.gitignore` por seguridad
- Cada desarrollador debe tener su propio archivo de configuración
- **El proyecto está listo para escalar** y construir las 15 historias de usuario

---

## Tecnologías
- **React Native** con **Expo**
- **Supabase** para backend y autenticación
- **React Navigation** para navegación
- **Expo Linear Gradient** para diseños

El frontend del sistema Pomodoro grupal es la parte visual con la que interactúan los usuarios. Permite gestionar sesiones de estudio, visualizar el temporizador en tiempo real, participar en salas y comunicarse mediante chat. Consume los servicios del backend para mostrar la información de forma dinámica y ofrecer una experiencia intuitiva y organizada.
