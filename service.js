const Service = require('./node_modules/node-windows').Service;

// Configurazione del servizio
const svc = new Service({
  name: 'Node.js Server',
  description: 'Avvia automaticamente il progetto Node.js per le acque minerali',
  script: 'C:\\Digital_acq\\acque\\server.js'
});

// Aggiungi il servizio
svc.on('install', () => {
  svc.start();
});

svc.install();
