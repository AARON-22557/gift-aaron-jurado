# 💻 MicroOS PC - Aplicación de Chat con Código de Invitación y Sanciones

**MicroOS PC** es una aplicación de escritorio y web para chatear con amigos desde la computadora o laptop. Incluye un entorno de sistema operativo virtual, salas privadas mediante **códigos de invitación** de 6 dígitos y un **sistema de sanciones/baneos temporales** administrado por el Creador/Jefe de la sala.

---

## 📥 ¿Cómo Descargar y Ejecutar en tu PC?

### Opción 1: Descargar Paquete ZIP
1. Descarga el archivo comprimido **`MicroOS_PC_Chat_App.zip`**.
2. Descomprime el archivo ZIP en una carpeta de tu ordenador.
3. Abre una terminal o consola de comandos en esa carpeta.
4. Ejecuta:
   ```bash
   npm install ws
   node server.js
   ```
5. Abre tu navegador web (Chrome, Edge, Firefox) e ingresa a:
   `http://localhost:3000`

---

## 🎮 Funcionalidades Principales

### 🔑 1. Código de Invitación de Sala
- **Crear Sala (Jefe):** Genera un código de invitación único de 6 dígitos (ej. `849201`) y otorga el rol de Creador/Jefe.
- **Unirse con Código:** Tus amigos ingresan el código de 6 dígitos desde sus ordenadores para unirse a la misma sala.

### 💬 2. Chat en Tiempo Real
- Envío y recepción instantánea de mensajes.
- Botones de respuesta rápida y emojis (HOLA, OK, NO, ❤️, 😊, 👍).
- Lista de usuarios conectados en tiempo real.

### 👑 3. Sistema de Sanciones y Baneos Temporales (Panel del Jefe)
- El Creador/Jefe de la sala puede seleccionar a cualquier usuario molesto y aplicarle una sanción:
  - ⏱ **10 segundos**
  - ⏱ **30 segundos**
  - ⏱ **1 minuto (60s)**
  - ✅ **Desbanear**
- **Efecto de la Sanción en el PC del usuario:**
  - Aparece una **pantalla roja de bloqueo** con un contador regresivo en tiempo real.
  - El usuario sancionado **no puede escribir ni enviar mensajes** hasta que el tiempo venza o el Jefe retire la sanción.

---

## 📦 Estructura del Proyecto

- `server.js`: Servidor HTTP y WebSocket para retransmisión de chats, salas e invitaciones.
- `index.html`: Entorno gráfico del sistema operativo MicroOS PC.
- `styles.css`: Estilos visuales del escritorio, ventanas y pantalla de sanción.
- `app.js`: Cliente de chat en tiempo real y temporizador de sanciones.
- `MicroOS_PC_Chat_App.zip`: Paquete completo descargable listo para distribuir.
