import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface logAttributes {
  id: number;
  message?: string;
  channel?: string;
  level: number;
  level_name: string;
  unix_time: number;
  datetime?: string;
  context?: string;
  extra?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type logPk = "id";
export type logId = log[logPk];
export type logOptionalAttributes = "id" | "message" | "channel" | "level" | "datetime" | "context" | "extra" | "created_at" | "updated_at";
export type logCreationAttributes = Optional<logAttributes, logOptionalAttributes>;

export class log extends Model<logAttributes, logCreationAttributes> implements logAttributes {
  id!: number;
  message?: string;
  channel?: string;
  level!: number;
  level_name!: string;
  unix_time!: number;
  datetime?: string;
  context?: string;
  extra?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof log {
    return log.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    channel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    level_name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    unix_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datetime: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'log',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
