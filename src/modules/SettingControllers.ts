import { Router } from "express";
import Joi from "joi";
import * as crypto from "node:crypto";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { Pinjam_Instrumen_SimpleUpdateStatus } from "../models/pinjam";
import { pinjam_iru } from "../models/pinjam_iru";
import { pinjam_iru_dtl } from "../models/pinjam_iru_dtl";
import { setting } from "../models/setting";
import { sterilisasi } from "../models/sterilisasi";

const SettingController = Router()
SettingController
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const find = await sequelize?.query(`select * from setting
                join pinjam on pinjam.pj_Id = setting.set_pj_Id
                join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                join institusi on institusi.ins_Id = ruang.ru_ins_Id
                where set_TransKode = :trans_kode limit 1`, {
                type: QueryTypes.SELECT,
                replacements: {
                    trans_kode: req.params.id
                }
            })

            if (!find?.length) {
                return res.status(404).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            const modelCleaning: any = find[0]
            const model = {
                id: modelCleaning.set_Id,
                trans_kode: modelCleaning.set_TransKode,
                start: modelCleaning.set_Start,
                end: modelCleaning.set_End,
                status: modelCleaning.set_Status,
                clean_man: modelCleaning.set_CleanBy,
                pj_trans_kode: modelCleaning.pj_TransKode,
                pj_tgl: modelCleaning.pj_Tgl,
                pj_ruang_id: modelCleaning.ru_Id,
                pj_ruang_nama: modelCleaning.ru_Nama,
                pj_institusi_id: modelCleaning.ru_ins_Id,
                pj_institusi_nama: modelCleaning.ins_Nama,
                pj_a1: modelCleaning.pj_A1,
                pj_b1: modelCleaning.pj_B1,
                pj_b2: modelCleaning.pj_B2,
                pj_a2: modelCleaning.pj_A2,
                pj_kamar: modelCleaning.pj_Kamar,
                pj_nomor: modelCleaning.pj_No,
                pj_pasien: modelCleaning.pj_Pasien,
                msn_nama: modelCleaning.msn_Nama,
                msn_no: modelCleaning.msn_Nomor
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    setting: model,
                }
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .get(`/`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const { show } = req.query

            let query = `select * 
                                    from setting 
                                    join pinjam on pinjam.pj_Id = setting.set_pj_Id 
                                    join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                                    join institusi on institusi.ins_Id = ruang.ru_ins_Id where pj_Status <> 9`
            if (show === 'transac') {
                query += ` and set_Status in (0)`
            }
            query += ` order by pj_InsTime desc`

            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.set_Id,
                    trans_kode: v.set_TransKode,
                    pj_trans_kode: v.pj_TransKode,
                    tgl: v.pj_Tgl,
                    tgl_return: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    status: v.set_Status,
                }
                datas.push(to_push)
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: 'Success',
                data: datas
            });

        } catch (err) {
            console.log('Setting-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .put('/status/:id', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                status: Joi.any().required(),
                list: Joi.array().items(
                    Joi.object().keys({
                        instrumen: Joi.any().required(),
                        amt_sett: Joi.when('....status', { is: Joi.any().valid(1), then: Joi.number().required().min(0), otherwise: Joi.allow('').allow(null) }),
                        // amt_sett: Joi.number().required().min(1)
                    })
                ).min(1)
            })

            let error
            try {
                await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
            } catch (err) {
                error = err
            }

            if (error) {
                let errMsg: string[] = [];
                let errors: any = {};

                try {
                    error.details.map((v, k) => {
                        errMsg.push(v.message)
                        if (v.path[0] === 'list') {
                            const impl = v.path.join('-')
                            errors[impl] = v.message

                        } else {
                            errors[v.path[0]] = v.message
                        }

                    });
                } catch (err) {
                    console.log(err)
                }

                return res.status(400).json({
                    responseCode: "001",
                    responseMessage: errMsg,
                    errors: errors
                });
            }

            // return res.status(400).json({
            //     responseCode: "001",
            //     responseMessage: 'errMsg', 
            // });

            const SettingModel = setting.initModel(sequelize)
            const modelSetting = await SettingModel.findOne({
                where: {
                    set_TransKode: req.params.id
                }
            })

            if (!modelSetting) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            const pinjam: any = await sequelize?.query(`select pj_Id
                from pinjam
                where pj_Id = :pj_id limit 1
                `, {
                type: QueryTypes.SELECT,
                replacements: {
                    pj_id: modelSetting.set_pj_Id
                }
            })

            try {
                const result = await sequelize?.transaction(async (tx) => {
                    const PinjamIruDtlModel = pinjam_iru_dtl.initModel(sequelize)
                    const PinjamIruModel = pinjam_iru.initModel(sequelize)

                    let items = 0, jenis = 0


                    const SimpleUpdate = async ({ id, colname, value }) => {
                        let explode = id.toString().split("-")
                        let newColname = colname
                        if (explode.length === 1) {
                            newColname = 'pji_' + newColname
                            return await PinjamIruModel.update({
                                [newColname]: value
                            }, {
                                where: {
                                    pji_Id: explode[0]
                                },
                                transaction: tx
                            })
                        } else {
                            newColname = 'pjd_' + newColname
                            return await PinjamIruDtlModel.update({
                                [newColname]: value
                            }, {
                                where: {
                                    pjd_Id: explode[1],
                                    pjd_pji_Id: explode[0]
                                },
                                transaction: tx
                            })
                        }
                    }

                    switch (req.body.status) {
                        case 1:
                            await Promise.all(
                                req.body.list.map(async (v, k) => {
                                    await SimpleUpdate({ id: v.instrumen, colname: 'Jml_Setting', value: v.amt_sett })
                                })
                            )

                            const last_setting = new Date()

                            await sequelize?.query(`update instrumen 
                                join pinjam_iru on instrumen.iru_Id = pinjam_iru.pji_iru_Id and pinjam_iru.pji_Jenis = 'pcs'
                                set iru_LastSetting = :last_setting 
                                where pinjam_iru.pji_pj_Id = :pj_id`, {
                                type: QueryTypes.UPDATE,
                                replacements: {
                                    last_setting: last_setting,
                                    pj_id: modelSetting.set_pj_Id
                                },
                                transaction: tx
                            })

                            await sequelize?.query(`update instrumen_set
                                join pinjam_iru on instrumen_set.set_Id = pinjam_iru.pji_set_Id and pinjam_iru.pji_Jenis = 'set'
                                set set_LastSetting = :last_setting 
                                where pinjam_iru.pji_pj_Id = :pj_id`, {
                                type: QueryTypes.UPDATE,
                                replacements: {
                                    last_setting: last_setting,
                                    pj_id: modelSetting.set_pj_Id
                                },
                                transaction: tx
                            })

                            break;
                        default:
                            break;
                    }

                    if (req.body.status === 1) {
                        // const SterilModel = sterilisasi.initModel(sequelize)
                        // await SterilModel.findOrCreate({
                        //     where: {
                        //         st_pj_Id: modelSetting.set_pj_Id
                        //     },
                        //     defaults: {
                        //         st_pj_Id: modelSetting.set_pj_Id,
                        //         st_Status: 0,
                        //         st_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                        //     },
                        //     transaction: tx,
                        // })
                        // await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelSetting.set_pj_Id, status: 5 })

                        // modelSetting.set_Status = 1
                        // await modelSetting.save({ transaction: tx })

                        const SterilModel = sterilisasi.initModel(sequelize)
                        const listIru = await PinjamIruModel.findAll({
                            where: {
                                pji_pj_Id: modelSetting.set_pj_Id,
                                pji_Status: 1,
                            }
                        })
                        await Promise.all(
                            listIru.map(async (v, k) => {
                                const [steril] = await SterilModel.findOrCreate({
                                    where: {
                                        st_pj_Id: v.pji_pj_Id,
                                        st_IruJenis: v.pji_Jenis,
                                        st_IruSetId: v.pji_set_Id,
                                        st_IruId: v.pji_iru_Id,
                                    },
                                    defaults: {
                                        st_InsBy: req.logged_user.user_Id,
                                        st_pj_Id: v.pji_pj_Id,
                                        st_IruJenis: v.pji_Jenis,
                                        st_IruId: v.pji_iru_Id,
                                        st_IruSetId: v.pji_set_Id,
                                        st_IruJml: (v.pji_Jenis === 'pcs') ? v.pji_Jml_A2 : 1,
                                        st_Status: 0,
                                        // st_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                                    },
                                    transaction: tx,
                                })
                                steril.st_InsBy = req.logged_user.user_Id
                                steril.st_pj_Id = v.pji_pj_Id
                                steril.st_IruJenis = v.pji_Jenis
                                steril.st_IruId = v.pji_iru_Id
                                steril.st_IruSetId = v.pji_set_Id
                                steril.st_IruJml = (v.pji_Jenis === 'pcs') ? v.pji_Jml_A2 : 1
                                steril.st_Status = 0
                                await steril.save({ transaction: tx })
                            })
                        )


                        await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelSetting.set_pj_Id, status: 5 })

                        modelSetting.set_Status = 1
                        await modelSetting.save({ transaction: tx })

                    }

                    return res.status(200).json({
                        responseCode: "000",
                        responseMessage: "success",
                        data: {
                        }
                    })

                })

            } catch (err) {
                console.log('Setting-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

        } catch (err) {
            console.log('Setting-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
export default SettingController;

