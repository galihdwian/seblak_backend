import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_iru_dtlAttributes {
  pjd_Id: number;
  pjd_pji_Id?: number;
  pjd_Seq?: number;
  pjd_Identity?: string;
  pjd_iru_Id?: number;
  pjd_Jml_Req?: number;
  pjd_Jml_A1?: number;
  pjd_Jml_B1?: number;
  pjd_Jml_B2?: number;
  pjd_Jml_A2?: number;
  pjd_Jml_Setting?: number;
  pjd_AddInfo?: string;
  pjd_Status?: number;
}

export type pinjam_iru_dtlPk = "pjd_Id";
export type pinjam_iru_dtlId = pinjam_iru_dtl[pinjam_iru_dtlPk];
export type pinjam_iru_dtlOptionalAttributes = "pjd_Id" | "pjd_pji_Id" | "pjd_Seq" | "pjd_Identity" | "pjd_iru_Id" | "pjd_Jml_Req" | "pjd_Jml_A1" | "pjd_Jml_B1" | "pjd_Jml_B2" | "pjd_Jml_A2" | "pjd_Jml_Setting" | "pjd_AddInfo" | "pjd_Status";
export type pinjam_iru_dtlCreationAttributes = Optional<pinjam_iru_dtlAttributes, pinjam_iru_dtlOptionalAttributes>;

export class pinjam_iru_dtl extends Model<pinjam_iru_dtlAttributes, pinjam_iru_dtlCreationAttributes> implements pinjam_iru_dtlAttributes {
  pjd_Id!: number;
  pjd_pji_Id?: number;
  pjd_Seq?: number;
  pjd_Identity?: string;
  pjd_iru_Id?: number;
  pjd_Jml_Req?: number;
  pjd_Jml_A1?: number;
  pjd_Jml_B1?: number;
  pjd_Jml_B2?: number;
  pjd_Jml_A2?: number;
  pjd_Jml_Setting?: number;
  pjd_AddInfo?: string;
  pjd_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_iru_dtl {
    return pinjam_iru_dtl.init({
    pjd_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pjd_pji_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Seq: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Identity: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    pjd_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_Req: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_A1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_B1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_B2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_A2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_Jml_Setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjd_AddInfo: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    pjd_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_iru_dtl',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pjd_Id" },
        ]
      },
    ]
  });
  }
}
