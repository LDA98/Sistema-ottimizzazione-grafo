import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

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
    sequelize,
    tableName: 'users',
  }
);

export default User;
