import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface mesinAttributes {
  msn_Id: number;
  msn_InsTime: Date;
  msn_InsBy?: number;
  msn_UpdTime?: Date;
  msn_UpdBy?: number;
  msn_Nama?: string;
  msn_Nomor?: string;
  msn_LastTest?: Date;
  msn_Status?: number;
}

export type mesinPk = "msn_Id";
export type mesinId = mesin[mesinPk];
export type mesinOptionalAttributes = "msn_Id" | "msn_InsTime" | "msn_InsBy" | "msn_UpdTime" | "msn_UpdBy" | "msn_Nama" | "msn_Nomor" | "msn_LastTest" | "msn_Status";
export type mesinCreationAttributes = Optional<mesinAttributes, mesinOptionalAttributes>;

export class mesin extends Model<mesinAttributes, mesinCreationAttributes> implements mesinAttributes {
  msn_Id!: number;
  msn_InsTime!: Date;
  msn_InsBy?: number;
  msn_UpdTime?: Date;
  msn_UpdBy?: number;
  msn_Nama?: string;
  msn_Nomor?: string;
  msn_LastTest?: Date;
  msn_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof mesin {
    return mesin.init({
    msn_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    msn_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    msn_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    msn_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    msn_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    msn_Nama: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    msn_Nomor: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    msn_LastTest: {
      type: DataTypes.DATE,
      allowNull: true
    },
    msn_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'mesin',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "msn_Id" },
        ]
      },
    ]
  });
  }
}
