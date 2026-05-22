import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface instrumen_logAttributes {
  log_Id: number;
  log_InsTime: Date;
  log_InsBy?: number;
  log_UpdTime?: Date;
  log_UpdBy?: number;
  log_Ref?: string;
  log_ins_Id?: number;
  log_iru_Id?: number;
  log_Jumlah?: number;
  log_Saldo?: number;
  log_Status?: number;
}

export type instrumen_logPk = "log_Id";
export type instrumen_logId = instrumen_log[instrumen_logPk];
export type instrumen_logOptionalAttributes = "log_Id" | "log_InsTime" | "log_InsBy" | "log_UpdTime" | "log_UpdBy" | "log_Ref" | "log_ins_Id" | "log_iru_Id" | "log_Jumlah" | "log_Saldo" | "log_Status";
export type instrumen_logCreationAttributes = Optional<instrumen_logAttributes, instrumen_logOptionalAttributes>;

export class instrumen_log extends Model<instrumen_logAttributes, instrumen_logCreationAttributes> implements instrumen_logAttributes {
  log_Id!: number;
  log_InsTime!: Date;
  log_InsBy?: number;
  log_UpdTime?: Date;
  log_UpdBy?: number;
  log_Ref?: string;
  log_ins_Id?: number;
  log_iru_Id?: number;
  log_Jumlah?: number;
  log_Saldo?: number;
  log_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof instrumen_log {
    return instrumen_log.init({
    log_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    log_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    log_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    log_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Ref: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    log_ins_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Saldo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'instrumen_log',
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
    ]
  });
  }
}
