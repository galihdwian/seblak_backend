import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface routine_logAttributes {
  rtlog_Name: string;
  rtlog_LastExec?: Date;
  rtlog_LastMsg?: string;
  rtlog_Tipe?: number;
  rtlog_Interval?: number;
}

export type routine_logPk = "rtlog_Name";
export type routine_logId = routine_log[routine_logPk];
export type routine_logOptionalAttributes = "rtlog_LastExec" | "rtlog_LastMsg" | "rtlog_Tipe" | "rtlog_Interval";
export type routine_logCreationAttributes = Optional<routine_logAttributes, routine_logOptionalAttributes>;

export class routine_log extends Model<routine_logAttributes, routine_logCreationAttributes> implements routine_logAttributes {
  rtlog_Name!: string;
  rtlog_LastExec?: Date;
  rtlog_LastMsg?: string;
  rtlog_Tipe?: number;
  rtlog_Interval?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof routine_log {
    return routine_log.init({
    rtlog_Name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    rtlog_LastExec: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rtlog_LastMsg: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    rtlog_Tipe: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    rtlog_Interval: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'routine_log',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rtlog_Name" },
        ]
      },
    ]
  });
  }
}
