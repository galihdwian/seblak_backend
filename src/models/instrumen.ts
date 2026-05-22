import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface instrumenAttributes {
  iru_Id: number;
  iru_InsTime: Date;
  iru_InsBy?: number;
  iru_UpdTime?: Date;
  iru_UpdBy?: number;
  iru_ins_Id?: number;
  iru_ru_Id?: number;
  iru_Idt?: string;
  iru_Nama?: string;
  iru_Satuan?: string;
  iru_NoKatalog?: string;
  iru_Brand?: string;
  iru_Reuse?: number;
  iru_LastSetting?: Date;
  iru_ExpDate?: Date;
  iru_Status?: number;
}

export type instrumenPk = "iru_Id";
export type instrumenId = instrumen[instrumenPk];
export type instrumenOptionalAttributes = "iru_Id" | "iru_InsTime" | "iru_InsBy" | "iru_UpdTime" | "iru_UpdBy" | "iru_ins_Id" | "iru_ru_Id" | "iru_Idt" | "iru_Nama" | "iru_Satuan" | "iru_NoKatalog" | "iru_Brand" | "iru_Reuse" | "iru_LastSetting" | "iru_ExpDate" | "iru_Status";
export type instrumenCreationAttributes = Optional<instrumenAttributes, instrumenOptionalAttributes>;

export class instrumen extends Model<instrumenAttributes, instrumenCreationAttributes> implements instrumenAttributes {
  iru_Id!: number;
  iru_InsTime!: Date;
  iru_InsBy?: number;
  iru_UpdTime?: Date;
  iru_UpdBy?: number;
  iru_ins_Id?: number;
  iru_ru_Id?: number;
  iru_Idt?: string;
  iru_Nama?: string;
  iru_Satuan?: string;
  iru_NoKatalog?: string;
  iru_Brand?: string;
  iru_Reuse?: number;
  iru_LastSetting?: Date;
  iru_ExpDate?: Date;
  iru_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof instrumen {
    return instrumen.init({
    iru_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    iru_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    iru_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iru_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iru_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iru_ins_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iru_ru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iru_Idt: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    iru_Nama: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    iru_Satuan: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    iru_NoKatalog: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    iru_Brand: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    iru_Reuse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iru_LastSetting: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iru_ExpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iru_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'instrumen',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "iru_Id" },
        ]
      },
    ]
  });
  }
}
