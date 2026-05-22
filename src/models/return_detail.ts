import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface return_detailAttributes {
  rtd_Id: number;
  rtd_rt_Id?: number;
  rtd_iru_Id?: number;
  rtd_SetNama?: string;
  rtd_JumlahAwal?: number;
  rtd_JumlahAkhir?: number;
  rtd_Status?: number;
}

export type return_detailPk = "rtd_Id";
export type return_detailId = return_detail[return_detailPk];
export type return_detailOptionalAttributes = "rtd_Id" | "rtd_rt_Id" | "rtd_iru_Id" | "rtd_SetNama" | "rtd_JumlahAwal" | "rtd_JumlahAkhir" | "rtd_Status";
export type return_detailCreationAttributes = Optional<return_detailAttributes, return_detailOptionalAttributes>;

export class return_detail extends Model<return_detailAttributes, return_detailCreationAttributes> implements return_detailAttributes {
  rtd_Id!: number;
  rtd_rt_Id?: number;
  rtd_iru_Id?: number;
  rtd_SetNama?: string;
  rtd_JumlahAwal?: number;
  rtd_JumlahAkhir?: number;
  rtd_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof return_detail {
    return return_detail.init({
    rtd_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rtd_rt_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtd_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtd_SetNama: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rtd_JumlahAwal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtd_JumlahAkhir: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtd_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'return_detail',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rtd_Id" },
        ]
      },
    ]
  });
  }
}
