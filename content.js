console.log("Test injection du content script");

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
    const div = document.querySelector("div.tag")
    const regexp = /tag_subcat_(\d+)/
    return div.className.match(regexp)[1]
}

if (element) {
    createButton(element)
    console.log(getCategorie())
}