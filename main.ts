/**
 * MicroOS Chat & Admin Sanction System for BBC micro:bit
 *
 * Features:
 * - MicroOS state machine (Boot, Code Entry, Main Menu, Chat, Admin/Sanctions, Info)
 * - Invitation Code mechanism for room connection (Radio Group & Code Header)
 * - Chat App with predefined quick messages, custom emoji icons, and text broadcasting
 * - Boss/Admin app to apply temporary bans (10s, 30s, 60s, 120s) or unban target users
 * - Automatic temporary sanction countdown and UI lock for banned users
 * - "DESCARGAR APP" option in menu
 */

enum OSState {
    Boot,
    CodeEntry,
    MainMenu,
    ChatApp,
    AdminApp,
    StatusApp,
    DownloadApp
}

// OS State Variables
let currentState: OSState = OSState.Boot
let invitationCode: number = 123
let enteredCode: number = 100
let myUserId: number = Math.randomRange(1, 9)
let isBoss: boolean = false
let isBanned: boolean = false
let banRemainingSeconds: number = 0

// Menu navigation
const MENU_ITEMS: string[] = ["CHAT", "ADMIN", "DESCARGAR APP", "INFO", "CODE"]
let selectedMenuItem: number = 0

// Chat options
const CHAT_MESSAGES: string[] = [
    "HOLA",
    "OK",
    "NO",
    "AYUDA",
    "JAJA",
    "ADIOS",
    "❤️",
    "😊",
    "👍"
]
let selectedChatIndex: number = 0

// Admin options
let targetUserId: number = 1
const BAN_DURATIONS: number[] = [10, 30, 60, 120]
let selectedBanDurationIndex: number = 0

// Radio protocol packet prefix delimiters
// Format: CODE:TYPE:SENDER:TARGET:DATA
// TYPES: C=Chat, B=Ban, H=Heartbeat

function applyInvitationCode(code: number) {
    invitationCode = code
    // Set radio group based on invitation code modulo 256 (radio group range 0-255)
    radio.setGroup(invitationCode % 256)
    radio.setTransmitPower(7)
}

function sendRadioPacket(msgType: string, target: number, data: string) {
    let packet = "" + invitationCode + ":" + msgType + ":" + myUserId + ":" + target + ":" + data
    radio.sendString(packet)
}

// Background timer to handle temporary ban countdown
control.inBackground(function () {
    while (true) {
        basic.pause(1000)
        if (banRemainingSeconds > 0) {
            banRemainingSeconds -= 1
            if (banRemainingSeconds <= 0) {
                banRemainingSeconds = 0
                isBanned = false
                music.playTone(Note.C5, music.beat(BeatFraction.Half))
                basic.showString("UNBANNED")
                renderCurrentScreen()
            }
        }
    }
})

// Radio packet handler
radio.onReceivedString(function (receivedString: string) {
    let parts = receivedString.split(":")
    if (parts.length < 5) return

    let pktCode = parseInt(parts[0])
    let pktType = parts[1]
    let pktSender = parseInt(parts[2])
    let pktTarget = parseInt(parts[3])
    let pktData = parts[4]

    // Verify invitation code match
    if (pktCode !== invitationCode) return

    if (pktType === "C") {
        // Chat message
        if (!isBanned) {
            music.playTone(Note.G4, music.beat(BeatFraction.Quarter))
            basic.showString("U" + pktSender + ":" + pktData)
            renderCurrentScreen()
        }
    } else if (pktType === "B") {
        // Ban command from Boss
        if (pktTarget === myUserId || pktTarget === 0) { // 0 = broadcast ban
            let banDuration = parseInt(pktData)
            if (banDuration > 0) {
                isBanned = true
                banRemainingSeconds = banDuration
                music.playTone(Note.C3, music.beat(BeatFraction.Whole))
                basic.showIcon(IconNames.No)
                basic.showString("BAN " + banRemainingSeconds + "s")
            } else {
                // Lift sanction / unban
                isBanned = false
                banRemainingSeconds = 0
                music.playTone(Note.G5, music.beat(BeatFraction.Half))
                basic.showIcon(IconNames.Yes)
                basic.showString("OK")
            }
            renderCurrentScreen()
        }
    }
})

// UI Rendering Functions
function renderCurrentScreen() {
    if (isBanned && currentState === OSState.ChatApp) {
        basic.showIcon(IconNames.No)
        return
    }

    switch (currentState) {
        case OSState.Boot:
            basic.showString("MicroOS")
            basic.showIcon(IconNames.Happy)
            break
        case OSState.CodeEntry:
            basic.showNumber(enteredCode)
            break
        case OSState.MainMenu:
            basic.showString(MENU_ITEMS[selectedMenuItem])
            break
        case OSState.ChatApp:
            basic.showString(CHAT_MESSAGES[selectedChatIndex])
            break
        case OSState.AdminApp:
            if (!isBoss) {
                basic.showString("BOSS ONLY")
            } else {
                basic.showString("U" + targetUserId + ":" + BAN_DURATIONS[selectedBanDurationIndex] + "s")
            }
            break
        case OSState.DownloadApp:
            basic.showString("DESCARGAR APP - MicroOS_Chat_App.zip")
            break
        case OSState.StatusApp:
            basic.showString("ID:" + myUserId + (isBoss ? " BOSS" : " USER"))
            break
    }
}

// Button A: Next / Increment / Scroll
input.onButtonPressed(Button.A, function () {
    if (isBanned) {
        basic.showString("BAN " + banRemainingSeconds + "s")
        return
    }

    if (currentState === OSState.Boot) {
        currentState = OSState.CodeEntry
        renderCurrentScreen()
    } else if (currentState === OSState.CodeEntry) {
        enteredCode = (enteredCode + 1)
        if (enteredCode > 150) enteredCode = 100
        renderCurrentScreen()
    } else if (currentState === OSState.MainMenu) {
        selectedMenuItem = (selectedMenuItem + 1) % MENU_ITEMS.length
        renderCurrentScreen()
    } else if (currentState === OSState.ChatApp) {
        selectedChatIndex = (selectedChatIndex + 1) % CHAT_MESSAGES.length
        renderCurrentScreen()
    } else if (currentState === OSState.AdminApp) {
        if (isBoss) {
            targetUserId = (targetUserId % 9) + 1
            renderCurrentScreen()
        } else {
            // Toggle boss mode if in Admin app screen
            isBoss = !isBoss
            renderCurrentScreen()
        }
    } else if (currentState === OSState.DownloadApp) {
        currentState = OSState.MainMenu
        renderCurrentScreen()
    } else if (currentState === OSState.StatusApp) {
        isBoss = !isBoss
        renderCurrentScreen()
    }
})

// Button B: Select / Confirm / Action
input.onButtonPressed(Button.B, function () {
    if (isBanned) {
        basic.showString("BAN " + banRemainingSeconds + "s")
        return
    }

    if (currentState === OSState.Boot) {
        currentState = OSState.CodeEntry
        renderCurrentScreen()
    } else if (currentState === OSState.CodeEntry) {
        applyInvitationCode(enteredCode)
        music.playTone(Note.E4, music.beat(BeatFraction.Quarter))
        basic.showIcon(IconNames.Yes)
        currentState = OSState.MainMenu
        renderCurrentScreen()
    } else if (currentState === OSState.MainMenu) {
        let item = MENU_ITEMS[selectedMenuItem]
        if (item === "CHAT") {
            currentState = OSState.ChatApp
        } else if (item === "ADMIN") {
            currentState = OSState.AdminApp
        } else if (item === "DESCARGAR APP") {
            currentState = OSState.DownloadApp
        } else if (item === "INFO") {
            currentState = OSState.StatusApp
        } else if (item === "CODE") {
            currentState = OSState.CodeEntry
        }
        renderCurrentScreen()
    } else if (currentState === OSState.ChatApp) {
        // Send selected chat message
        sendRadioPacket("C", 0, CHAT_MESSAGES[selectedChatIndex])
        music.playTone(Note.C5, music.beat(BeatFraction.Quarter))
        basic.showIcon(IconNames.SmallSquare)
        basic.pause(200)
        renderCurrentScreen()
    } else if (currentState === OSState.AdminApp) {
        if (isBoss) {
            // Change ban duration or trigger ban command
            selectedBanDurationIndex = (selectedBanDurationIndex + 1) % BAN_DURATIONS.length
            renderCurrentScreen()
        } else {
            basic.showString("HOLD A+B FOR BOSS")
        }
    } else if (currentState === OSState.DownloadApp) {
        currentState = OSState.MainMenu
        renderCurrentScreen()
    } else if (currentState === OSState.StatusApp) {
        currentState = OSState.MainMenu
        renderCurrentScreen()
    }
})

// Button A+B: Back to Main Menu / Admin Action (Issue Ban)
input.onButtonPressed(Button.AB, function () {
    if (isBanned) {
        basic.showString("BAN " + banRemainingSeconds + "s")
        return
    }

    if (currentState === OSState.AdminApp && isBoss) {
        // Boss issues ban to target user
        let duration = BAN_DURATIONS[selectedBanDurationIndex]
        sendRadioPacket("B", targetUserId, "" + duration)
        music.playTone(Note.G3, music.beat(BeatFraction.Half))
        basic.showString("BANNED U" + targetUserId)
        renderCurrentScreen()
    } else {
        // Return to Main Menu
        currentState = OSState.MainMenu
        renderCurrentScreen()
    }
})

// Initialize System on Startup
applyInvitationCode(invitationCode)
basic.showAnimation(`
    . . . . .    . . . . .    . . # . .    . # # # .    # # # # #
    . . . . .    . . # . .    . # # # .    # # # # #    # # # # #
    . . # . .    . # # # .    # # # # #    # # # # #    # # # # #
    . . . . .    . . # . .    . # # # .    # # # # #    # # # # #
    . . . . .    . . . . .    . . # . .    . # # # .    # # # # #
`, 100)
basic.pause(500)
renderCurrentScreen()
