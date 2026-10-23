
// ==================================
// 1. SPIELWERTE
// ==================================

let punkte = 0;
let muenzenProKlick = 5;
let upgradePreis = 20;

let maschinenAnzahl = 0;
let maschinenPreis = 50;

// Name unseres gespeicherten Spielstands
const SPEICHER_NAME = "click-and-collect-spielstand-v1";


// ==================================
// 2. HTML-ELEMENTE FINDEN
// ==================================

const anzeige = document.getElementById("punkte");
const sammelnButton = document.getElementById("sammeln");

const upgradeButton = document.getElementById("upgrade");
const klickWertAnzeige = document.getElementById("klick-wert");
const preisAnzeige = document.getElementById("upgrade-preis");

const maschinenAnzeige =
    document.getElementById("maschinen-anzahl");

const produktionAnzeige =
    document.getElementById("muenzen-pro-sekunde");

const maschinenPreisAnzeige =
    document.getElementById("maschinen-preis");

const maschineKaufenButton =
    document.getElementById("maschine-kaufen");

// Neue Elemente für die Speicherung
const speichernButton =
    document.getElementById("spiel-speichern");

const speicherStatus =
    document.getElementById("speicher-status");


// ==================================
// 3. ANZEIGEN AKTUALISIEREN
// ==================================

function anzeigeAktualisieren() {

    anzeige.textContent = punkte;

    klickWertAnzeige.textContent = muenzenProKlick;

    preisAnzeige.textContent = upgradePreis;

    maschinenAnzeige.textContent = maschinenAnzahl;

    produktionAnzeige.textContent = maschinenAnzahl;

    maschinenPreisAnzeige.textContent = maschinenPreis;

    // Kaufbuttons nur bei genügend Münzen aktivieren
    upgradeButton.disabled = punkte < upgradePreis;

    maschineKaufenButton.disabled =
        punkte < maschinenPreis;
}


// ==================================
// 4. SPIELSTAND SPEICHERN
// ==================================

function spielSpeichern(art) {

    // Alle wichtigen Werte zusammenfassen
    const spielstand = {
        punkte: punkte,
        muenzenProKlick: muenzenProKlick,
        upgradePreis: upgradePreis,
        maschinenAnzahl: maschinenAnzahl,
        maschinenPreis: maschinenPreis
    };

    try {

        // Spielstand im Browser speichern
        localStorage.setItem(
            SPEICHER_NAME,
            JSON.stringify(spielstand)
        );

        // Aktuelle Uhrzeit ermitteln
        const uhrzeit = new Date().toLocaleTimeString("de-DE");

        // Rückmeldung anzeigen
        if (art === "manuell") {

            speicherStatus.textContent =
                "✅ Manuell gespeichert um " + uhrzeit;

        } else {

            speicherStatus.textContent =
                "✅ Automatisch gespeichert um " + uhrzeit;

        }

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Speichern fehlgeschlagen!";

        console.error("Speicherfehler:", fehler);
    }
}


// ==================================
// 5. SPIELSTAND LADEN
// ==================================

function spielLaden() {

    try {

        // Nach einem gespeicherten Spielstand suchen
        const gespeichert =
            localStorage.getItem(SPEICHER_NAME);

        // Wenn noch kein Spielstand existiert
        if (gespeichert === null) {

            speicherStatus.textContent =
                "Neues Spiel gestartet.";

            return;
        }

        // Gespeicherte Daten zurückverwandeln
        const daten = JSON.parse(gespeichert);

        // Prüfen, ob die Daten gültig sind
        const gueltig =
            daten &&
            Number.isSafeInteger(daten.punkte) &&
            daten.punkte >= 0 &&
            Number.isSafeInteger(daten.muenzenProKlick) &&
            daten.muenzenProKlick >= 5 &&
            Number.isSafeInteger(daten.upgradePreis) &&
            daten.upgradePreis >= 1 &&
            Number.isSafeInteger(daten.maschinenAnzahl) &&
            daten.maschinenAnzahl >= 0 &&
            Number.isSafeInteger(daten.maschinenPreis) &&
            daten.maschinenPreis >= 1;

        if (!gueltig) {
            speicherStatus.textContent =
                "⚠️ Spielstand ist ungültig.";
            return;
        }

        // Alle gespeicherten Werte wiederherstellen
        punkte = daten.punkte;

        muenzenProKlick = daten.muenzenProKlick;

        upgradePreis = daten.upgradePreis;

        maschinenAnzahl = daten.maschinenAnzahl;

        maschinenPreis = daten.maschinenPreis;

        speicherStatus.textContent =
            "✅ Spielstand erfolgreich geladen!";

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Spielstand konnte nicht geladen werden.";

        console.error("Ladefehler:", fehler);
    }
}


// ==================================
// 6. MÜNZEN SAMMELN
// ==================================

sammelnButton.addEventListener("click", function() {

    punkte = punkte + muenzenProKlick;

    anzeigeAktualisieren();

    // Nach dem Klick automatisch speichern
    spielSpeichern("automatisch");

});


// ==================================
// 7. KLICK-UPGRADES KAUFEN
// ==================================

upgradeButton.addEventListener("click", function() {

    if (punkte >= upgradePreis) {

        punkte = punkte - upgradePreis;

        muenzenProKlick = muenzenProKlick + 5;

        upgradePreis = upgradePreis + 20;

        anzeigeAktualisieren();

        // Nach dem Kauf automatisch speichern
        spielSpeichern("automatisch");
    }

});


// ==================================
// 8. MÜNZMASCHINEN KAUFEN
// ==================================

maschineKaufenButton.addEventListener("click", function() {

    if (punkte >= maschinenPreis) {

        punkte = punkte - maschinenPreis;

        maschinenAnzahl = maschinenAnzahl + 1;

        maschinenPreis = maschinenPreis + 25;

        anzeigeAktualisieren();

        // Nach dem Kauf automatisch speichern
        spielSpeichern("automatisch");
    }

});


// ==================================
// 9. AUTOMATISCHE MÜNZPRODUKTION
// ==================================

setInterval(function() {

    if (maschinenAnzahl > 0) {

        punkte = punkte + maschinenAnzahl;

        anzeigeAktualisieren();
    }

}, 1000);


// ==================================
// 10. AUTOMATISCHES SPEICHERN
// ==================================

// Zusätzlich alle 10 Sekunden speichern
setInterval(function() {

    spielSpeichern("automatisch");

}, 10000);


// ==================================
// 11. MANUELLES SPEICHERN
// ==================================

speichernButton.addEventListener("click", function() {

    spielSpeichern("manuell");

});


// ==================================
// 12. BEIM VERLASSEN SPEICHERN
// ==================================

window.addEventListener("pagehide", function() {

    spielSpeichern("automatisch");

});


// ==================================
// 13. SPIEL STARTEN
// ==================================

// Vorhandenen Spielstand laden
spielLaden();

// Aktuellen Spielstand anzeigen
anzeigeAktualisieren();
