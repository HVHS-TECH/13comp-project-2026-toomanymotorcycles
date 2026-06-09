
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

var activeLobbies = [];
class Lobby {
    constructor(gameID, lobbyID, host, maxPlayerCount, playerList, joinable, data) {
        //once created, these values are never interacted with
        //all interaction is handled through the mutation handler proxy function
        //which handles sending data to the server
        if (lobbyID == 0) {this.lobbyID = Math.round(Math.random()^2*10)} else {this.lobbyID = lobbyID};
        this.gameID = gameID;
        this.host = host;
        this.maxPlayerCount = null;
        this.playerList = [];
        this.joinable = null;
        this.data = null;
        this.mutationHandler = {
            set(mutatedData) {

            }
        }
        get(doc(db, "gameEntries", gameID)).then((snap) => {
            if (snap.exists()) {
                this.maxPlayerCount = snap.data.maxPlayers;
            } else {
                console.error("The requested game does not exist.");
                this = null;
            }
            if (this.host == getAuth().currentUser.uid) {
                this.playerList.push(getAuth().currentUser.uid);
                this.joinable = true;
            }
        });
    }

    initiateProxyConnection() {

    }

    join() {
        // attempts to join lobby
        if (this.playerList.includes(getAuth().currentUser.uid)) {console.warn("You are already in this lobby."); return false;}
        if (!this.joinable) {console.warn("You cannot join this lobby."); return false;}
        if (this.playerList.length >= this.maxPlayerCount) {console.warn("This lobby is full."); return false;}
        this.playerList.push(getAuth().currentUser.uid);
        return true;
    }

    leave() {
        // attempts to leave lobby
        if (!this.playerList.includes(getAuth().currentUser.uid)) {console.warn("You are not in this lobby."); return false;}
        this.playerList.splice(this.playerList.findIndex((uid) => {return uid == getAuth().currentUser.uid}),1);
        return true;
    }

    lock() {
        // requests to database to lock lobby, can only be done as host
    }

    unlock() {
        // requests to database to unlock lobby, can only be done as host
    }

    dataPush() {
        // manually triggers event listener
    }

    destroy() {
        // requests to database to destroy lobby, can only be done as host
    }
}

export function getLobbies() {}

//okay, so the solution is a mutation observer, i can set on up on all lobbies that updates all changed values in the database.
//if i don't sleep, I won't be able to think, so I should probably sleep

//DAMN THE SUNK COST FALLACY I'M REBUILDING MY ARCHITECTURE
//BADLY BUILT GOVERNMENT SOFTWARE STYLE A.K.A TWO DATABASES
//BECAUSE REBUILDING THE OTHER ONE WOULD TAKE TOO LONG