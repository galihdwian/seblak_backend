import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface sessionsAttributes {
  sess_Id: number;
  sess_InsTime: Date;
  sess_user_Id?: number;
  sess_Key?: string;
  sess_Expire?: Date;
  sess_Status?: number;
}

export type sessionsPk = "sess_Id";
export type sessionsId = sessions[sessionsPk];
export type sessionsOptionalAttributes = "sess_Id" | "sess_InsTime" | "sess_user_Id" | "sess_Key" | "sess_Expire" | "sess_Status";
export type sessionsCreationAttributes = Optional<sessionsAttributes, sessionsOptionalAttributes>;

export class sessions extends Model<sessionsAttributes, sessionsCreationAttributes> implements sessionsAttributes {
  sess_Id!: number;
  sess_InsTime!: Date;
  sess_user_Id?: number;
  sess_Key?: string;
  sess_Expire?: Date;
  sess_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof sessions {
    return sessions.init({
    sess_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sess_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    sess_user_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sess_Key: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    sess_Expire: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sess_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'sessions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sess_Id" },
        ]
      },
    ]
  });
  }
}
