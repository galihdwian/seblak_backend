import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface instrumen_stokAttributes {
  stok_Id: number;
  stok_InsBy?: number;
  stok_InsTime: Date;
  stok_UpdBy?: number;
  stok_UpdTime?: Date;
  stok_iru_Id?: number;
  stok_ins_Id?: number;
  stok_Jumlah?: number;
  stok_Status?: number;
}

export type instrumen_stokPk = "stok_Id";
export type instrumen_stokId = instrumen_stok[instrumen_stokPk];
export type instrumen_stokOptionalAttributes = "stok_Id" | "stok_InsBy" | "stok_InsTime" | "stok_UpdBy" | "stok_UpdTime" | "stok_iru_Id" | "stok_ins_Id" | "stok_Jumlah" | "stok_Status";
export type instrumen_stokCreationAttributes = Optional<instrumen_stokAttributes, instrumen_stokOptionalAttributes>;

export class instrumen_stok extends Model<instrumen_stokAttributes, instrumen_stokCreationAttributes> implements instrumen_stokAttributes {
  stok_Id!: number;
  stok_InsBy?: number;
  stok_InsTime!: Date;
  stok_UpdBy?: number;
  stok_UpdTime?: Date;
  stok_iru_Id?: number;
  stok_ins_Id?: number;
  stok_Jumlah?: number;
  stok_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof instrumen_stok {
    return instrumen_stok.init({
    stok_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    stok_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stok_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    stok_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stok_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stok_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stok_ins_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stok_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stok_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'instrumen_stok',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "stok_Id" },
        ]
      },
    ]
  });
  }
}
