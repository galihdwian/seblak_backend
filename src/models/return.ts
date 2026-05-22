import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface return_Attributes {
  rt_Id: number;
  rt_InsTime: Date;
  rt_InsBy?: number;
  rt_UpdTime?: Date;
  rt_UpdBy?: number;
  rt_TransKode?: string;
  rt_Tanggal?: string;
  rt_pj_Id?: number;
  rt_AddInfo?: string;
  rt_Submitter?: string;
  rt_Verifikator?: string;
  rt_IruTotalJns?: number;
  rt_IruTotalItm?: number;
  rt_Status?: number;
}

export type return_Pk = "rt_Id";
export type return_Id = return_[return_Pk];
export type return_OptionalAttributes = "rt_Id" | "rt_InsTime" | "rt_InsBy" | "rt_UpdTime" | "rt_UpdBy" | "rt_TransKode" | "rt_Tanggal" | "rt_pj_Id" | "rt_AddInfo" | "rt_Submitter" | "rt_Verifikator" | "rt_IruTotalJns" | "rt_IruTotalItm" | "rt_Status";
export type return_CreationAttributes = Optional<return_Attributes, return_OptionalAttributes>;

export class return_ extends Model<return_Attributes, return_CreationAttributes> implements return_Attributes {
  rt_Id!: number;
  rt_InsTime!: Date;
  rt_InsBy?: number;
  rt_UpdTime?: Date;
  rt_UpdBy?: number;
  rt_TransKode?: string;
  rt_Tanggal?: string;
  rt_pj_Id?: number;
  rt_AddInfo?: string;
  rt_Submitter?: string;
  rt_Verifikator?: string;
  rt_IruTotalJns?: number;
  rt_IruTotalItm?: number;
  rt_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static initModel(sequelize: Sequelize.Sequelize): typeof return_ {
    return return_.init({
    rt_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rt_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    rt_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rt_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rt_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rt_TransKode: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    rt_Tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    rt_pj_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rt_AddInfo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rt_Submitter: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rt_Verifikator: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rt_IruTotalJns: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    rt_IruTotalItm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    rt_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'return',
    timestamps: false,
    hooks: {
      beforeCreate: async (instance: return_) => {
        let isUnique = false;
        let newKode = '';

        // Loop until a unique code is found
        while (!isUnique) {
          newKode = return_.generateRandomKey(8);

          // Check if exists in DB
          const existing = await return_.findOne({
            where: { rt_TransKode: newKode },
            attributes: ['rt_Id'] // Only fetch ID to keep it lightweight
          });

          if (!existing) {
            isUnique = true;
          }
        }

        instance.rt_TransKode = newKode;
      }
    },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rt_Id" },
        ]
      },
    ]
  });
  }
}
