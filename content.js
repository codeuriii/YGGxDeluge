
const element = document.querySelector('a.butt');

function createButton(element) {
    const myButton = document.createElement("a")
    myButton.className = "butt"
    myButton.textContent = "Envoyer a deluge"
    myButton.style.borderColor = "#4975d1"
    myButton.style.color = "#4975d1"
    myButton.style.marginLeft = "5px"
    myButton.addEventListener("mouseenter", () => {
        myButton.style.backgroundColor = "#4975d1"
        myButton.style.color = "white"
    })
    myButton.addEventListener("mouseleave", () => {
        myButton.style.backgroundColor = "white"
        myButton.style.color = "#4975d1"
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

if (element) {
    createButton(element)
    console.log(getCategorie())
}