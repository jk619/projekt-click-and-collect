
// Unser aktueller Spielstand
let punkte = 0;

// So viele Münzen bekommen wir pro Klick
let muenzenProKlick = 5;

// Das erste Upgrade kostet 20 Münzen
let upgradePreis = 20;

// Elemente aus HTML finden
const anzeige = document.getElementById("punkte");
const sammelnButton = document.getElementById("sammeln");
const upgradeButton = document.getElementById("upgrade");

const klickWertAnzeige = document.getElementById("klick-wert");
const preisAnzeige = document.getElementById("upgrade-preis");


// Diese Funktion aktualisiert unsere Anzeigen
function anzeigeAktualisieren() {

    anzeige.textContent = punkte;

    klickWertAnzeige.textContent = muenzenProKlick;

    preisAnzeige.textContent = upgradePreis;

    // Upgrade nur erlauben, wenn genug Münzen da sind
    upgradeButton.disabled = punkte < upgradePreis;
}


// Wenn der Spieler Münzen sammelt
sammelnButton.addEventListener("click", function() {

    punkte = punkte + muenzenProKlick;

    anzeigeAktualisieren();

});


// Wenn der Spieler ein Upgrade kaufen möchte
upgradeButton.addEventListener("click", function() {

    // Hat der Spieler genug Münzen?
    if (punkte >= upgradePreis) {

        // Münzen für das Upgrade abziehen
        punkte = punkte - upgradePreis;

        // Pro Klick gibt es jetzt 5 Münzen mehr
        muenzenProKlick = muenzenProKlick + 5;

        // Das nächste Upgrade wird teurer
        upgradePreis = upgradePreis + 20;

        // Anzeigen aktualisieren
        anzeigeAktualisieren();

    }

});


// Beim Start alle Werte anzeigen
anzeigeAktualisieren();