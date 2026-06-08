import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, setDoc as set, getDocs as getm, query, orderBy, limit, onSnapshot as monitor, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

var activeLobbies = [];
class Lobby {
    constructor(gameID, lobbyID, host, maxPlayerCount, playerList, joinable, data) {
        if (lobbyID == 0) {this.lobbyID = Math.round(Math.random()^2*10)} else {this.lobbyID = lobbyID}
        this.host = host;
        this.maxPlayerCount = null;
        this.playerList = [];
        this.joinable = null;
        this.data = null;
        get(doc(db, gameEntries, gameID)).then((snap) => {
            if (snap.exists()) {
                this.maxPlayerCount = 2;
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

const lobbyUpdater = {
    toFirestore: (lobby) => {
        return {
            players = lobby.host,
            maxPlayerCount = lobby.maxPlayerCount,
            playerList = lobby.playerList,
            joinable = lobby.joinable,
            data = lobby.data
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Lobby(data.host, data.maxPlayerCount, data.playerList, data.joinable, data.data);
    }
};

export function getLobbies() {}

//okay, so the solution is a mutation observer, i can set on up on all lobbies that updates all changed values in the database.
//if i don't sleep, I won't be able to think, so I should probably sleep