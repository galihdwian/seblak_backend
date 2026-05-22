import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface institusiAttributes {
  ins_Id: number;
  ins_InsTime: Date;
  ins_InsBy?: number;
  ins_UpdBy?: number;
  ins_UpdTime?: Date;
  ins_Nama?: string;
  ins_Lokasi?: string;
  ins_PJ?: string;
  ins_Status?: number;
}

export type institusiPk = "ins_Id";
export type institusiId = institusi[institusiPk];
export type institusiOptionalAttributes = "ins_Id" | "ins_InsTime" | "ins_InsBy" | "ins_UpdBy" | "ins_UpdTime" | "ins_Nama" | "ins_Lokasi" | "ins_PJ" | "ins_Status";
export type institusiCreationAttributes = Optional<institusiAttributes, institusiOptionalAttributes>;

export class institusi extends Model<institusiAttributes, institusiCreationAttributes> implements institusiAttributes {
  ins_Id!: number;
  ins_InsTime!: Date;
  ins_InsBy?: number;
  ins_UpdBy?: number;
  ins_UpdTime?: Date;
  ins_Nama?: string;
  ins_Lokasi?: string;
  ins_PJ?: string;
  ins_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof institusi {
    return institusi.init({
    ins_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ins_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    ins_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ins_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ins_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ins_Nama: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    ins_Lokasi: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    ins_PJ: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ins_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'institusi',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ins_Id" },
        ]
      },
    ]
  });
  }
}
