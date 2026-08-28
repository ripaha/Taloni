# Taloni

PWA-sovellus omakotitalon huoltokirjaksi. Nykyinen versio: 0.10.15

## Kieli ja kommunikaatio

Kaikki viestintä, työvaiheet, kommentit ja koodin selitykset suomeksi. Ei englanninkielisiä työvaiheita tai välikommentteja.

## Tekninen pino

- Yksi HTML-tiedosto (index.html) + service worker (sw.js)
- IndexedDB, 14 store-objektia: properties, spaces, devices, maintenanceItems, maintenanceLogs, journalEntries, projects, documents, contacts, meters, meterReadings, taxonomies, settings, reminders
- Lucide-ikonit CDN:stä
- Inter-fontti Google Fontsista
- Ei frameworkeja, vanilla JS + CSS
- Hostaus GitHub Pagesissa

## Versionhallinta

- Versionumero kasvaa jokaisesta muutoksesta, myös pienistä
- Päivitä aina sekä APP_VERSION (index.html) että CACHE_VERSION (sw.js)
- Päivitä CHANGELOG-taulukko (index.html) aina kun versionumero muuttuu
- Tarkista nykyinen versio ennen muutoksia: `grep "APP_VERSION" index.html`

## Työskentelytapa

- Isommissa muutoksissa: suunnittele ensin ja pyydä hyväksyntä ennen koodausta
- Pienissä muutoksissa: voi koodata suoraan
- Testaa logiikka Node.js:llä ennen koodiin lisäämistä, jos mahdollista

## Tilanne ja tiekartta (päivitetty v0.10.15:n mukaan)

- **Projektit** (remontit + kustannukset + pintamateriaalit): valmis, toteutettu v0.10.0:ssa
- **Kulutusseuranta** (sähkö/vesilukemat, graafit): kesken — meters/meterReadings-tietokantataulut olemassa, mutta navigaatiossa "Kulutus" on yhä disabled-tilassa
- **v1.0**: ensimmäinen vakaa julkaisu, kun ydinominaisuudet (mukaan lukien kulutusseuranta) ovat koossa
- **Google Drive -synkronointi** (v1.1+): automaattinen synkronointi vielä tekemättä; manuaalinen varmuuskopiointi Google Driveen on jo olemassa asetuksissa
