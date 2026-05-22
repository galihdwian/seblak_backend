import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface settingAttributes {
  set_Id: number;
  set_InsTime: Date;
  set_InsBy?: number;
  set_UpdTime?: Date;
  set_UpdBy?: number;
  set_pj_Id?: number;
  set_TransKode?: string;
  set_SettingBy?: string;
  set_IruJenis?: 'pcs' | 'set';
  set_IruId?: number;
  set_IruSetId?: number;
  set_IruJml?: number;
  set_Status?: number;
}

export type settingPk = "set_Id";
export type settingId = setting[settingPk];
export type settingOptionalAttributes = "set_Id" | "set_InsTime" | "set_InsBy" | "set_UpdTime" | "set_UpdBy" | "set_pj_Id" | "set_TransKode" | "set_SettingBy" | "set_IruJenis" | "set_IruId" | "set_IruSetId" | "set_IruJml" | "set_Status";
export type settingCreationAttributes = Optional<settingAttributes, settingOptionalAttributes>;

export class setting extends Model<settingAttributes, settingCreationAttributes> implements settingAttributes {
  set_Id!: number;
  set_InsTime!: Date;
  set_InsBy?: number;
  set_UpdTime?: Date;
  set_UpdBy?: number;
  set_pj_Id?: number;
  set_TransKode?: string;
  set_SettingBy?: string;
  set_IruJenis?: 'pcs' | 'set';
  set_IruId?: number;
  set_IruSetId?: number;
  set_IruJml?: number;
  set_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static initModel(sequelize: Sequelize.Sequelize): typeof setting {
    return setting.init({
      set_Id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      set_InsTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn('current_timestamp')
      },
      set_InsBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_UpdTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      set_UpdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_pj_Id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_TransKode: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      set_SettingBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      set_IruJenis: {
        type: DataTypes.ENUM('pcs', 'set'),
        allowNull: true
      },
      set_IruId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_IruSetId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_IruJml: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      set_Status: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'setting',
      timestamps: false,
      hooks: {
        beforeCreate: async (instance: setting) => {
          let isUnique = false;
          let newKode = '';

          // Loop until a unique code is found
          while (!isUnique) {
            newKode = setting.generateRandomKey(8);

            // Check if exists in DB
            const existing = await setting.findOne({
              where: { set_TransKode: newKode },
              attributes: ['set_Id'] // Only fetch ID to keep it lightweight
            });

            if (!existing) {
              isUnique = true;
            }
          }

          instance.set_TransKode = newKode;
        }
      },
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "set_Id" },
          ]
        },
      ]
    });
  }
}
