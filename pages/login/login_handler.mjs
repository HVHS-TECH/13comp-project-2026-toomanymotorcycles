import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFirestore, collection as col, doc, addDoc, deleteDoc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence,  browserSessionPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNRUASOXGQabiR8LGBzKP6BDSEEAHdTR8",
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
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    const AUTH = getAuth();
    setPersistence(AUTH,browserSessionPersistence);
    console.log("CDS: Authentication Persistence set to 'session'")
    document.getElementById("loading").setAttribute("hidden",true);
    document.getElementById("page").removeAttribute("style");
    console.log("CDS: Initialisation complete.");
}
try {
    init();
    onAuthStateChanged(getAuth(), (user) => {
        if (user) {
            window.location.href = "../../pages/hub/hub.html";
        }
    })
} catch (err) {
    console.error(`-!- CDS FATAL ERROR -!-\nInitialisation FAILED\n${err}`);
    document.getElementById("loading-gif").setAttribute("src","./../../resources/resources_global/warning.png");
    document.getElementById("loading-gif").setAttribute("width",200);
    document.getElementById("loading-gif").setAttribute("height",200);
    document.getElementById("loading-message").innerText = "A fatal error has occured, try again later.";
    document.getElementById("loading-message").setAttribute("style","color:indianred");
    document.getElementById("fatalerror-info").removeAttribute("hidden");
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

function rememberMeToggle() {
    const AUTH = getAuth();
    if (document.getElementById("remember-me-toggle").checked) {
        setPersistence(AUTH,browserLocalPersistence);
        console.log("CDS: Authentication Persistence set to 'local'")
    } else {
        setPersistence(AUTH,browserSessionPersistence);
        console.log("CDS: Authentication Persistence set to 'session'")
    }
}

function loginWithGoogle() {
    const AUTH = getAuth();
    const PROVIDER = new GoogleAuthProvider();
    PROVIDER.setCustomParameters({
        prompt: 'select_account'
    });
    console.log(AUTH);
    console.log(PROVIDER);
    toggleButtonState(document.getElementById("google-button"),false);
    signInWithPopup(AUTH, PROVIDER).then((authResult) => {
        console.log(authResult);
    }).catch((err) => {
        if (err.code != "auth/popup-closed-by-user") {document.getElementById("google-error").removeAttribute("hidden");}
        console.warn(`-!- CDS ERROR -!-\nAuthentication FAILED\n${err}`);
        toggleButtonState(document.getElementById("google-button"),true,"<b>Sign in with Google</b>");
    })
}

function loginWithUserPasswd(email,passwd) {
    const AUTH = getAuth();
    
    toggleButtonState(document.getElementById("login-button"),false);
    signInWithEmailAndPassword(AUTH, email, passwd).then((userCredential) => {
        console.log(userCredential);
        globalThis.user = userCredential
    }).catch((err) => {
        var errorMessage = document.getElementById("userpass-error");
        errorMessage.removeAttribute("hidden");
        switch(err.code) {
            case "auth/missing-email":
               errorMessage.innerText = "Please enter your email and password.";
               break;
            case "auth/invalid-email":
               errorMessage.innerText = "Invalid email.";
               break;
            case "auth/missing-password":
               errorMessage.innerText = "Please enter your email and password.";
               break;
            case "auth/invalid-credential":
               errorMessage.innerText = "Incorrect username or password.";
               break;
            default:
               errorMessage.innerText = "Internal authentication error, try again later.";
               break;
        };
        console.warn(`-!- CDS ERROR -!-\nAuthentication FAILED\n${err}`);
        toggleButtonState(document.getElementById("login-button"),true,"<b>Login</b>");
    });
}

globalThis.rememberMeToggle = rememberMeToggle;
globalThis.loginWithGoogle = loginWithGoogle;
globalThis.loginWithUserPasswd = loginWithUserPasswd;
