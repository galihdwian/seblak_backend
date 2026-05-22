import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface pinjam_registerAttributes {
  pj_Id: number;
  pj_InsTime: Date;
  pj_InsBy?: number;
  pj_UpdTime?: Date;
  pj_UpdBy?: number;
  pj_TransKode?: string;
  pj_Tgl?: string;
  pj_ru_Id?: number;
  pj_Kamar?: string;
  pj_No?: string;
  pj_Pasien?: string;
  pj_AddInfo?: string;
  pj_A1?: string;
  pj_B1?: string;
  pj_B2?: string;
  pj_A2?: string;
  pj_Jenis?: 'pcs' | 'set';
  pj_set_Id?: number;
  pj_Jumlah?: number;
  pj_IruTotalJns?: number;
  pj_IruTotalItm?: number;
  pj_Status?: number;
}

export type pinjam_registerPk = "pj_Id";
export type pinjam_registerId = pinjam_register[pinjam_registerPk];
export type pinjam_registerOptionalAttributes = "pj_Id" | "pj_InsTime" | "pj_InsBy" | "pj_UpdTime" | "pj_UpdBy" | "pj_TransKode" | "pj_Tgl" | "pj_ru_Id" | "pj_Kamar" | "pj_No" | "pj_Pasien" | "pj_AddInfo" | "pj_A1" | "pj_B1" | "pj_B2" | "pj_A2" | "pj_Jenis" | "pj_set_Id" | "pj_Jumlah" | "pj_IruTotalJns" | "pj_IruTotalItm" | "pj_Status";
export type pinjam_registerCreationAttributes = Optional<pinjam_registerAttributes, pinjam_registerOptionalAttributes>;

export class pinjam_register extends Model<pinjam_registerAttributes, pinjam_registerCreationAttributes> implements pinjam_registerAttributes {
  pj_Id!: number;
  pj_InsTime!: Date;
  pj_InsBy?: number;
  pj_UpdTime?: Date;
  pj_UpdBy?: number;
  pj_TransKode?: string;
  pj_Tgl?: string;
  pj_ru_Id?: number;
  pj_Kamar?: string;
  pj_No?: string;
  pj_Pasien?: string;
  pj_AddInfo?: string;
  pj_A1?: string;
  pj_B1?: string;
  pj_B2?: string;
  pj_A2?: string;
  pj_Jenis?: 'pcs' | 'set';
  pj_set_Id?: number;
  pj_Jumlah?: number;
  pj_IruTotalJns?: number;
  pj_IruTotalItm?: number;
  pj_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }
  
  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_register {
    return pinjam_register.init({
    pj_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pj_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    pj_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pj_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_TransKode: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    pj_Tgl: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    pj_ru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_Kamar: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    pj_No: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    pj_Pasien: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pj_AddInfo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pj_A1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pj_B1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pj_B2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pj_A2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pj_Jenis: {
      type: DataTypes.ENUM('pcs','set'),
      allowNull: true,
      defaultValue: "pcs"
    },
    pj_set_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_IruTotalJns: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_IruTotalItm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pj_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_register',
    timestamps: false,
    hooks: {
      beforeCreate: async (instance: pinjam_register) => {
        let isUnique = false;
        let newKode = '';

        // Loop until a unique code is found
        while (!isUnique) {
          newKode = pinjam_register.generateRandomKey(8);

          // Check if exists in DB
          const existing = await pinjam_register.findOne({
            where: { pj_TransKode: newKode },
            attributes: ['pj_Id'] // Only fetch ID to keep it lightweight
          });

          if (!existing) {
            isUnique = true;
          }
        }

        instance.pj_TransKode = newKode;
      }
    },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pj_Id" },
        ]
      },
    ]
  });
  }
}
