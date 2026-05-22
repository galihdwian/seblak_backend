import Excel from "exceljs";
import { Router } from "express";
import Joi from "joi";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { biological_ind_test } from "../models/biological_ind_test";
import { mesin } from "../models/mesin";
import path from "path";
import dayjs from "dayjs";

const BiologicaltestController = Router()
BiologicaltestController
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

                return res.status(400).send({
                    responseCode: "001",
                    responseMessage: errMsg,
                    errors: errors
                });
            }

            try {

                const { mesin, dt1, dt2 } = req.body
                let where = {}
                let query = `
                select * 
                from biological_ind_test
                join mesin on biological_ind_test.blt_msn_Id = mesin.msn_Id where blt_Status <> 9
                `

                if (mesin) {
                    query += ` and blt_msn_Id = :msn`
                    where['msn'] = mesin
                }
                if (dt1) {
                    query += ` and date(blt_StartTime) >= :dt1`
                    where['dt1'] = dt1
                }
                if (dt2) {
                    query += ` and date(blt_EndTime) <= :dt2`
                    where['dt2'] = dt2
                }

                const pinjam: any = await sequelize.query(query, {
                    type: QueryTypes.SELECT,
                    replacements: where,
                })

                const workbook = new Excel.Workbook();
                const UPLOAD_DIR = path.join(process.cwd(), 'public', 'format_export_bio.xlsx');
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
                        const newRow = worksheet.insertRow(7, [v.msn_Nama, v.msn_Nomor, dayjs(v.blt_StartTime).format('DD/MM/YYYY HH:mm'), dayjs(v.blt_EndTime).format('DD/MM/YYYY HH:mm'), v.blt_Result, v.blt_Paper, v.blt_Petugas])
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
                    'attachment; filename=' + `Export Biological Test periode ${dt1} s.d. ${dt2}.xlsx`
                );

                // 4. Write to response stream
                await workbook.xlsx.write(res);
                res.end();

            } catch (err) {
                console.log('Bowie-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to export",
                })
            }

        } catch (err) {
            console.log('Bowie-controller', err);
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

            const find = await sequelize?.query(`select * from 
                biological_ind_test
                join mesin on biological_ind_test.blt_msn_Id = mesin.msn_Id
                where blt_Id = :trans_kode limit 1`, {
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

            const v: any = find[0]
            const model = {
                id: v.blt_Id,
                mesin_nama: v.msn_Nama,
                mesin_nomor: v.msn_Nomor,
                status: v.blt_Status,
                start: v.blt_StartTime,
                end: v.blt_EndTime,
                paper: v.blt_Paper,
                hasil: v.blt_Result,
                petugas: v.blt_Petugas,
                ins_time: v.blt_InsTime,
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    biological_ind_test: model,
                }
            })

        } catch (err) {
            console.log('Biologicaltest-controller', err);
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
            const { show } = req.query

            let query = `select * 
                from biological_ind_test
                join mesin on biological_ind_test.blt_msn_Id = mesin.msn_Id where blt_Status <> 9`
            if (show === 'transac') {
                query += ` and blt_Status in (0,1)`
            }
            query += ` order by blt_Status asc, blt_Id desc`
            query += ` limit ${limit}`

            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.blt_Id,
                    mesin_nama: v.msn_Nama,
                    mesin_nomor: v.msn_Nomor,
                    status: v.blt_Status,
                    start: v.blt_StartTime,
                    end: v.blt_EndTime,
                    paper: v.blt_Paper,
                    hasil: v.blt_Result,

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
                result: Joi.string().required(),
                end: Joi.string().when('status', {
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
                    responseMessage: "Perbaiki inputan",
                    errors: errors
                });
            }

            const BdtModel = biological_ind_test.initModel(sequelize)
            const MesinModel = mesin.initModel(sequelize)

            const modelBowie = await BdtModel.findOne({
                where: {
                    blt_Id: req.params.id
                }
            })

            if (!modelBowie) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }
            try {
                const result = await sequelize?.transaction(async (tx) => {

                    if (req.body.status === 2) {
                        await BdtModel.update({
                            blt_Status: req.body.status,
                            blt_EndTime: req.body.end,
                            blt_Result: req.body.result,
                        }, {
                            where: { blt_Id: req.params.id },
                            transaction: tx,
                        })

                        let status_mesin = 1
                        await MesinModel.update({
                            msn_Status: status_mesin,
                            msn_LastTest: req.body.end,
                        }, {
                            where: { msn_Id: modelBowie.blt_msn_Id },
                            transaction: tx
                        })
                    }

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "success",
                    data: {
                    }
                })
            } catch (err) {
                console.log('Biologicaltest-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }

        } catch (err) {
            console.log('Biologicaltest-controller', err);
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
            mesin: Joi.string().required(),
            paper: Joi.string().required(),
            start: Joi.any().required(),
        })

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            let errMsg: string[] = [];
            let errors: any = {};

            error.details.map((v, k) => {
                errMsg.push(v.message)
                errors[v.path[0]] = v.message
            });

            return res.status(400).json({
                responseCode: "001",
                responseMessage: errMsg,
                errors: errors
            });
        }

        const sequelize: Sequelize = await bky_sequelize()
        try {
            const BdtModel = biological_ind_test.initModel(sequelize)
            const MesinModel = mesin.initModel(sequelize)

            try {
                const result = await sequelize?.transaction(async (tx) => {
                    const model = await BdtModel.create({
                        blt_InsTime: new Date(),
                        blt_InsBy: req.logged_user.user_Id,
                        blt_msn_Id: req.body.mesin,
                        blt_Paper: req.body.paper,
                        blt_StartTime: req.body.start,
                        blt_Status: 1,
                        blt_Petugas: req.logged_user.user_Nama,
                    })

                    await MesinModel.update({
                        msn_Status: 4,
                    }, {
                        where: { msn_Id: model.blt_msn_Id },
                        transaction: tx,
                    })

                    return model;

                })

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "success",
                    data: {
                        id: result.blt_Id
                    }
                })
            } catch (err) {
                console.log('Biologicaltest-controller', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to upd status",
                })
            }



        } catch (err) {
            console.log('Biologicaltest-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize.close();
        }
    },
    )
export default BiologicaltestController;

