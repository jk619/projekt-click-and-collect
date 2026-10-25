
// ==================================
// 1. SPIELWERTE
// ==================================

let punkte = 0;
let muenzenProKlick = 5;
let upgradePreis = 20;

let maschinenAnzahl = 0;
let maschinenPreis = 50;

// Wir verwenden unseren bisherigen Spielstand weiter
const SPEICHER_NAME = "click-and-collect-spielstand-v1";

// Maximal 24 Stunden Offline-Produktion
const MAX_OFFLINE_SEKUNDEN = 24 * 60 * 60;

// Zeitpunkt der letzten berechneten Produktion
let letzterProduktionsZeitpunkt = Date.now();


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

const speichernButton =
    document.getElementById("spiel-speichern");

const speicherStatus =
    document.getElementById("speicher-status");

// NEU: Anzeige für den Offline-Bonus
const offlineInfo =
    document.getElementById("offline-info");


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

    upgradeButton.disabled = punkte < upgradePreis;

    maschineKaufenButton.disabled =
        punkte < maschinenPreis;
}


// ==================================
// 4. PRODUKTION NACH ZEIT BERECHNEN
// ==================================

function produktionBerechnen() {

    const jetzt = Date.now();

    // Wie viele volle Sekunden sind vergangen?
    const vergangeneSekunden = Math.floor(
        (jetzt - letzterProduktionsZeitpunkt) / 1000
    );

    if (vergangeneSekunden <= 0) {

        // Falls die Systemuhr zurückgestellt wurde
        if (jetzt < letzterProduktionsZeitpunkt) {
            letzterProduktionsZeitpunkt = jetzt;
        }

        return;
    }

    // Maschinen produzieren für die vergangene Zeit
    punkte = punkte +
        vergangeneSekunden * maschinenAnzahl;

    // Zeitpunkt der letzten Produktion aktualisieren
    letzterProduktionsZeitpunkt +=
        vergangeneSekunden * 1000;

    anzeigeAktualisieren();
}


// ==================================
// 5. SPIELSTAND SPEICHERN
// ==================================

function spielSpeichern(art) {

    // Zuerst noch ausstehende Münzen berechnen
    produktionBerechnen();

    const spielstand = {
        punkte: punkte,
        muenzenProKlick: muenzenProKlick,
        upgradePreis: upgradePreis,
        maschinenAnzahl: maschinenAnzahl,
        maschinenPreis: maschinenPreis,

        // NEU: Produktionszeitpunkt speichern
        letzterProduktionsZeitpunkt:
            letzterProduktionsZeitpunkt
    };

    try {

        localStorage.setItem(
            SPEICHER_NAME,
            JSON.stringify(spielstand)
        );

        const uhrzeit =
            new Date().toLocaleTimeString("de-DE");

        speicherStatus.textContent =
            (art === "manuell"
                ? "💾 Manuell"
                : "✅ Automatisch") +
            " gespeichert um " + uhrzeit;

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Speichern fehlgeschlagen!";

        console.error("Speicherfehler:", fehler);
    }
}


// ==================================
// 6. SPIELSTAND LADEN + OFFLINE-BONUS
// ==================================

function spielLaden() {

    try {

        const gespeichert =
            localStorage.getItem(SPEICHER_NAME);

        if (gespeichert === null) {

            speicherStatus.textContent =
                "Neues Spiel gestartet.";

            return;
        }

        const daten = JSON.parse(gespeichert);

        // Prüfen, ob der Spielstand gültig ist
        const gueltig = daten &&
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

        // Bisherigen Spielstand wiederherstellen
        punkte = daten.punkte;
        muenzenProKlick = daten.muenzenProKlick;
        upgradePreis = daten.upgradePreis;
        maschinenAnzahl = daten.maschinenAnzahl;
        maschinenPreis = daten.maschinenPreis;

        // ==================================
        // NEU: OFFLINE-FORTSCHRITT
        // ==================================

        const jetzt = Date.now();

        let offlineBonus = 0;

        // Nur berechnen, wenn ein gültiger
        // Produktionszeitpunkt gespeichert wurde
        if (
            Number.isSafeInteger(
                daten.letzterProduktionsZeitpunkt
            ) &&
            daten.letzterProduktionsZeitpunkt > 0 &&
            daten.letzterProduktionsZeitpunkt <= jetzt
        ) {

            // Sekunden seit der letzten Produktion
            const verstricheneSekunden = Math.floor(
                (jetzt -
                daten.letzterProduktionsZeitpunkt) / 1000
            );

            // Maximal 24 Stunden anrechnen
            const angerechneteSekunden = Math.min(
                verstricheneSekunden,
                MAX_OFFLINE_SEKUNDEN
            );

            // Offline-Münzen berechnen
            offlineBonus =
                angerechneteSekunden * maschinenAnzahl;

            // Bonus zum Münzstand hinzufügen
            punkte = punkte + offlineBonus;

            // Meldung für den Spieler erstellen
            if (offlineBonus > 0) {

                const dauer =
                    angerechneteSekunden >= 60
                        ? Math.floor(
                            angerechneteSekunden / 60
                          ) + " Minuten"
                        : angerechneteSekunden +
                          " Sekunden";

                offlineInfo.textContent =
                    "🌙 Willkommen zurück! Deine " +
                    maschinenAnzahl +
                    " Maschinen haben in " +
                    dauer +
                    " insgesamt " +
                    offlineBonus.toLocaleString("de-DE") +
                    " Münzen produziert!";
            }
        }

        // Ab jetzt läuft die neue Spielzeit
        letzterProduktionsZeitpunkt = jetzt;

        speicherStatus.textContent =
            "✅ Spielstand geladen.";

        // Offline-Bonus direkt sichern.
        // So kann er nicht doppelt vergeben werden.
        if (offlineBonus > 0) {

            spielSpeichern("automatisch");
        }

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Spielstand konnte nicht geladen werden.";

        console.error("Ladefehler:", fehler);
    }
}


// ==================================
// 7. MÜNZEN DURCH KLICKEN SAMMELN
// ==================================

sammelnButton.addEventListener("click", function() {

    produktionBerechnen();

    punkte = punkte + muenzenProKlick;

    anzeigeAktualisieren();

    spielSpeichern("automatisch");
});


// ==================================
// 8. KLICK-UPGRADES KAUFEN
// ==================================

upgradeButton.addEventListener("click", function() {

    produktionBerechnen();

    if (punkte >= upgradePreis) {

        punkte = punkte - upgradePreis;

        muenzenProKlick = muenzenProKlick + 5;

        upgradePreis = upgradePreis + 20;

        anzeigeAktualisieren();

        spielSpeichern("automatisch");
    }
});


// ==================================
// 9. MÜNZMASCHINEN KAUFEN
// ==================================

maschineKaufenButton.addEventListener("click", function() {

    produktionBerechnen();

    if (punkte >= maschinenPreis) {

        punkte = punkte - maschinenPreis;

        maschinenAnzahl = maschinenAnzahl + 1;

        maschinenPreis = maschinenPreis + 25;

        anzeigeAktualisieren();

        spielSpeichern("automatisch");
    }
});


// ==================================
// 10. MANUELL SPEICHERN
// ==================================

speichernButton.addEventListener("click", function() {

    spielSpeichern("manuell");
});


// ==================================
// 11. AUTOMATISCHE PRODUKTION
// ==================================

// Etwa jede Sekunde Produktion berechnen
setInterval(produktionBerechnen, 1000);


// ==================================
// 12. AUTOMATISCHES SPEICHERN
// ==================================

// Alle 10 Sekunden speichern
setInterval(function() {

    spielSpeichern("automatisch");

}, 10000);


// ==================================
// 13. BEIM VERLASSEN SPEICHERN
// ==================================

window.addEventListener("pagehide", function() {

    spielSpeichern("automatisch");

});


// ==================================
// 14. SPIEL STARTEN
// ==================================

spielLaden();

anzeigeAktualisieren();
