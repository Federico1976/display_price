const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 5003;

// Configurazione per i file statici
app.use(express.static(path.join(__dirname, 'public')));

// Percorso del file CSV
const csvFilePath = path.join(__dirname, 'prezzi_acque.csv');

// Rotta principale per mostrare i dati del CSV
app.get('/', (req, res) => {
    const results = [];

    // Legge il CSV e lo converte in un array di oggetti
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // HTML Layout con Stile
            let html = `
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Prezzi Acque Minerali</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                        height: 100vh; /* Utilizza tutta l'altezza dello schermo */
                        overflow: hidden; /* Evita lo scroll */
                    }

                    .header {
                        width: 100%;
                        background: #fff;
                        padding: 10px 0; /* Riduce l'altezza */
                        text-align: center;
                        border-bottom: 4px solid #2b2e83;
                    }

                    .header img {
    width: 100%; /* Adatta l'immagine alla larghezza del monitor */
    max-height: 75px; /* Limita l'altezza massima a 100px */
    object-fit: contain; /* Mantiene le proporzioni */
    display: block;
    margin: 0 auto;
}

                    .container {
                        display: flex;
                        justify-content: space-evenly;
                        align-items: stretch;
                        height: calc(100vh - 80px); /* Adatta lo spazio rimanente */
                        padding: 10px;
                        box-sizing: border-box;
                    }

                    .column {
                        width: 48%; /* Due colonne ben distanziate */
                        display: flex;
                        flex-direction: column;
                        justify-content: space-around; /* Distribuisce gli elementi uniformemente */
                    }

                    .item {
                        background: #d3e0fc;
                        margin: 5px 0;
                        padding: 10px 15px;
                        border-radius: 5px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        height: 8%; /* Ogni riga occupa circa l'8% dello spazio verticale */
                    }

                    .item:nth-child(odd) {
                        background: #e9f0ff;
                    }

                    .product-name {
    font-size: 28px; /* Dimensione più grande per rendere il testo più evidente */
    font-weight: 900; /* Grassetto extra per maggiore spessore */
    color: #2b2e83; /* Mantieni il colore attuale */
    margin-right: 10px;
    line-height: 1.2; /* Riduce lo spazio tra le righe di testo */
    text-transform: uppercase; /* (Opzionale) Trasforma il testo in maiuscolo */
}

                    .product-description {
                        font-size: 14px; /* Più piccola della marca */
                        color: #2b2e83;
                        font-weight: normal;
                    }

                    .price {
                        font-size: 28px;
                        font-weight: 900;
                        color: #2b2e83;
						line-height: 1.2; /* Riduce lo spazio tra le righe di testo */
                    }

                    /* Evidenziazione Offerta */
                    .highlight {
                        background: #fff3cd;
                        border: 2px solid #ffc107;
                        box-shadow: 0 0 10px rgba(255, 193, 7, 0.7);
                        animation: pulse 1.5s infinite;
                    }

                    .price.offer {
                        color: #d9534f;
                        animation: grow 1.2s infinite alternate;
                    }

                    .offer-icon {
                        width: 30px;
                        height: 30x;
                        margin-left: 10px;
                        animation: bounce 1.5s infinite;
                    }

                    @keyframes pulse {
                        0%, 100% {
                            box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
                        }
                        50% {
                            box-shadow: 0 0 15px rgba(255, 193, 7, 1);
                        }
                    }

                    @keyframes grow {
                        0% {
                            transform: scale(1);
                        }
                        100% {
                            transform: scale(1.2);
                        }
                    }

                    @keyframes bounce {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-10px);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.png" alt="Sacoph Logo">
                </div>
                <div class="container">
            `;

            // Dividi i dati in due colonne da 13 ciascuna
            const column1 = results.slice(0, 13);
            const column2 = results.slice(13, 26);

            const renderColumn = (data) => {
    let columnHtml = `<div class="column">`;
    data.forEach(row => {
        const isOffer = row.Offerta && row.Offerta.toLowerCase() === 'si'; // Controlla che Offerta esista
        columnHtml += `
        <div class="item ${isOffer ? 'highlight' : ''}">
            <div>
                <span class="product-name">${row.Marca || 'N/A'}</span>
                <span class="product-description">${row.Descrizione || 'N/A'}</span>
            </div>
            <span class="price ${isOffer ? 'offer' : ''}">${row.Prezzo || 'N/A'} &euro;</span>
            ${isOffer ? '<img src="/offer-icon.png" class="offer-icon" alt="Offerta">' : ''}
        </div>`;
    });
    columnHtml += `</div>`;
    return columnHtml;
};


            html += renderColumn(column1);
            html += renderColumn(column2);

            html += `
                </div>
                <script>
                    setInterval(() => {
                        location.reload();
                    }, 60000); // Aggiorna ogni 60 secondi
                </script>
            </body>
            </html>
            `;

            res.send(html);
        });
});

// **Nuova Rotta**: Servire la pagina di modifica
app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/edit.html'));
});

// **Nuova Rotta**: Ottenere i dati del CSV come JSON
app.get('/api/data', (req, res) => {
    const results = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results); // Invia i dati come JSON al frontend
        });
});

// **Nuova Rotta**: Salvare i dati modificati
// Rotta per salvare i dati modificati
// Rotta per salvare i dati modificati
app.post('/api/save', express.json(), (req, res) => {
    const data = req.body; // Dati inviati dal frontend

    // Filtra eventuali righe vuote o incomplete
    const filteredData = data.filter(row => 
        row.Marca && row.Marca.trim() && // Controlla che Marca non sia vuoto
        row.Descrizione && row.Descrizione.trim() && // Controlla che Descrizione non sia vuoto
        row.Prezzo && row.Prezzo.trim() && // Controlla che Prezzo non sia vuoto
        row.Offerta && row.Offerta.trim() // Controlla che Offerta non sia vuoto
    );

    if (filteredData.length === 0) {
        return res.status(400).json({ success: false, message: 'Dati non validi o file vuoto.' });
    }

    // Estrai le intestazioni
    const headers = Object.keys(filteredData[0]);

    // Crea il contenuto del CSV
    const csvData = [
        headers.join(','), // Prima riga: intestazioni
        ...filteredData.map(row => 
            headers.map(header => (row[header] || '').trim()).join(',')
        ) // Dati normalizzati
    ].join('\n');

    // Scrivi i dati aggiornati nel file CSV
    fs.writeFile(csvFilePath, csvData, (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Errore nel salvataggio del file.' });
        } else {
            res.json({ success: true, message: 'File CSV salvato con successo.' });
        }
    });
});



// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});