import { DataTypes, Model } from 'sequelize';
import Database from '../config/database';

interface OptimizationModelAttributes {
  id?: number;
  userId: number;
  graph: string; 
  tokensCost: number; 
}

class OptimizationModel extends Model<OptimizationModelAttributes> implements OptimizationModelAttributes {
  public id!: number;
  public userId!: number;
  public graph!: string;
  public tokensCost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Metodo per creare un modello di ottimizzazione
  public static async createModel(userId: number, graph: string, tokensCost: number): Promise<OptimizationModel> {
    return await OptimizationModel.create({ userId, graph, tokensCost });
  }

  // Metodo per trovare un modello per ID
  public static async findModelById(modelId: number): Promise<void> {
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }
  }

  // Metodo per ottenere un modello per ID
  public static async getModelById(modelId: number): Promise<OptimizationModel> {
    const model = await OptimizationModel.findByPk(modelId);
    if (!model) {
      const err = new Error('Modello non trovato');
      err.name = 'Not_found';
      throw err;
    }
    return model;
  }

  // Metodo per verificare se l'utente è il creatore del modello
  public static async checkUserOwnership(modelId: number, userId: number): Promise<void> {
    const model = await OptimizationModel.getModelById(modelId);
    if (model.userId !== userId) {
      const err = new Error('Non sei il creatore del modello');
      err.name = 'Forbidden'; 
      throw err;    
     }
  }

  // Metodo per applicare le modifiche al grafo
  public async applyChanges(coordinates: string): Promise<void> {
    const graph = JSON.parse(this.graph);
    const parsedCoordinates = JSON.parse(coordinates);
    parsedCoordinates.forEach(({x, y}: { x: number; y: number }) => {
      graph[x][y] = graph[x][y] === 0 ? 1 : 0; // Inverte il valore in base alle coordinate
    });
    
    // Aggiorna il grafo nel modello
    this.graph = JSON.stringify(graph);
    await this.save();
  }
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
    sequelize: Database.getInstance(),
    tableName: 'optimization_models',
  }
);

export default OptimizationModel;
