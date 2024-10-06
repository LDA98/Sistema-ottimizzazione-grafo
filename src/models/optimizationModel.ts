import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface OptimizationModelAttributes {
  id?: number;
  userId: number;
  graph: string; // JSON string per il grafo
  tokensCost: number; // Costo in token per la creazione
}

class OptimizationModel extends Model<OptimizationModelAttributes> implements OptimizationModelAttributes {
  public id!: number;
  public userId!: number;
  public graph!: string;
  public tokensCost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OptimizationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    graph: {
      type: DataTypes.JSON, // Salva il grafo come JSON
      allowNull: false,
    },
    tokensCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'optimization_models',
  }
);

export default OptimizationModel;
