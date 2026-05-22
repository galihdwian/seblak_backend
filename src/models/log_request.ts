import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface log_requestAttributes {
  log_Id: number;
  log_InsTime?: Date;
  log_prov_Id?: number;
  log_Tipe?: number;
  log_Action?: number;
  log_va_Id?: number;
  log_Target?: string;
  log_Method?: string;
  log_Request?: string;
  log_Response?: string;
  log_HTTPStatus?: string;
  log_CURL?: string;
  log_Status?: number;
}

export type log_requestPk = "log_Id";
export type log_requestId = log_request[log_requestPk];
export type log_requestOptionalAttributes = "log_Id" | "log_InsTime" | "log_prov_Id" | "log_Tipe" | "log_Action" | "log_va_Id" | "log_Target" | "log_Method" | "log_Request" | "log_Response" | "log_HTTPStatus" | "log_CURL" | "log_Status";
export type log_requestCreationAttributes = Optional<log_requestAttributes, log_requestOptionalAttributes>;

export class log_request extends Model<log_requestAttributes, log_requestCreationAttributes> implements log_requestAttributes {
  log_Id!: number;
  log_InsTime?: Date;
  log_prov_Id?: number;
  log_Tipe?: number;
  log_Action?: number;
  log_va_Id?: number;
  log_Target?: string;
  log_Method?: string;
  log_Request?: string;
  log_Response?: string;
  log_HTTPStatus?: string;
  log_CURL?: string;
  log_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof log_request {
    return log_request.init({
    log_Id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    log_InsTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    log_prov_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Tipe: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Action: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    log_va_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Target: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    log_Method: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    log_Request: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    log_Response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    log_HTTPStatus: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    log_CURL: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    log_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'log_request',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "log_Id" },
        ]
      },
      {
        name: "log_prov_Id",
        using: "BTREE",
        fields: [
          { name: "log_prov_Id" },
        ]
      },
      {
        name: "log_va_Id",
        using: "BTREE",
        fields: [
          { name: "log_va_Id" },
        ]
      },
      {
        name: "log_Request",
        type: "FULLTEXT",
        fields: [
          { name: "log_Request" },
          { name: "log_Response" },
        ]
      },
    ]
  });
  }
}
