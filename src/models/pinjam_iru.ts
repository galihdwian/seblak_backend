import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_iruAttributes {
  pji_Id: number;
  pji_InsTime: Date;
  pji_InsBy?: number;
  pji_UpdTime?: Date;
  pji_UpdBy?: number;
  pji_pj_Id?: number;
  pji_Jenis?: 'pcs' | 'set';
  pji_iru_Id?: number;
  pji_set_Id?: number;
  pji_Jml_Req?: number;
  pji_Jml_A1?: number;
  pji_Jml_B1?: number;
  pji_Jml_B2?: number;
  pji_Jml_A2?: number;
  pji_Jml_Setting?: number;
  pji_IruTotalJns?: number;
  pji_IruTotalItm?: number;
  pji_Status?: number;
}

export type pinjam_iruPk = "pji_Id";
export type pinjam_iruId = pinjam_iru[pinjam_iruPk];
export type pinjam_iruOptionalAttributes = "pji_Id" | "pji_InsTime" | "pji_InsBy" | "pji_UpdTime" | "pji_UpdBy" | "pji_pj_Id" | "pji_Jenis" | "pji_iru_Id" | "pji_set_Id" | "pji_Jml_Req" | "pji_Jml_A1" | "pji_Jml_B1" | "pji_Jml_B2" | "pji_Jml_A2" | "pji_Jml_Setting" | "pji_IruTotalJns" | "pji_IruTotalItm" | "pji_Status";
export type pinjam_iruCreationAttributes = Optional<pinjam_iruAttributes, pinjam_iruOptionalAttributes>;

export class pinjam_iru extends Model<pinjam_iruAttributes, pinjam_iruCreationAttributes> implements pinjam_iruAttributes {
  pji_Id!: number;
  pji_InsTime!: Date;
  pji_InsBy?: number;
  pji_UpdTime?: Date;
  pji_UpdBy?: number;
  pji_pj_Id?: number;
  pji_Jenis?: 'pcs' | 'set';
  pji_iru_Id?: number;
  pji_set_Id?: number;
  pji_Jml_Req?: number;
  pji_Jml_A1?: number;
  pji_Jml_B1?: number;
  pji_Jml_B2?: number;
  pji_Jml_A2?: number;
  pji_Jml_Setting?: number;
  pji_IruTotalJns?: number;
  pji_IruTotalItm?: number;
  pji_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_iru {
    return pinjam_iru.init({
    pji_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pji_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    pji_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pji_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_pj_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jenis: {
      type: DataTypes.ENUM('pcs','set'),
      allowNull: true,
      defaultValue: "pcs"
    },
    pji_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_set_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_Req: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_A1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_B1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_B2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_A2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jml_Setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_IruTotalJns: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_IruTotalItm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_iru',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pji_Id" },
        ]
      },
    ]
  });
  }
}
