import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface instrumen_setAttributes {
  set_Id: number;
  set_InsBy?: number;
  set_InsTime: Date;
  set_UpdBy?: number;
  set_UpdTime?: Date;
  set_ins_Id?: number;
  set_ru_Id?: number;
  set_Nama?: string;
  set_ItemTotal?: number;
  set_LastSetting?: Date;
  set_ExpDate?: Date;
  set_Status?: number;
}

export type instrumen_setPk = "set_Id";
export type instrumen_setId = instrumen_set[instrumen_setPk];
export type instrumen_setOptionalAttributes = "set_Id" | "set_InsBy" | "set_InsTime" | "set_UpdBy" | "set_UpdTime" | "set_ins_Id" | "set_ru_Id" | "set_Nama" | "set_ItemTotal" | "set_LastSetting" | "set_ExpDate" | "set_Status";
export type instrumen_setCreationAttributes = Optional<instrumen_setAttributes, instrumen_setOptionalAttributes>;

export class instrumen_set extends Model<instrumen_setAttributes, instrumen_setCreationAttributes> implements instrumen_setAttributes {
  set_Id!: number;
  set_InsBy?: number;
  set_InsTime!: Date;
  set_UpdBy?: number;
  set_UpdTime?: Date;
  set_ins_Id?: number;
  set_ru_Id?: number;
  set_Nama?: string;
  set_ItemTotal?: number;
  set_LastSetting?: Date;
  set_ExpDate?: Date;
  set_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof instrumen_set {
    return instrumen_set.init({
    set_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    set_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    set_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    set_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    set_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    set_ins_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    set_ru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    set_Nama: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    set_ItemTotal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    set_LastSetting: {
      type: DataTypes.DATE,
      allowNull: true
    },
    set_ExpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    set_Status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'instrumen_set',
    timestamps: false,
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
