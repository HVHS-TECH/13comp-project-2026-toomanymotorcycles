import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, setDoc as set, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNRUASOXGQabiR8LGBzKP6BDSEEAHdTR8",
  authDomain: "comp-2025-joshua-kh.firebaseapp.com",
  projectId: "comp-2025-joshua-kh",
  storageBucket: "comp-2025-joshua-kh.firebasestorage.app",
  messagingSenderId: "666152943807",
  appId: "1:666152943807:web:487145ec86c0e197dfc60a",
  measurementId: "G-J1FZFCMSRE"
};

var app, analytics, authProvider, db, account, username, globalCanReceiveAds = false;

function init() {
    console.info("-------------------------------------\n--- CHAOS DATABASE SOLUTIONS V1.0 ---\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");
    console.log("CDS: Initialising...");
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            window.location.href = "../../pages/login/login.html";
        }
        else{
            account = user;
            console.log(account);
            get(doc(db, 'users', getAuth().currentUser.uid)).then((snap) => {
                if (snap.exists()) {
                    username = snap.data().username;
                    globalCanReceiveAds = snap.data().canReceiveAds;
                    displayData();
                    document.getElementById("loading").setAttribute("hidden",true);
                    document.getElementById("page").removeAttribute("style");
                    console.log("CDS: Initialisation complete.");
                } else {
                    document.getElementById("setup-finish").showModal();
                }
            })
        }
    })
}

function setupUser(userName,canReceiveAds) {
    if (canReceiveAds == "on") {
        canReceiveAds = true;
    } else {
        canReceiveAds = false;
    }
    switch (true) {
        case userName.length == 0:
                document.getElementById("setup-finish-username").className = "errorInput";
                document.getElementById("setup-finish-error").innerText = "This is a required field"
                document.getElementById("setup-finish-error").removeAttribute("hidden");
            break;
        case userName.length <= 20:
            set(doc(db, 'users', getAuth().currentUser.uid), {
                username: userName,
                joinedAt: Date.now(),
                canReceiveAds
            }).then(() => {
                username = userName;
                displayData();
                document.getElementById("loading").setAttribute("hidden",true);
                document.getElementById("page").removeAttribute("style");
                console.log("CDS: Initialisation complete.");
                document.getElementById("setup-finish").close();
            });
            break;
        case userName.length > 20:
                document.getElementById("setup-finish-username").className = "errorInput";
                document.getElementById("setup-finish-error").innerText = "Username is over 20 characters"
                document.getElementById("setup-finish-error").removeAttribute("hidden");
            break;
        default:
                console.error("CDS FATAL ERROR: Something has gone very, VERY wrong. \n username.length returned a negative value");
            break;
    }
}

function displayData() {
    document.getElementById("username-display").innerText = username;
    document.getElementById("pic-display").src = account.photoURL;
}

function eraseData() {

}

function deleteAccountPhase1() {
    if (document.getElementById("account-delete-conftest").value == username) {
        document.getElementById("account-delete-warn").close();
        document.getElementById("account-delete-finalwarn").showModal();
    }
}

function deleteAccountPhase2() {
    
}

try {
    init();
} catch (err) {
    console.error(`-!- CDS FATAL ERROR -!-\nInitialisation FAILED\n${err}`);
    document.getElementById("loading-gif").setAttribute("src","./../../resources/resources_global/warning.png");
    document.getElementById("loading-gif").setAttribute("width",200);
    document.getElementById("loading-gif").setAttribute("height",200);
    document.getElementById("loading-message").innerText = "A fatal error has occured, try again later.";
    document.getElementById("loading-message").setAttribute("style","color:indianred");
    document.getElementById("fatalerror-info").removeAttribute("hidden");
};

globalThis.setupUser = setupUser;
globalThis.deleteAccountPhase1 = deleteAccountPhase1;