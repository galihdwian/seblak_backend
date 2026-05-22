import { Router } from "express";
import Joi from "joi";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { Pinjam_Instrumen_SimpleUpdateStatus } from "../models/pinjam";
import { sterilisasi } from "../models/sterilisasi";
import Excel from "exceljs";
import path from 'path';
import dayjs from "dayjs";

const SterilController = Router()
SterilController
    .post('/export', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                mesin: Joi.string(),
                dt1: Joi.date().required(),
                dt2: Joi.date().required(),
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

                return res.status(400).send(JSON.stringify({
                    responseCode: "001",
                    responseMessage: errMsg,
                    errors: errors
                }));
            }

            try {

                const { mesin, dt1, dt2 } = req.body
                let where = {}
                let query = `
                select * from
                    (
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen.iru_Nama, instrumen.iru_Id, mesin.*, 'pcs' as iru_jenis
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen on instrumen.iru_Id = sterilisasi.st_IruId and sterilisasi.st_Irujenis = 'pcs' 
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                      
                       union 
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen_set.set_Nama as iru_Nama, instrumen_set.set_Id as iru_Id , mesin.*, 'set' as iru_jenis
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen_set on instrumen_set.set_Id = sterilisasi.st_IruSetId and sterilisasi.st_Irujenis = 'set' 
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                       
                    ) as yuhu
                where st_Status <> 9 and st_Status in (2)
            `

                if (mesin) {
                    query += ` and st_msn_Id = :msn`
                    where['msn'] = mesin
                }
                if (dt1) {
                    query += ` and date(st_Start) >= :dt1`
                    where['dt1'] = dt1
                }
                if (dt2) {
                    query += ` and date(st_End) <= :dt2`
                    where['dt2'] = dt2
                }

                query += ` order by pj_InsTime desc`

                const pinjam: any = await sequelize.query(query, {
                    type: QueryTypes.SELECT,
                    replacements: where,
                })

                const workbook = new Excel.Workbook();
                const UPLOAD_DIR = path.join(process.cwd(), 'public', 'format_export_sterilisasi.xlsx');
                await workbook.xlsx.readFile(UPLOAD_DIR)
                const worksheet = workbook.worksheets[0]

                const thinBorderAllSides = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };


                if (worksheet) {
                    worksheet.getCell('B4').value = dayjs(dt1).format('DD/MM/YYYY')
                    worksheet.getCell('D4').value = dayjs(dt2).format('DD/MM/YYYY')

                    let rowIdx = 7;
                    pinjam.map((v) => {
                        const newRow = worksheet.insertRow(7, [v.msn_Nama, dayjs(v.st_End).format('DD/MM/YYYY'), dayjs(v.st_End).format('HH:mm'), '', v.st_SteBy, v.iru_Nama, v.iru_jenis, v.st_IruJml])
                        newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            cell.border = thinBorderAllSides;
                        });
                        rowIdx++
                    })
                }



                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });


                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=' + `Export Sterelisasi periode ${dt1} s.d. ${dt2}.xlsx`
                );

                // 4. Write to response stream
                await workbook.xlsx.write(res);
                res.end();

            } catch (err) {
                console.log('Sterilisasi-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to export",
                })
            }

        } catch (err) {
            console.log('sterilisasi-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to post",
            })
        } finally {
            sequelize?.close()
        }
    })
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            let query = `
                select * from
                    (
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen.iru_Nama, instrumen.iru_Id, mesin.*
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen on instrumen.iru_Id = sterilisasi.st_IruId and sterilisasi.st_Irujenis = 'pcs'
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                      
                       union 
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen_set.set_Nama as iru_Nama, instrumen_set.set_Id as iru_Id , mesin.*
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen_set on instrumen_set.set_Id = sterilisasi.st_IruSetId and sterilisasi.st_Irujenis = 'set' 
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                                             
                    ) as yuhu
                where st_Status <> 9
            `

            query += ` and st_TransKode = :trans_kode limit 1`

            const find = await sequelize?.query(query, {
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

            const modelSteril: any = find[0]
            const model = {
                id: modelSteril.st_Id,
                trans_kode: modelSteril.st_TransKode,
                start: modelSteril.st_Start,
                end: modelSteril.st_End,
                status: modelSteril.st_Status,
                clean_man: modelSteril.st_SteBy,
                pj_trans_kode: modelSteril.pj_TransKode,
                pj_tgl: modelSteril.pj_Tgl,
                pj_ruang_id: modelSteril.ru_Id,
                pj_ruang_nama: modelSteril.ru_Nama,
                pj_institusi_id: modelSteril.ru_ins_Id,
                pj_institusi_nama: modelSteril.ins_Nama,
                pj_a1: modelSteril.pj_A1,
                pj_b1: modelSteril.pj_B1,
                pj_b2: modelSteril.pj_B2,
                pj_a2: modelSteril.pj_A2,
                pj_kamar: modelSteril.pj_Kamar,
                pj_nomor: modelSteril.pj_No,
                pj_pasien: modelSteril.pj_Pasien,
                msn_nama: modelSteril.msn_Nama,
                msn_no: modelSteril.msn_Nomor,
                msn_nama: modelSteril.msn_Nama,
                msn_no: modelSteril.msn_Nomor,
                iru_nama: modelSteril.iru_Nama,
                iru_id: modelSteril.iru_Id,
                iru_jenis: modelSteril.cl_IruJenis,
                iru_jml: modelSteril.cl_IruJml,
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    sterilisasi: model,
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
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen.iru_Nama, instrumen.iru_Id, mesin.*
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen on instrumen.iru_Id = sterilisasi.st_IruId and sterilisasi.st_Irujenis = 'pcs' 
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                      
                       union 
                        select sterilisasi.*, pinjam.*, ruang.ru_Nama, institusi.ins_Nama, instrumen_set.set_Nama as iru_Nama, instrumen_set.set_Id as iru_Id , mesin.*
                            from sterilisasi 
                            join pinjam on pinjam.pj_Id = sterilisasi.st_pj_Id
                            join ruang on ruang.ru_Id = pinjam.pj_ru_Id
                            join institusi on institusi.ins_Id = ruang.ru_ins_Id
                            join instrumen_set on instrumen_set.set_Id = sterilisasi.st_IruSetId and sterilisasi.st_Irujenis = 'set' 
                            left join mesin on mesin.msn_Id = sterilisasi.st_msn_Id                       
                    ) as yuhu
                where st_Status <> 9
            `

            if (show === 'transac') {
                query += ` and st_Status in (0,1)`
            }
            if (key) {
                query += ` and ((msn_Nama like :key) or (iru_Nama like :key) or (st_TransKode like :key) or (pj_TransKode like :key) or (st_TransKode like :key) or (pj_Kamar like :key) or (pj_No like :key) or  (pj_Pasien like :key) or (JSON_EXTRACT(pj_Metadata,"$.list_instrument") like :key))`
                where['key'] = `%${key}%`
            }

            query += ` order by pj_InsTime desc`
            query += ` limit ${limit}`
            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: where,
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.st_Id,
                    trans_kode: v.st_TransKode,
                    start: v.st_Start,
                    end: v.st_End,
                    pj_trans_kode: v.pj_TransKode,
                    tgl: v.pj_Tgl,
                    tgl_return: v.pj_Tgl,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    kamar: v.pj_Kamar,
                    no: v.pj_No,
                    status: v.st_Status,
                    iru_nama: v.iru_Nama,
                    iru_id: v.iru_Id,
                    iru_jenis: v.st_IruJenis,
                    iru_jml: v.st_IruJml,
                    msn_nama: v.msn_Nama,
                    msn_no: v.msn_Nomor,
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

    // .put('/status/:id', auth(), async (req, res) => {

    //     const sequelize: any = await bky_sequelize()
    //     try {

    //         const schema = Joi.object({
    //             status: Joi.any().required(),
    //             mesin: Joi.string().when('status', {
    //                 is: Joi.valid(1),
    //                 then: Joi.required()
    //             }),
    //             start_time: Joi.string().when('status', {
    //                 is: Joi.valid(1),
    //                 then: Joi.required()
    //             }),
    //             end_time: Joi.string().when('status', {
    //                 is: Joi.valid(2),
    //                 then: Joi.required()
    //             }),
    //             tgl_expired: Joi.string().when('status', {
    //                 is: Joi.valid(2),
    //                 then: Joi.required()
    //             }),
    //         })

    //         let error
    //         try {
    //             await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    //         } catch (err) {
    //             error = err
    //         }

    //         if (error) {
    //             let errMsg: string[] = [];
    //             let errors: any = {};

    //             try {
    //                 error.details.map((v, k) => {
    //                     errMsg.push(v.message)
    //                     if (v.path[0] === 'list') {
    //                         const impl = v.path.join('-')
    //                         errors[impl] = v.message

    //                     } else {
    //                         errors[v.path[0]] = v.message
    //                     }

    //                 });
    //             } catch (err) {
    //                 console.log(err)
    //             }

    //             return res.status(400).json({
    //                 responseCode: "001",
    //                 responseMessage: errMsg,
    //                 errors: errors
    //             });
    //         }

    //         const SterilModel = sterilisasi.initModel(sequelize)
    //         const modelSteril = await SterilModel.findOne({
    //             where: {
    //                 st_TransKode: req.params.id
    //             }
    //         })

    //         if (!modelSteril) {
    //             return res.status(400).json({
    //                 responseCode: "002",
    //                 responseMessage: "not found",
    //             })
    //         }

    //         const pinjam: any = await sequelize?.query(`select pj_Id
    //             from pinjam
    //             where pj_Id = :pj_id limit 1
    //             `, {
    //             type: QueryTypes.SELECT,
    //             replacements: {
    //                 pj_id: modelSteril.st_pj_Id
    //             }
    //         })

    //         try {
    //             const result = await sequelize?.transaction(async (tx) => {

    //                 let defaultUpdateStatus = false
    //                 let pjl_info

    //                 switch (req.body.status) {
    //                     case 1:
    //                         pjl_info = `start steril | | `
    //                         defaultUpdateStatus = true

    //                         await SterilModel.update({
    //                             st_Status: req.body.status,
    //                             st_Start: req.body.start_time,
    //                             st_SteBy: req.logged_user.user_Nama,
    //                             st_msn_Id: req.body.mesin,
    //                         }, {
    //                             where: {
    //                                 st_Id: modelSteril.st_Id
    //                             },
    //                             transaction: tx,
    //                         })
    //                         break;
    //                     case 2:
    //                         pjl_info = `selesai steril | | `
    //                         defaultUpdateStatus = true

    //                         await SterilModel.update({
    //                             st_Status: req.body.status,
    //                             st_End: req.body.end_time,
    //                         }, {
    //                             where: {
    //                                 st_Id: modelSteril.st_Id
    //                             },
    //                             transaction: tx
    //                         })
    //                         break;
    //                     default:
    //                         defaultUpdateStatus = true
    //                         break;
    //                 }

    //                 const PinjamLogModel = pinjam_log.initModel(sequelize)
    //                 await PinjamLogModel.create({
    //                     pjl_Action: req.body.status,
    //                     pjl_Info: pjl_info,
    //                     pjl_pj_Id: pinjam[0].pj_Id,
    //                 }, {
    //                     transaction: tx
    //                 })

    //                 await SterilModel.update({
    //                     st_UpdTime: new Date(),
    //                     st_UpdBy: req.logged_user.user_Id,
    //                 }, {
    //                     where: {
    //                         st_Id: modelSteril.st_Id
    //                     },
    //                     transaction: tx
    //                 })

    //                 if (req.body.status === 2) {
    //                     await SterilModel.update({
    //                         st_Status: req.body.status
    //                     }, {
    //                         where: {
    //                             st_Id: modelSteril.st_Id
    //                         },
    //                         transaction: tx
    //                     },
    //                     )

    //                     await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelSteril.st_pj_Id, status: 1, tgl_expired: req.body.tgl_expired })
    //                 }

    //             })

    //             return res.status(200).json({
    //                 responseCode: "000",
    //                 responseMessage: "success",
    //                 data: {
    //                 }
    //             })
    //         } catch (err) {
    //             console.log('Steril-controller', err);
    //             return res.status(400).json({
    //                 responseCode: "002",
    //                 responseMessage: "failed to upd status",
    //             })
    //         }

    //     } catch (err) {
    //         console.log('Steril-controller', err);
    //         return res.status(400).json({
    //             responseCode: "002",
    //             responseMessage: "failed to get",
    //         })
    //     } finally {
    //         sequelize?.close()
    //     }
    // })

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
                    error?.details?.map((v, k) => {
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

            const SterilModel = sterilisasi.initModel(sequelize)

            try {
                const result = await sequelize?.transaction(async (tx) => {

                    const { start_time, end_time, id, mesin, status } = req.body
                    if (status === 1) {
                        await Promise.all(
                            id.map(async (v, k) => {
                                const pinjam = await SterilModel.update({
                                    st_Status: 1,
                                    st_Start: start_time,
                                    st_SteBy: req.logged_user.user_Nama,
                                    st_msn_Id: mesin,
                                }, {
                                    where: {
                                        st_Id: v
                                    },
                                    transaction: tx,
                                })
                            })
                        )
                    } else {
                        await Promise.all(
                            id.map(async (v, k) => {
                                const modelSteril = await SterilModel.findOne({
                                    where: {
                                        st_Id: v
                                    },
                                    transaction: tx,
                                })

                                if (modelSteril) {
                                    await modelSteril?.update({
                                        st_Status: 2,
                                        st_End: end_time,
                                        st_msn_Id: mesin,
                                    })

                                    await modelSteril.save({ transaction: tx })

                                    await Pinjam_Instrumen_SimpleUpdateStatus({ sequelize: sequelize, tx: tx, id_pinjam: modelSteril.st_pj_Id, iru_jenis: modelSteril.st_IruJenis, iru_id: (modelSteril.st_IruJenis === 'pcs') ? modelSteril.st_IruId : modelSteril.st_IruSetId, status: 1, tgl_expired: req.body.tgl_expired })


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
                console.log('Sterilisasi-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

        } catch (err) {
            console.log('sterilisasi-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })

export default SterilController;

