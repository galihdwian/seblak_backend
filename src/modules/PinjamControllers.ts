import dayjs from "dayjs";
import { Router } from "express";
import Joi from "joi";
import * as crypto from "node:crypto";
import { Op, QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { cleaning } from "../models/cleaning";
import { instrumen_set } from "../models/instrumen_set";
import { instrumen_set_list } from "../models/instrumen_set_list";
import { pinjam, Pinjam_Action_Log, Pinjam_Instrumen_SimpleUpdateStatus, Pinjam_Instrumen_SimpleUpdateStatus_Deletedlist } from "../models/pinjam";
import { pinjam_iru } from "../models/pinjam_iru";
import { pinjam_iru_dtl } from "../models/pinjam_iru_dtl";
import { pinjam_log } from "../models/pinjam_log";
import { return_ } from "../models/return";
import { ruang } from "../models/ruang";

const PinjamController = Router()

PinjamController
    .get('/detail/:id', auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const find: any = await sequelize?.query(`select pinjam.*, ruang.*, institusi.*,
                            insby.user_Id as insby_id,insby.user_Nama as insby_nama,
                            updby.user_Id as updby_id,updby.user_Nama as updby_nama
                            from pinjam 
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            left join users insby on insby.user_Id = pinjam.pj_InsBy
                            left join users updby on updby.user_Id = pinjam.pj_UpdBy
                            where pj_Status <> 9 and pj_TransKode = :trans_kode limit 1`, {
                type: QueryTypes.SELECT,
                replacements: {
                    trans_kode: req.params.id
                }
            })

            if (!find.length) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            const model = {
                id: find[0].pj_Id,
                ins_time: find[0].pj_InsTime,
                ins_by: find[0].pj_InsBy,
                ins_by_nama: find[0].insby_nama,
                upd_time: find[0].pj_UpdTime,
                upd_by: find[0].pj_UpdBy,
                upd_by_nama: find[0].updby_nama,
                jenis_pj: find[0].pj_Jenis,
                a1: find[0].pj_A1,
                b1: find[0].pj_B1,
                b2: find[0].pj_B2,
                a2: find[0].pj_A2,
                trans_kode: find[0].pj_TransKode,
                tgl: find[0].pj_Tgl,
                ruang_id: find[0].ru_Id,
                ruang_nama: find[0].ru_Nama,
                institusi_id: find[0].ru_ins_Id,
                institusi_nama: find[0].ins_Nama,
                kamar: find[0].pj_Kamar,
                nomor: find[0].pj_No,
                pasien: find[0].pj_Pasien,
                total_iru: find[0].pj_IruTotal,
                total_jns: find[0].pj_IruTotalJns,
                total_itm: find[0].pj_IruTotalItm,
                status: find[0].pj_Status,
            }

            const rawList: any = await sequelize?.query(`
                select * 
                from pinjam_iru
                left join instrumen on instrumen.iru_Id = pinjam_iru.pji_iru_Id
                left join instrumen_set on instrumen_set.set_Id = pinjam_iru.pji_set_Id
                where pji_pj_Id = :id and pji_Status = 1`, {
                type: QueryTypes.SELECT,
                replacements: {
                    id: find[0].pj_Id
                }
            })

            let list = await Promise.all(
                rawList.map(async (v, k) => {
                    let to_push = {
                        id: v.pji_Id,
                        jenis: v.pji_Jenis,
                        nama: (v.pji_Jenis !== 'set') ? v.iru_Nama : v.set_Nama,
                        no_katalog: v.iru_NoKatalog,
                        brand: v.iru_Brand,
                        amt: v.pji_Jml_Req,
                        amt_a1: v.pji_Jml_A1,
                        amt_b1: v.pji_Jml_B1,
                        amt_b2: v.pji_Jml_B2,
                        amt_a2: v.pji_Jml_A2,
                        amt_sett: v.pji_Jml_Setting,
                        set_list: {
                            id: v.set_Id,
                            nama: v.set_Nama,
                            instrumen: []
                        },
                    }
                    if (v.pji_Jenis !== 'set') {

                        const instrumen = await sequelize?.query(`
                            select *
                            from pinjam_iru_dtl 
                            join instrumen on instrumen.iru_Id = pinjam_iru_dtl.pjd_iru_Id
                            where pjd_pji_Id = :pji limit 1
                            `,
                            {
                                type: QueryTypes.SELECT,
                                replacements: {
                                    pji: v.pji_Id
                                }
                            }
                        )

                        if (instrumen[0]) {
                            const new_v = instrumen[0]
                            to_push.instrumen = {
                                id: `${v.pji_Id}`,
                                identity: new_v.pjd_Identity,
                                seq: new_v.pjd_Seq,
                                nama: new_v.iru_Nama,
                                no_katalog: new_v.iru_NoKatalog,
                                brand: new_v.iru_Brand,
                                amt: new_v.pjd_Jml_Req,
                                amt_a1: new_v.pjd_Jml_A1,
                                amt_b1: new_v.pjd_Jml_B1,
                                amt_b2: new_v.pjd_Jml_B2,
                                amt_a2: new_v.pjd_Jml_A2,
                                amt_sett: new_v.pjd_Jml_Setting,
                            }
                        }

                        return to_push
                    } else {

                        const set_list = await sequelize?.query(`
                            select * 
                            from  pinjam_iru_dtl
                            join instrumen on instrumen.iru_Id = pinjam_iru_dtl.pjd_iru_Id
                            where pjd_pji_Id = :pji
                            `,
                            {
                                type: QueryTypes.SELECT,
                                replacements: {
                                    pji: v.pji_Id
                                }
                            }
                        )

                        let set_push = {}
                        let set_pack = {}

                        await Promise.all(
                            set_list.map((vv, kk) => {
                                const new_v = vv

                                if (!set_pack[new_v.pjd_Seq]) {
                                    set_pack[new_v.pjd_Seq] = {
                                        seq: new_v.pjd_Seq,
                                        identity: new_v.pjd_Identity,
                                    }
                                }
                                if (!set_push[new_v.pjd_Seq]) {
                                    set_push[new_v.pjd_Seq] = []
                                }


                                set_push[new_v.pjd_Seq].push({
                                    id: `${v.pji_Id}-${new_v.pjd_Id}`,
                                    nama: new_v.iru_Nama,
                                    no_katalog: new_v.iru_NoKatalog,
                                    brand: new_v.iru_Brand,
                                    amt: new_v.pjd_Jml_Req,
                                    amt_a1: new_v.pjd_Jml_A1,
                                    amt_b1: new_v.pjd_Jml_B1,
                                    amt_b2: new_v.pjd_Jml_B2,
                                    amt_a2: new_v.pjd_Jml_A2,
                                    amt_sett: new_v.pjd_Jml_Setting,
                                })
                            })
                        )

                        to_push.set_list.pack = set_pack
                        to_push.set_list.instrumen = set_push

                        return to_push
                    }
                })

            )

            const log_a1 = await Pinjam_Action_Log({ sequelize: sequelize, id_pinjam: find[0].pj_Id, action: 3 })
            const log_b1 = await Pinjam_Action_Log({ sequelize: sequelize, id_pinjam: find[0].pj_Id, action: 4 })
            const log_b2 = await Pinjam_Action_Log({ sequelize: sequelize, id_pinjam: find[0].pj_Id, action: 5 })
            const log_a2 = await Pinjam_Action_Log({ sequelize: sequelize, id_pinjam: find[0].pj_Id, action: 6 })

            let log_action = {
                a1: {
                    user: {
                        uname: log_a1?.user_Uname,
                        nama: log_a1?.user_Nama,
                    },
                    log_time: log_a1?.pjl_Time
                },
                b1: {
                    user: {
                        uname: log_b1?.user_Uname,
                        nama: log_b1?.user_Nama,
                    },
                    log_time: log_b1?.pjl_Time
                },
                b2: {
                    user: {
                        uname: log_b2?.user_Uname,
                        nama: log_b2?.user_Nama,
                    },
                    log_time: log_b2?.pjl_Time
                },
                a2: {
                    user: {
                        uname: log_a2?.user_Uname,
                        nama: log_a2?.user_Nama,
                    },
                    log_time: log_a2?.pjl_Time
                },
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    pinjam: model,
                    detail: list,
                    log_action: log_action
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
    .put('/status/:id', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                status: Joi.any().required(),
                receiver: Joi.string().when('status', {
                    is: Joi.valid(4),
                    then: Joi.required()
                }),
                time_receive: Joi.string(),
                submitter: Joi.string().when('status', {
                    is: Joi.valid(5),
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

            const PinjamModel = pinjam.initModel(sequelize)
            const modelPinjam = await PinjamModel.findOne({
                where: {
                    pj_TransKode: req.params.id
                }
            })

            if (!modelPinjam) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            if ((modelPinjam.pj_Jenis === 'AHP') && (modelPinjam.pj_Status >= 4)) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "Aksi tidak diperbolehkan",
                })
            }

            try {
                const result = await sequelize?.transaction(async (tx) => {

                    let defaultUpdateStatus = false
                    let pjl_info

                    switch (req.body.status) {
                        case 2:
                            pjl_info = `set dipacking | | `
                            defaultUpdateStatus = true
                            break;
                        case 3:
                            pjl_info = `set siap diambil | | `
                            defaultUpdateStatus = true
                            break;
                        case 4:
                            pjl_info = `telah diambil | | `
                            await PinjamModel.update(
                                {
                                    pj_Status: req.body.status,
                                    pj_Receiver: req.body?.receiver,
                                }, {
                                where: {
                                    pj_Id: modelPinjam.pj_Id
                                },
                                transaction: tx
                            })
                            break;
                        case 5:
                            pjl_info = `telah dikembalikan | | `
                            const ReturnModel = return_.initModel(sequelize)
                            const modelReturn = await ReturnModel.create(
                                {
                                    rt_InsBy: req.logged_user.user_Id,
                                    rt_pj_Id: modelPinjam.pj_Id,
                                    rt_Submitter: req.body.submitter,
                                    // rt_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                                    rt_Tanggal: new Date(),
                                },
                                { transaction: tx }
                            )
                            defaultUpdateStatus = true
                            break;
                        case 6:
                            break;
                        case 7:
                            break;
                        case 8:
                            pjl_info = `dibatalkan | | `
                            break;
                        default:
                            defaultUpdateStatus = true
                            break;
                    }

                    if (defaultUpdateStatus) {
                        await PinjamModel.update(
                            {
                                pj_Status: req.body.status,
                            }, {
                            where: {
                                pj_Id: modelPinjam.pj_Id
                            },
                            transaction: tx
                        })
                    }

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: req.body.status,
                        pjl_Info: pjl_info,
                        pjl_pj_Id: modelPinjam.pj_Id,
                        pjl_user_Id: req.logged_user.user_Id,
                    }, {
                        transaction: tx
                    })

                    if (modelPinjam.pj_Jenis === 'AHP') {
                        if (req.body.status === 4) {
                            await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 1, tgl_expired: dayjs().add(5, 'year').format('YYYY-MM-DD 00:00:00') })
                        }
                    }

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "success",
                    data: {
                    }
                })
            } catch (err) {
                console.log('Pinjam-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

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
    .post('/request', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.any(),
            // pinjam_trans_kode: Joi.string().required(),
            dt_pakai: Joi.date().required(),
            ruang_id: Joi.any()
                .external(async (id, helpers) => {
                    if (id) {
                        const sequelize = await bky_sequelize();
                        try {
                            const ruangModel = ruang.initModel(sequelize)
                            const findRuang = await ruangModel.findOne({
                                where: {
                                    ru_Id: parseInt(id)
                                }
                            })
                            if (!findRuang) {
                                return helpers.error('any.invalid')
                            }
                        } catch (err) {
                            console.log(err)
                            return helpers.error('any.invalid')
                        } finally {
                            sequelize?.close()
                        }
                    } else {
                        return helpers.error('any.invalid')
                    }
                })
                .required(),
            jenis_pj: Joi.string(),
            kamar: Joi.string().allow(null).allow(''),
            nomor: Joi.string().allow(null).allow(''),
            pasien: Joi.string().allow(null).allow(''),
            packing_man: Joi.string().allow(null).allow(''),
            receiver: Joi.string().allow(null).allow(''),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().min(1).required()
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
                error.details?.map((v, k) => {
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
                responseMessage: 'Perbaiki inputan',
                errors: errors
            });
        }

        const sequelize = await bky_sequelize()
        try {

            const InstruSetListModel = instrumen_set_list.initModel(sequelize)

            let errors: any = {};
            await Promise.all(
                req.body.list.map(async (v, k) => {
                    const id_split = v.instrumen.split("-")
                    if (id_split.length >= 2) {
                        const jns = id_split[0]
                        const id = parseInt(id_split[1])
                        if (jns === 'set') {
                            const counter = await InstruSetListModel.count({
                                where: {
                                    list_set_Id: id
                                }
                            })
                            if (counter === 0) {
                                errors[`list-${k}-nama`] = 'Tidak ada list dalam set ini'
                            }
                        }
                    }
                })
            )

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({
                    responseCode: "001",
                    responseMessage: 'Invalid input',
                    errors: errors
                });
            }

            try {

                const result = await sequelize?.transaction(async (tx) => {

                    let totalItems;
                    let totalJenis;

                    const PinjamModel = pinjam.initModel(sequelize)
                    const PinjamIruModel = pinjam_iru.initModel(sequelize)
                    const PinjamDtlModel = pinjam_iru_dtl.initModel(sequelize)

                    const modelPinjam = await PinjamModel.create(
                        {
                            pj_InsBy: req.logged_user.user_Id,
                            pj_Kamar: req.body.kamar,
                            pj_ru_Id: parseInt(req.body.ruang_id),
                            pj_No: req.body.nomor,
                            pj_Pasien: req.body.pasien,
                            // pj_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                            pj_Tgl: req.body.dt_pakai,
                            pj_Jenis: req.body.jenis_pj
                        },
                        { transaction: tx }
                    )

                    let metadata = {
                        list_instrument: []
                    }

                    // const PinjamReqModel = pinjam_request.initModel(sequelize)

                    await Promise.all(
                        req.body.list.map(async (v, k) => {
                            const id_split = v.instrumen.split("-")
                            if (id_split.length >= 2) {
                                let jns = id_split[0]
                                const id = parseInt(id_split[1])
                                let nama

                                if (jns === 'set') {
                                    nama = v.nama
                                } else if (jns === 'pack') {
                                    jns = 'pcs'
                                }

                                let items = 0, jenis = 0

                                const modelPinjamIru = await PinjamIruModel.create({
                                    pji_pj_Id: modelPinjam.pj_Id,
                                    pji_Jenis: jns,
                                    pji_iru_Id: (jns !== 'set') ? id : null,
                                    pji_set_Id: (jns === 'set') ? id : null,
                                    pji_Jml_Req: parseInt(v.amt)
                                },
                                    { transaction: tx }
                                )

                                let iruList: any[] = []

                                if (jns !== 'set') {
                                    items += v.amt
                                    jenis++

                                    totalItems += items
                                    totalJenis++
                                } else if (jns === 'set') {
                                    iruList = await sequelize.query(`select list_iru_Id as iru_Id, list_Jumlah as jumlah from instrumen_set_list where list_set_Id = :set_id and list_Status <> 9`, {
                                        type: QueryTypes.SELECT,
                                        replacements: {
                                            set_id: id
                                        }
                                    })

                                    let i = 0;

                                    while (i < parseInt(v.amt)) {
                                        await Promise.all(iruList.map(async (vv, kk) => {
                                            const detail = await PinjamDtlModel.create({
                                                pjd_iru_Id: vv.iru_Id,
                                                pjd_Jml_Req: parseInt(vv.jumlah),
                                                pjd_pji_Id: modelPinjamIru.pji_Id,
                                                pjd_Seq: (i + 1)
                                            }, {
                                                transaction: tx
                                            })
                                            items += parseInt(vv.jumlah)
                                            jenis++

                                            totalItems += items
                                            totalJenis++
                                        }))
                                        i++
                                    }


                                }
                            }
                        })
                    )

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: 1,
                        pjl_Info: `request peminjaman |  | `,
                        pjl_pj_Id: modelPinjam.pj_Id,
                        pjl_user_Id: req.logged_user.user_Id,
                    }, {
                        transaction: tx
                    })

                    const all_instru = await sequelize.query(`
                        select iru_Nama as nama 
                            from pinjam_iru 
                            join instrumen on instrumen.iru_Id = pinjam_iru.pji_iru_Id
                            where pji_pj_Id = :pj_Id and pji_Jenis = 'pcs'
                        union
                        select set_Nama as nama 
                            from pinjam_iru 
                            join instrumen_set on instrumen_set.set_Id = pinjam_iru.pji_set_Id
                            where pji_pj_Id = :pj_Id and pji_Jenis = 'set'
                            
                        `, {
                        type: QueryTypes.SELECT,
                        replacements: {
                            pj_Id: modelPinjam.pj_Id
                        },
                        transaction: tx
                    })

                    console.log(all_instru)

                    await Promise.all(
                        all_instru.map((v, k) => {
                            metadata.list_instrument.push(v.nama)
                        })
                    )

                    console.log(metadata)

                    await PinjamModel.update(
                        {
                            pj_IruTotalItm: totalItems,
                            pj_IruTotalJns: totalJenis,
                            pj_Metadata: JSON.stringify(metadata)
                        }, {
                        where: {
                            pj_Id: modelPinjam.pj_Id
                        },
                        transaction: tx
                    })

                    await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 12 })

                    return true

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: 'Success',
                });
            } catch (err) {
                console.log(err)
                return res.status(400).json({
                    responseCode: "001",
                    responseMessage: 'Failed to add',
                    errors: err
                });
            }
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                responseCode: "001",
                responseMessage: 'Failed to add',
                errors: err
            });
        } finally {
            sequelize?.close()
        }
    })
    .put('/packing', auth(), async (req, res) => {

        let error
        const schema = Joi.object({
            id: Joi.any(),
            // pinjam_trans_kode: Joi.string().required(),
            dt_pakai: Joi.date().required(),
            ruang_id: Joi.any()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const ruangModel = ruang.initModel(sequelize)
                        const findRuang = await ruangModel.findOne({
                            where: {
                                ru_Id: parseInt(id)
                            }
                        })
                        if (!findRuang) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        console.log(err)
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }

                })
                .required(),
            kamar: Joi.string().required().allow('').allow(null),
            nomor: Joi.string().required().allow('').allow(null),
            status: Joi.number().required().allow('').allow(null),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt_a1: Joi.when('....status', { is: Joi.any().valid(3), then: Joi.number().required(), otherwise: Joi.allow('').allow(null) }),
                    amt_b1: Joi.when('....status', { is: Joi.any().valid(4), then: Joi.number().required(), otherwise: Joi.allow('').allow(null) }),
                    amt_b2: Joi.when('....status', { is: Joi.any().valid(5), then: Joi.number().required(), otherwise: Joi.allow('').allow(null) }),
                    amt_a2: Joi.when('....status', { is: Joi.any().valid(6), then: Joi.number().required(), otherwise: Joi.allow('').allow(null) }),
                })
            ).min(1)
        })

        let joi_value: any = {}
        try {
            const { value }: any = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true, errors: { language: 'id' } });
            joi_value = value
        } catch (err) {
            error = err
        }

        if (error) {
            let errMsg: string[] = [];
            let errors: any = {};

            try {
                error.details?.map((v, k) => {
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

        const sequelize = await bky_sequelize()
        try {

            const PinjamModel = pinjam.initModel(sequelize)
            const modelPinjam = await PinjamModel.findOne({
                where: {
                    pj_Id: req.body.id
                },
            })

            if (!modelPinjam) {
                return res.status(404).json({
                    responseCode: "002",
                    responseMessage: "Peminjaman tidak ditemukan",
                });
            }

            if ((modelPinjam.pj_Jenis === 'AHP') && (modelPinjam.pj_Status >= 4)) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "Aksi tidak diperbolehkan",
                })
            }

            try {

                const result = await sequelize?.transaction(async (tx) => {

                    const PinjamIruDtlModel = pinjam_iru_dtl.initModel(sequelize)
                    const PinjamIruModel = pinjam_iru.initModel(sequelize)

                    const SimpleUpdate = async ({ id, colname, value }) => {
                        let explode = id.toString().split("-")
                        let newColname = colname
                        if (explode.length === 1) {
                            newColname = 'pji_' + newColname
                            return await PinjamIruModel.update({
                                [newColname]: value,
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

                    let pjl_info = ''
                    let iruActivs = []
                    switch (req.body.status) {
                        case 3:
                            pjl_info = `set dipacking | | `
                            iruActivs = []
                            await Promise.all(
                                req.body.list.map(async (v, k) => {
                                    let explode = v.instrumen.toString().split("-")
                                    iruActivs.push(explode[0] * 1)
                                    await SimpleUpdate({ id: v.instrumen, colname: 'Jml_A1', value: v.amt_a1 })
                                })
                            )

                            // iruActivs = [...new Set(iruActivs)]
                            await PinjamIruModel.update(
                                {
                                    pji_Status: 2,
                                    pji_UpdBy: req.logged_user.user_Id,
                                    pji_UpdTime: new Date(),
                                }, {
                                where: {
                                    pji_pj_Id: modelPinjam.pj_Id,
                                    pji_Id: {
                                        [Op.notIn]: iruActivs
                                    }
                                },
                                transaction: tx
                            })

                            await PinjamModel.update({
                                pj_A1: req.logged_user.user_Nama
                            }, {
                                where: {
                                    pj_Id: modelPinjam.pj_Id
                                },
                                transaction: tx
                            })
                            await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 2 })
                            await Pinjam_Instrumen_SimpleUpdateStatus_Deletedlist({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id })

                        case 4:
                            pjl_info = `telah diambil | | `
                            iruActivs = []
                            await Promise.all(
                                req.body.list.map(async (v, k) => {
                                    let explode = v.instrumen.toString().split("-")
                                    iruActivs.push(explode[0] * 1)
                                    await SimpleUpdate({ id: v.instrumen, colname: 'Jml_B1', value: v.amt_b1 })
                                })
                            )
                            await PinjamIruModel.update(
                                {
                                    pji_Status: 2,
                                    pji_UpdBy: req.logged_user.user_Id,
                                    pji_UpdTime: new Date(),
                                }, {
                                where: {
                                    pji_pj_Id: modelPinjam.pj_Id,
                                    pji_Id: {
                                        [Op.notIn]: iruActivs
                                    }
                                },
                                transaction: tx
                            })
                            await PinjamModel.update({
                                pj_B1: req.logged_user.user_Nama
                            }, {
                                where: {
                                    pj_Id: modelPinjam.pj_Id
                                },
                                transaction: tx
                            })
                            await Pinjam_Instrumen_SimpleUpdateStatus_Deletedlist({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id })
                            break;
                        case 5:
                            pjl_info = `telah dikembalikan | | `
                            await Promise.all(
                                req.body.list.map(async (v, k) => {
                                    await SimpleUpdate({ id: v.instrumen, colname: 'Jml_B2', value: v.amt_b2 })
                                })
                            )
                            await PinjamModel.update({
                                pj_B2: req.logged_user.user_Nama
                            }, {
                                where: {
                                    pj_Id: modelPinjam.pj_Id
                                },
                                transaction: tx
                            })
                            break;
                        case 6:
                            await Promise.all(
                                req.body.list.map(async (v, k) => {
                                    await SimpleUpdate({ id: v.instrumen, colname: 'Jml_A2', value: v.amt_a2 })
                                })
                            )
                            await PinjamModel.update({
                                pj_A2: req.logged_user.user_Nama
                            }, {
                                where: {
                                    pj_Id: modelPinjam.pj_Id
                                },
                                transaction: tx
                            })
                            break;
                        default:
                            break;
                    }

                    await PinjamModel.update(
                        {
                            pj_Status: req.body.status,
                            pj_UpdBy: req.logged_user.user_Id,
                            pj_UpdTime: new Date()
                        }, {
                        where: {
                            pj_Id: modelPinjam.pj_Id
                        },
                        transaction: tx
                    })

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: req.body.status,
                        pjl_Info: pjl_info,
                        pjl_pj_Id: modelPinjam.pj_Id,
                        pjl_user_Id: req.logged_user.user_Id,
                    }, {
                        transaction: tx
                    })

                    if (modelPinjam.pj_Jenis === 'AHP') {
                        if (req.body.status === 4) {
                            await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 1, tgl_expired: dayjs().add(5, 'year').format('YYYY-MM-DD 00:00:00') })
                        }
                    }

                    if (req.body.status === 6) {
                        const CleaningModel = cleaning.initModel(sequelize)
                        const listIru = await PinjamIruModel.findAll({
                            where: {
                                pji_pj_Id: modelPinjam.pj_Id,
                                pji_Status: 1,
                            }
                        })
                        await Promise.all(
                            listIru.map(async (v, k) => {
                                const [cleaning] = await CleaningModel.findOrCreate({
                                    where: {
                                        cl_pj_Id: v.pji_pj_Id,
                                        cl_IruJenis: v.pji_Jenis,
                                        cl_IruSetId: v.pji_set_Id,
                                        cl_IruId: v.pji_iru_Id,
                                    },
                                    defaults: {
                                        cl_pj_Id: v.pji_pj_Id,
                                        cl_IruJenis: v.pji_Jenis,
                                        cl_IruId: v.pji_iru_Id,
                                        cl_IruSetId: v.pji_set_Id,
                                        cl_IruJml: (v.pji_Jenis === 'pcs') ? v.pji_Jml_A2 : 1,
                                        cl_Status: 0,
                                        // cl_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                                    },
                                    transaction: tx,
                                })
                                cleaning.cl_pj_Id = v.pji_pj_Id
                                cleaning.cl_IruJenis = v.pji_Jenis
                                cleaning.cl_IruId = v.pji_iru_Id
                                cleaning.cl_IruSetId = v.pji_set_Id
                                cleaning.cl_IruJml = (v.pji_Jenis === 'pcs') ? v.pji_Jml_A2 : 1
                                cleaning.cl_Status = 0
                                await cleaning.save({ transaction: tx })
                            })
                        )

                        await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 3 })
                    }

                    return modelPinjam

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: 'Success',
                    data: {
                        id: result.pj_Id,
                        trans_kode: result.pj_TransKode
                    }
                });
            } catch (err) {
                console.log(err)
            }
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                responseCode: "001",
                responseMessage: 'Failed to add',
                errors: err
            });
        } finally {
            sequelize?.close()
        }
    })
    .delete('/:id', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.any().required(),
        })

        let error
        try {
            schema.validate(req.body.params, { abortEarly: false, allowUnknown: true });
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

        const sequelize = await bky_sequelize()
        try {
            try {

                const result = await sequelize?.transaction(async (tx) => {

                    const PinjamModel = pinjam.initModel(sequelize)
                    const modelPinjam = await PinjamModel.findOne({
                        where: {
                            pj_Id: req.params.id
                        },
                        transaction: tx
                    })

                    if (!modelPinjam) {
                        return res.status(404).json({
                            responseCode: "001",
                            responseMessage: "Peminjaman tidak ditemukan",
                        });
                    }

                    modelPinjam.pj_Status = 8
                    await modelPinjam.save()

                    await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelPinjam.pj_Id, status: 1 })

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_pj_Id: modelPinjam.pj_Id,
                        pjl_Action: 8,
                        pjl_Info: `set batal peminjaman |  | `,
                        pjl_user_Id: req.logged_user.user_Id
                    }, {
                        transaction: tx
                    })

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: 'Success',
                });
            } catch (err) {

            }
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                responseCode: "001",
                responseMessage: 'Failed to add',
                errors: err
            });
        } finally {
            sequelize?.close()
        }
    })
    .get('/', auth(), async (req, res) => {

        const sequelize = await bky_sequelize()
        try {

            const limit = 40

            const { show, key, jenis_pj, status } = req.query
            let where = {
                ruangan: req.logged_user.user_ru_Id,
            }

            let query = `select * from pinjam 
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id where pj_Status <> 9`
            if ([4].indexOf(req.logged_user.user_Level) >= 0) {
                query += ` and ruang.ru_Id = :ruangan `
                where['ruangan'] = req.logged_user.user_ru_Id
            }
            if (show === 'transac') {
                query += ` and ((pj_Status in (1,2,3,4,5) and pj_Jenis in ('IRU')) or (pj_Status in (1,2,3) and pj_Jenis in ('AHP'))) `
            }

            if (key) {
                query += ` and ((pj_TransKode like :key) or (ins_Nama like :key) or (ru_Nama like :key) or (pj_Kamar like :key) or (pj_No like :key) or  (pj_Pasien like :key) or (JSON_EXTRACT(pj_Metadata,"$.list_instrument") like :key))`
                where['key'] = `%${key}%`
            }

            if (jenis_pj) {
                query += ` and ((pj_Jenis = :jenis))`
                where['jenis'] = `${jenis_pj}`
            }

            if (status) {
                query += ` and ((pj_Status = :status))`
                where['status'] = `${status}`
            }
            query += ` order by pj_Status asc, pj_Tgl desc,  pj_Id desc`
            query += ` limit ${limit}`

            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: where,
            })

            const SetListModel = instrumen_set.initModel(sequelize)

            let datas: any = await Promise.all(
                pinjam.map(async (v, k) => {
                    const metadata = JSON.parse(v.pj_Metadata)
                    let list_instrument = []
                    if (metadata) {
                        list_instrument = metadata.list_instrument
                    }

                    return {
                        id: v.pj_Id,
                        jenis_pj: v.pj_Jenis,
                        trans_kode: v.pj_TransKode,
                        tgl: v.pj_Tgl,
                        ruang_id: v.ru_Id,
                        ruang_nama: v.ru_Nama,
                        institusi_id: v.ru_ins_Id,
                        institusi_nama: v.ins_Nama,
                        kamar: v.pj_Kamar,
                        no: v.pj_No,
                        jenis: v.pj_Jenis,
                        iru_nama: '',
                        iru_total: v.pj_IruTotal,
                        list_instrument: list_instrument,
                        status: v.pj_Status,

                    }
                })
            )

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
                err: err
            })
        } finally {
            sequelize?.close()
        }
    })
    .post('/', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.any(),
            // pinjam_trans_kode: Joi.string().required(),
            dt_pakai: Joi.date().required(),
            ruang: Joi.any()
                .external(async (id) => {
                    console.log('id', id)
                    const sequelize = await bky_sequelize();
                    try {
                        const ruangModel = ruang.initModel(sequelize)
                        const findRuang = await ruangModel.findOne({
                            where: {
                                ru_Id: parseInt(id)
                            }
                        })
                        if (!findRuang) {
                            throw new Error('Ruangan tidak valid')
                        }
                    } catch (err) {
                        console.log(err)
                        throw new Error('Ruangan tidak valid')
                    } finally {
                        sequelize?.close()
                    }

                })
                .required(),
            kamar: Joi.string().required(),
            nomor: Joi.string().required(),
            packing_man: Joi.string().allow(null).allow(''),
            receiver: Joi.string().allow(null).allow(''),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().min(1).required()
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
                error.details?.map((v, k) => {
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

        const sequelize = await bky_sequelize()
        try {
            const result = await sequelize?.transaction(async (tx) => {

                let totalItems = 0;
                let totalJenis = 0;
                let totalIru = 0

                const PinjamModel = pinjam.initModel(sequelize)
                const modelPinjam = await PinjamModel.create(
                    {
                        pj_InsBy: req.logged_user.user_Id,
                        pj_Kamar: req.body.kamar,
                        pj_ru_Id: parseInt(req.body.ruang),
                        pj_No: req.body.nomor,
                        pj_Packer: req.body.packing_man,
                        pj_Receiver: req.body.receiver,
                        // pj_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                        pj_Tgl: req.body.dt_pakai
                    },
                    { transaction: tx }
                )

                const PinjamDtlModel = pinjam_iru_dtl.initModel(sequelize)
                await Promise.all(
                    req.body.list.map(async (v, k) => {
                        let items = 0, jenis = 0
                        const id_split = v.instrumen.split("-")
                        if (id_split.length >= 2) {
                            const jns = id_split[0]
                            const id = parseInt(id_split[1])

                            if (jns !== 'set') {
                                const detail = await PinjamDtlModel.create({
                                    pjd_iru_Id: parseInt(id),
                                    pjd_Jml_Req: parseInt(v.amt),
                                    pjd_pj_Id: modelPinjam.pj_Id
                                },
                                    { transaction: tx }
                                )
                                items += parseInt(v.amt)
                                jenis++

                                totalItems += items
                                totalJenis++
                            } else {
                                const list: any = await sequelize?.query(`select * 
                                    from instrumen_set_list 
                                    where list_set_Id = :id and list_Status <> 9`, {
                                    type: QueryTypes.SELECT,
                                    replacements: {
                                        id: id
                                    }
                                })
                                Promise.all(list.map(async (vv, kk) => {
                                    const detail = await PinjamDtlModel.create({
                                        pjd_iru_Id: vv.list_iru_Id,
                                        pjd_Jml_Req: vv.list_Jumlah,
                                        pjd_pj_Id: modelPinjam.pj_Id,
                                        pjd_set_Id: vv.list_set_Id,
                                    },
                                        { transaction: tx }
                                    )
                                    items += parseInt(vv.list_Jumlah)
                                    jenis++

                                    totalItems += items
                                    totalJenis++
                                }))
                            }
                        }
                        totalIru++
                    })
                )

                const PinjamLogModel = pinjam_log.initModel(sequelize)
                await PinjamLogModel.create({
                    pjl_Action: 1,
                    pjl_Info: `request peminjaman |  | `,
                    pjl_pj_Id: modelPinjam.pj_Id,
                    pjl_user_Id: req.logged_user.user_Id
                }, {
                    transaction: tx
                })

                await PinjamModel.update(
                    {
                        pj_IruTotalItm: totalItems,
                        pj_IruTotalJns: totalJenis,
                        pj_IruTotal: totalIru,
                    }, {
                    where: {
                        pj_Id: modelPinjam.pj_Id
                    },
                    transaction: tx
                })

                return modelPinjam

            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: 'Success',
                data: {
                    id: result.pj_Id,
                    trans_kode: result.pj_TransKode
                }
            });
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                responseCode: "001",
                responseMessage: 'Failed to add',
                errors: err
            });
        } finally {
            sequelize?.close()
        }
    })

export default PinjamController;

