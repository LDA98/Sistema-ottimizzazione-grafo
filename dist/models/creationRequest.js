"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class CreationRequest extends sequelize_1.Model {
}
CreationRequest.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    graph: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tokensCost: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    approved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.default,
    modelName: 'CreationRequest',
});
exports.default = CreationRequest;
