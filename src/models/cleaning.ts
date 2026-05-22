import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface cleaningAttributes {
  cl_Id: number;
  cl_InsTime: Date;
  cl_InsBy?: number;
  cl_UpdTime?: Date;
  cl_UpdBy?: number;
  cl_TransKode?: string;
  cl_CleanBy?: string;
  cl_pj_Id?: number;
  cl_msn_Id?: number;
  cl_Start?: Date;
  cl_End?: Date;
  cl_IruJenis?: 'pcs' | 'set';
  cl_IruId?: number;
  cl_IruSetId?: number;
  cl_IruJml?: number;
  cl_Status?: number;
}

export type cleaningPk = "cl_Id";
export type cleaningId = cleaning[cleaningPk];
export type cleaningOptionalAttributes = "cl_Id" | "cl_InsTime" | "cl_InsBy" | "cl_UpdTime" | "cl_UpdBy" | "cl_TransKode" | "cl_CleanBy" | "cl_pj_Id" | "cl_msn_Id" | "cl_Start" | "cl_End" | "cl_IruJenis" | "cl_IruId" | "cl_IruSetId" | "cl_IruJml" | "cl_Status";
export type cleaningCreationAttributes = Optional<cleaningAttributes, cleaningOptionalAttributes>;

export class cleaning extends Model<cleaningAttributes, cleaningCreationAttributes> implements cleaningAttributes {
  cl_Id!: number;
  cl_InsTime!: Date;
  cl_InsBy?: number;
  cl_UpdTime?: Date;
  cl_UpdBy?: number;
  cl_TransKode?: string;
  cl_CleanBy?: string;
  cl_pj_Id?: number;
  cl_msn_Id?: number;
  cl_Start?: Date;
  cl_End?: Date;
  cl_IruJenis?: 'pcs' | 'set';
  cl_IruId?: number;
  cl_IruSetId?: number;
  cl_IruJml?: number;
  cl_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static initModel(sequelize: Sequelize.Sequelize): typeof cleaning {
    return cleaning.init({
    cl_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cl_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    cl_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cl_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_TransKode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cl_CleanBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cl_pj_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_msn_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_Start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cl_End: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cl_IruJenis: {
      type: DataTypes.ENUM('pcs','set'),
      allowNull: true
    },
    cl_IruId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_IruSetId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_IruJml: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cl_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'cleaning',
    timestamps: false,
      hooks: {
        beforeCreate: async (instance: cleaning) => {
          let isUnique = false;
          let newKode = '';

          // Loop until a unique code is found
          while (!isUnique) {
            newKode = cleaning.generateRandomKey(8);

            // Check if exists in DB
            const existing = await cleaning.findOne({
              where: { cl_TransKode: newKode },
              attributes: ['cl_Id'] // Only fetch ID to keep it lightweight
            });

            if (!existing) {
              isUnique = true;
            }
          }

          instance.cl_TransKode = newKode;
        }
      },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cl_Id" },
        ]
      },
    ]
  });
  }
}
