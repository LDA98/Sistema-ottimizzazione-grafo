import express from 'express';
import dotenv from 'dotenv';
import Database from './config/database';
import userRoutes from './routes/userRoutes';
import optimizationRoutes from './routes/optimizationRoutes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;


app.use(express.json()); // Middleware per il parsing del JSON

// Rotta di base per verificare il funzionamento del server
app.get('/', (req, res) => {
  res.send('Il server è attivo e funzionante!');
});

// Rotte utenti
app.use('/api/users', userRoutes);

// Rotte per i modelli di ottimizzazione
app.use('/api/optimizations', optimizationRoutes);

app.use(errorHandler);

// Sincronizza il database e avvia il server
const sequelize = Database.getInstance(); // Ottieni l'istanza di Sequelize

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
