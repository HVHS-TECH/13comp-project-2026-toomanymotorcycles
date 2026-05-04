import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
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

var app, analytics, userAuthService, authProvider, db, account, username, initialised = false;

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
            console.log(account.uid)
            requestUsername.then(() => {
                displayData();
                document.getElementById("loading").setAttribute("hidden",true);
                document.getElementById("page").removeAttribute("style");
                console.log("CDS: Initialisation complete.");
            }, () => {document.getElementById("setup-finish").showModal();});
        }
    })
}

const requestUsername = new Promise(function(resolve, reject) {
    console.log(getAuth().currentUser)
    get(doc(db, 'users', getAuth().currentUser.uid)).then((snap) => {
        if (snap.exists()) {
            username = snap.data();
            Promise.resolve();
        } else {
            Promise.reject();
        }
    })
});

function setUsername() {

}

function displayData() {}

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