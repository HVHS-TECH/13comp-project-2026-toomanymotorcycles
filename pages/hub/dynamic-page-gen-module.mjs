import { getFirestore, collection as col, doc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export function generatePage(app) {
    const DB = getFirestore(app);
    getm(col(DB, 'gameEntries')).then((snap) => {
        snap.forEach((doc) => {
            console.log(doc.data());
        })
    });
}