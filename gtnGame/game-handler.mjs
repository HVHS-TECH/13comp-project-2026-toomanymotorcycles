var userType = null;
var gameState = -1;
var lastRecordedTurn = -1;
// -1: inactive
// 0: waiting for turn
// 1: taking turn
// 2: waiting for response from host
// 3: round over, win
// 4: round over, lose

function onTurnBegin() {
    if (globalThis.joinedLobby.data.turn == globalThis.joinedLobby.playerList.value.findIndex(globalThis.userID)) {
        console.log("Current client is now active.");
        gameState = 1;
    } else {
        console.log(`Player ${activePlayer} is now active.`);
        gameState = 0;
    }
}

function onTurnEnd(submittedGuess) {
    if (gameState == 1) {
        globalThis.joinedLobby.data.value.guess = submittedGuess;
        globalThis.joinedLobby.data.value.response = -2
        gameState = 2;
    }
}

function hostCheck() {
    switch (true) {
        case globalThis.joinedLobby.data.value.guess == globalThis.joinedLobby.hostData.secretNumber:
            globalThis.joinedLobby.data.value.response = 2
            globalThis.joinedLobby.data.value.turn = -2
            break;
        case globalThis.joinedLobby.data.value.guess < globalThis.joinedLobby.hostData.secretNumber:
            globalThis.joinedLobby.data.value.response = -1
            break;
        case globalThis.joinedLobby.data.value.guess > globalThis.joinedLobby.hostData.secretNumber:
            globalThis.joinedLobby.data.value.response = 1
            break;
    }
}

function onGuessResponse() {
    if (gameState == 2) {
        console.log("Host response received.")
        if (globalThis.joinedLobby.data.value.response == -1) {
            console.log("Guess was too low.");
            globalThis.joinedLobby.data.value.response == 0;
            globalThis.joinedLobby.data.value.confirm = true
        } else if (globalThis.joinedLobby.data.value.response == 1) {
            console.log("Guess was too high.");
            globalThis.joinedLobby.data.response == 0;
            globalThis.joinedLobby.data.value.confirm = true
        } else if (globalThis.joinedLobby.data.value.response == 2) {
            console.log("Guess was correct.");
            onWin()
        } else {
            console.error("Received bad responce from server.");
            globalThis.joinedLobby.data.value.response == -2;
        }
    }
}

function onWin() {
    gameState = 3;
    console.log("You win.");
}

function onLose() {
    console.log(`Player ${globalThis.joinedLobby.data.value.turn} wins.`);
}

globalThis.resubscribeToLobby(() => {
    if (globalThis.joinedLobby.host.value == globalThis.userID) {
        userType = "host";
        console.log("Joined as lobby host.");
    } else {
        userType = "player";
        console.log("Joined as player.");
    }
    console.warn("Warning:\nDo not attempt to spoof your user type, this will cause issues with the client.\nYou will only succeed in breaking your own system.");
    
    globalThis.joinedLobby.onLobbyDataUpdate = () => {
        try {
        if (userType == "host" && typeof globalThis.joinedLobby.data.value.response != "undefined" && globalThis.joinedLobby.data.value.response == 0 && globalThis.joinedLobby.data.value.confirm == true) {
            globalThis.joinedLobby.data.value.turn ++;
        }
        if (userType == "host" && typeof globalThis.joinedLobby.data.value.response != "undefined" && globalThis.joinedLobby.data.value.response == -2) {
            hostCheck();
        }
        if (globalThis.joinedLobby.data.value.turn != lastRecordedTurn && globalThis.joinedLobby.data.value.turn != -1) {
            onTurnBegin();
        }
        if (gameState == 2 && typeof globalThis.joinedLobby.data.value.response != "undefined" && globalThis.joinedLobby.data.value.response != -2) {
            onGuessResponse();
        }
        if (globalThis.joinedLobby.data.turn == -2 && gameState != 3) {
            gameState = 4;
            onLose();
        }
        } catch (err) {
            console.warn(`An error has occured.\nThis is likely the result of attempted tampering with the script.\nStop cheating and you'll be fine. Simple as that.\n\n${err}`);
        }
    }
});