import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface usersAttributes {
  user_Id: number;
  user_InsTime?: Date;
  user_InsBy?: number;
  user_Email?: string;
  user_Uname?: string;
  user_Passw?: string;
  user_Pin?: string;
  user_OTP?: string;
  user_OTPInfo?: string;
  user_OTPAction?: number;
  user_OTPActionToday?: number;
  user_Nama?: string;
  user_NoHp?: string;
  user_LastLogin?: Date;
  user_Level: number;
  user_ru_Id?: number;
  user_rcp_Id?: number;
  user_grup_Id?: number;
  user_Avatar?: string;
  user_UpdBy?: number;
  user_UpdTime?: Date;
  user_MBSAlias?: string;
  user_TrialPin?: number;
  user_TrialOTP?: number;
  user_RememberToken?: string;
  user_Status?: number;
}

export type usersPk = "user_Id" | "user_Level";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "user_Id" | "user_InsTime" | "user_InsBy" | "user_Email" | "user_Uname" | "user_Passw" | "user_Pin" | "user_OTP" | "user_OTPInfo" | "user_OTPAction" | "user_OTPActionToday" | "user_Nama" | "user_NoHp" | "user_LastLogin" | "user_Level" | "user_ru_Id" | "user_rcp_Id" | "user_grup_Id" | "user_Avatar" | "user_UpdBy" | "user_UpdTime" | "user_MBSAlias" | "user_TrialPin" | "user_TrialOTP" | "user_RememberToken" | "user_Status";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  user_Id!: number;
  user_InsTime?: Date;
  user_InsBy?: number;
  user_Email?: string;
  user_Uname?: string;
  user_Passw?: string;
  user_Pin?: string;
  user_OTP?: string;
  user_OTPInfo?: string;
  user_OTPAction?: number;
  user_OTPActionToday?: number;
  user_Nama?: string;
  user_NoHp?: string;
  user_LastLogin?: Date;
  user_Level!: number;
  user_ru_Id?: number;
  user_rcp_Id?: number;
  user_grup_Id?: number;
  user_Avatar?: string;
  user_UpdBy?: number;
  user_UpdTime?: Date;
  user_MBSAlias?: string;
  user_TrialPin?: number;
  user_TrialOTP?: number;
  user_RememberToken?: string;
  user_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return users.init({
    user_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_InsTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_Email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    user_Uname: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    user_Passw: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_Pin: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_OTP: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_OTPInfo: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    user_OTPAction: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_OTPActionToday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    user_Nama: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_NoHp: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    user_LastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_Level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      primaryKey: true
    },
    user_ru_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_rcp_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_grup_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_Avatar: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    user_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_MBSAlias: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_TrialPin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    user_TrialOTP: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    user_RememberToken: {
      type: DataTypes.STRING(240),
      allowNull: true
    },
    user_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_Id" },
          { name: "user_Level" },
        ]
      },
    ]
  });
  }
}
