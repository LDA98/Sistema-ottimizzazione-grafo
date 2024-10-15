import { Model, DataTypes, Op } from 'sequelize';
import Database from '../config/database';

class ModificationRequest extends Model {
  public id!: number;
  public modelId!: number;
  public userId!: number;
  public coordinates!: string;
  public status!: 'Pending' | 'Accepted' | 'Rejected' | 'Refused';
  public tokensCost!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Metodo per creare una richiesta di modifica
  public static async createModificationRequest(
    modelId: number,
    userId: number,
    coordinates: string,
    tokensCost: number
  ): Promise<ModificationRequest> {
    return await ModificationRequest.create({
      modelId,
      userId,
      coordinates,
      status: 'Pending', // Imposta lo stato iniziale
      tokensCost,
    });
  }

  // Metodo per trovare una richiesta di modifica per ID
  public static async findRequestById(requestId: number): Promise<ModificationRequest> {
    const request = await ModificationRequest.findByPk(requestId);
    if (!request) {
      const err = new Error('Richiesta di modifica non trovata');
      err.name = 'Not_found';
      throw err;
    }
    return request;
  }

  // Metodo per verificare se una richiesta può essere aggiornata
  public static async verifyIsPossibleUpdate(requestId: number): Promise<ModificationRequest> {
    const request = await ModificationRequest.findRequestById(requestId);
    if (request.status !== 'Pending') {
      const err = new Error('Richiesta già : ' + request.status);
      err.name = 'Not_found';
      throw err;
    }
    return request;
  }

  // Metodo per aggiornare lo stato della richiesta di modifica
  public static async updateRequestStatus(request: ModificationRequest, status: string): Promise<void> {
    if(status === 'Accepted') request.status = 'Accepted';
    else request.status = 'Rejected';    
    await request.save();
  }

  // Metodo per rifiutare altre richieste di modifica 'Pending' per lo stesso modello
  public static async refusePendingRequests(modelId: number, requestId: number): Promise<void> {
    await ModificationRequest.update(
      { status: 'Refused' },
      {
        where: {
          modelId,
          id: { [Op.ne]: requestId },
          status: 'Pending',
        },
      }
    );
  }

  // Metodo per ottenere lo storico delle richieste di modifica
  public static async getModificationRequestsByModelId(modelId: number, status?: string): Promise<ModificationRequest[]> {
    const whereClause: any = { modelId };
    if (status) {
      whereClause.status = status;
    }
    const modificationRequests = await ModificationRequest.findAll({
      where: whereClause,
    });
    if (modificationRequests.length === 0) {
      const err = new Error(`Nessuna richiesta di modifica trovata.`);
      err.name = 'Not_found';
      throw err;
    } else {
      return modificationRequests;
    }
  }

  // Metodo per ottenere richieste di modifica filtrando per date
  public static async getModificationRequestsByModelIdAndDate(modelId: number,startDate?: string,endDate?: string): Promise<ModificationRequest[]> {
    const whereClause: any = {
      modelId,
      status: 'Accepted',
    };

    // Aggiungi le condizioni per updatedAt se le date sono fornite
    if (startDate) {
      whereClause.updatedAt = { ...whereClause.updatedAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Imposta la fine del giorno
      whereClause.updatedAt = { ...whereClause.updatedAt, [Op.lte]: end };
    }

    const modificationRequests = await ModificationRequest.findAll({
      where: whereClause,
    });

    if (modificationRequests.length === 0) {
      const err = new Error(`Nessuna richiesta di modifica trovata tra ${startDate ?? 'inizio'} ed ${endDate ?? 'fine'}.`);
      err.name = 'Not_found';
      throw err;
    } else {
      return modificationRequests;
    }
  }
  
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
    sequelize: Database.getInstance(),
    tableName: 'modification_requests',
  }
);

export default ModificationRequest;
