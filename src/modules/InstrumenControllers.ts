import { Router } from "express";
import Joi from "joi";
import { Op, QueryTypes, Sequelize } from "sequelize";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import { instrumen } from "../models/instrumen";
import { instrumen_set } from "../models/instrumen_set";
import { instrumen_set_list } from "../models/instrumen_set_list";
import { instrumen_stok } from "../models/instrumen_stok";

const InstrumenController = Router()
InstrumenController
    .put('/stok', auth(), async (req, res) => {
        const schema = Joi.object({
            stok: Joi.array().items(
                Joi.object().keys({
                    id: Joi.any().required(),
                    amt: Joi.object()
                })
            )
        })

        const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
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



        const sequelize = await bky_sequelize()
        try {

            const InstuStok = instrumen_stok.initModel(sequelize)
            let promisedArr = []
            Promise.all(
                req.body.stok.map(async (v, k) => {
                    Object.keys(v.amt).map(async (kk) => {
                        promisedArr.push(
                            new Promise(async (res) => {
                                const find = await InstuStok.findOne({
                                    where: {
                                        stok_iru_Id: v.id,
                                        stok_ins_Id: kk * 1
                                    },
                                })
                                if (find) {
                                    find.stok_Jumlah = v.amt[kk] * 1
                                    const saved = (await find.save())
                                    res(saved)
                                } else {
                                    const saved = await InstuStok.create({
                                        tok_iru_Id: v.id,
                                        stok_ins_Id: kk * 1,
                                        stok_Jumlah: v.amt[kk] * 1
                                    })
                                    res(saved)
                                }
                            })
                        )

                    })
                })
            )
            await Promise.all(promisedArr)

            return res.status(200).json({
                responseCode: "000",
                responseMessage: 'Success',
            });

        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    })
    .get('/stok_dashboard', auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {

            let query
            let where: any = {}
            const { key, status, jenis } = req.query

            query = `
                    select * from (
                    
                    SELECT concat('pcs-', iru_Id) AS id, iru_Nama AS nama, iru_NoKatalog AS no_katalog, iru_Brand AS brand, iru_Reuse AS REUSE, 
                    iru_Satuan AS jenis, iru_LastSetting AS tgl_setting, iru_ExpDate AS tgl_expired, iru_Status AS status 
                    FROM instrumen WHERE iru_Satuan = 'PCS' AND iru_Status <> 9
                    UNION 
                    SELECT concat('pack-', iru_Id) AS id, iru_Nama AS nama, iru_NoKatalog AS no_katalog, iru_Brand AS brand, iru_Reuse AS REUSE, 
                    iru_Satuan AS jenis, iru_LastSetting AS tgl_setting, iru_ExpDate AS tgl_expired, iru_Status AS status 
                    FROM instrumen WHERE iru_Satuan = 'pack' AND iru_Status <> 9
                    UNION 
                    SELECT concat('set-', set_Id) AS id, set_Nama AS nama, '' AS no_katalog, '' AS brand, 0 AS REUSE, 
                    'SET' AS jenis, set_LastSetting AS tgl_setting, set_ExpDate AS tgl_expired, set_Status AS status 
                    FROM instrumen_set WHERE set_Status <> 9
                    
                    ) as subqu
                    where 1=1 
            `

            if (key) {
                query += ` and ((nama like :key))`
                where['key'] = `%${key}%`
            }
            if (jenis) {
                query += ` and ((jenis like :jenis))`
                where['jenis'] = `${jenis}`
            }
            if (status) {
                if (status === 'in-use') {
                    query += ` and (status in (2,3,4,5,12))`
                } else {
                    query += ` and (status in (1))`
                }
            }
            query += ` ORDER BY field(jenis, 'pcs','set','pack'), tgl_expired ASC, FIELD(status, 1,5,4,3,2,12)`
            const models: any[] = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: where,
            })

            // query = `select iru_Id as id, iru_Nama as nama, iru_NoKatalog as no_katalog, iru_Brand as brand, iru_Reuse as reuse, iru_Satuan as jenis, iru_LastSetting as tgl_setting, iru_Status as status from instrumen where iru_Satuan = 'PCS' and iru_Status <> 9`
            // if (key) {
            //     query += ` and ((iru_Nama like :key))`
            //     where['key'] = `%${key}%`
            // }
            // if (status) {
            //     if (status === 'in-use') {
            //         query += ` and (iru_Status in (2,3,4))`
            //     } else {
            //         query += ` and (iru_Status in (1))`
            //     }
            // }
            // query += ` order by iru_Nama asc`

            // const models: any[] = await sequelize.query(query, {
            //     type: QueryTypes.SELECT,
            //     replacements: where,
            // })
            // let datas = models.map((v, k) => {
            //     return {
            //         id: 'pcs-' + v.iru_Id,
            //         nama: v.iru_Nama,
            //         no_katalog: v.iru_NoKatalog,
            //         brand: v.iru_Brand,
            //         reuse: v.iru_Reuse,
            //         jenis: v.iru_Satuan.toLocaleLowerCase(),
            //         tgl_setting: v.iru_LastSetting,
            //         status: v.iru_Status,
            //     }
            // })

            // const last_state = [...datas]

            // datas = []
            // last_state.map((v, k) => {
            //     if (v.jenis === 'pcs') {
            //         let to_push = { ...v }
            //         to_push.id = `pcs-${v.id}`
            //         datas.push(to_push)
            //     }
            // })

            // query = `select * from instrumen_set where (set_Nama is not null) and set_Status <> 9`

            // if (key) {
            //     query += ` and ((set_Nama like :key))`
            //     where['key'] = `%${key}%`
            // }
            // if (status) {
            //     if (status === 'in-use') {
            //         query += ` and (set_Status in (2,3,4))`
            //     } else {
            //         query += ` and (set_Status in (1))`
            //     }
            // }
            // query += ` order by set_Nama asc`

            // const modelSet: any[] = await sequelize.query(query, {
            //     type: QueryTypes.SELECT,
            //     replacements: where,
            // })
            // modelSet.map((v, k) => {
            //     const to_push = {
            //         id: 'set-' + v.set_Id,
            //         nama: v.set_Nama,
            //         no_katalog: '',
            //         brand: '',
            //         reuse: '',
            //         jenis: 'set',
            //         tgl_setting: v.set_LastSetting,
            //         status: v.set_Status,
            //     }
            //     datas.push(to_push)
            // })

            // datas.sort((a, b) => {
            //     if (a.jenis === 'pcs') {
            //         return 1;
            //     }
            // })

            // datas.sort((a, b) => {
            //     if (a.tgl_setting > b.tgl_setting) {
            //         return 1
            //     }
            //     if (a.tgl_setting === null) {
            //         return -1
            //     }
            // })

            // if (jenis) {
            //     datas = datas.filter((v) => {
            //         return (v.jenis.toString().toLowerCase().indexOf(jenis) >= 0)
            //     })
            // }

            let inUse = 0
            let avb = 0
            let datas = [...models]


            datas.map((v, k) => {
                if ([5, 4, 3, 2, 12].indexOf(parseInt(v.status)) >= 0) {
                    inUse++
                } else if (([1]).indexOf(parseInt(v.status)) >= 0) {
                    avb++
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    stats: {
                        inUse: inUse,
                        avb: avb
                    },
                    data: datas,
                }
            })

        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .get('/stok', auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        try {
            const instrumen: any = await sequelize?.query(`select * from instrumen where iru_Status <> 9 order by iru_Nama`, {
                type: QueryTypes.SELECT
            })
            const stok: any = await sequelize?.query(`select * from instrumen_stok`, {
                type: QueryTypes.SELECT
            })
            const institusi: any = await sequelize?.query(`select * from institusi`, {
                type: QueryTypes.SELECT
            })

            let datas: any = []
            instrumen.map((v, k) => {
                let to_push = {
                    id: v.iru_Id,
                    nama: v.iru_Nama,
                    brand: v.iru_Brand,
                    no_katalog: v.iru_NoKatalog,
                    amt: {}
                }

                institusi.map((vv, kk) => {
                    to_push.amt[`${vv.ins_Id}`] = 0
                })

                datas.push(to_push)
            })

            stok.map((v, k) => {
                datas.map((vv, kk) => {
                    if (v.stok_iru_Id === vv.id) {
                        // datas[kk].amt?.[`${v.stok_ins_Id}`] = v.stok_Jumlah 
                        datas[kk]['amt'][`${v.stok_ins_Id}`] = v.stok_Jumlah
                    }
                })
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: 'Success',
                data: datas
            });

        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize?.close()
        }
    })
    .post('/set', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.any(),
            nama: Joi.string().required(),
            tgl_expired: Joi.date().required(),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().min(1).required()
                })
            )
        })

        const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
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
            const InstrumenSetModel = instrumen_set.initModel(sequelize)
            const find = await InstrumenSetModel.findOne({
                where: {
                    set_Status: {
                        notIn: [9]
                    },
                    set_Nama: req.body.nama
                }
            })
            if (find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'Instrumen sudah ada',
                });
            }

            const model = await InstrumenSetModel.create({
                set_InsTime: new Date(),
                set_InsBy: req.logged_user.user_Id,
                set_Nama: req.body.nama,
                set_Status: 1,
                set_ExpDate: req.body.tgl_expired,
            })

            let total = 0
            await Promise.all(
                req.body.list.map(async (v, k) => {
                    const InstrumenSetListModel = instrumen_set_list.initModel(sequelize)
                    const list = await InstrumenSetListModel.create({
                        list_InsTime: new Date(),
                        list_InsBy: req.logged_user.user_Id,
                        list_set_Id: model.set_Id,
                        list_iru_Id: v.instrumen,
                        list_Jumlah: v.amt * 1
                    })
                    total += v.amt * 1
                })
            )

            model.set_ItemTotal = total
            await model.save()

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.set_Id,
                }
            })

        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize.close()
        }
    })
    .put('/set', auth(), async (req, res) => {
        const schema = Joi.object({
            id: Joi.number().required(),
            nama: Joi.string().required(),
            list: Joi.array().items(
                Joi.object().keys({
                    instrumen: Joi.any().required(),
                    amt: Joi.number().min(1).required()
                })
            )
        })

        const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
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
                responseMessage: 'perbaiki inputan',
                errors: errors
            });
        }

        const sequelize: Sequelize = await bky_sequelize()
        try {

            const InstrumenSetModel = instrumen_set.initModel(sequelize)
            const find = await InstrumenSetModel.findOne({
                where: {
                    set_Id: req.body.id,
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'Set tidak ditemukan',
                });
            }
            let total = 0

            const InstrumenSetListModel = instrumen_set_list.initModel(sequelize)

            // await InstrumenSetListModel.up({
            //     where: {
            //         list_set_Id: find.set_Id
            //     }
            // })

            try {
                const result = await sequelize?.transaction(async (tx) => {
                    await sequelize.query(`
                update instrumen_set_list 
                set list_Status = 9, list_UpdTime = :time, list_UpdBy = :by
                where list_set_Id = :set_Id
                `, {
                        type: QueryTypes.UPDATE,
                        replacements: {
                            time: new Date(),
                            by: req.logged_user.user_Id,
                            set_Id: find.set_Id,
                        },
                        transaction: tx,
                    })

                    await Promise.all(
                        req.body.list.map(async (v, k) => {
                            const id_split = v.instrumen.split("-")
                            if (id_split.length >= 2) {
                                const [model, created] = await InstrumenSetListModel.findOrCreate({
                                    defaults: {
                                        list_InsTime: new Date(),
                                        list_InsBy: req.logged_user.user_Id,
                                        list_set_Id: find.set_Id,
                                        list_iru_Id: id_split[1],
                                        list_Jumlah: parseInt(v.amt),
                                        list_Status: 1,
                                    },
                                    where: {
                                        list_set_Id: find.set_Id,
                                        list_iru_Id: id_split[1],
                                    },
                                    transaction: tx
                                })
                                if (!created) {
                                    model.list_Jumlah = parseInt(v.amt)
                                    model.list_Status = 1
                                    model.list_UpdTime = new Date()
                                    model.list_UpdBy = req.logged_user.user_Id
                                    model.save({ transaction: tx })
                                }
                                total += v.amt * 1
                            }

                        })
                    )

                    find.set_Nama = req.body.nama
                    find.set_ItemTotal = total
                    find.set_UpdBy = req.logged_user.user_Id
                    find.set_UpdTime = new Date()
                    await find.save({ transaction: tx })

                    return res.status(200).json({
                        responseCode: "000",
                        responseMessage: "success",
                        data: {
                            id: find.set_Id,
                        }
                    })
                })
            } catch (err) {
                console.log('Instrumen-controller-add', err);
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "failed to add",
                })
            }



        } catch (err) {
            console.log('Instrumen-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize.close()
        }
    })
    .delete('/set/:id', auth(), async (req, res) => {
        const sequelize: Sequelize = await bky_sequelize()
        try {

            const InstrumenSetModel = instrumen_set.initModel(sequelize)
            const find = await InstrumenSetModel.findOne({
                where: {
                    set_Status: {
                        [Op.notIn]: [9]
                    },
                    set_Id: parseInt(req.params.id)
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            find.set_InsTime = new Date()
            find.set_UpdBy = req.logged_user.user_Id            
            find.set_Status = 9
            await find.save()

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    })
    .get('/set/:id', auth(), async (req, res) => {
        const sequelize: Sequelize = await bky_sequelize()
        try {

            const InstrumenSetModel = instrumen_set.initModel(sequelize)
            const find = await InstrumenSetModel.findOne({
                where: {
                    set_Status: {
                        [Op.notIn]: [9]
                    },
                    set_Id: parseInt(req.params.id)
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            const model = {
                id: find?.set_Id,
                nama: find?.set_Nama,
                status: find?.set_Status,
            }

            const list: any = await sequelize.query(`select * 
            from instrumen_set_list 
            join instrumen on instrumen.iru_Id = instrumen_set_list.list_iru_Id
            where list_set_Id = :idd`, {
                type: QueryTypes.SELECT,
                replacements: {
                    idd: find?.set_Id
                }
            })
            const lists = list.map((v: {}, k: any) => {
                return {
                    id: v.iru_Id,
                    nama: v.iru_Nama,
                    no_katalog: v.iru_NoKatalog,
                    brand: v.iru_Brand,
                    amt: v.list_Jumlah
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    set: model,
                    list: lists
                }
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    })
    .get('/set', auth(), async (req, res) => {
        const sequelize: Sequelize = await bky_sequelize()
        try {

            const models = await sequelize.query(`select * from instrumen_set where set_Status <> 9 order by set_Nama`, {
                type: QueryTypes.SELECT
            })
            const datas = models.map((v, k) => {
                return {
                    id: v.set_Id,
                    nama: v.set_Nama,
                    item_total: v.set_ItemTotal,
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: datas
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    })
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize: Sequelize = await bky_sequelize()
        try {

            const InstrumenModel = instrumen.initModel(sequelize)
            const find = await InstrumenModel.findOne({
                where: {
                    iru_Status: {
                        [Op.notIn]: [9]
                    },
                    iru_Id: parseInt(req.params.id)
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            const model = {
                id: find.iru_Id,
                idt: find.iru_Idt,
                nama: find.iru_Nama,
                satuan: find.iru_Satuan,
                no_katalog: find.iru_NoKatalog,
                brand: find.iru_Brand,
                reuse: find.iru_Reuse,
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    instrumen: model,
                }
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    })
    .put('/', auth(), async (req, res) => {

        const schema = Joi.object({
            id: Joi.any().required(),
            idt: Joi.string().allow('').allow(null),
            nama: Joi.string().required(),
            satuan: Joi.string().allow('').allow(null),
            no_katalog: Joi.string(),
            brand: Joi.string(),
            reuse: Joi.number().allow('').allow(null),
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
            const InstruModel = instrumen.initModel(sequelize)
            const find = await InstruModel.findOne({
                where: {
                    iru_Id: req.body.id
                }
            })

            if (!find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'model not found',
                });
            }

            find.iru_Idt = req.body.idt
            find.iru_Nama = req.body.nama
            find.iru_Satuan = req.body.satuan
            find.iru_NoKatalog = req.body.no_katalog
            find.iru_Brand = req.body.brand
            find.iru_Reuse = req.body.reuse ? req.body.reuse : null
            find.iru_UpdBy = req.logged_user.user_Id
            find.iru_UpdTime = new Date()
            await find.save()

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: find.iru_Id,
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
    .post('/', auth(), async (req, res) => {

        const schema = Joi.object({
            id: Joi.any(),
            idt: Joi.string().required(),
            nama: Joi.string().required(),
            satuan: Joi.string().required(),
            tgl_expired: Joi.date().required(),
            no_katalog: Joi.string(),
            brand: Joi.string(),
            reuse: Joi.number().allow(''),
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
            const InstruModel = instrumen.initModel(sequelize)
            const find = await InstruModel.findOne({
                where: {
                    iru_Status: {
                        notIn: [9]
                    },
                    iru_Idt: req.body.idt,
                    iru_Nama: req.body.nama
                }
            })

            if (find) {
                return res.status(400).json({
                    responseCode: "005",
                    responseMessage: 'Instrumen sudah ada',
                });
            }

            const model = await InstruModel.create({
                iru_InsTime: new Date(),
                iru_InsBy: req.logged_user.user_Id,
                iru_Idt: req.body.idt,
                iru_Nama: req.body.nama,
                iru_Satuan: req.body.satuan,
                iru_NoKatalog: req.body.no_katalog,
                iru_Brand: req.body.brand,
                iru_Reuse: req.body.reuse ? req.body.reuse : null,
                iru_ExpDate: req.body.tgl_expired,
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.iru_Id,
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
    .get('/', auth(), async (req, res) => {
        const sequelize: Sequelize = await bky_sequelize()
        try {

            const { action } = req.query

            let query
            let where: any = {}
            const { key, status, jenis } = req.query

            query = `
                    select * from (
                        SELECT concat('pcs-', iru_Id) AS id, iru_Nama AS nama, iru_NoKatalog AS no_katalog, iru_Brand AS brand, iru_Reuse AS REUSE, 
                        iru_Satuan AS jenis, iru_LastSetting AS tgl_setting, iru_ExpDate AS tgl_expired, iru_Status AS status 
                        FROM instrumen WHERE iru_Satuan = 'PCS' AND iru_Status <> 9
                        UNION 
                        SELECT concat('chk-', iru_Id) AS id, iru_Nama AS nama, iru_NoKatalog AS no_katalog, iru_Brand AS brand, iru_Reuse AS REUSE, 
                        iru_Satuan AS jenis, iru_LastSetting AS tgl_setting, iru_ExpDate AS tgl_expired, iru_Status AS status 
                        FROM instrumen WHERE iru_Satuan = 'chk' AND iru_Status <> 9
                        UNION 
                        SELECT concat('pack-', iru_Id) AS id, iru_Nama AS nama, iru_NoKatalog AS no_katalog, iru_Brand AS brand, iru_Reuse AS REUSE, 
                        iru_Satuan AS jenis, iru_LastSetting AS tgl_setting, iru_ExpDate AS tgl_expired, iru_Status AS status 
                        FROM instrumen WHERE iru_Satuan = 'pack' AND iru_Status <> 9
                        UNION 
                        SELECT concat('set-', set_Id) AS id, set_Nama AS nama, '' AS no_katalog, '' AS brand, 0 AS REUSE, 
                        'SET' AS jenis, set_LastSetting AS tgl_setting, set_ExpDate AS tgl_expired, set_Status AS status 
                        FROM instrumen_set WHERE set_Status <> 9
                    ) as subqu
                    where 1=1 
            `

            if (key) {
                query += ` and ((nama like :key))`
                where['key'] = `%${key}%`
            }

            if (jenis) {
                query += ` and ((jenis = :jenis))`
                where['jenis'] = `${jenis}`
            }
            if (status) {
                if (status === 'in-use') {
                    query += ` and (status in (2,3,4,5,12))`
                } else {
                    query += ` and (status in (1))`
                }
            }
            if (action === 'new') {
                query += ` and ((jenis in ('pcs','set','pack'))) and (status in (1))`
            }
            query += ` ORDER BY tgl_expired ASC, FIELD(status, 1,5,4,3,2,12), jenis asc`
            const models: any[] = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: where,
            })

            const datas = models

            // const query = `select * from instrumen where iru_Status <> 9 order by field(iru_Satuan,'pcs','set','chk'), iru_Nama asc, iru_ExpDate asc`
            // const models: any[] = await sequelize.query(query, {
            //     type: QueryTypes.SELECT
            // })
            // let datas = models.map((v, k) => {
            //     return {
            //         id: v.iru_Id,
            //         nama: v.iru_Nama,
            //         no_katalog: v.iru_NoKatalog,
            //         brand: v.iru_Brand,
            //         reuse: v.iru_Reuse,
            //         jenis: v.iru_Satuan.toLocaleLowerCase(),
            //         status: v.iru_Status,
            //         tgl_setting: v.iru_LastSetting,
            //         tgl_expired: v.iru_ExpDate,
            //     }
            // })

            // if (action === 'new') {

            //     const last_state = [...datas]

            //     datas = []
            //     last_state.map((v, k) => {
            //         if (v.jenis === 'pcs') {
            //             let to_push = { ...v }
            //             to_push.id = `pcs-${v.id}`
            //             datas.push(to_push)
            //         }
            //     })

            //     const query = `select * from instrumen_set where (set_Nama is not null) and set_Status <> 9 order by set_ExpDate asc, set_Nama asc`
            //     const models: any[] = await sequelize.query(query, {
            //         type: QueryTypes.SELECT
            //     })
            //     models.map((v, k) => { 
            //         const to_push = {
            //             id: 'set-' + v.set_Id,
            //             nama: v.set_Nama,
            //             no_katalog: '',
            //             brand: '',
            //             reuse: '',
            //             jenis: 'set',
            //             status: v.set_Status,
            //             tgl_setting: v.set_LastSetting,
            //             tgl_expired: v.set_ExpDate,
            //         }
            //         datas.push(to_push)
            //     })

            //     datas = datas.filter((v) => {
            //         const isExp = (dayjs(v.tgl_expired) <= dayjs())
            //         return (v.status === 1) && (!isExp)
            //     })
            // }

            // datas.sort((a, b) => a.nama - b.nama)

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: datas
            })

        } catch (err) {
            console.log('Instrumen-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    },
    )
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

                const InstrumenModel = instrumen.initModel(sequelize)
                const modelInstru = await InstrumenModel.findOne({
                    where: {
                        iru_Id: req.params.id
                    }
                })

                if (!modelInstru) {
                    return res.status(404).json({
                        responseCode: "001",
                        responseMessage: "Model tidak ditemukan",
                    });
                }

                modelInstru.iru_Status = 9;
                modelInstru.iru_UpdBy = req.logged_user.user_Id
                modelInstru.iru_UpdTime = new Date()
                await modelInstru.save()

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
export default InstrumenController; 