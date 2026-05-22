import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface articleAttributes {
  artc_Id: number;
  artc_InsTime: Date;
  artc_InsBy?: number;
  artc_UpdTime?: Date;
  artc_UpdBy?: number;
  artc_Title?: string;
  artc_Content?: string;
  artc_Seo?: string;
  artc_cat_Id?: number;
  artc_Heading?: string;
  artc_Tag?: string;
  artc_CoverImage?: string;
  artc_ContentImage?: string;
  artc_ExternalLink?: string;
  artc_Status?: number;
}

export type articlePk = "artc_Id";
export type articleId = article[articlePk];
export type articleOptionalAttributes = "artc_Id" | "artc_InsTime" | "artc_InsBy" | "artc_UpdTime" | "artc_UpdBy" | "artc_Title" | "artc_Content" | "artc_Seo" | "artc_cat_Id" | "artc_Heading" | "artc_Tag" | "artc_CoverImage" | "artc_ContentImage" | "artc_ExternalLink" | "artc_Status";
export type articleCreationAttributes = Optional<articleAttributes, articleOptionalAttributes>;

export class article extends Model<articleAttributes, articleCreationAttributes> implements articleAttributes {
  artc_Id!: number;
  artc_InsTime!: Date;
  artc_InsBy?: number;
  artc_UpdTime?: Date;
  artc_UpdBy?: number;
  artc_Title?: string;
  artc_Content?: string;
  artc_Seo?: string;
  artc_cat_Id?: number;
  artc_Heading?: string;
  artc_Tag?: string;
  artc_CoverImage?: string;
  artc_ContentImage?: string;
  artc_ExternalLink?: string;
  artc_Status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof article {
    return article.init({
    artc_Id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    artc_InsTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    artc_InsBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    artc_UpdTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    artc_UpdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    artc_Title: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    artc_Content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    artc_Seo: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    artc_cat_Id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    artc_Heading: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    artc_Tag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    artc_CoverImage: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    artc_ContentImage: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    artc_ExternalLink: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    artc_Status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'article',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "artc_Id" },
        ]
      },
    ]
  });
  }
}
