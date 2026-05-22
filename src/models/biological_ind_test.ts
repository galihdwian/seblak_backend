import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface biological_ind_testAttributes {
  blt_Id: number;
  blt_InsTime: Date;
  blt_InsBy?: number;
  blt_UpdTime?: Date;
  blt_UpdBy?: number;
  blt_Petugas?: string;
  blt_StartTime?: Date;
  blt_EndTime?: Date;
  blt_msn_Id?: number;
  blt_Paper?: string;
  blt_Result?: string;
  blt_Status?: number;
}

export type biological_ind_testPk = "blt_Id";
export type biological_ind_testId = biological_ind_test[biological_ind_testPk];
export type biological_ind_testOptionalAttributes = "blt_Id" | "blt_InsTime" | "blt_InsBy" | "blt_UpdTime" | "blt_UpdBy" | "blt_Petugas" | "blt_StartTime" | "blt_EndTime" | "blt_msn_Id" | "blt_Paper" | "blt_Result" | "blt_Status";
export type biological_ind_testCreationAttributes = Optional<biological_ind_testAttributes, biological_ind_testOptionalAttributes>;

export class biological_ind_test extends Model<biological_ind_testAttributes, biological_ind_testCreationAttributes> implements biological_ind_testAttributes {
  blt_Id!: number;
  blt_InsTime!: Date;
  blt_InsBy?: number;
  blt_UpdTime?: Date;
  blt_UpdBy?: number;
  blt_Petugas?: string;
  blt_StartTime?: Date;
  blt_EndTime?: Date;
  blt_msn_Id?: number;
  blt_Paper?: string;
  blt_Result?: string;
  blt_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof biological_ind_test {
    return biological_ind_test.init({
    blt_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    blt_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    blt_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    blt_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    blt_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    blt_Petugas: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    blt_StartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    blt_EndTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    blt_msn_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    blt_Paper: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    blt_Result: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    blt_Status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'biological_ind_test',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "blt_Id" },
        ]
      },
    ]
  });
  }
}
