import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface article_categoryAttributes {
  cat_Id: number;
  cat_InsTime: Date;
  cat_InsBy?: number;
  cat_UpdTime?: Date;
  cat_UpdBy?: number;
  cat_Name?: string;
  cat_Seo?: string;
  cat_Desc?: string;
  cat_Depth?: number;
  cat_Parent?: number;
  cat_Logo?: string;
  cat_Status?: number;
}

export type article_categoryPk = "cat_Id";
export type article_categoryId = article_category[article_categoryPk];
export type article_categoryOptionalAttributes = "cat_Id" | "cat_InsTime" | "cat_InsBy" | "cat_UpdTime" | "cat_UpdBy" | "cat_Name" | "cat_Seo" | "cat_Desc" | "cat_Depth" | "cat_Parent" | "cat_Logo" | "cat_Status";
export type article_categoryCreationAttributes = Optional<article_categoryAttributes, article_categoryOptionalAttributes>;

export class article_category extends Model<article_categoryAttributes, article_categoryCreationAttributes> implements article_categoryAttributes {
  cat_Id!: number;
  cat_InsTime!: Date;
  cat_InsBy?: number;
  cat_UpdTime?: Date;
  cat_UpdBy?: number;
  cat_Name?: string;
  cat_Seo?: string;
  cat_Desc?: string;
  cat_Depth?: number;
  cat_Parent?: number;
  cat_Logo?: string;
  cat_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof article_category {
    return article_category.init({
    cat_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cat_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    cat_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cat_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cat_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cat_Name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    cat_Seo: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    cat_Desc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cat_Depth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cat_Parent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cat_Logo: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    cat_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'article_category',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cat_Id" },
        ]
      },
    ]
  });
  }
}
