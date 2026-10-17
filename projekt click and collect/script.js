let punkte = 0;

const anzeige = document.getElementById("punkte");
const button = document.getElementById("sammeln");

button.addEventListener("click", function() {
    punkte = punkte + 5;
    anzeige.textContent = punkte;
});