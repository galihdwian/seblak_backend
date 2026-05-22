import { Router } from "express";
import Joi from "joi";
import * as crypto from "node:crypto";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { cleaning } from "../models/cleaning";
import { Pinjam_Instrumen_SimpleUpdateStatus } from "../models/pinjam";
import { pinjam_log } from "../models/pinjam_log";
import { setting } from "../models/setting";

const CleaningController = Router()
CleaningController
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            let query = ` select * from
                    (
                        select cleaning.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen.iru_Nama, instrumen.iru_Id, mesin.*
                            from cleaning 
                            join pinjam on pinjam.pj_Id = cleaning.cl_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen on instrumen.iru_Id = cleaning.cl_IruId and cleaning.cl_Irujenis = 'pcs'
                            left join mesin on mesin.msn_Id = cleaning.cl_msn_Id
                       union 
                        select cleaning.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen_set.set_Nama as iru_Nama, instrumen_set.set_Id as iru_Id, mesin.*
                            from cleaning 
                            join pinjam on pinjam.pj_Id = cleaning.cl_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen_set on instrumen_set.set_Id = cleaning.cl_IruSetId and cleaning.cl_Irujenis = 'set'  
                            left join mesin on mesin.msn_Id = cleaning.cl_msn_Id                      
                    ) as yuhu
                where cl_Status <> 9`

            const find = await sequelize?.query(`${query} 
                    and cl_TransKode = :trans_kode limit 1`, {
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
                id: modelCleaning.cl_Id,
                trans_kode: modelCleaning.cl_TransKode,
                start: modelCleaning.cl_Start,
                end: modelCleaning.cl_End,
                status: modelCleaning.cl_Status,
                clean_man: modelCleaning.cl_CleanBy,
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
                msn_no: modelCleaning.msn_Nomor,                
                iru_nama: modelCleaning.iru_Nama,
                iru_id: modelCleaning.iru_Id,
                iru_jenis: modelCleaning.cl_IruJenis,
                iru_jml: modelCleaning.cl_IruJml,
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    cleaning: model,
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

            const limit = 40
            const { show, key } = req.query
            let where = {}
            let query = `
                select * from
                    (
                        select cleaning.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen.iru_Nama, instrumen.iru_Id, mesin.*
                            from cleaning 
                            join pinjam on pinjam.pj_Id = cleaning.cl_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen on instrumen.iru_Id = cleaning.cl_IruId and cleaning.cl_Irujenis = 'pcs'
                            left join mesin on mesin.msn_Id = cleaning.cl_msn_Id
                       union 
                        select cleaning.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen_set.set_Nama as iru_Nama, instrumen_set.set_Id as iru_Id, mesin.* 
                            from cleaning 
                            join pinjam on pinjam.pj_Id = cleaning.cl_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen_set on instrumen_set.set_Id = cleaning.cl_IruSetId and cleaning.cl_Irujenis = 'set'   
                            left join mesin on mesin.msn_Id = cleaning.cl_msn_Id                     
                    ) as yuhu
                where cl_Status <> 9
            `
            if (show === 'transac') {
                query += ` and cl_Status in (0,1)`
            }
            if (key) {
                 query += ` and ((msn_Nama like :key) or (iru_Nama like :key) or (cl_TransKode like :key) or (pj_TransKode like :key)  or (pj_Kamar like :key) or (pj_No like :key) or  (pj_Pasien like :key) or (JSON_EXTRACT(pj_Metadata,"$.list_instrument") like :key))`
                where['key'] = `%${key}%`
            }
            query += ` order by cl_InsTime desc`
            query += ` limit ${limit}`
            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: where,
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.cl_Id,
                    trans_kode: v.cl_TransKode,
                    start: v.cl_Start,
                    end: v.cl_End,
                    pj_trans_kode: v.pj_TransKode,
                    tgl: v.pj_Tgl,
                    tgl_return: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    status: v.cl_Status,
                    msn_nama: v.msn_Nama,
                    msn_no: v.msn_Nomor,   
                    iru_nama: v.iru_Nama,
                    iru_id: v.iru_Id,
                    iru_jenis: v.cl_IruJenis,
                    iru_jml: v.cl_IruJml
                }
                datas.push(to_push)
            })

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
                mesin: Joi.string().when('status', {
                    is: Joi.valid(1),
                    then: Joi.required()
                }),
                start_time: Joi.string().when('status', {
                    is: Joi.valid(1),
                    then: Joi.required()
                }),
                end_time: Joi.string().when('status', {
                    is: Joi.valid(2),
                    then: Joi.required()
                }),
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

            const CleaningModel = cleaning.initModel(sequelize)
            const modelCleaning = await CleaningModel.findOne({
                where: {
                    cl_TransKode: req.params.id
                }
            })

            if (!modelCleaning) {
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
                    pj_id: modelCleaning.cl_pj_Id
                }
            })

            try {
                const result = await sequelize?.transaction(async (tx) => {

                    let defaultUpdateStatus = false
                    let pjl_info

                    switch (req.body.status) {
                        case 1:
                            pjl_info = `start pencucian | | `
                            defaultUpdateStatus = true

                            await CleaningModel.update({
                                cl_Status: req.body.status,
                                cl_Start: req.body.start_time,
                                cl_CleanBy: req.body.clean_man,
                                cl_msn_Id: req.body.mesin,
                            }, {
                                where: {
                                    cl_Id: modelCleaning.cl_Id
                                },
                                transaction: tx,
                            })
                            break;
                        case 2:
                            pjl_info = `selesai pencucian | | `
                            defaultUpdateStatus = true

                            await CleaningModel.update({
                                cl_Status: req.body.status,
                                cl_End: req.body.end_time,
                            }, {
                                where: {
                                    cl_Id: modelCleaning.cl_Id
                                },
                                transaction: tx
                            })
                            break;
                        default:
                            defaultUpdateStatus = true
                            break;
                    }

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: req.body.status,
                        pjl_Info: pjl_info,
                        pjl_pj_Id: pinjam[0].pj_Id,
                    }, {
                        transaction: tx
                    })

                    await CleaningModel.update({
                        cl_UpdTime: new Date(),
                        cl_UpdBy: req.logged_user.user_Id,
                    }, {
                        where: {
                            cl_Id: modelCleaning.cl_Id
                        },
                        transaction: tx
                    })

                    if (req.body.status === 2) {
                        const SettingModel = setting.initModel(sequelize)
                        await SettingModel.findOrCreate({
                            where: {
                                set_pj_Id: modelCleaning.cl_pj_Id
                            },
                            defaults: {
                                set_pj_Id: modelCleaning.cl_pj_Id,
                                set_Status: 0,
                                // set_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                            },
                            transaction: tx,
                        })
                        await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelCleaning.cl_pj_Id, status: 4 })
                    }

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "success",
                    data: {
                    }
                })
            } catch (err) {
                console.log('Cleaning-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

        } catch (err) {
            console.log('Cleaning-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .put('/', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                id: Joi.array().required(),
                status: Joi.number().required(),
                mesin: Joi.string().when('status', {
                    is: Joi.valid(1),
                    then: Joi.required()
                }),
                start_time: Joi.string().when('status', {
                    is: Joi.valid(1),
                    then: Joi.required()
                }),
                end_time: Joi.string().when('status', {
                    is: Joi.valid(2),
                    then: Joi.required()
                }),
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

            const CleaningModel = cleaning.initModel(sequelize)
            const SettingModel = setting.initModel(sequelize)

            try {
                const result = await sequelize?.transaction(async (tx) => {

                    const { start_time, end_time, id, mesin, status } = req.body
                    if (status === 1) {
                        await Promise.all(
                            id.map(async (v, k) => {
                                const pinjam = await CleaningModel.update({
                                    cl_Status: 1,
                                    cl_Start: start_time,
                                    cl_CleanBy: req.logged_user.user_Nama,
                                    cl_msn_Id: mesin,
                                }, {
                                    where: {
                                        cl_Id: v
                                    },
                                    transaction: tx,
                                })
                            })
                        )
                    } else {
                        await Promise.all(
                            id.map(async (v, k) => {
                                const cleaning = await CleaningModel.findOne({
                                    where: {
                                        cl_Id: v
                                    },
                                    transaction: tx,
                                })

                                if (cleaning) {
                                    await cleaning?.update({
                                        cl_Status: 2,
                                        cl_End: end_time,
                                        cl_msn_Id: mesin,
                                    })

                                    await cleaning.save({ transaction: tx })

                                    const [savedModel] = await SettingModel.findOrCreate({
                                        where: {
                                            set_pj_Id: cleaning.cl_pj_Id,
                                            set_IruJenis: cleaning.cl_IruJenis,
                                            set_IruSetId: cleaning.cl_IruSetId,
                                            set_IruId: cleaning.cl_IruId,
                                        },
                                        defaults: {
                                            set_pj_Id: cleaning.cl_pj_Id,
                                            set_IruJenis: cleaning.cl_IruJenis,
                                            set_IruSetId: cleaning.cl_IruSetId,
                                            set_IruId: cleaning.cl_IruId,
                                            set_Status: 0,
                                            // set_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                                        },
                                        transaction: tx,
                                    })

                                    savedModel.set_pj_Id = cleaning.cl_pj_Id
                                    savedModel.set_IruJenis = cleaning.cl_IruJenis
                                    savedModel.set_IruSetId = cleaning.cl_IruSetId
                                    savedModel.set_IruId = cleaning.cl_IruId
                                    savedModel.set_Status = 0
                                    await savedModel.save({ transaction: tx })
                                }



                            })

                        )



                    }


                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "success",
                    data: {
                    }
                })
            } catch (err) {
                console.log('Cleaning-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

        } catch (err) {
            console.log('Cleaning-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
export default CleaningController;

