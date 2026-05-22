import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_detailAttributes {
  pjd_Id: number;
  pjd_pj_Id?: number;
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

export type pinjam_detailPk = "pjd_Id";
export type pinjam_detailId = pinjam_detail[pinjam_detailPk];
export type pinjam_detailOptionalAttributes = "pjd_Id" | "pjd_pj_Id" | "pjd_iru_Id" | "pjd_Jml_Req" | "pjd_Jml_A1" | "pjd_Jml_B1" | "pjd_Jml_B2" | "pjd_Jml_A2" | "pjd_Jml_Setting" | "pjd_AddInfo" | "pjd_Status";
export type pinjam_detailCreationAttributes = Optional<pinjam_detailAttributes, pinjam_detailOptionalAttributes>;

export class pinjam_detail extends Model<pinjam_detailAttributes, pinjam_detailCreationAttributes> implements pinjam_detailAttributes {
  pjd_Id!: number;
  pjd_pj_Id?: number;
  pjd_iru_Id?: number;
  pjd_Jml_Req?: number;
  pjd_Jml_A1?: number;
  pjd_Jml_B1?: number;
  pjd_Jml_B2?: number;
  pjd_Jml_A2?: number;
  pjd_Jml_Setting?: number;
  pjd_AddInfo?: string;
  pjd_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_detail {
    return pinjam_detail.init({
    pjd_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pjd_pj_Id: {
      type: DataTypes.INTEGER,
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
    tableName: 'pinjam_detail',
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
