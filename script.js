let punkte = 0;

const anzeige = document.getElementById("punkte");
const button = document.getElementById("sammeln");

button.addEventListener("click", function() {
    punkte = punkte + 50;
    anzeige.textContent = punkte;
});