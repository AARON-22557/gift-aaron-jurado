// Pin donde está conectado el servomotor (Pin 0)
// Pin donde están conectados los Neopixels (Pin 1)
let SERVO_PIN = AnalogPin.P0

// Función para mover el servo
function mover_servo(angulo: number) {
    pins.servoWritePin(SERVO_PIN, angulo)
}

// Función para configurar color de Neopixel (Simulación simple)
function color_leds(color: string) {
    if (color == "GREEN") {
        basic.showIcon(IconNames.Happy)
    } else if (color == "RED") {
        basic.showIcon(IconNames.Sad)
    } else if (color == "BLACK") {
        basic.clearScreen()
    }
}

// --- INICIO DEL PROGRAMA ---

// 1. Configuración Inicial (INICI)
mover_servo(90)
color_leds("BLACK")
basic.clearScreen()

// 2. Detecció de sacseig (Shake)
input.onGesture(Gesture.Shake, function () {
    // 3. Nombre aleatori = 1 ?
    if (Math.randomRange(0, 1) == 1) {
        // --- CAMINO SÍ (Positivo) ---
        basic.showIcon(IconNames.Happy)
        music.playTone(262, music.beat(BeatFraction.Whole)) // C4 is 262 Hz
        mover_servo(0)
        color_leds("GREEN")
    } else {
        // --- CAMINO NO (Negativo) ---
        basic.showIcon(IconNames.Sad)
        music.playTone(392, music.beat(BeatFraction.Whole)) // G4 is 392 Hz
        mover_servo(180)
        color_leds("RED")
    }

    // --- RUTINA DE RESET ---
    basic.pause(1000)
    mover_servo(90)
    color_leds("BLACK")
    basic.clearScreen()
})
