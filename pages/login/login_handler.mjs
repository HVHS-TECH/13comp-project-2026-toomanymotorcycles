import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,  signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA8eRtuze9y-JNH3Qe7kmMlvSBvvR860uU",
    authDomain: "comp-2025-joshua-kh.firebaseapp.com",
    projectId: "comp-2025-joshua-kh",
    storageBucket: "comp-2025-joshua-kh.firebasestorage.app",
    messagingSenderId: "666152943807",
    appId: "1:666152943807:web:487145ec86c0e197dfc60a",
    measurementId: "G-J1FZFCMSRE"
};

var app, analytics, userAuthService, authProvider, db, initialised = false;
function init() {
    console.info("-------------------------------------\n--- CHAOS DATABASE SOLUTIONS V1.0 ---\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");
    console.log("CDS: Initialising...");
    document.getElementById("loading").removeAttribute("hidden");
    globalThis.user = undefined;
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    userAuthService = getAuth();
    authProvider = new GoogleAuthProvider();
    document.getElementById("loading").setAttribute("hidden",true);
    document.getElementById("page").removeAttribute("hidden");
    console.log("CDS: Initialisation complete.");
}
try {
    init();
} catch (err) {
    console.error(`-!- CDS FATAL ERROR -!-\nInitialisation FAILED\n${err}`);
};

function toggleButtonState(button,active,textIfActive) {
    if (active) {
        button.innerHTML = textIfActive
        button.className = ""
        button.removeAttribute("disabled");
    } else {
        button.innerHTML = "<b>...</b>"
        button.className = "button-awaiting"
        button.setAttribute("disabled","true");
    }
}

function loginWithGoogle() {
    toggleButtonState(document.getElementById("google-button"),false);
    signInWithPopup(userAuthService, authProvider)
        .then((authResult) => {
            console.log(authResult);
        }).catch((err) => {
            document.getElementById("google-error").removeAttribute("hidden");
            console.warn(`-!- CDS ERROR -!-\nAuthentication FAILED\n${err}`);
            toggleButtonState(document.getElementById("google-button"),true,"<b>Sign in with Google</b>");
        })
}

function loginWithUserPasswd() {
    // TODO: Write and link to username/password form
}

globalThis.loginWithGoogle = loginWithGoogle;
globalThis.loginWithUserPasswd = loginWithUserPasswd;
