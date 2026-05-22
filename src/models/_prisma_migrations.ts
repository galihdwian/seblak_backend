import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface _prisma_migrationsAttributes {
  id: string;
  checksum: string;
  finished_at?: Date;
  migration_name: string;
  logs?: string;
  rolled_back_at?: Date;
  started_at: Date;
  applied_steps_count: number;
}

export type _prisma_migrationsPk = "id";
export type _prisma_migrationsId = _prisma_migrations[_prisma_migrationsPk];
export type _prisma_migrationsOptionalAttributes = "finished_at" | "logs" | "rolled_back_at" | "started_at" | "applied_steps_count";
export type _prisma_migrationsCreationAttributes = Optional<_prisma_migrationsAttributes, _prisma_migrationsOptionalAttributes>;

export class _prisma_migrations extends Model<_prisma_migrationsAttributes, _prisma_migrationsCreationAttributes> implements _prisma_migrationsAttributes {
  id!: string;
  checksum!: string;
  finished_at?: Date;
  migration_name!: string;
  logs?: string;
  rolled_back_at?: Date;
  started_at!: Date;
  applied_steps_count!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof _prisma_migrations {
    return _prisma_migrations.init({
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    checksum: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    finished_at: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    migration_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    logs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rolled_back_at: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    applied_steps_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: '_prisma_migrations',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
