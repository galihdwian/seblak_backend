import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface bowie_dick_testAttributes {
  bdt_Id: number;
  bdt_InsTime: Date;
  bdt_InsBy?: number;
  bdt_UpdTime?: Date;
  bdt_UpdBy?: number;
  bdt_Petugas?: string;
  bdt_StartTime?: Date;
  bdt_EndTime?: Date;
  bdt_msn_Id?: number;
  bdt_Paper?: string;
  bdt_Result?: string;
  bdt_Status?: number;
}

export type bowie_dick_testPk = "bdt_Id";
export type bowie_dick_testId = bowie_dick_test[bowie_dick_testPk];
export type bowie_dick_testOptionalAttributes = "bdt_Id" | "bdt_InsTime" | "bdt_InsBy" | "bdt_UpdTime" | "bdt_UpdBy" | "bdt_Petugas" | "bdt_StartTime" | "bdt_EndTime" | "bdt_msn_Id" | "bdt_Paper" | "bdt_Result" | "bdt_Status";
export type bowie_dick_testCreationAttributes = Optional<bowie_dick_testAttributes, bowie_dick_testOptionalAttributes>;

export class bowie_dick_test extends Model<bowie_dick_testAttributes, bowie_dick_testCreationAttributes> implements bowie_dick_testAttributes {
  bdt_Id!: number;
  bdt_InsTime!: Date;
  bdt_InsBy?: number;
  bdt_UpdTime?: Date;
  bdt_UpdBy?: number;
  bdt_Petugas?: string;
  bdt_StartTime?: Date;
  bdt_EndTime?: Date;
  bdt_msn_Id?: number;
  bdt_Paper?: string;
  bdt_Result?: string;
  bdt_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof bowie_dick_test {
    return bowie_dick_test.init({
    bdt_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bdt_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    bdt_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bdt_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bdt_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bdt_Petugas: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    bdt_StartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bdt_EndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bdt_msn_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bdt_Paper: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    bdt_Result: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    bdt_Status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bowie_dick_test',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bdt_Id" },
        ]
      },
    ]
  });
  }
}
