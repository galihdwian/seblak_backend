import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_requestAttributes {
  preq_Id: number;
  preq_InsBy?: number;
  preq_InsTime?: Date;
  preq_UpdTime?: Date;
  preq_UpdBy?: number;
  preq_ru_Id?: number;
  preq_Kamar?: string;
  preq_No?: string;
  preq_Pasien?: string;
  preq_iru_Id?: number;
  preq_SetNama?: string;
  preq_Jenis?: string;
  preq_Jumlah?: number;
  preq_Status?: number;
}

export type pinjam_requestPk = "preq_Id";
export type pinjam_requestId = pinjam_request[pinjam_requestPk];
export type pinjam_requestOptionalAttributes = "preq_Id" | "preq_InsBy" | "preq_InsTime" | "preq_UpdTime" | "preq_UpdBy" | "preq_ru_Id" | "preq_Kamar" | "preq_No" | "preq_Pasien" | "preq_iru_Id" | "preq_SetNama" | "preq_Jenis" | "preq_Jumlah" | "preq_Status";
export type pinjam_requestCreationAttributes = Optional<pinjam_requestAttributes, pinjam_requestOptionalAttributes>;

export class pinjam_request extends Model<pinjam_requestAttributes, pinjam_requestCreationAttributes> implements pinjam_requestAttributes {
  preq_Id!: number;
  preq_InsBy?: number;
  preq_InsTime?: Date;
  preq_UpdTime?: Date;
  preq_UpdBy?: number;
  preq_ru_Id?: number;
  preq_Kamar?: string;
  preq_No?: string;
  preq_Pasien?: string;
  preq_iru_Id?: number;
  preq_SetNama?: string;
  preq_Jenis?: string;
  preq_Jumlah?: number;
  preq_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_request {
    return pinjam_request.init({
    preq_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    preq_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preq_InsTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preq_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preq_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preq_ru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preq_Kamar: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    preq_No: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    preq_Pasien: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    preq_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preq_SetNama: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    preq_Jenis: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    preq_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preq_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_request',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "preq_Id" },
        ]
      },
    ]
  });
  }
}
