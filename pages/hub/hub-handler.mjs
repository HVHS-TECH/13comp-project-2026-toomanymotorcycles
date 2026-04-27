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

var app, analytics, userAuthService, authProvider, db, account, initialised = false;

async function init() {
    console.info("-------------------------------------\n--- CHAOS DATABASE SOLUTIONS V1.0 ---\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");
    console.log("CDS: Initialising...");
    document.getElementById("loading").removeAttribute("hidden");
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    await onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            window.location.href = "../../pages/login/login.html";
        }
        else{
            account = user;
            console.log(account.uid)
        }
    })
    document.getElementById("loading").setAttribute("hidden",true);
    document.getElementById("page").removeAttribute("style");
    document.getElementById("setup-finish").showModal();
    console.log("CDS: Initialisation complete.");
}

function requestUsername() {
    get(doc(db, 'users', account.uid)).then((data) => {

    })
}

function displayData() {}

try {
    init();
    requestUsername();
    displayData();
} catch (err) {
    console.error(`-!- CDS FATAL ERROR -!-\nInitialisation FAILED\n${err}`);
    document.getElementById("loading-gif").setAttribute("src","./../../resources/resources_global/warning.png");
    document.getElementById("loading-gif").setAttribute("width",200);
    document.getElementById("loading-gif").setAttribute("height",200);
    document.getElementById("loading-message").innerText = "A fatal error has occured, try again later.";
    document.getElementById("loading-message").setAttribute("style","color:indianred");
    document.getElementById("fatalerror-info").removeAttribute("hidden");
};