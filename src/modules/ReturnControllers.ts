import { format } from "date-fns";
import { Elysia } from "elysia";
import Joi from "joi";
import * as crypto from "node:crypto";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import { pinjam } from "../models/pinjam";
import { pinjam_detail } from "../models/pinjam_detail";
import { pinjam_log } from "../models/pinjam_log";
import { return_ } from "../models/return";
import { return_detail } from "../models/return_detail";
import { Router } from "express";
import { cleaning } from "../models/cleaning";
import auth from "../middleware/auth";

const ReturnController = Router()
ReturnController
    .get('/detail/:id', auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const find: any = await sequelize?.query(`select * from \`return\`
                            join pinjam on pinjam.pj_Id = return.rt_pj_Id 
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            where rt_TransKode = :trans_kode limit 1`, {
                type: QueryTypes.SELECT,
                replacements: {
                    trans_kode: req.params.id
                }
            })

            if (!find.length) {
                return res.status(404).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }


            const model = {
                id: find[0].rt_Id,
                trans_kode: find[0].rt_TransKode,
                pj_trans_kode: find[0].pj_TransKode,
                tgl: find[0].pj_Tgl,
                tgl_return: find[0].rt_Tanggal,
                ruang_id: find[0].ru_Id,
                ruang_nama: find[0].ru_Nama,
                institusi_id: find[0].ru_ins_Id,
                institusi_nama: find[0].ins_Nama,
                packer: find[0].pj_Packer,
                receiver: find[0].pj_Receiver,
                submitter: find[0].rt_Submitter,
                verikator: find[0].rt_Verifikator,
                kamar: find[0].pj_Kamar,
                no: find[0].pj_No,
                total_jns: find[0].pj_IruTotalJns,
                total_itm: find[0].pj_IruTotalItm,
                total_jns_return: find[0].rt_IruTotalJns,
                total_itm_return: find[0].rt_IruTotalItm,
                status: find[0].rt_Status,
            }

            const list: any = await sequelize?.query(`select * 
                                from return_detail 
                                join instrumen on instrumen.iru_Id = return_detail.rtd_iru_Id
                                where rtd_rt_Id = :id and rtd_Status <> 9`, {
                type: QueryTypes.SELECT,
                replacements: {
                    id: find[0].rt_Id
                }
            })
            const lists = list.map((v: {}, k: any) => {
                return {
                    id: v.iru_Id,
                    nama: v.iru_Nama,
                    no_katalog: v.iru_NoKatalog,
                    brand: v.iru_Brand,
                    amt: v.rtd_JumlahAwal,
                    amt_return: v.rtd_JumlahAkhir,
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    return: model,
                    detail: lists
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
    .get('/', auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {
            const pinjam: any = await sequelize.query(`select * from \`return\`
                            join pinjam on pinjam.pj_Id = return.rt_pj_Id 
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            where pj_Status <> 9 order by pj_InsTime desc`, {
                type: QueryTypes.SELECT
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.rt_Id,
                    trans_kode: v.rt_TransKode,
                    tgl: v.pj_Tgl,
                    tgl_return: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    packer: v.pj_Packer,
                    receiver: v.pj_Receiver,
                    submitter: v.rt_Submitter,
                    receiver_return: v.rt_Receiver,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    total_jns: v.pj_IruTotalJns,
                    total_itm: v.pj_IruTotalItm,
                    total_jns_return: v.rt_IruTotalJns,
                    total_itm_return: v.rt_IruTotalItm,
                    status: v.rt_Status,
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
    .post('/', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.any(),
            dt_return: Joi.date().required(),
            return_man: Joi.string().required(),
            receiver: Joi.string().required(),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().required(),
                    amt_return: Joi.number().required(),
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

        const sequelize = await bky_sequelize()
        try {

            const PinjamModel = pinjam.initModel(sequelize)
            const modelPinjam = await PinjamModel.findOne({
                where: {
                    pj_TransKode: req.body.pinjam_trans_kode
                }
            })
            if (!modelPinjam) {
                return res.status(404).json({
                    responseCode: "001",
                    responseMessage: "Model pinjam not found",
                });
            }

            try {

                const result = await sequelize?.transaction(async (tx) => {
                    const ReturnModel = return_.initModel(sequelize)
                    const modelReturn = await ReturnModel.create(
                        {
                            rt_InsBy: null,
                            rt_pj_Id: modelPinjam.pj_Id,
                            rt_Submitter: req.body.return_man,
                            rt_Receiver: req.body.receiver,
                            // rt_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                            rt_Tanggal: req.body.dt_return
                        },
                        { transaction: tx }
                    )

                    const ReturnDtlModel = return_detail.initModel(sequelize)
                    let items = 0, jenis = 0
                    await Promise.all(
                        req.body.list.map(async (v, k) => {
                            const detail = await ReturnDtlModel.create({
                                rtd_iru_Id: parseInt(v.instrumen),
                                rtd_JumlahAwal: parseInt(v.amt),
                                rtd_JumlahAkhir: parseInt(v.amt_return),
                                rtd_rt_Id: modelReturn.rt_Id
                            },
                                { transaction: tx }
                            )
                            items += parseInt(v.amt_return)
                            jenis++
                        })
                    )

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: 3,
                        pjl_Info: `pengembalian |  | `
                    }, {
                        transaction: tx
                    })

                    await PinjamModel.update(
                        {
                            pj_Status: 3,
                            pj_UpdTime: new Date(),
                            pj_UpdBy: req.logged_user.user_Id,
                        }, {
                        where: {
                            pj_Id: modelPinjam.pj_Id
                        },
                        transaction: tx
                    })

                    await ReturnModel.update({
                        rt_IruTotalJns: jenis,
                        rt_IruTotalItm: items,
                    }, {
                        where: {
                            rt_Id: modelReturn.rt_Id,
                        },
                        transaction: tx
                    })

                    return modelReturn

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: 'Success',
                    data: {
                        id: result.rt_Id,
                        trans_kode: result.rt_TransKode
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
            schema.validate(params, { abortEarly: false, allowUnknown: true });
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

                    modelPinjam.pj_Status = 5
                    await modelPinjam.save()

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_pj_Id: modelPinjam.pj_Id,
                        pjl_Action: 5,
                        pjl_Info: `set batal peminjaman |  | `
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
    .put('/status/:id', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                status: Joi.any().required(),
                receiver: Joi.string().required(),
                time_receive: Joi.string().required(),
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

            // const find: any = await sequelize?.query(`select * from pinjam 
            // join ruang on ruang.ru_Id = pinjam.pj_ru_Id
            // join institusi on institusi.ins_Id = ruang.ru_ins_Id
            // where pj_Status <> 9 and pj_TransKode = :trans_kode limit 1`, {
            //     type: QueryTypes.SELECT,
            //     replacements: {
            //         trans_kode: req.params.id
            //     }
            // })




            const PinjamModel = pinjam.initModel(sequelize)
            const find = await PinjamModel.findOne({
                where: {
                    pj_TransKode: req.params.id
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            try {
                const result = await sequelize?.transaction(async (tx) => {

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Action: 2,
                        pjl_Info: `set diterima - ${req.body.time_receive} |  | `
                    }, {
                        transaction: tx
                    })

                    await PinjamModel.update(
                        {
                            pj_Status: req.body.status,
                            pj_Receiver: req.body.receiver
                        }, {
                        where: {
                            pj_Id: find.pj_Id
                        },
                        transaction: tx
                    })

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
    .post('/verifikasi/:id', auth(), async (req, res) => {
        const schema = Joi.object({
            dt_return: Joi.date().required(),
            submitter: Joi.string().required(),
            verifikator: Joi.string().required(),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().required(),
                    amt_return: Joi.number().required(),
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

        const sequelize = await bky_sequelize()
        try {

            const ReturnModel = return_.initModel(sequelize)
            const modelReturn = await ReturnModel.findOne({
                where: {
                    rt_TransKode: req.params.id
                }
            })
            if (!modelReturn) {
                return res.status(404).json({
                    responseCode: "001",
                    responseMessage: "Model not found",
                });
            }

            const PinjamModel = pinjam.initModel(sequelize)
            const modelPinjam = await PinjamModel.findOne({
                where: {
                    pj_Id: modelReturn.rt_pj_Id
                }
            })

            try {

                const result = await sequelize?.transaction(async (tx) => {

                    const ReturnDtlModel = return_detail.initModel(sequelize)
                    const CleaningModel = cleaning.initModel(sequelize)
                    let items = 0, jenis = 0

                    ReturnDtlModel.destroy({
                        where: {
                            rtd_rt_Id: modelReturn.rt_Id
                        },
                        transaction: tx
                    })

                    const list: any = await sequelize?.query(`select * 
                        from pinjam_detail 
                        join instrumen on instrumen.iru_Id = pinjam_detail.pjd_iru_Id
                        where pjd_pj_Id = :id and pjd_Status <> 9
                        order by pjd_SetNama, iru_Nama`, {
                        type: QueryTypes.SELECT,
                        replacements: {
                            id: modelPinjam.pj_Id
                        }
                    })

                    await Promise.all(
                        list.map(async (v, k) => {
                            let jumAkhir = 0
                            req.body.list.map((vv, kk) => {
                                if (vv.instrumen === v.iru_Id) {
                                    jumAkhir = vv.amt_return
                                }
                            })
                            await ReturnDtlModel.create({
                                rtd_iru_Id: parseInt(v.iru_Id),
                                rtd_JumlahAwal: parseInt(v.pjd_Jumlah),
                                rtd_JumlahAkhir: parseInt(jumAkhir),
                                rtd_rt_Id: modelReturn.rt_Id
                            },
                                { transaction: tx }
                            )
                            items += parseInt(jumAkhir)
                            jenis++

                            return true;
                        })
                    )

                    const PinjamLogModel = pinjam_log.initModel(sequelize)
                    await PinjamLogModel.create({
                        pjl_Flow: 2,
                        pjl_Action: 1,
                        pjl_Info: `verifikasi pengembalian |  | `
                    }, {
                        transaction: tx
                    })

                    await ReturnModel.update({
                        rt_IruTotalJns: jenis,
                        rt_IruTotalItm: items,
                        rt_Status: 2
                    }, {
                        where: {
                            rt_Id: modelReturn.rt_Id,
                        },
                        transaction: tx
                    })

                    await CleaningModel.findOrCreate({
                        where: {
                            cl_rt_Id: modelReturn.rt_Id,
                            cl_UpdTime: new Date(),
                            cl_UpdBy: ''
                        },
                        defaults: {
                            cl_rt_Id: modelReturn.rt_Id,
                            // cl_TransKode: crypto.randomBytes(3).toString('hex').toUpperCase(),
                        }
                    })

                    return modelReturn

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: 'Success',
                    data: {
                        id: modelReturn.rt_Id,
                        trans_kode: modelReturn.rt_TransKode
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
export default ReturnController; 