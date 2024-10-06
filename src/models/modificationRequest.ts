import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ModificationRequest extends Model {
  public id!: number;
  public modelId!: number;
  public userId!: number;
  public coordinates!: string;
  public status!: 'Pending' | 'Accepted' | 'Rejected' | 'Refused';
  public tokensCost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ModificationRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Refused'),
      defaultValue: 'Pending',
    },
    tokensCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'modification_requests',
  }
);

export default ModificationRequest;
