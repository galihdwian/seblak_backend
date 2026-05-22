import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface sterilisasiAttributes {
  st_Id: number;
  st_InsTime: Date;
  st_InsBy?: number;
  st_UpdTime?: Date;
  st_UpdBy?: number;
  st_TransKode?: string;
  st_SteBy?: string;
  st_pj_Id?: number;
  st_msn_Id?: number;
  st_Start?: Date;
  st_End?: Date;
  st_IruJenis?: 'pcs' | 'set';
  st_IruId?: number;
  st_IruSetId?: number;
  st_IruJml?: number;
  st_Status?: number;
}

export type sterilisasiPk = "st_Id";
export type sterilisasiId = sterilisasi[sterilisasiPk];
export type sterilisasiOptionalAttributes = "st_Id" | "st_InsTime" | "st_InsBy" | "st_UpdTime" | "st_UpdBy" | "st_TransKode" | "st_SteBy" | "st_pj_Id" | "st_msn_Id" | "st_Start" | "st_End" | "st_IruJenis" | "st_IruId" | "st_IruSetId" | "st_IruJml" | "st_Status";
export type sterilisasiCreationAttributes = Optional<sterilisasiAttributes, sterilisasiOptionalAttributes>;

export class sterilisasi extends Model<sterilisasiAttributes, sterilisasiCreationAttributes> implements sterilisasiAttributes {
  st_Id!: number;
  st_InsTime!: Date;
  st_InsBy?: number;
  st_UpdTime?: Date;
  st_UpdBy?: number;
  st_TransKode?: string;
  st_SteBy?: string;
  st_pj_Id?: number;
  st_msn_Id?: number;
  st_Start?: Date;
  st_End?: Date;
  st_IruJenis?: 'pcs' | 'set';
  st_IruId?: number;
  st_IruSetId?: number;
  st_IruJml?: number;
  st_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static initModel(sequelize: Sequelize.Sequelize): typeof sterilisasi {
    return sterilisasi.init({
      st_Id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      st_InsTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn('current_timestamp')
      },
      st_InsBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_UpdTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      st_UpdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_TransKode: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      st_SteBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      st_pj_Id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_msn_Id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_Start: {
        type: DataTypes.DATE,
        allowNull: true
      },
      st_End: {
        type: DataTypes.DATE,
        allowNull: true
      },
      st_IruJenis: {
        type: DataTypes.ENUM('pcs', 'set'),
        allowNull: true
      },
      st_IruId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_IruSetId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_IruJml: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      st_Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    }, {
      sequelize,
      tableName: 'sterilisasi',
      timestamps: false,
      hooks: {
        beforeCreate: async (instance: sterilisasi) => {
          let isUnique = false;
          let newKode = '';

          // Loop until a unique code is found
          while (!isUnique) {
            newKode = sterilisasi.generateRandomKey(8);

            // Check if exists in DB
            const existing = await sterilisasi.findOne({
              where: { st_TransKode: newKode },
              attributes: ['st_Id'] // Only fetch ID to keep it lightweight
            });

            if (!existing) {
              isUnique = true;
            }
          }

          instance.st_TransKode = newKode;
        }
      },
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "st_Id" },
          ]
        },
      ]
    });
  }
}
