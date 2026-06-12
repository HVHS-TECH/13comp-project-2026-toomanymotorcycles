import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection as col, doc, getDoc, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getDatabase, ref, get, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

//I know I'm using both types of database, and I know that this is inefficiency given form. Shut up. Rebuilding my entire architecture would take too long.

var activeLobbies = new Map();
var joinedLobby = null;

// The lobby handler can run independently of all other scripts
// and thus is able to initiate its own database connection if necessary.
// If the database has already been initialised, this will, of course, do nothing.

const firebaseConfig = {
  apiKey: "AIzaSyCNRUASOXGQabiR8LGBzKP6BDSEEAHdTR8",
  authDomain: "comp-2025-joshua-kh.firebaseapp.com",
  projectId: "comp-2025-joshua-kh",
  storageBucket: "comp-2025-joshua-kh.firebasestorage.app",
  messagingSenderId: "666152943807",
  appId: "1:666152943807:web:487145ec86c0e197dfc60a",
  measurementId: "G-J1FZFCMSRE",
};
const initialised = false;
const app = initializeApp(firebaseConfig);
const fsdb = getFirestore(app);
const rtdb = getDatabase(app);
console.info("-------------------------------------\n------- CDS LOBBY MODULE V1.0 -------\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");

class ActiveLobby {
    static generateCode() {
        //I stole this from geeksforgeeks.org
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
        return result;
    }
    constructor(lobbyID, gameID) {
        this.gameID = gameID;
        if (lobbyID == 0) {
            this.lobbyID = this.generateCode();
            set(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}`), {
            host: getAuth().currentUser.uid,
            maxPlayerCount: 2,
            playerList: new Map(),
            joinable: true,
            data: {turn:0}
        })
        } else {
            this.lobbyID = lobbyID;
        };
        onValue(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}`), (lobbyData) => {
            if (lobbyData.exists()) {
                this.host = lobbyData.val().host;
                this.maxPlayerCount = lobbyData.val().max;
                this.playerList = lobbyData.val().playerList;
                this.joinable = lobbyData.val().joinable;
                this.data = lobbyData.val().data;
            } else {
                throw new ReferenceError("Invalid lobby.")
            }
        });
    }
}

function getLobbies() {
    
}

function joinLobby(lobbyID,gameID) {
    joinedLobby = new ActiveLobby(lobbyID,gameID);
    
}

function leaveLobby() {
    // attempts to leave lobby
        
}

function lockLobby() {
    // requests to database to lock lobby, can only be done as host
}

function unlockLobby() {
    // requests to database to unlock lobby, can only be done as host
}

function destroyLobby() {
    // requests to database to destroy lobby, can only be done as host
}

getLobbies();
joinLobby("uxaw","owdihwidnw");

//okay, so the solution is a mutation observer, i can set on up on all lobbies that updates all changed values in the database.
//if i don't sleep, I won't be able to think, so I should probably sleep

//DAMN THE SUNK COST FALLACY I'M REBUILDING MY ARCHITECTURE
//BADLY BUILT GOVERNMENT SOFTWARE STYLE A.K.A TWO DATABASES
//BECAUSE REBUILDING THE OTHER ONE WOULD TAKE TOO LONG

//I think I've finally found the most efficient way to do this.

//Isn't it funny that George and I came to almost exactly the same conclusion
//as to the most efficient way to create an expandable lobby system?