let strip = neopixel.create(DigitalPin.P0, 24, NeoPixelMode.RGB)
strip.showColor(neopixel.colors(NeoPixelColors.Black))

input.onGesture(Gesture.Shake, function () {
    let nombre_aleatori = randint(1, 2)
    if (nombre_aleatori == 1) {
        basic.showIcon(IconNames.Happy)
        music.playTone(Note.C, music.beat(BeatFraction.Whole))
        pins.servoWritePin(AnalogPin.P1, 0)
        strip.showColor(neopixel.colors(NeoPixelColors.Green))
    } else {
        basic.showIcon(IconNames.Sad)
        music.playTone(Note.G, music.beat(BeatFraction.Whole))
        pins.servoWritePin(AnalogPin.P1, 180)
        strip.showColor(neopixel.colors(NeoPixelColors.Red))
    }
    basic.pause(1000)
    pins.servoWritePin(AnalogPin.P1, 90)
    strip.showColor(neopixel.colors(NeoPixelColors.Black))
    basic.clearScreen()
})
