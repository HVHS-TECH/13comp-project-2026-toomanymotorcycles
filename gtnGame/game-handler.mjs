import { getAuth, onAuthStateChanged, GoogleAuthProvider, reauthenticateWithCredential, deleteUser, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";


var initialised = false;
var cycleRunning = false;
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
    console.log("TURN BEGIN");
    if (globalThis.joinedLobby.data.turn + 1 == globalThis.joinedLobby.playerList.value.indexOf(globalThis.userID)) {
        console.log("Current client is now active.");
        gameState = 1;
    } else {
        console.log(`Player ${globalThis.joinedLobby.data.turn + 1} is now active.`);
        gameState = 0;
    }
    lastRecordedTurn = globalThis.joinedLobby.data.turn;
}

function onTurnEnd(submittedGuess) {
    console.log("TURN END");
    if (gameState == 1) {
        gameState = 2;
        globalThis.joinedLobby.data.guess = submittedGuess;
        globalThis.joinedLobby.data.response = -2;
        console.log(globalThis.joinedLobby.data.response)
        console.log("Awaiting responce from host...");
    } else {
        console.warn("Wait your turn, please.");
    }
}

function hostCheck() {
    console.log("HOST CHECK");
    console.log(globalThis.joinedLobby.data.guess);
    console.log(globalThis.joinedLobby.hostData.secretNumber);
    switch (true) {
        case globalThis.joinedLobby.data.guess == globalThis.joinedLobby.hostData.secretNumber:
            console.log("SECRET NUMBER FOUND");
            globalThis.joinedLobby.data.response = 2;
            globalThis.joinedLobby.data.winner = globalThis.joinedLobby.data.turn + 1;
            globalThis.joinedLobby.data.turn = -2;
            break;
        case globalThis.joinedLobby.data.guess < globalThis.joinedLobby.hostData.secretNumber:
            console.log("GUESS TOO LOW");
            globalThis.joinedLobby.data.response = -1;
            break;
        case globalThis.joinedLobby.data.guess > globalThis.joinedLobby.hostData.secretNumber:
            console.log("GUESS TOO HIGH");
            globalThis.joinedLobby.data.response = 1;
            break;
    }
    console.log("HOST CHECK COMPLETE");
}

function onGuessResponse() {
    console.log("HOST RESPONCE RECEIVED");
    if (gameState == 2) {
        console.log("Host response received.")
        if (globalThis.joinedLobby.data.response == -1) {
            console.log("Guess was too low.");
            globalThis.joinedLobby.data.response == 0;
            globalThis.joinedLobby.data.confirm = true
        } else if (globalThis.joinedLobby.data.response == 1) {
            console.log("Guess was too high.");
            globalThis.joinedLobby.data.response == 0;
            globalThis.joinedLobby.data.confirm = true
        } else if (globalThis.joinedLobby.data.response == 2) {
            console.log("Guess was correct.");
        } else {
            console.error("Received bad responce from server.");
            globalThis.joinedLobby.data.response == -2;
        }
    }
}

function onWin() {
    gameState = 3;
    console.log("You win.");
}

function onLose() {
    console.log(`Player ${globalThis.joinedLobby.data.winner} wins.`);
}

function mainHandler(joinedLobby) {
    console.warn("Warning:\nDo not attempt to spoof your user type, this will cause issues with the client.\nYou will only succeed in breaking your own system.");
    
    joinedLobby.onLobbyDataUpdate = () => {
        try {
            if (!cycleRunning) {
                cycleRunning = true;
            if(!initialised) {
                console.log(globalThis.joinedLobby.host.value)
                if (globalThis.joinedLobby.host.value == globalThis.userID) {
                    userType = "host";
                    console.log("Joined as lobby host.");
                } else {
                    userType = "player";
                    console.log("Joined as player.");
                }
                initialised = true;
            }
        if (userType == "host" && typeof globalThis.joinedLobby.data.response != "undefined" && globalThis.joinedLobby.data.response == -2) {
            hostCheck(globalThis.joinedLobby);
        }
        if (gameState == 2 && typeof globalThis.joinedLobby.data.response != "undefined" && globalThis.joinedLobby.data.response != -2) {
            onGuessResponse(globalThis.joinedLobby);
        }
        if (globalThis.joinedLobby.data.turn == -2 && globalThis.joinedLobby.data.winner == globalThis.joinedLobby.playerList.value.indexOf(globalThis.userID)) {
            if (!globalThis.joinedLobby.data.confirm) {
                globalThis.joinedLobby.data.confirm = true;
                globalThis.saveImportantScore(1,true);
            }
            onWin()
        }
        if (globalThis.joinedLobby.data.turn == -2 && globalThis.joinedLobby.data.winner != globalThis.joinedLobby.playerList.value.indexOf(globalThis.userID)) {
            gameState = 4;
            onLose(globalThis.joinedLobby);
        }
        if (userType == "host" && globalThis.joinedLobby.data.winner == -1 && globalThis.joinedLobby.data.confirm == true) {
            console.log("RESPONCE CONFIRMED");
            globalThis.joinedLobby.data.response = 0;
            globalThis.joinedLobby.data.confirm = false;
            globalThis.joinedLobby.data.turn = (globalThis.joinedLobby.data.turn + 1) % globalThis.joinedLobby.maxPlayerCount.value;
        }
        if (globalThis.joinedLobby.data.turn != lastRecordedTurn && globalThis.joinedLobby.data.turn >= 0) {
            onTurnBegin(globalThis.joinedLobby);
        }
        cycleRunning = false;
        }
        } catch (err) {
            console.warn(`An error has occured.\nThis is likely the result of attempted tampering with the script.\nStop cheating and you'll be fine. Simple as that.\n\n${err}`);
        }
    }
};

onAuthStateChanged(getAuth(), (user) => {
    globalThis.userID = user.uid;
    globalThis.resubscribeToLobby(mainHandler);
});

globalThis.respond = onTurnEnd;