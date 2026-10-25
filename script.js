
// ==================================
// 1. SPIELWERTE
// ==================================

let punkte = 0;
let muenzenProKlick = 5;
let upgradePreis = 20;

let maschinenAnzahl = 0;
let maschinenPreis = 50;

// Gleicher Speichername wie bisher!
// Dadurch bleiben alte Spielstände erhalten.
const SPEICHER_NAME = "click-and-collect-spielstand-v1";

// Maximal 24 Stunden Offline-Produktion
const MAX_OFFLINE_SEKUNDEN = 24 * 60 * 60;

// Zeitpunkt der letzten Produktion
let letzterProduktionsZeitpunkt = Date.now();

// NEU: Noch nicht eingesammelte Münzen
let ausstehenderOfflineBonus = 0;
let ausstehendeOfflineSekunden = 0;


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

// NEU: Elemente unseres Willkommensfensters
const offlineModal =
    document.getElementById("offline-modal");

const offlineZeitAnzeige =
    document.getElementById("offline-zeit");

const offlineBonusAnzeige =
    document.getElementById("offline-bonus");

const offlineEinsammelnButton =
    document.getElementById("offline-einsammeln");
// ==================================
// NEU: BACKUP-ELEMENTE FINDEN
// ==================================

const exportierenButton =
    document.getElementById("spiel-exportieren");

const importierenButton =
    document.getElementById("spiel-importieren");

const importDateiInput =
    document.getElementById("spiel-datei");

// ==================================
// 3. SPIELANZEIGE AKTUALISIEREN
// ==================================

function anzeigeAktualisieren() {

    anzeige.textContent = punkte.toLocaleString("de-DE");

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
// 4. NORMALE PRODUKTION BERECHNEN
// ==================================

function produktionBerechnen() {

    const jetzt = Date.now();

    if (jetzt < letzterProduktionsZeitpunkt) {
        letzterProduktionsZeitpunkt = jetzt;
        return;
    }

    const sekunden = Math.floor(
        (jetzt - letzterProduktionsZeitpunkt) / 1000
    );

    if (sekunden <= 0) {
        return;
    }

    punkte += sekunden * maschinenAnzahl;

    letzterProduktionsZeitpunkt += sekunden * 1000;

    anzeigeAktualisieren();
}


// ==================================
// 5. OFFLINE-ZEIT FORMATTIEREN
// ==================================

function dauerFormatieren(sekunden) {

    const stunden = Math.floor(sekunden / 3600);

    const minuten = Math.floor(
        (sekunden % 3600) / 60
    );

    const restSekunden = sekunden % 60;

    const teile = [];

    if (stunden > 0) {
        teile.push(stunden + " Std.");
    }

    if (minuten > 0) {
        teile.push(minuten + " Min.");
    }

    if (restSekunden > 0 || teile.length === 0) {
        teile.push(restSekunden + " Sek.");
    }

    return teile.join(" ");
}


// ==================================
// 6. SPIELSTAND SPEICHERN
// ==================================

function spielSpeichern(art) {

    produktionBerechnen();

    const spielstand = {

        punkte: punkte,
        muenzenProKlick: muenzenProKlick,
        upgradePreis: upgradePreis,

        maschinenAnzahl: maschinenAnzahl,
        maschinenPreis: maschinenPreis,

        letzterProduktionsZeitpunkt:
            letzterProduktionsZeitpunkt,

        // NEU: Nicht abgeholten Bonus sichern
        ausstehenderOfflineBonus:
            ausstehenderOfflineBonus,

        ausstehendeOfflineSekunden:
            ausstehendeOfflineSekunden
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

        return true;

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Speichern fehlgeschlagen!";

        console.error(fehler);
        return false;
    }
}


// ==================================
// 7. WILLKOMMENSFENSTER ANZEIGEN
// ==================================

function offlineFensterAnzeigen() {

    if (ausstehenderOfflineBonus <= 0) {
        return;
    }

    offlineZeitAnzeige.textContent =
        dauerFormatieren(ausstehendeOfflineSekunden);

    offlineBonusAnzeige.textContent =
        ausstehenderOfflineBonus.toLocaleString("de-DE");

    // Fenster sichtbar machen
    offlineModal.hidden = false;

    // Tastaturfokus auf Einsammelbutton setzen
    offlineEinsammelnButton.focus();
}


// ==================================
// 8. SPIELSTAND LADEN
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
                "⚠️ Spielstand ungültig.";

            return;
        }

        // Bisherige Werte wiederherstellen
        punkte = daten.punkte;
        muenzenProKlick = daten.muenzenProKlick;
        upgradePreis = daten.upgradePreis;

        maschinenAnzahl = daten.maschinenAnzahl;
        maschinenPreis = daten.maschinenPreis;

        // Bereits vorgemerkten Bonus laden
        ausstehenderOfflineBonus =
            Number.isSafeInteger(
                daten.ausstehenderOfflineBonus
            ) && daten.ausstehenderOfflineBonus >= 0
                ? daten.ausstehenderOfflineBonus
                : 0;

        ausstehendeOfflineSekunden =
            Number.isSafeInteger(
                daten.ausstehendeOfflineSekunden
            ) && daten.ausstehendeOfflineSekunden >= 0
                ? daten.ausstehendeOfflineSekunden
                : 0;

        // ==================================
        // NEUEN OFFLINE-BONUS BERECHNEN
        // ==================================

        const jetzt = Date.now();

        const letzterZeitpunkt =
            daten.letzterProduktionsZeitpunkt;

        if (
            Number.isSafeInteger(letzterZeitpunkt) &&
            letzterZeitpunkt > 0 &&
            letzterZeitpunkt <= jetzt
        ) {

            const vergangeneSekunden = Math.floor(
                (jetzt - letzterZeitpunkt) / 1000
            );

            const offlineSekunden = Math.min(
                vergangeneSekunden,
                MAX_OFFLINE_SEKUNDEN
            );

            const neuerBonus =
                offlineSekunden * maschinenAnzahl;

            // Bonus nur VORMERKEN, nicht gutschreiben!
            ausstehenderOfflineBonus += neuerBonus;

            ausstehendeOfflineSekunden +=
                offlineSekunden;
        }

        // Jetzt beginnt die neue Produktionszeit
        letzterProduktionsZeitpunkt = jetzt;

        anzeigeAktualisieren();

        // Bonus sofort speichern, damit er
        // beim erneuten Laden nicht doppelt entsteht
        spielSpeichern("automatisch");

        // Willkommensfenster bei Bonus öffnen
        offlineFensterAnzeigen();

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Spielstand konnte nicht geladen werden.";

        console.error(fehler);
    }
}


// ==================================
// 9. OFFLINE-MÜNZEN EINSAMMELN
// ==================================

offlineEinsammelnButton.addEventListener(
    "click",
    function() {

        if (ausstehenderOfflineBonus <= 0) {
            return;
        }

        produktionBerechnen();

        // Vorherigen Bonus merken
        const bonus = ausstehenderOfflineBonus;
        const sekunden = ausstehendeOfflineSekunden;

        // Bonus dem Münzstand hinzufügen
        punkte += bonus;

        // Ausstehenden Bonus zurücksetzen
        ausstehenderOfflineBonus = 0;
        ausstehendeOfflineSekunden = 0;

        anzeigeAktualisieren();

        // Neuen Spielstand dauerhaft sichern
        if (spielSpeichern("manuell")) {

            // Fenster schließen
            offlineModal.hidden = true;
            sammelnButton.focus();

        } else {

            // Falls Speichern fehlschlägt,
            // Bonus nicht verlieren
            punkte -= bonus;
            ausstehenderOfflineBonus = bonus;
            ausstehendeOfflineSekunden = sekunden;

            anzeigeAktualisieren();
        }
    }
);


// ==================================
// 10. MÜNZEN SAMMELN
// ==================================

sammelnButton.addEventListener("click", function() {

    produktionBerechnen();

    punkte += muenzenProKlick;

    anzeigeAktualisieren();

    spielSpeichern("automatisch");
});


// ==================================
// 11. KLICK-UPGRADES KAUFEN
// ==================================

upgradeButton.addEventListener("click", function() {

    produktionBerechnen();

    if (punkte >= upgradePreis) {

        punkte -= upgradePreis;

        muenzenProKlick += 5;

        upgradePreis += 20;

        anzeigeAktualisieren();

        spielSpeichern("automatisch");
    }
});


// ==================================
// 12. MÜNZMASCHINEN KAUFEN
// ==================================

maschineKaufenButton.addEventListener(
    "click",
    function() {

        produktionBerechnen();

        if (punkte >= maschinenPreis) {

            punkte -= maschinenPreis;

            maschinenAnzahl += 1;

            maschinenPreis += 25;

            anzeigeAktualisieren();

            spielSpeichern("automatisch");
        }
    }
);


// ==================================
// 13. MANUELLES SPEICHERN
// ==================================

speichernButton.addEventListener("click", function() {

    spielSpeichern("manuell");
});


// ==================================
// 14. AUTOMATISCHE PRODUKTION
// ==================================

setInterval(produktionBerechnen, 1000);


// ==================================
// 15. AUTOMATISCHES SPEICHERN
// ==================================

setInterval(function() {

    spielSpeichern("automatisch");

}, 10000);


// ==================================
// 16. BEIM VERLASSEN SPEICHERN
// ==================================

window.addEventListener("pagehide", function() {

    spielSpeichern("automatisch");
});


// ==================================
// SPIELSTAND EXPORTIEREN
// ==================================

exportierenButton.addEventListener("click", function() {

    try {

        // Aktuelle Maschinenproduktion berücksichtigen
        produktionBerechnen();

        // Alle wichtigen Spielwerte sammeln
        const backup = {

            format: "click-and-collect",
            version: 1,
            exportiertAm: new Date().toISOString(),

            spielstand: {

                punkte: punkte,

                muenzenProKlick: muenzenProKlick,

                upgradePreis: upgradePreis,

                maschinenAnzahl: maschinenAnzahl,

                maschinenPreis: maschinenPreis,

                letzterProduktionsZeitpunkt:
                    letzterProduktionsZeitpunkt,

                ausstehenderOfflineBonus:
                    ausstehenderOfflineBonus,

                ausstehendeOfflineSekunden:
                    ausstehendeOfflineSekunden
            }
        };

        // JavaScript-Daten in JSON-Text verwandeln
        const jsonText = JSON.stringify(backup, null, 2);

        // Daraus eine herunterladbare Datei erstellen
        const datei = new Blob(
            [jsonText],
            { type: "application/json" }
        );

        // Temporäre Download-Adresse erstellen
        const downloadUrl = URL.createObjectURL(datei);

        // Unsichtbaren Download-Link erstellen
        const link = document.createElement("a");

        link.href = downloadUrl;

        // Dateiname mit aktuellem Datum
        const datum = new Date().toISOString().slice(0, 10);

        link.download =
            "click-and-collect-backup-" + datum + ".json";

        // Download starten
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Temporäre Adresse wieder freigeben
        setTimeout(function() {
            URL.revokeObjectURL(downloadUrl);
        }, 1000);

        speicherStatus.textContent =
            "💾 Backup-Download gestartet!";

    } catch (fehler) {

        speicherStatus.textContent =
            "⚠️ Export fehlgeschlagen!";

        console.error("Exportfehler:", fehler);
    }
});


// ==================================
// BACKUP-DATEN ÜBERPRÜFEN
// ==================================

function istGueltigerBackupSpielstand(daten) {

    if (!daten || typeof daten !== "object") {
        return false;
    }

    // Hilfsfunktion für gültige ganze Zahlen
    function gueltigeZahl(wert, minimum) {
        return Number.isSafeInteger(wert) &&
               wert >= minimum;
    }

    return (
        gueltigeZahl(daten.punkte, 0) &&

        gueltigeZahl(daten.muenzenProKlick, 5) &&

        gueltigeZahl(daten.upgradePreis, 1) &&

        gueltigeZahl(daten.maschinenAnzahl, 0) &&

        gueltigeZahl(daten.maschinenPreis, 1) &&

        gueltigeZahl(daten.ausstehenderOfflineBonus, 0) &&

        gueltigeZahl(daten.ausstehendeOfflineSekunden, 0) &&

        // Verhindert zu große Zahlen beim Einsammeln
        daten.ausstehenderOfflineBonus <=
            Number.MAX_SAFE_INTEGER - daten.punkte
    );
}


// ==================================
// SPIELSTAND IMPORTIEREN
// ==================================

// Klick auf Import öffnet den Datei-Explorer
importierenButton.addEventListener("click", function() {

    importDateiInput.click();

});


// Sobald eine Datei ausgewählt wurde
importDateiInput.addEventListener(
    "change",
    async function() {

        const datei = importDateiInput.files[0];

        // Dateiauswahl zurücksetzen
        importDateiInput.value = "";

        if (!datei) {
            return;
        }

        // Ungewöhnlich große Dateien ablehnen
        if (datei.size > 100000) {

            speicherStatus.textContent =
                "⚠️ Die Backup-Datei ist zu groß.";

            return;
        }

        try {

            // Datei einlesen
            const text = await datei.text();

            // JSON-Text zurück in Daten verwandeln
            const backup = JSON.parse(text);

            // Prüfen, ob die Datei von unserem Spiel ist
            if (
                !backup ||
                backup.format !== "click-and-collect" ||
                backup.version !== 1 ||
                !istGueltigerBackupSpielstand(
                    backup.spielstand
                )
            ) {

                throw new Error(
                    "Ungültige oder nicht unterstützte Backup-Datei"
                );
            }

            // Vor dem Überschreiben nachfragen
            const bestaetigt = window.confirm(
                "ACHTUNG!\n\n" +
                "Dein aktueller Spielstand wird durch " +
                "den importierten Spielstand ersetzt.\n\n" +
                "Möchtest du wirklich fortfahren?"
            );

            if (!bestaetigt) {
                return;
            }

            const daten = backup.spielstand;

            // Die aktuelle Zeit verwenden.
            // Dadurch entsteht kein doppelter
            // Offline-Verdienst seit dem Export.
            const jetzt = Date.now();

            const neuerSpielstand = {

                punkte: daten.punkte,

                muenzenProKlick: daten.muenzenProKlick,

                upgradePreis: daten.upgradePreis,

                maschinenAnzahl: daten.maschinenAnzahl,

                maschinenPreis: daten.maschinenPreis,

                letzterProduktionsZeitpunkt: jetzt,

                ausstehenderOfflineBonus:
                    daten.ausstehenderOfflineBonus,

                ausstehendeOfflineSekunden:
                    daten.ausstehendeOfflineSekunden
            };

            // Zuerst sicher im Browser speichern
            localStorage.setItem(
                SPEICHER_NAME,
                JSON.stringify(neuerSpielstand)
            );

            // Danach die laufenden Spielwerte ersetzen
            punkte = neuerSpielstand.punkte;

            muenzenProKlick =
                neuerSpielstand.muenzenProKlick;

            upgradePreis = neuerSpielstand.upgradePreis;

            maschinenAnzahl =
                neuerSpielstand.maschinenAnzahl;

            maschinenPreis =
                neuerSpielstand.maschinenPreis;

            letzterProduktionsZeitpunkt = jetzt;

            ausstehenderOfflineBonus =
                neuerSpielstand.ausstehenderOfflineBonus;

            ausstehendeOfflineSekunden =
                neuerSpielstand.ausstehendeOfflineSekunden;

            // Spielanzeige aktualisieren
            anzeigeAktualisieren();

            // Willkommensfenster zurücksetzen
            offlineModal.hidden = true;

            // Falls ein offener Offline-Bonus existiert,
            // wird das Einsammelfenster angezeigt
            offlineFensterAnzeigen();

            speicherStatus.textContent =
                "✅ Spielstand erfolgreich importiert!";

        } catch (fehler) {

            speicherStatus.textContent =
                "⚠️ Import fehlgeschlagen! " +
                "Bitte überprüfe die Datei.";

            console.error("Importfehler:", fehler);
        }
    }
);

// ==================================
// 17. SPIEL STARTEN
// ==================================

spielLaden();

anzeigeAktualisieren();
