import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface log_request_inAttributes {
  req_datetime?: Date;
  req_serial: string;
  req_IP?: string;
  req_agent?: string;
  req_target?: string;
  req_header?: string;
  req_request?: string;
}

export type log_request_inPk = "req_serial";
export type log_request_inId = log_request_in[log_request_inPk];
export type log_request_inOptionalAttributes = "req_datetime" | "req_IP" | "req_agent" | "req_target" | "req_header" | "req_request";
export type log_request_inCreationAttributes = Optional<log_request_inAttributes, log_request_inOptionalAttributes>;

export class log_request_in extends Model<log_request_inAttributes, log_request_inCreationAttributes> implements log_request_inAttributes {
  req_datetime?: Date;
  req_serial!: string;
  req_IP?: string;
  req_agent?: string;
  req_target?: string;
  req_header?: string;
  req_request?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof log_request_in {
    return log_request_in.init({
    req_datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    req_serial: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    req_IP: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    req_agent: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    req_target: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    req_header: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    req_request: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'log_request_in',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "req_serial" },
        ]
      },
    ]
  });
  }
}
