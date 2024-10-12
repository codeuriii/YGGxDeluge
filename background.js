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

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",  // Ajout du mode CORS
        headers: {
            "Content-Type": "application/json",
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

// Fonction pour ajouter un torrent avec l'URL et les cookies
async function addTorrent(link, cookies) {
    const torrentResponse = await fetch(link, {
        method: 'GET',
        headers: {
            'Cookie': cookies
        }
    });

    if (!torrentResponse.ok) {
        throw new Error('Failed to download the torrent file from the indexer.');
    }

    // Lire le fichier torrent sous forme de blob
    const torrentBlob = await torrentResponse.blob();

    // Lire le blob en tant qu'ArrayBuffer
    const arrayBuffer = await torrentBlob.arrayBuffer();

    // Convertir l'ArrayBuffer en un tableau d'octets (bytes)
    const torrentFileBytes = new Uint8Array(arrayBuffer);

    // Convertir les octets en un tableau de base64 pour que Deluge les traite comme un fichier valide
    const torrentBase64 = btoa(String.fromCharCode.apply(null, torrentFileBytes));

    const url = `${delugeConfig.host}:${delugeConfig.port}/json`;

    // Ajouter le torrent à Deluge en envoyant le fichier encodé en base64
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method: 'core.add_torrent_file',
            params: ["downloaded_torrent.torrent", torrentBase64, {}],
            id: 2
        })
    });

    const data = await response.json();
    // console.log(await response.text())
    return data.result;  // Renvoie l'ID du torrent ajouté
}

// Fonction pour ajouter un label au torrent
async function setLabel(torrentId, label) {
    const url = `${delugeConfig.host}:${delugeConfig.port}/json`;

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",  // Ajout du mode CORS
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
    return data.error;  // Renvoie `true` si le label est appliqué avec succès
}

// Écoute les messages envoyés depuis content.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "addTorrent") {
        const { link, label } = message;

        // Connexion à l'API de Deluge
        const connected = await connectToDeluge();
        if (!connected) {
            console.error("Connexion à Deluge échouée");
            sendResponse({ status: "Erreur de connexion" });
            return;
        }

        // Ajout du torrent avec l'URL et les cookies
        const torrentId = await addTorrent("https://ygg.re" + link, await getCookie("ygg_", "https://ygg.re"));
        if (torrentId) {
            console.log("Torrent ajouté avec succès:", torrentId);

            // Ajout du label si disponible
            if (label) {
                const labelSet = await setLabel(torrentId, label);
                if (!labelSet) {
                    console.log("Label ajouté:", label);
                } else {
                    console.error("Erreur lors de l'ajout du label");
                }
            }

            sendResponse({ status: "Torrent ajouté et label appliqué" });
        } else {
            console.error("Erreur lors de l'ajout du torrent");
            sendResponse({ status: "Erreur lors de l'ajout du torrent" });
        }
    }

    // Prowlarr part
    else if (message.action === "prowlarr") {
        updateProwlarrIndexer()
    }
});

async function getCookie(cookieName, domainUrl) {
    return await new Promise((resolve, reject) => {
        // Utilisation de l'API chrome.cookies pour récupérer le cookie
        chrome.cookies.get({ url: domainUrl, name: cookieName }, function (cookie) {
            if (cookie) {
                console.log(cookie.value)
                resolve(cookie.value); // Retourne la valeur du cookie si trouvé
            } else {
                reject(`Cookie "${cookieName}" not found on domain ${domainUrl}`);
            }
        });
    });
}

async function updateProwlarrIndexer() {
    const cookie = `ygg_=${await getCookie("ygg_", "https://ygg.re")}`
    fetch("http://192.168.1.253:9696/api/v1/indexer/11", {
        headers: {
            "X-Api-Key": "aba331ee587245008bf5c2e0f06f376c",
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
    .then(data => {
        let raw = data
        for (const d of raw.fields) {
            if (d.name === "cookie") {
                d.value = cookie
                break
            }
        }

        fetch("http://192.168.1.253:9696/api/v1/indexer/11", {
            headers: {
                "X-Api-Key": "aba331ee587245008bf5c2e0f06f376c",
                "Content-Type": "application/json"
            },
            method: "PUT",
            body: JSON.stringify(raw)
        }).then(response => response.text())
        .then(data => {
            if (data === 202) {
                console.log("Prowlarr indexer updated!");
            } else {
                console.log(data)
                console.error("battu")
            }
        })
    })
}