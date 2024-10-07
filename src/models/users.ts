import { DataTypes, Model } from 'sequelize';
import Database from '../config/database';

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  tokens?: number;
  isAdmin?: boolean;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public tokens!: number;
  public isAdmin!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Metodo per trovare un utente e controllare i token
  public static async findUserAndCheckTokens(userId: number, tokensRequired: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }
    if (user.tokens < tokensRequired) {
      const err = new Error('Credito insufficiente. Hai a disposizione ' + user.tokens);
      err.name = 'Insufficient_credit';
      throw err;
    }
    return user;
  }

  // Metodo per sottrarre i token
  public static async deductTokens(userId: number, tokensToDeduct: number): Promise<number> {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('Utente non trovato');
      err.name = 'Not_found';
      throw err;
    }
    user.tokens -= tokensToDeduct;
    await user.save();
    return user.tokens; // Restituisce il credito rimanente
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokens: {
      type: DataTypes.FLOAT,
      defaultValue: 10, // Token iniziali per ogni utente
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  },
  {
    sequelize: Database.getInstance(),
    tableName: 'users',
  }
);

export default User;
