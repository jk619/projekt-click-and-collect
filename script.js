
// ==================================
// 1. UNSERE SPIELWERTE
// ==================================

let punkte = 0;

let muenzenProKlick = 5;

let upgradePreis = 20;

// Neue Werte für die Maschinen
let maschinenAnzahl = 0;

let maschinenPreis = 50;


// ==================================
// 2. HTML-ELEMENTE FINDEN
// ==================================

const anzeige = document.getElementById("punkte");

const sammelnButton = document.getElementById("sammeln");

const upgradeButton = document.getElementById("upgrade");

const klickWertAnzeige =
    document.getElementById("klick-wert");

const preisAnzeige =
    document.getElementById("upgrade-preis");

// Neue Elemente für die Maschinen
const maschinenAnzeige =
    document.getElementById("maschinen-anzahl");

const produktionAnzeige =
    document.getElementById("muenzen-pro-sekunde");

const maschinenPreisAnzeige =
    document.getElementById("maschinen-preis");

const maschineKaufenButton =
    document.getElementById("maschine-kaufen");


// ==================================
// 3. ALLE ANZEIGEN AKTUALISIEREN
// ==================================

function anzeigeAktualisieren() {

    anzeige.textContent = punkte;

    klickWertAnzeige.textContent = muenzenProKlick;

    preisAnzeige.textContent = upgradePreis;

    // Maschinen anzeigen
    maschinenAnzeige.textContent = maschinenAnzahl;

    produktionAnzeige.textContent = maschinenAnzahl;

    maschinenPreisAnzeige.textContent = maschinenPreis;

    // Buttons nur bei genug Münzen aktivieren
    upgradeButton.disabled = punkte < upgradePreis;

    maschineKaufenButton.disabled =
        punkte < maschinenPreis;
}


// ==================================
// 4. MÜNZEN DURCH KLICKEN SAMMELN
// ==================================

sammelnButton.addEventListener("click", function() {

    punkte = punkte + muenzenProKlick;

    anzeigeAktualisieren();

});


// ==================================
// 5. KLICK-UPGRADES KAUFEN
// ==================================

upgradeButton.addEventListener("click", function() {

    if (punkte >= upgradePreis) {

        punkte = punkte - upgradePreis;

        muenzenProKlick = muenzenProKlick + 5;

        upgradePreis = upgradePreis + 20;

        anzeigeAktualisieren();
    }

});


// ==================================
// 6. MÜNZMASCHINEN KAUFEN
// ==================================

maschineKaufenButton.addEventListener("click", function() {

    if (punkte >= maschinenPreis) {

        // Preis bezahlen
        punkte = punkte - maschinenPreis;

        // Eine neue Maschine hinzufügen
        maschinenAnzahl = maschinenAnzahl + 1;

        // Nächste Maschine wird teurer
        maschinenPreis = maschinenPreis + 25;

        // Anzeigen aktualisieren
        anzeigeAktualisieren();
    }

});


// ==================================
// 7. AUTOMATISCHE PRODUKTION
// ==================================

setInterval(function() {

    // Jede Maschine produziert 1 Münze pro Sekunde
    punkte = punkte + maschinenAnzahl;

    // Neuen Münzstand anzeigen
    anzeigeAktualisieren();

}, 1000);


// ==================================
// 8. SPIEL STARTEN
// ==================================

anzeigeAktualisieren();
