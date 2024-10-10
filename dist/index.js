"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const optimizationRoutes_1 = __importDefault(require("./routes/optimizationRoutes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use(express_1.default.json()); // Middleware per il parsing del JSON
// Rotta di base per verificare il funzionamento del server
app.get('/', (req, res) => {
    res.send('Il server è attivo e funzionante!');
});
// Rotte utenti
app.use('/api/users', userRoutes_1.default);
// Rotte per i modelli di ottimizzazione
app.use('/api/optimizations', optimizationRoutes_1.default);
app.use(errorHandler_1.default);
// Sincronizza il database e avvia il server
const sequelize = database_1.default.getInstance(); // Ottieni l'istanza di Sequelize
sequelize.sync({ force: false })
    .then(() => {
    console.log('Database sincronizzato con successo.');
    return sequelize.authenticate();
})
    .then(() => {
    console.log('Connessione al database stabilita con successo.');
    app.listen(PORT, () => {
        console.log(`Server in esecuzione su http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Errore durante la sincronizzazione del database o connessione:', err);
});
