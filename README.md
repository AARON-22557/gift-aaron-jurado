# MicroOS PC Chat App (Sistema Operativo Virtual con Chat por Código y Sanciones)

¡Bienvenido a **MicroOS PC Chat App**! Una aplicación completa de chat estilo Sistema Operativo Web con invitación por código de 6 dígitos, roles (Jefe / Creador y Miembro) y sistema de sanciones/baneos temporales.

---

## 🚀 Cómo Ejecutar la Aplicación Facilmente (Sin comandos)

1. Extrae todo el contenido del archivo `.zip` en una carpeta de tu PC.
2. Haz **doble clic** en el archivo **`Iniciar_MicroOS_Chat.bat`**.
3. ¡Listo! Se instalarán dependencias automáticamente (si es la primera vez), se iniciará el servidor y se abrirá la aplicación en tu navegador web.

---

## 🛠️ Ejecución manual desde Consola / CMD (Opcional)

Si prefieres usar la consola de comandos:

1. Abre la carpeta en la terminal o CMD.
2. Instala las dependencias (solo la primera vez):
   ```cmd
   npm install
   ```
3. Inicia el servidor:
   ```cmd
   node server.js
   ```
4. Abre en tu navegador web:
   ```
   http://localhost:3000
   ```

---

## ✨ Características Principales

* **Sistema Operativo Virtual (MicroOS PC):**
  * Escritorio con iconos (*Chat por Código*, *Descargar App*, *Info MicroOS*).
  * Barra de tareas con reloj digital en tiempo real e indicador de estado de red.
  * Ventanas flotantes que se pueden cerrar e interactuar.

* **Chat por Código de Invitación (6 dígitos):**
  * **Crear sala:** Genera un código único de 6 dígitos (ej. `849201`). El usuario que la crea se convierte automáticamente en el **Jefe / Creador**.
  * **Unirse a sala:** Cualquier usuario con el código puede unirse al chat instantáneamente.

* **Sistema de Sanciones / Baneos Temporales (Exclusivo del Jefe):**
  * El Jefe tiene un **Panel de Control de Sanciones** en la parte derecha del chat.
  * Puede sancionar a cualquier usuario por **10 segundos**, **30 segundos** o **60 segundos** (o quitar el baneo inmediatamente).
  * Durante el baneo, la pantalla del usuario sancionado se **bloquea con un temporizador rojo en cuenta regresiva** e impide escribir mensajes hasta que se cumpla la sanción.

* **Botones de Respuesta Rápida:**
  * Mensajes predefinidos para chat rápido (`👍 ¡Entendido!`, `👋 ¡Hola a todos!`, `⚠️ ¡Atención!`, `😂 Jajaja`).

* **Soporte Multidispositivo en Red Local (LAN):**
  * Varios ordenadores conectados a la misma red WiFi o local pueden chatear ingresando a la IP del servidor (ej. `http://192.168.1.50:3000`).
