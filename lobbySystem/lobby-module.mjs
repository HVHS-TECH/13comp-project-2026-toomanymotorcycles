import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection as col, doc, getDoc, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getDatabase, ref, get as rtdbget, set as rtdbset, update as rtdbupdate, onValue, onDisconnect, runTransaction } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
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
  databaseURL: "https://comp-2025-joshua-kh-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "comp-2025-joshua-kh",
  storageBucket: "comp-2025-joshua-kh.firebasestorage.app",
  messagingSenderId: "666152943807",
  appId: "1:666152943807:web:487145ec86c0e197dfc60a",
  measurementId: "G-J1FZFCMSRE"
};

//I accidentally created my firestore database and realtime database in two different locations.
//Having two different web apps was the only fix available. Lesson learned.
//TECHNICAL DEBT YAY
//Never mind, I fixed it.

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);
const rdtbRef = ref(rtdb);
const fsdb = getFirestore(app);

//initialisation constants, these give commonly-used references to the database and its various apps and systems

console.info("-------------------------------------\n------- CDS LOBBY MODULE V1.0 -------\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");

class ActiveLobby {
    lobbyID = null; //the ID of the monitored lobby, used to identify it within the database and client-side code
    gameID = null; //the ID of the game that the lobby has been created under
    onLobbyDataUpdate = null; // A field that takes a function. Said function is called every time the lobby server data is updated.
    
    // Private fields that can only be modified through proxy objects. This ensures that any attempt to update them is intercepted and sent to the database.

    #userUID = null; // the UID of the current user, null if there is no user. Not linked to the database, instead made private to hinder attempts to change it, as any changes would break the client script.
    #host = {value: ""}; // the lobby's host, linked directly with the server database.
    #maxPlayerCount = {value: 0}; // the lobby's max player count, linked directly with the server database.
    #playerList = {}; // the lobby's player list, linked directly with the server database.
    #joinable = {value: false}; // whether or not the lobby is joinable, linked directly with the server database.
    #data = {value: {}}; // the data within the lobby, linked directly with the server database.
    #hostData = {value: {}}; // data only visible to the lobby's host, linked directly with the server database.
    #holdDataUpdates = {value: false}; // a holdover from a previous attempt, kept just in case. Signals to the system to hold database updates until further notice.
    
    heldDataUpdates = {} // a list of all held database updates, written simultaneously when a hold is released.

    //Proxy handlers. These intercept attempts to set private lobby object data values and send the updates to the server.
    hostProxyHandler = {set(existingVal, prop, newVal) {
        console.log("Database transaction.")
        try {
            if (newVal != existingVal) {
                console.log(`Database sync.`);
                    rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/host`), newVal).then(()=> {
                    console.log(`Database sync complete.`);
                });
            }
        } catch (err) {
            console.warn(`Database sync failed.\n${err}`);
            Reflect.set(this, prop, existingVal);
        }
    }};
    MPCProxyHandler = {set(existingVal, prop, newVal) {
        try {
            if (newVal != existingVal) {
            console.log(`Database sync.`);
                rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/maxPlayerCount`), newVal).then(()=> {
                console.log(`Database sync complete.`);
            });
            }
        } catch (err) {
            console.warn(`Database sync failed.\n${err}`);
            Reflect.set(this, prop, existingVal);
        }
    }};
    joinableProxyHandler = {set(existingVal, prop, newVal) {
        try {
            if (newVal != existingVal) {
            console.log(`Database sync.`);
            rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/joinable`), newVal).then(()=> {
                console.log(`Database sync complete.`);
            });
            }
        } catch (err) {
            console.warn(`Database sync failed.\n${err}`);
            Reflect.set(this, prop, existingVal);
        }
    }};
    dataProxyHandler = {set(existingVal, prop, newVal) {
        try {
            if (!this.holdDataUpdates) {
            console.log(`Database sync.`);
            rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/data/${prop}`), newVal).then(()=> {
                console.log(`Database sync complete.`);
            });
            } else {
                this.mainLobbyReference.heldDataUpdates[prop] = newVal;
            }
        } catch (err) {
            console.warn(`Database sync failed.\n${err}`);
            Reflect.set(this, prop, existingVal);
        }
    }};
    hostDataProxyHandler = {set(existingVal, prop, newVal) {
        try {
            console.log(`Database sync.`);
            rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/hostData/${prop}`), newVal).then(()=> {
                console.log(`Database sync complete.`);
            });
        } catch (err) {
            console.warn(`Database sync failed.\n${err}`);
            Reflect.set(this, prop, existingVal);
        }
    }};
    holdDataUpdatesProxyHandler = {
        updateLoop() {
            try {
                rtdbupdate(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/data`), this.mainLobbyReference.heldDataUpdates).then(()=> {
                    console.log(`Database sync complete.`);
                });
            } catch {
                console.warn("Failure is not an option. Retrying...")
                this.updateLoop()
            }
        },
        set(existingVal, prop, newVal) {
            if (newVal == true) {
                console.warn("Holding database data updates...");
            } else {
                console.warn("Hold released. Sending held updates...");
                this.updateLoop();
            }
        }
    }

    //The proxy objects themselves. Upon being edited, passes the value to both the handlers and the private object fields.
    host = new Proxy(this.#host,this.hostProxyHandler);
    maxPlayerCount = new Proxy(this.#maxPlayerCount,this.MPCProxyHandler);
    joinable = new Proxy(this.#joinable,this.joinableProxyHandler);
    data = new Proxy(this.#data,this.dataProxyHandler);
    hostData = new Proxy(this.#data,this.hostDataProxyHandler);
    holdDataUpdates = new Proxy(this.#holdDataUpdates,this.holdDataUpdatesProxyHandler);

    static generateCode() {
        //I stole this from geeksforgeeks.org, public domain or creative commons I think. Generates a pin code used as the lobby ID upon creation of a lobby.
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
        return result;
    }
    
    constructor(lobbyID, gameID, executeAfter) {
        this.#userUID = getAuth().currentUser.uid;
        this.gameID = gameID;
        if (lobbyID == 0) {
            console.log("Lobby created.")
            this.lobbyID = ActiveLobby.generateCode();
            console.log("Lobby code: "+this.lobbyID);
            var newPlayerList = new Map();
            newPlayerList.set(0, "ANCHOR");
            newPlayerList.set(newPlayerList.size, this.#userUID);
            rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}`), {
                host: this.#userUID,
                maxPlayerCount: 2,
                playerList: Object.fromEntries(newPlayerList.entries()),
                joinable: true,
                data: {turn:0, guess:-1, response:0, confirm:false},
                hostData: {secretNumber: Math.floor((Math.random()*10)*(Math.random()*10))}
            })
        } else {
            this.lobbyID = lobbyID;
        };
        var lobbyReference = ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}`);
        
        this.hostProxyHandler.gameID = this.gameID;
        this.MPCProxyHandler.gameID = this.gameID;
        this.joinableProxyHandler.gameID = this.gameID;
        this.dataProxyHandler.gameID = this.gameID;
        this.hostDataProxyHandler.gameID = this.gameID;

        this.hostProxyHandler.lobbyID = this.lobbyID;
        this.MPCProxyHandler.lobbyID = this.lobbyID;
        this.joinableProxyHandler.lobbyID = this.lobbyID;
        this.dataProxyHandler.lobbyID = this.lobbyID;
        this.hostDataProxyHandler.lobbyID = this.lobbyID;

        this.dataProxyHandler.mainLobbyReference = this;
        this.holdDataUpdatesProxyHandler.mainLobbyReference= this;

        this.dataUpdater = onValue(lobbyReference, (lobbyData) => {
            if (lobbyData.exists()) {
                console.log(lobbyData.val());
                this.#host.value = lobbyData.val().host;
                this.#maxPlayerCount.value = lobbyData.val().maxPlayerCount;
                this.#playerList.value = lobbyData.val().playerList;
                this.#joinable.value = lobbyData.val().joinable;
                this.#data.value = lobbyData.val().data;
                if(this.#host == this.#userUID) {
                    this.#hostData.value = lobbyData.val().hostData;
                } else {
                    this.#hostData.value = null;
                }
                if (typeof this.onLobbyDataUpdate == "function") {
                    this.onLobbyDataUpdate();
                } else {
                    console.warn("Lobby data update listener inactive or invalid.")
                }
            } else {
                console.error("Invalid lobby.");
            }
        });
        executeAfter(this);
    }
    join() {
        try {
            runTransaction(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`), (existingVal) => {
                if(!existingVal.includes(this.#userUID)) {
                    console.log("Joining lobby...")
                    existingVal.push(this.#userUID);
                } else {
                    throw new Error("You have already joined this lobby.");
                }
                return existingVal;
            }).then(() => {
                console.log("Lobby joined.")
            })
        } catch (err) {
            console.warn(`Attempt to join lobby failed.\n${err}`)
            rtdbget(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`),(snap) => {
                this.#playerList = snap.val();
            });
        }
    }
    leave() {
        try {
            runTransaction(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`), (existingVal) => {
                if(existingVal.includes(this.#userUID)) {
                    console.log("Leaving lobby...")
                    existingVal.splice(existingVal.indexOf(this.#userUID),1);
                } else {
                    throw new Error("You are not in this lobby.");
                }
                return existingVal;
            }).then(() => {
                console.log("Lobby left.")
                this.dataUpdater();
                joinedLobby = null;
                globalThis.joinedLobby = null;
                sessionStorage.clear();
                delete this;
            })
        } catch (err) {
            console.warn(`Attempt to leave lobby failed.\n${err}`)
            rtdbget(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`),(snap) => {
                this.#playerList = snap.val();
            });
        }
    }
    kick(user) {
        try {
            runTransaction(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`), (existingVal) => {
                if(existingVal.includes(user)) {
                    console.log("Attempting to kick user with a uid of "+user+"...")
                    existingVal.splice(existingVal.indexOf(user),1);
                } else {
                    throw new Error("That user is not part of this lobby.");
                }
                return existingVal;
            }).then(() => {
                console.log("User kicked.")
            })
        } catch (err) {
            console.warn(`Kick failed.\n${err}`)
            rtdbget(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}/playerList`),(snap) => {
                this.#playerList = snap.val();
            });
        }
    }
    destroy() {
        try {
            console.log(`Requesting lobby destruction...`);
            rtdbset(ref(rtdb, `/gameLobbies/${this.gameID}/${this.lobbyID}`), null).then(()=> {
                console.log(`Lobby destroyed.`);
                this.dataUpdater();
                joinedLobby = null;
                globalThis.joinedLobby = null;
                sessionStorage.clear();
                delete this;
            });
        } catch (err) {
            console.warn(`Attempt to destroy lobby failed.\n${err}`);
        }
    }
    onKick() {
        console.warn("You have been kicked from the lobby.");
        this.leave(); 
    }
}

function setupLobbyListener() {
    onValue(ref(rtdb, `/gameLobbies`),(allLobbies) => {
        console.log(allLobbies);
    })
}

function joinLobby(lobbyID,gameID) {
    joinedLobby = new ActiveLobby(lobbyID,gameID,(lobby) => {
        lobby.join();
        sessionStorage.setItem("lobbyID",lobbyID);
        sessionStorage.setItem("gameID",gameID);
    });
    globalThis.joinedLobby = joinedLobby;
}

function leaveLobby() {
    joinedLobby.leave();
}

function resubscribeToLobby(callback) {
    joinedLobby = new ActiveLobby(sessionStorage.getItem("lobbyID"),sessionStorage.getItem("lobbyID"),callback); 
}

function destroyLobby() {
    joinedLobby.destroy();
}

function saveHighScore(score) {

}

globalThis.joinLobby = joinLobby;
globalThis.leaveLobby = leaveLobby;
globalThis.resubscribeToLobby = resubscribeToLobby;
globalThis.destroyLobby = destroyLobby;
globalThis.saveHighScore = saveHighScore;
globalThis.userID = getAuth().currentUser.uid;
//getLobbies();

//okay, so the solution is a mutation observer, i can set on up on all lobbies that updates all changed values in the database.
//if i don't sleep, I won't be able to think, so I should probably sleep

//DAMN THE SUNK COST FALLACY I'M REBUILDING MY ARCHITECTURE
//BADLY BUILT GOVERNMENT SOFTWARE STYLE A.K.A TWO DATABASES
//BECAUSE REBUILDING THE OTHER ONE WOULD TAKE TOO LONG

//I think I've finally found the most efficient way to do this.

//Isn't it funny that George and I came to almost exactly the same conclusion
//as to the most efficient way to create an expandable lobby system?