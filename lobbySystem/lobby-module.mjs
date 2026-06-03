import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, setDoc as set, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

var activeLobbies = [];
class Lobby {
    constructor(gameID, lobbyID, host) {
        if (lobbyID == 0) {this.lobbyID = Math.round(Math.random()^2*10)} else {this.lobbyID = lobbyID}
        this.host = host;
        this.maxPlayerCount = 2;
        this.playerList = [];
        this.joinable = false;
        get(doc(db, gameEntries, gameID)).then((snap) => {
            if (snap.exists()) {
                this.maxPlayerCount = 2;
            } else {
                error("The requested game does not exist.");
                this = null;
            }
        })
        // set up event listener to detect whenever the database data changes
    }

    open() {
        if (this.host != getAuth().currentUser.uid) {console.warn("Lobbies can only be opened by their host."); return;}
        this.playerList.push(getAuth().currentUser.uid);
        this.joinable = true;
    }

    join() {
        if (this.playerList.includes(getAuth().currentUser.uid)) {console.warn("You are already in this lobby."); return false;}
        if (!this.joinable) {console.warn("You cannot join this lobby."); return false;}
        if (this.playerList.length >= this.maxPlayerCount) {console.warn("This lobby is full."); return false;}
        this.playerList.push();
        return true;
    }

    leave() {

    }

    dataUpdate() {

    }

    destroy() {

    }
}

export function getLobbies() {}