import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface pinjam_instrumenAttributes {
  pji_Id: number;
  pji_InsTime: Date;
  pji_InsBy?: number;
  pji_UpdTime?: Date;
  pji_UpdBy?: number;
  pji_pj_Id?: number;
  pji_Jenis?: 'pcs' | 'set';
  pji_set_Id?: number;
  pji_Jumlah?: number;
  pji_IruTotalJns?: number;
  pji_IruTotalItm?: number;
  pji_Status?: number;
}

export type pinjam_instrumenPk = "pji_Id";
export type pinjam_instrumenId = pinjam_instrumen[pinjam_instrumenPk];
export type pinjam_instrumenOptionalAttributes = "pji_Id" | "pji_InsTime" | "pji_InsBy" | "pji_UpdTime" | "pji_UpdBy" | "pji_pj_Id" | "pji_Jenis" | "pji_set_Id" | "pji_Jumlah" | "pji_IruTotalJns" | "pji_IruTotalItm" | "pji_Status";
export type pinjam_instrumenCreationAttributes = Optional<pinjam_instrumenAttributes, pinjam_instrumenOptionalAttributes>;

export class pinjam_instrumen extends Model<pinjam_instrumenAttributes, pinjam_instrumenCreationAttributes> implements pinjam_instrumenAttributes {
  pji_Id!: number;
  pji_InsTime!: Date;
  pji_InsBy?: number;
  pji_UpdTime?: Date;
  pji_UpdBy?: number;
  pji_pj_Id?: number;
  pji_Jenis?: 'pcs' | 'set';
  pji_set_Id?: number;
  pji_Jumlah?: number;
  pji_IruTotalJns?: number;
  pji_IruTotalItm?: number;
  pji_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam_instrumen {
    return pinjam_instrumen.init({
    pji_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pji_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    pji_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pji_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_pj_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jenis: {
      type: DataTypes.ENUM('pcs','set'),
      allowNull: true,
      defaultValue: "pcs"
    },
    pji_set_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_IruTotalJns: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_IruTotalItm: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pji_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'pinjam_instrumen',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pji_Id" },
        ]
      },
    ]
  });
  }
}
