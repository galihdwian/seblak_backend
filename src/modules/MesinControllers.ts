import { Router } from "express";
import Joi from "joi";
import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import { mesin } from "../models/mesin";
import auth from "../middleware/auth";

const MesinController = Router()
MesinController
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const find = await sequelize?.query(`select * from mesin where msn_Id = :id`, {
                type: QueryTypes.SELECT,
                replacements: {
                    id: req.params.id
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
                id: v.msn_Id,
                nama: v.msn_Nama,
                nomor: v.msn_Nomor,
                last_test: v.msn_LastTest,
                status: v.msn_Status,
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    mesin: model,
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

            const { status } = req.query

            let query = `select * from mesin where (1=1)`
            if (status) {
                query += ` and msn_Status = :status`
            } else {
                query += ` and msn_Status <> 9`
            }
            query += ` order by msn_InsTime desc`
            const pinjam: any = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: {
                    status: status
                }
            })

            let datas: any = []
            pinjam.map((v, k) => {
                let to_push = {
                    id: v.msn_Id,
                    nama: v.msn_Nama,
                    nomor: v.msn_Nomor,
                    last_test: v.msn_LastTest,
                    status: v.msn_Status,

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
            nama: Joi.string().required(),
            nomor: Joi.string().required(),
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
            const MesinModel = mesin.initModel(sequelize)
            const find = await MesinModel.findOne({
                where: {
                    msn_Status: {
                        notIn: [9]
                    },
                    msn_Nomor: req.body.nomor,
                    msn_Nama: req.body.nama
                }
            })

            if (find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'Mesin sudah ada',
                });
            }

            const model = await MesinModel.create({
                msn_InsTime: new Date(),
                msn_InsBy: req.logged_user.user_Id,
                msn_Nama: req.body.nama,
                msn_Nomor: req.body.nomor,
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.msn_Id,
                }
            })

        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize.close();
        }
    },
    )
    .put('/', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                id: Joi.required(),
                nama: Joi.string().required(),
                nomor: Joi.string().required(),
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

            const MesinModel = mesin.initModel(sequelize)
            const modelMesin = await MesinModel.findOne({
                where: {
                    msn_Id: req.body.id
                }
            })

            if (!modelMesin) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            modelMesin.msn_Nama = req.body.nama
            modelMesin.msn_Nomor = req.body.nomor
            await modelMesin.save();

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
            })

        } catch (err) {
            console.log('Mesin-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
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
            schema.validate(req.params, { abortEarly: false, allowUnknown: true });
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

                const MesinModel = mesin.initModel(sequelize)
                const model = await MesinModel.findOne({
                    where: {
                        msn_Id: req.params.id
                    }
                })

                if (!model) {
                    return res.status(404).json({
                        responseCode: "001",
                        responseMessage: "Model tidak ditemukan",
                    });
                }

                model.msn_InsTime = new Date()
                model.msn_UpdBy = req.logged_user.user_Id
                model.msn_Status = 9;
                await model.save()

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
export default MesinController;

