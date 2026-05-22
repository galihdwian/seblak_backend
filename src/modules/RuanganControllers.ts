import { Router } from "express";
import Joi from "joi";
import { Op, QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize";
import { ruang } from "../models/ruang";
import auth from "../middleware/auth";

const RuanganController = Router();
RuanganController
    .post('/', auth(), async (req, res) => {

        const schema = Joi.object({
            id: Joi.any(),
            nama: Joi.string().required(),
            institusi: Joi.any().required(),
            pinjam_form_full: Joi.number(),
        })

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            let errMsg: string[] = [];
            let errors: any = {};

            error.details.map((v, k) => {
                errMsg.push(v.message)
                errors[v.path[0]] = v.message
            });

            return res.status(400)({
                responseCode: "001",
                responseMessage: errMsg,
                errors: errors
            });
        }

        const sequelize = await bky_sequelize()
        try {
            const RuangModel = ruang.initModel(sequelize)
            const find = await RuangModel.findOne({
                where: {
                    ru_Status: {
                        [Op.notIn]: [9]
                    },
                    ru_Nama: req.body.nama,
                    ru_ins_Id: req.body.institusi
                }
            })
            if (find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'Ruangan sudah ada',
                });
            }

            const metadata = {
                pinjam_form_full: req.body.pinjam_form_full
            }

            const model = await RuangModel.create({
                ru_InsTime: new Date(),
                ru_InsBy: req.logged_user.user_Id,
                ru_Nama: req.body.nama,
                ru_ins_Id: req.body.institusi,
                ru_Metadata: JSON.stringify(metadata)
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.ru_Id,
                }
            })

        } catch (err) {
            console.log('Ruang-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
    )
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            const find = await sequelize?.query(`select * from ruang join institusi on ruang.ru_ins_Id = institusi.ins_Id where ru_Status <> 9 and ru_Id = :id`, {
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
            let model = {
                id: v.ru_Id,
                nama: v.ru_Nama,
                institusi: v.ru_ins_Id,
                institusi_nama: v.ins_Nama,
            }

            let metadata
            try {
                metadata = JSON.parse(v.ru_Metadata)
            } catch (e) { }
            if (!metadata) {
                metadata = {}
            }

            model['metadata'] = metadata

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    ruangan: model,
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

            let query = `select * from ruang join institusi on ruang.ru_ins_Id = institusi.ins_Id where ru_Status <> 9`

            if ([4].indexOf(req.logged_user.user_Level) >= 0) {
                query += ` and ruang.ru_Id = :ruangan `
            }
            const models: any = await sequelize?.query(query, {
                type: QueryTypes.SELECT,
                replacements: {
                    ruangan: req.logged_user.user_ru_Id,
                }
            })
            const datas = models.map((v, k) => {

                let row = {
                    id: v.ru_Id,
                    nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                }

                let metadata
                try {
                    metadata = JSON.parse(v.ru_Metadata)
                } catch (e) { }
                if (!metadata) {
                    metadata = {}
                }

                row = { ...row, ...metadata }
                return row
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: datas
            })

        } catch (err) {
            console.log('Ruang-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    },
    )
    .put('/', auth(), async (req, res) => {

        const sequelize: any = await bky_sequelize()
        try {

            const schema = Joi.object({
                id: Joi.required(),
                nama: Joi.string().required(),
                institusi: Joi.any().required(),
                pinjam_form_full: Joi.number(),
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

            const ruanganModel = ruang.initModel(sequelize)
            const modelruangan = await ruanganModel.findOne({
                where: {
                    ru_Id: req.body.id
                }
            })

            if (!modelruangan) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            let metadata: any = {}
            try {
                metadata = JSON.parse(modelruangan.ru_Metadata)
            } catch (e) { }

            if (!metadata) {
                metadata = {}
            }

            metadata.pinjam_form_full = req.body.pinjam_form_full

            modelruangan.ru_Metadata = JSON.stringify(metadata)
            modelruangan.ru_Nama = req.body.nama
            modelruangan.ru_ins_Id = req.body.institusi
            await modelruangan.save();

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
            })

        } catch (err) {
            console.log('ruangan-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .put('/kamar/:id', auth(), async (req, res) => {
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

                const ruanganModel = ruang.initModel(sequelize)
                const model = await ruanganModel.findOne({
                    where: {
                        ru_Id: req.params.id
                    }
                })

                if (!model) {
                    return res.status(404).json({
                        responseCode: "001",
                        responseMessage: "Model tidak ditemukan",
                    });
                }

                let metadata = JSON.parse(model.ru_Metadata)
                if (!metadata) {
                    metadata = {}
                }
                metadata.kamar  = req.body.kamar
                
                model.ru_Metadata = JSON.stringify(metadata);
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

                const ruanganModel = ruang.initModel(sequelize)
                const model = await ruanganModel.findOne({
                    where: {
                        ru_Id: req.params.id
                    }
                })

                if (!model) {
                    return res.status(404).json({
                        responseCode: "001",
                        responseMessage: "Model tidak ditemukan",
                    });
                }

                model.ru_InsTime = new Date()
                model.ru_UpdBy = req.logged_user.user_Id
                model.ru_Status = 9;
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
export default RuanganController; 