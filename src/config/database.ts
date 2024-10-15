import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Definizione della classe Database che gestisce la connessione al database usando il pattern Singleton
class Database {
    // Memorizza l'istanza unica della connessione al database
    private static instance: Sequelize;

    // Metodo per ottenere l'istanza di Sequelize
    public static getInstance(): Sequelize {

        // Verifica se l'instanza già esiste, altrimenti la crea utilizzando le variabili .env
        if (!Database.instance) {
            Database.instance = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS!, {
                host: process.env.DB_HOST,
                dialect: 'postgres',
                logging: false, 
            });
        }
        return Database.instance;
    }
}

export default Database;
