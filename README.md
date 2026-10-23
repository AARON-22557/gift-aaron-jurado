# MicroOS - Chat, Invitación y Sistema de Sanciones / Baneos

MicroOS es un sistema operativo liviano para BBC micro:bit que incluye una aplicación de **Chat**, **Código de Invitación**, y un sistema de **Sanciones / Baneos temporales** administrado por el creador / jefe (Boss).

---

## 📥 Descargar App

Puedes descargar el paquete completo comprimido en ZIP para instalar o compilar la aplicación:

* **Archivo ZIP:** `MicroOS_Chat_App.zip`
* Contenido del paquete ZIP:
  - `main.ts` (Código fuente completo de MicroOS y la App de Chat)
  - `built/binary.hex` y `built/mbcodal-binary.hex` (Binarios listos para flashear en BBC micro:bit)
  - `pxt.json` (Configuración de dependencias de MakeCode)
  - `README.md` (Instrucciones)

---

## 🚀 Características Principales

1. **Sistema Operativo (MicroOS):**
   - Menú interactivo con navegación mediante botones (A = Desplazarse, B = Seleccionar, A+B = Volver al menú principal).
   - Incluye aplicaciones: `CHAT`, `ADMIN` (Sanciones), `DESCARGAR APP`, `INFO`, `CODE`.

2. **Código de Invitación:**
   - Permite unirse a salas privadas configurando un número de invitación (ej. `100` - `150`).
   - Mapea el código al canal de radio de micro:bit y añade un encabezado de verificación.

3. **Aplicación de Chat:**
   - Envío y recepción de mensajes predefinidos, texto corto y emoticonos (`HOLA`, `OK`, `NO`, `AYUDA`, `JAJA`, `❤️`, `😊`, `👍`).
   - Visualización de mensajes en la pantalla LED 5x5 con notificaciones sonoras.

4. **Sistema de Sanciones y Baneos Temporales (Modo Boss / Jefe):**
   - El Creador / Jefe puede sancionar usuarios asignando un tiempo de baneo temporal (10s, 30s, 60s, 120s) o levantar la sanción (0s).
   - Mientras el usuario está baneado:
     - Se bloquea la interfaz de usuario con un icono de advertencia (`BAN X s`).
     - Se deshabilita el envío de mensajes de chat.
     - Un contador en segundo plano resta el tiempo automáticamente y desbanea al usuario al llegar a cero.

---

## ⚙️ Uso en MakeCode

* Abrir [MakeCode micro:bit](https://makecode.microbit.org/)
* Hacer clic en **Importar** > **Importar URL** o cargar el archivo `main.ts` / `binary.hex`.
