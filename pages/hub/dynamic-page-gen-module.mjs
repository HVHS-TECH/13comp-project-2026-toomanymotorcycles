import { getFirestore, collection as col, doc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export function generatePage(app) {
    const DB = getFirestore(app);
    var gameEntries = [];
    var index = 0;
    getm(col(DB, 'gameEntries')).then((snap) => {
        snap.forEach((doc) => {
            console.log(doc.data());
            var newEntry = document.createElement("img");
            newEntry.id = "game-entry-" + index;
            newEntry.src = doc.data().icon;
            newEntry.dataset.title = doc.data().name;
            newEntry.dataset.desc = doc.data().description;
            newEntry.dataset.bnr = doc.data()["banner-pic"];
            newEntry.dataset.mtplr = doc.data().multiplayer;
            newEntry.addEventListener("click",displayEntry);
            document.getElementById("games-container").appendChild(newEntry);
            index ++;
        });
    });
}

function displayEntry(entry) {
    var lightbox = null;
    console.log(entry.target);
    console.log(entry.target.dataset.mtplr)
    if (entry.target.dataset.mtplr == "true") {lightbox = document.getElementById("multiplayer-game-description")} else {};
    lightbox.getElementsByClassName("dsc-banner")[0].textContent =  entry.target.dataset.bnr;
    lightbox.getElementsByClassName("dsc-header")[0].textContent =  entry.target.dataset.title;
    lightbox.getElementsByClassName("dsc-para")[0].textContent =  entry.target.dataset.desc;
    lightbox.showModal();
}