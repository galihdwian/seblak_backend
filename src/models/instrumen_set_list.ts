import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface instrumen_set_listAttributes {
  list_Id: number;
  list_InsBy?: number;
  list_InsTime: Date;
  list_UpdTime?: Date;
  list_UpdBy?: number;
  list_set_Id?: number;
  list_iru_Id?: number;
  list_Jumlah?: number;
  list_Status?: number;
}

export type instrumen_set_listPk = "list_Id";
export type instrumen_set_listId = instrumen_set_list[instrumen_set_listPk];
export type instrumen_set_listOptionalAttributes = "list_Id" | "list_InsBy" | "list_InsTime" | "list_UpdTime" | "list_UpdBy" | "list_set_Id" | "list_iru_Id" | "list_Jumlah" | "list_Status";
export type instrumen_set_listCreationAttributes = Optional<instrumen_set_listAttributes, instrumen_set_listOptionalAttributes>;

export class instrumen_set_list extends Model<instrumen_set_listAttributes, instrumen_set_listCreationAttributes> implements instrumen_set_listAttributes {
  list_Id!: number;
  list_InsBy?: number;
  list_InsTime!: Date;
  list_UpdTime?: Date;
  list_UpdBy?: number;
  list_set_Id?: number;
  list_iru_Id?: number;
  list_Jumlah?: number;
  list_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof instrumen_set_list {
    return instrumen_set_list.init({
    list_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    list_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    list_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    list_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_set_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_iru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_Jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'instrumen_set_list',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "list_Id" },
        ]
      },
    ]
  });
  }
}
