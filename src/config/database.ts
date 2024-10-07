import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    private static instance: Sequelize;

    private constructor() {}

    public static getInstance(): Sequelize {
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
