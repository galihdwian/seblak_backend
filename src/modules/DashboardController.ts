import dayjs from "dayjs";
import { Router } from "express";
import { Op, QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { pinjam } from "../models/pinjam";
import { users } from "../models/users";

const DashboardController = Router()
DashboardController.get(`/`, auth(), async (req, res) => {
    const sequelize = await bky_sequelize()
    try {

        const { show } = req.query
        let datas = {
            pinjam_trx: 0,
            pinjam_tot: 0,
            cssd: 0,
            nakes: 0
        }


        const PinjamModel = pinjam.initModel(sequelize)
        const UserModel = users.initModel(sequelize)

        if ([0, 1, 2, 3].indexOf(req.logged_user.user_Level) >= 0) {
            datas.pinjam_trx = await PinjamModel.count({
                where: {
                    pj_Status: {
                        [Op.in]: [1, 2, 3, 4, 5]
                    }
                }
            })

            datas.pinjam_tot = await PinjamModel.count({
                where: {
                    pj_Status: {
                        [Op.ne]: 9
                    }
                }
            })

            datas.cssd = await UserModel.count({
                where: {
                    user_Level: {
                        [Op.in]: [3]
                    }
                }
            })

            datas.nakes = await UserModel.count({
                where: {
                    user_Level: {
                        [Op.in]: [4]
                    }
                }
            })
        } else {
            datas.pinjam_trx = await PinjamModel.count({
                where: {
                    pj_Status: {
                        [Op.in]: [1, 2, 3, 4, 5]
                    },
                    pj_ru_Id: req.logged_user.user_ru_Id,
                }
            })
    
            datas.pinjam_tot = await PinjamModel.count({
                where: {
                    pj_Status: {
                        [Op.ne]: 9
                    },
                    pj_ru_Id: req.logged_user.user_ru_Id,
                }
            })
        }

        let mainQuery = `select * from pinjam 
        join ruang on ruang.ru_Id = pinjam.pj_ru_Id
        join institusi on institusi.ins_Id = ruang.ru_ins_Id 
        where pj_Status <> 9 and date_format(pj_Tgl,'%Y-%m') = :year `

        if (req.logged_user.user_Level === 4) {
            mainQuery += ` and pj_ru_Id = :ruang_id`
        }

        let query = mainQuery
        query += ` order by pj_Tgl desc limit 10`

        const pinjamRes: any = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: {
                year: dayjs().format('YYYY-MM'),
                ruang_id: req.logged_user.user_ru_Id
            }
        })

        let pinjamArr: any = await Promise.all(
            pinjamRes.map(async (v, k) => {
                return {
                    id: v.pj_Id,
                    trans_kode: v.pj_TransKode,
                    tgl: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    packer: v.pj_Packer,
                    receiver: v.pj_Receiver,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    jenis: v.pj_Jenis,
                    iru_nama: '',
                    pj_set_Id: v.pj_set_Id,
                    total_jns: v.pj_IruTotalJns,
                    total_itm: v.pj_IruTotalItm,
                    status: v.pj_Status,
                }
            })
        )
        datas.pinjam = pinjamArr

        let queryBaru = mainQuery
        queryBaru += ` and pj_Status = 1 order by pj_Tgl desc limit 10`

        const pinjamResBaru: any = await sequelize.query(queryBaru, {
            type: QueryTypes.SELECT,
            replacements: {
                year: dayjs().format('YYYY-MM'),
                ruang_id: req.logged_user.user_ru_Id
            }
        })

        let pinjamArrBaru: any = await Promise.all(
            pinjamResBaru.map(async (v, k) => {
                return {
                    id: v.pj_Id,
                    trans_kode: v.pj_TransKode,
                    tgl: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    packer: v.pj_Packer,
                    receiver: v.pj_Receiver,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    jenis: v.pj_Jenis,
                    iru_nama: '',
                    pj_set_Id: v.pj_set_Id,
                    total_jns: v.pj_IruTotalJns,
                    total_itm: v.pj_IruTotalItm,
                    status: v.pj_Status,
                }
            })
        )
        datas.pinjam_baru = pinjamArrBaru

        /* komposisi peminjaman */
        const ruangRes: any = await sequelize?.query(`select * from ruang join institusi on ruang.ru_ins_Id = institusi.ins_Id where ru_Status <> 9`, {
            type: QueryTypes.SELECT
        })
        const ruangArr = ruangRes.map((v, k) => {
            let row = {
                id: v.ru_Id,
                nama: v.ru_Nama,
                institusi_id: v.ru_ins_Id,
                institusi_nama: v.ins_Nama,
            }
            return row
        })
        let pinjam_comp = []
        await Promise.all(
            ruangArr.map(async (v, k) => {
                const counter = await PinjamModel.count({
                    where: {
                        pj_ru_Id: v.id,
                        pj_Tgl: {
                            [Op.between]: [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')]
                        }
                    }
                })
                if (counter > 0) {
                    pinjam_comp.push({
                        ...v,
                        jml: counter
                    })
                }
            })
        )
        datas.pinjam_komp = pinjam_comp

        return res.status(200).json({
            responseCode: "000",
            responseMessage: 'Success',
            data: datas
        });

    } catch (err) {
        console.log('Pinjam-controller-add', err);
        return res.status(400).json({
            responseCode: "002",
            responseMessage: "failed to get",
            err: err,
        })
    } finally {
        sequelize?.close()
    }
})
export default DashboardController