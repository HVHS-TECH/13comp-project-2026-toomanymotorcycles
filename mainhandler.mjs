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

var currentDeletionTimeout, app, analytics, auth, google, db, initialised = false;
try {
    console.info("-------------------------------------\n--- CHAOS DATABASE SOLUTIONS V1.0 ---\n------ COPYRIGHT OF CHAOS INC. ------\n-------------------------------------");
    console.log("CDS: Initialising...");
    globalThis.user = undefined;
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    auth = getAuth();
    google = new GoogleAuthProvider();
    console.log("CDS: Initialisation complete.");
} catch (err) {
    console.error(`-!- CDS FATAL ERROR -!-\nInitialisation FAILED\n${err}`);
};
