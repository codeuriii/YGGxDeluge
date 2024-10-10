
const element = document.querySelector('a.butt');

function createButton(element) {
    const myButton = document.createElement("a")
    myButton.className = "butt"
    myButton.textContent = "Envoyer a deluge"
    myButton.style.borderColor = "#4975d1"
    myButton.style.color = "white"
    console.log(element.parentElement.style.background)
    myButton.style.marginLeft = "5px"
    myButton.addEventListener("mouseenter", () => {
        myButton.style.backgroundColor = "#4975d1"
    })
    myButton.addEventListener("mouseleave", () => {
        myButton.style.backgroundColor = element.style.color
    })
    myButton.addEventListener("click", () => {
        addTorrentToDeluge(getTorrentLink(), getCategorie())
    })
    element.parentElement.appendChild(myButton)
}

function getCategorie() {
    const categories = {
        "2183": "radarr",
        "2184": "sonarr",
        "2179": "sonarr",
        "2178": "radarr",
        "2148": "lidarr"
    }
    const div = document.querySelector("div.tag")
    const regexp = /tag_subcat_(\d+)/
    const id = div.className.match(regexp)[1]
    if (id in categories) {
        return categories[id]
    }
}

function getTorrentLink() {
    return element.getAttribute("href")
}

function addTorrentToDeluge(link, label) {
    // Récupérer les cookies (si applicable)
    const cookies = document.cookie;

    chrome.runtime.sendMessage(
        {
            action: "addTorrent",
            link: link,
            label: label,
            cookies: cookies
        },
        response => {
            console.log("Réponse du background:", response);
        }
    );
}

if (element) {
    createButton(element)
}