import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ruangAttributes {
  ru_Id: number;
  ru_InsTime: Date;
  ru_InsBy?: number;
  ru_UpdTime?: Date;
  ru_UpdBy?: number;
  ru_ins_Id?: number;
  ru_Nama?: string;
  ru_Metadata?: string;
  ru_Status?: number;
}

export type ruangPk = "ru_Id";
export type ruangId = ruang[ruangPk];
export type ruangOptionalAttributes = "ru_Id" | "ru_InsTime" | "ru_InsBy" | "ru_UpdTime" | "ru_UpdBy" | "ru_ins_Id" | "ru_Nama" | "ru_Metadata" | "ru_Status";
export type ruangCreationAttributes = Optional<ruangAttributes, ruangOptionalAttributes>;

export class ruang extends Model<ruangAttributes, ruangCreationAttributes> implements ruangAttributes {
  ru_Id!: number;
  ru_InsTime!: Date;
  ru_InsBy?: number;
  ru_UpdTime?: Date;
  ru_UpdBy?: number;
  ru_ins_Id?: number;
  ru_Nama?: string;
  ru_Metadata?: string;
  ru_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof ruang {
    return ruang.init({
    ru_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ru_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    ru_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ru_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ru_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ru_ins_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ru_Nama: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    ru_Metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ru_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ruang',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ru_Id" },
        ]
      },
    ]
  });
  }
}
