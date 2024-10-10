// background.js

// Configurations de connexion à l'API de Deluge
const delugeConfig = {
    host: "http://192.168.1.253",   // Adresse de ton interface Deluge Web
    port: 8112,                     // Port par défaut de l'interface web de Deluge
    password: "deluge"              // Le mot de passe que tu as configuré pour l'interface web
};

// Fonction pour se connecter à Deluge
async function connectToDeluge() {
    const url = `${delugeConfig.host}:${delugeConfig.port}/json`;

    // Requête de connexion pour authentifier
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            method: "auth.login",
            params: [delugeConfig.password],
            id: 1
        })
    });

    const data = await response.json();
    return data.result;  // Renvoie `true` si l'authentification réussit
}

// Fonction pour ajouter un torrent par lien (URL ou magnet)
async function addTorrent(link) {
    const url = `${delugeConfig.host}:${delugeConfig.port}/json`;

    // Requête pour ajouter le torrent via Deluge
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            method: "core.add_torrent_url",
            params: [link, {}],
            id: 2
        })
    });

    const data = await response.json();
    return data.result;  // Renvoie l'ID du torrent ajouté
}

// Fonction pour ajouter un label au torrent
async function setLabel(torrentId, label) {
    const url = `${delugeConfig.host}:${delugeConfig.port}/json`;

    // Requête pour assigner un label à un torrent
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            method: "label.set_torrent",
            params: [torrentId, label],
            id: 3
        })
    });

    const data = await response.json();
    return data.result;  // Renvoie `true` si le label est appliqué avec succès
}

// Écoute les messages envoyés depuis content.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "addTorrent") {
        const { link, label } = message;

        // Connexion à l'API de Deluge
        const connected = await connectToDeluge();
        if (!connected) {
            console.error("Connexion à Deluge échouée");
            sendResponse({status: "Erreur de connexion"});
            return;
        }

        // Ajout du torrent
        const torrentId = await addTorrent(link);
        if (torrentId) {
            console.log("Torrent ajouté avec succès:", torrentId);

            // Ajout du label si disponible
            if (label) {
                const labelSet = await setLabel(torrentId, label);
                if (labelSet) {
                    console.log("Label ajouté:", label);
                } else {
                    console.error("Erreur lors de l'ajout du label");
                }
            }

            sendResponse({status: "Torrent ajouté et label appliqué"});
        } else {
            console.error("Erreur lors de l'ajout du torrent");
            sendResponse({status: "Erreur lors de l'ajout du torrent"});
        }
    }
});
