import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_logAttributes {
  pjl_Id: number;
  pjl_pj_Id?: number;
  pjl_Time: Date;
  pjl_Flow?: number;
  pjl_Action?: number;
  pjl_Info?: string;
  pjl_user_Id?: number;
  pjl_Status?: number;
}

export type pinjam_logPk = "pjl_Id";
export type pinjam_logId = pinjam_log[pinjam_logPk];
export type pinjam_logOptionalAttributes = "pjl_Id" | "pjl_pj_Id" | "pjl_Time" | "pjl_Flow" | "pjl_Action" | "pjl_Info" | "pjl_user_Id" | "pjl_Status";
export type pinjam_logCreationAttributes = Optional<pinjam_logAttributes, pinjam_logOptionalAttributes>;

export class pinjam_log extends Model<pinjam_logAttributes, pinjam_logCreationAttributes> implements pinjam_logAttributes {
  pjl_Id!: number;
  pjl_pj_Id?: number;
  pjl_Time!: Date;
  pjl_Flow?: number;
  pjl_Action?: number;
  pjl_Info?: string;
  pjl_user_Id?: number;
  pjl_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_log {
    return pinjam_log.init({
    pjl_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pjl_pj_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjl_Time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    pjl_Flow: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    pjl_Action: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjl_Info: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    pjl_user_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pjl_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_log',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pjl_Id" },
        ]
      },
    ]
  });
  }
}
