import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface log_aktifitasAttributes {
  log_Id: number;
  log_UserId?: number;
  log_UserJenis?: number;
  log_InsTime: Date;
  log_Jenis?: number;
  log_Info?: string;
}

export type log_aktifitasPk = "log_Id";
export type log_aktifitasId = log_aktifitas[log_aktifitasPk];
export type log_aktifitasOptionalAttributes = "log_Id" | "log_UserId" | "log_UserJenis" | "log_InsTime" | "log_Jenis" | "log_Info";
export type log_aktifitasCreationAttributes = Optional<log_aktifitasAttributes, log_aktifitasOptionalAttributes>;

export class log_aktifitas extends Model<log_aktifitasAttributes, log_aktifitasCreationAttributes> implements log_aktifitasAttributes {
  log_Id!: number;
  log_UserId?: number;
  log_UserJenis?: number;
  log_InsTime!: Date;
  log_Jenis?: number;
  log_Info?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof log_aktifitas {
    return log_aktifitas.init({
    log_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    log_UserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_UserJenis: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    log_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    log_Jenis: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log_Info: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'log_aktifitas',
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
