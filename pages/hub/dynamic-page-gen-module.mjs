import { getFirestore, collection as col, doc, getDoc as get, getDocs as getm, query, orderBy, limit, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export function generatePage(app) {
    const DB = getFirestore(app);
    var gameEntries = [];
    var index = 0;
    getm(col(DB, 'gameEntries')).then((snap) => {
        snap.forEach((doc) => {
            var newEntry = document.createElement("img");
            newEntry.id = "game-entry-" + index;
            newEntry.src = doc.data().icon;
            newEntry.dataset.gameID = doc.id;
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

export function generateHighscores(app) {
    const DB = getFirestore(app);
    document.getElementById("leaderboards-container").innerHTML = "";
    getm(col(DB, 'importantScores')).then((snap) => {
        snap.forEach((entry) => {
            var scores = Object.entries(entry.data());
            scores = scores.sort((a,b) => {
                return b[1] - a[1];
            })
            var newEntry = document.createElement("div");
            newEntry.id = "leaderboard-entry-" + entry.id;
            var entryGameTitle = document.createElement("h2");
            var entryGameLeaderboardTitle = document.createElement("h3");
            get(doc(DB, 'gameEntries', entry.id)).then((data) => {
                entryGameTitle.innerText = data.data().name;
                entryGameLeaderboardTitle.innerText = data.data()['importantScore-name'];
            })
            var newList = document.createElement("ol");
            scores.forEach((value) => {
                var newScore = document.createElement("li");
                newScore.innerText = `${value[0]} (${value[1]})`;
                newList.appendChild(newScore);
            })
            newEntry.appendChild(entryGameTitle);
            newEntry.appendChild(entryGameLeaderboardTitle);
            newEntry.appendChild(newList);
            document.getElementById("leaderboards-container").appendChild(newEntry);
        });
    });
}

function lobbyPlayerListUpdateHandler(lobby) {
    console.log(lobby.playerList)
}

function displayEntry(entry) {
    var lightbox = null;
    console.log(entry.target);
    console.log(entry.target.dataset.mtplr)
    if (entry.target.dataset.mtplr == "true") {lightbox = document.getElementById("multiplayer-game-description")} else {};
    lightbox.getElementsByClassName("dsc-banner")[0].textContent =  entry.target.dataset.bnr;
    lightbox.getElementsByClassName("dsc-header")[0].textContent =  entry.target.dataset.title;
    lightbox.getElementsByClassName("dsc-para")[0].textContent =  entry.target.dataset.desc;
    if (entry.target.dataset.mtplr == "true") {
        document.getElementById("multiplayer-lobby-create").addEventListener("click", () => {lightbox.close(); joinLobby(0,entry.target.parent,lobbyPlayerListUpdateHandler)});
    }
    lightbox.showModal();
}