import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { randomBytes } from 'crypto';

export interface pinjamAttributes {
  pj_Id: number;
  pj_InsTime: Date;
  pj_InsBy?: number;
  pj_UpdTime?: Date;
  pj_UpdBy?: number;
  pj_TransKode?: string;
  pj_Tgl?: string;
  pj_ru_Id?: number;
  pj_Kamar?: string;
  pj_No?: string;
  pj_Pasien?: string;
  pj_AddInfo?: string;
  pj_Jenis?: string;
  pj_A1?: string;
  pj_B1?: string;
  pj_B2?: string;
  pj_A2?: string;
  pj_IruTotal?: number;
  pj_IruTotalJns?: number;
  pj_IruTotalItm?: number;
  pj_Status?: number;
  pj_Metadata?: String;
}

export type pinjamPk = "pj_Id";
export type pinjamId = pinjam[pinjamPk];
export type pinjamOptionalAttributes = "pj_Id" | "pj_InsTime" | "pj_InsBy" | "pj_UpdTime" | "pj_UpdBy" | "pj_TransKode" | "pj_Tgl" | "pj_ru_Id" | "pj_Kamar" | "pj_No" | "pj_Pasien" | "pj_AddInfo" | "pj_A1" | "pj_B1" | "pj_B2" | "pj_A2" | "pj_IruTotal" | "pj_IruTotalJns" | "pj_IruTotalItm" | "pj_Status" | "pj_Jenis" | "pj_Metadata";
export type pinjamCreationAttributes = Optional<pinjamAttributes, pinjamOptionalAttributes>;

export class pinjam extends Model<pinjamAttributes, pinjamCreationAttributes> implements pinjamAttributes {
  pj_Id!: number;
  pj_InsTime!: Date;
  pj_InsBy?: number;
  pj_UpdTime?: Date;
  pj_UpdBy?: number;
  pj_Jenis?: string;
  pj_TransKode?: string;
  pj_Tgl?: string;
  pj_ru_Id?: number;
  pj_Kamar?: string;
  pj_No?: string;
  pj_Pasien?: string;
  pj_AddInfo?: string;
  pj_A1?: string;
  pj_B1?: string;
  pj_B2?: string;
  pj_A2?: string;
  pj_Metadata?: string;
  pj_IruTotal?: number;
  pj_IruTotalJns?: number;
  pj_IruTotalItm?: number;
  pj_Status?: number;

  static generateRandomKey(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }

  static initModel(sequelize: Sequelize.Sequelize): typeof pinjam {
    return pinjam.init({
      pj_Id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      pj_InsTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn('current_timestamp')
      },
      pj_InsBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_UpdTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      pj_UpdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_Jenis: {
        type: DataTypes.ENUM('IRU', 'AHP'),

      },
      pj_TransKode: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      pj_Tgl: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      pj_ru_Id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_Kamar: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      pj_No: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      pj_Pasien: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pj_AddInfo: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      pj_A1: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pj_B1: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pj_B2: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pj_A2: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pj_IruTotal: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_IruTotalJns: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_IruTotalItm: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pj_Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      pj_Metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    }, {
      sequelize,
      tableName: 'pinjam',
      timestamps: false,
      hooks: {
        beforeCreate: async (instance: pinjam) => {
          let isUnique = false;
          let newKode = '';

          // Loop until a unique code is found
          while (!isUnique) {
            newKode = pinjam.generateRandomKey(8);

            // Check if exists in DB
            const existing = await pinjam.findOne({
              where: { pj_TransKode: newKode },
              attributes: ['pj_Id'] // Only fetch ID to keep it lightweight
            });

            if (!existing) {
              isUnique = true;
            }
          }

          instance.pj_TransKode = newKode;
        }
      },
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "pj_Id" },
          ]
        },
      ]
    });
  }
}

export const Pinjam_Instrumen_SimpleUpdateStatus = async ({ sequelize, id_pinjam, iru_jenis = '', iru_id = '', status, tx, tgl_expired = '' }) => {

  if (iru_jenis && iru_id) {

    if (iru_jenis === 'pcs') {
      await sequelize.query(`update instrumen 
        join pinjam_iru  on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
        set instrumen.iru_Status = :status
        where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_iru_Id = :iru_id and pinjam_iru.pji_Status = 1`, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          pinjam_id: id_pinjam,
          iru_id: iru_id,
          status: status,
        },
        transaction: tx,
      });

      if (tgl_expired) {

        await sequelize.query(`update instrumen 
          join pinjam_iru  on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
          set instrumen.iru_ExpDate = :expDate
          where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_iru_Id = :iru_id`, {
          type: Sequelize.QueryTypes.UPDATE,
          replacements: {
            pinjam_id: id_pinjam,
            iru_id: iru_id,
            expDate: tgl_expired,
          },
          transaction: tx,
        });
      }

    } else {

      await sequelize.query(`update instrumen_set 
        join pinjam_iru  on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
        set instrumen_set.set_Status = :status
        where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_set_Id = :iru_id and pinjam_iru.pji_Status = 1`, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          pinjam_id: id_pinjam,
          iru_id: iru_id,
          status: status,
        },
        transaction: tx,
      });

      if (tgl_expired) {
        await sequelize.query(`update instrumen_set 
              join pinjam_iru  on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
              set instrumen_set.set_ExpDate = :expDate
              where pinjam_iru.pji_pj_Id = :pinjam_id  and pinjam_iru.pji_set_Id = :iru_id`, {
          type: Sequelize.QueryTypes.UPDATE,
          replacements: {
            pinjam_id: id_pinjam,
            iru_id: iru_id,
            expDate: tgl_expired,
          },
          transaction: tx,
        });
      }

    }

  } else {

    await sequelize.query(`update instrumen 
      join pinjam_iru  on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
      set instrumen.iru_Status = :status
      where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_Status = 1`, {
      type: Sequelize.QueryTypes.UPDATE,
      replacements: {
        pinjam_id: id_pinjam,
        status: status,
      },
      transaction: tx,
    });

    await sequelize.query(`update instrumen_set 
 join pinjam_iru  on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
 set instrumen_set.set_Status = :status
 where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_Status = 1`, {
      type: Sequelize.QueryTypes.UPDATE,
      replacements: {
        pinjam_id: id_pinjam,
        status: status,
      },
      transaction: tx,
    });

    if (tgl_expired) {

      await sequelize.query(`update instrumen 
 join pinjam_iru  on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
 set instrumen.iru_ExpDate = :expDate
 where pinjam_iru.pji_pj_Id = :pinjam_id`, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          pinjam_id: id_pinjam,
          expDate: tgl_expired,
        },
        transaction: tx,
      });

      await sequelize.query(`update instrumen_set 
 join pinjam_iru  on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
 set instrumen_set.set_ExpDate = :expDate
 where pinjam_iru.pji_pj_Id = :pinjam_id`, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          pinjam_id: id_pinjam,
          expDate: tgl_expired,
        },
        transaction: tx,
      });
    }
  }




};



export const Pinjam_Instrumen_SimpleUpdateStatus_Deletedlist = async ({ sequelize, id_pinjam, tx }) => {

  await sequelize.query(`update instrumen 
 join pinjam_iru  on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
 set instrumen.iru_Status = 1
 where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_Status = 2`, {
    type: Sequelize.QueryTypes.UPDATE,
    replacements: {
      pinjam_id: id_pinjam,
    },
    transaction: tx,
  });

  await sequelize.query(`update instrumen_set 
 join pinjam_iru  on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
 set instrumen_set.set_Status = 1
 where pinjam_iru.pji_pj_Id = :pinjam_id and pinjam_iru.pji_Status = 2`, {
    type: Sequelize.QueryTypes.UPDATE,
    replacements: {
      pinjam_id: id_pinjam,
    },
    transaction: tx,
  });

};


export const Pinjam_Action_Log = async ({ sequelize, id_pinjam, action }) => {
  const find = await sequelize.query(`
    select pjl_Time, pjl_Action, pjl_Info, user_Uname, user_Nama
    from pinjam_log
    left join users on users.user_Id = pinjam_log.pjl_user_Id
    where pjl_pj_Id = :id_pinjam and pjl_Action = :action
    order by pjl_Time desc limit 1
    `, {
    type: Sequelize.QueryTypes.SELECT,
    replacements: {
      id_pinjam: id_pinjam,
      action: action
    }
  })

  if (find[0]) {
    return find[0]
  }


}