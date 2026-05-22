import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface app_settingsAttributes {
  key: string;
  value?: string;
  label?: string;
}

export type app_settingsPk = "key";
export type app_settingsId = app_settings[app_settingsPk];
export type app_settingsOptionalAttributes = "value" | "label";
export type app_settingsCreationAttributes = Optional<app_settingsAttributes, app_settingsOptionalAttributes>;

export class app_settings extends Model<app_settingsAttributes, app_settingsCreationAttributes> implements app_settingsAttributes {
  key!: string;
  value?: string;
  label?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof app_settings {
    return app_settings.init({
    key: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'app_settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "key" },
        ]
      },
    ]
  });
  }
}
