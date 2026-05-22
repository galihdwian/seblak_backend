import crypto from "crypto";
import { Router } from "express";
import fs from "fs";
import Joi from "joi";
import multer from "multer";
import path from "path";
import { Op, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import BASE_URL from "..";
import bky_sequelize from "../config/sequelize";
import auth from "../middleware/auth";
import newSession from "../middleware/session";
import { ruang } from "../models/ruang";
import { sessions } from "../models/sessions";
import { users } from "../models/users";

// Ensure directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for temporary storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024  // 1MB max file size
    },
}).any();

const UsersController = Router()
UsersController
    .post('/auth', async (req, res) => {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        })

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            let errMsg = [];
            let errors = {};

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

        const sequelize = await bky_sequelize();
        try {
            const UserModel = users.initModel(sequelize);
            const findOne = await UserModel.findOne({
                where: {
                    [Op.or]: [{ user_Email: req.body.email }, { user_Uname: req.body.email }]
                }
            });
            if (findOne) {
                if (crypto.createHash('md5').update(req.body.password).digest("hex") === findOne.user_Passw) {

                    const session = await newSession(sequelize, findOne.user_Id)

                    const users = await sequelize.query("select * from users where user_Id = :uid", {
                        replacements: { uid: findOne.user_Id },
                        type: QueryTypes.SELECT
                    })

                    const user = users[0]

                    return res.status(200).json({
                        responseCode: "000",
                        responseMessage: "login success",
                        data: {
                            id: user.user_Id,
                            token: session.sess_Key,
                            expire: session.sess_Expire,
                            full_name: user.user_FullName,
                            email: user.user_Email,
                            user_status: user.user_Status,
                            level: user.user_Level
                        }
                    })
                }
            }

            return res.status(400).json({
                responseCode: "005",
                responseMessage: "invalid email/password",
                errors: {
                    password: "invalid email/password"
                }
            })

        } catch (err) {
            console.log('user-controller-login', err)
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to login",
            })
        } finally {
            sequelize.close()
        }
    })
    .post('/logout', auth(), async (req, res) => {
        const sequelize = await bky_sequelize();
        try {
            const SessionModel = sessions.initModel(sequelize);
            const findOne = await SessionModel.findOne({ where: { sess_Key: req.logged_user.token } });
            if (findOne) {

                findOne.sess_Status = 2;
                await findOne.save();

                return res.status(200).json({
                    responseCode: "000",
                    responseMessage: "logout success",
                })
            }

            return res.status(400).json({
                responseCode: "005",
                responseMessage: "invalid token",
            })

        } catch (err) {
            console.log('user-controller-logout', err)
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to logout",
            })
        } finally {
            sequelize.close()
        }
    })
    .delete('/:id', auth(), async (req, res) => {

        const sequelize = await bky_sequelize()
        try {

            const UserModel = users.initModel(sequelize)
            const model = await UserModel.findOne({
                where: {
                    user_Id: req.params.id
                }
            })

            if (!model) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            await UserModel.update({
                user_Status: 9,
            }, {
                where: {
                    user_Id: model.user_Id
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
            })

        } catch (err) {
            console.log('User-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
        // {
        //     req.body: t.Object({
        //         email: t.String({
        //             required: true,
        //             format: "email"
        //         }),
        //         full_name: t.String(),
        //         password: t.String({
        //             required: true,
        //         })
        //     })
        // }
    )
    .put('/', auth(), async (req, res) => {

        const schema = Joi.object({
            id: Joi.any().required(),
            full_name: Joi.string().required(),
            user_name: Joi.string().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Uname: id,
                                user_Id: {
                                    [Op.notIn]: [req.body.id]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                })
            ,
            email: Joi.string().email().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Email: id,
                                user_Id: {
                                    [Op.notIn]: [req.body.id]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                })
            ,
            phone: Joi.any().required(),
            level: Joi.any().required(),
            ruang_id: Joi.when('level', {
                is: Joi.any().valid("4"),
                then: Joi.any().required()
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
                            return helpers.error('any.invalid')
                        } finally {
                            sequelize?.close()
                        }

                    })
                ,
                otherwise: Joi.allow('').allow(null)
            })
            // .message({'any.invalid': '{{#label}} tidak valid'})
        })



        let error
        try {
            const { value }: any = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true, errors: { language: 'id' } });
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

            const UserModel = users.initModel(sequelize)
            const model = await UserModel.findOne({
                where: {
                    user_Id: req.body.id
                }
            })

            if (!model) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            await UserModel.update({
                user_Email: req.body.email,
                user_Nama: req.body.full_name,
                user_Uname: req.body.user_name,
                user_NoHp: req.body.phone,
                user_Level: req.body.level,
                user_ru_Id: req.body.ruang_id,
            }, {
                where: {
                    user_Id: model.user_Id
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.user_Id,
                }
            })

        } catch (err) {
            console.log('User-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
        // {
        //     req.body: t.Object({
        //         email: t.String({
        //             required: true,
        //             format: "email"
        //         }),
        //         full_name: t.String(),
        //         password: t.String({
        //             required: true,
        //         })
        //     })
        // }
    )
    .post('/', auth(), async (req, res) => {

        const schema = Joi.object({
            id: Joi.any(),
            user_name: Joi.string().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Uname: id,
                                user_Status: {
                                    [Op.notIn]: [9]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                }),
            full_name: Joi.string().required(),
            email: Joi.string().email().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Email: id,
                                user_Status: {
                                    [Op.notIn]: [9]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                })
            ,
            password: Joi.string().min(6).max(12).required(),
            repassword: Joi.any().equal(Joi.ref('password')).required()
                .label('Re password')
                .messages({ 'any.only': '{{#label}} does not match' }),
            phone: Joi.any().required(),
            level: Joi.any().required(),
            ruang_id: Joi.when('level', {
                is: Joi.any().valid("4"),
                then: Joi.any().required()
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
                            return helpers.error('any.invalid')
                        } finally {
                            sequelize?.close()
                        }

                    })
                ,
                otherwise: Joi.allow('').allow(null)
            })
            // .message({'any.invalid': '{{#label}} tidak valid'})
        })



        let error
        try {
            const { value }: any = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true, errors: { language: 'id' } });
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

            // const hasher = new Bun.CryptoHasher('md5');
            // const passw = hasher.update(req.body.repassword).digest('hex');

            const passw = crypto.createHash('md5').update(req.body.repassword).digest('hex');

            const UserModel = users.initModel(sequelize)
            const model = await UserModel.create({
                user_InsTime: new Date(),
                user_InsBy: req.logged_user.user_Id,
                user_Email: req.body.email,
                user_Nama: req.body.full_name,
                user_Uname: req.body.user_name,
                user_NoHp: req.body.phone,
                user_Level: req.body.level,
                user_Passw: passw,
                user_Status: 1,
                user_ru_Id: req.body.ruang_id,
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.user_Id,
                }
            })

        } catch (err) {
            console.log('User-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
        // {
        //     req.body: t.Object({
        //         email: t.String({
        //             required: true,
        //             format: "email"
        //         }),
        //         full_name: t.String(),
        //         password: t.String({
        //             required: true,
        //         })
        //     })
        // }
    )
    .get(`/detail/:id`, auth(), async (req, res) => {
        const sequelize = await bky_sequelize()
        let id = req.params.id

        try {

            const find = await sequelize?.query(`select * from users 
                left join ruang on ruang.ru_Id = users.user_ru_Id
                left join institusi on institusi.ins_Id = ruang.ru_ins_Id
                where user_Id = :id`, {
                type: QueryTypes.SELECT,
                replacements: {
                    id: id
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
                id: v.user_Id,
                email: v.user_Email,
                phone: v.user_NoHp,
                user_name: v.user_Uname,
                full_name: v.user_Nama,
                level: v.user_Level,
                status: v.user_Status,
                ruang_id: v.ru_Id,
                ruang_nama: v.ru_Nama,
                institusi_id: v.ru_ins_Id,
                institusi_nama: v.ins_Nama,
                last_login: v.user_LastLogin,
                avatar: `${BASE_URL}/uploads/${v.user_Avatar}`
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    user: model,
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

            const {level, status, key} = req.query

            let query = `select * from users 
                left join ruang on ruang.ru_Id = users.user_ru_Id
                left join institusi on institusi.ins_Id = ruang.ru_ins_Id
                where (1=1)`
            if (status) {
                query += ` and user_Status = :status`
            }
            if (key) {
                query += ` and ((user_Nama like :key) or (user_Email like :key) or (user_NoHp like :key) )`
            }
            if (level) {
                query += ` and user_Level = :level`
            }
            query += ` order by user_Level asc, user_Nama asc`
            const models: any = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: {
                    status: status,
                    key: `%${key}%`,
                    level: level
                }
            })
            

            const datas = models.map((v, k) => {
                return {
                    id: v.user_Id,
                    email: v.user_Email,
                    phone: v.user_NoHp,
                    full_name: v.user_Nama,
                    user_name: v.user_Uname,
                    level: v.user_Level,
                    status: v.user_Status,
                    ruang_id: v.ru_Id,
                    ruang_nama: v.ru_Nama,
                    institusi_id: v.ru_ins_Id,
                    institusi_nama: v.ins_Nama,
                    last_login: v.user_LastLogin,
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: datas
            })

        } catch (err) {
            console.log('User-controller', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to get",
            })
        } finally {
            sequelize.close()
        }
    },
    )
    .put('/profile', auth(), async (req, res) => {

        const schema = Joi.object({
            full_name: Joi.string().required(),
            user_name: Joi.string().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Uname: id,
                                user_Id: {
                                    [Op.notIn]: [req.logged_user.user_Id]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                })
            ,
            email: Joi.string().email().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_Email: id,
                                user_Id: {
                                    [Op.notIn]: [req.logged_user.user_Id]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `email sudah digunakan`
                })
            ,
            phone: Joi.any().required()
                .external(async (id, helpers) => {
                    const sequelize = await bky_sequelize();
                    try {
                        const userModel = users.initModel(sequelize)
                        const findModel = await userModel.findOne({
                            where: {
                                user_NoHp: id,
                                user_Id: {
                                    [Op.notIn]: [req.logged_user.user_Id]
                                }
                            }
                        })
                        if (findModel) {
                            return helpers.error('any.invalid')
                        }
                    } catch (err) {
                        return helpers.error('any.invalid')
                    } finally {
                        sequelize?.close()
                    }
                })
                .messages({
                    'any.invalid': `no hp sudah digunakan`
                }),
        })



        let error
        try {
            const { value }: any = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true, errors: { language: 'id' } });
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

            const UserModel = users.initModel(sequelize)
            const model = await UserModel.findOne({
                where: {
                    user_Id: req.body.id
                }
            })

            if (!model) {
                return res.status(400).json({
                    responseCode: "002",
                    responseMessage: "not found",
                })
            }

            await UserModel.update({
                user_Email: req.body.email,
                user_Nama: req.body.full_name,
                user_Uname: req.body.user_name,
                user_NoHp: req.body.phone,
            }, {
                where: {
                    user_Id: req.logged_user.user_Id
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
                data: {
                    id: model.user_Id,
                }
            })

        } catch (err) {
            console.log('User-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
        // {
        //     req.body: t.Object({
        //         email: t.String({
        //             required: true,
        //             format: "email"
        //         }),
        //         full_name: t.String(),
        //         password: t.String({
        //             required: true,
        //         })
        //     })
        // }
    )
    .put('/changepassword', auth(), async (req, res) => {

        const schema = Joi.object({
            password: Joi.string().min(6).max(12).required(),
            repassword: Joi.any().equal(Joi.ref('password')).required()
                .label('Re password')
                .messages({ 'any.only': '{{#label}} does not match' }),
        })

        let id = req.logged_user.user_Id

        let error
        try {
            const { value }: any = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true, errors: { language: 'id' } });
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

            // const hasher = new Bun.CryptoHasher('md5');
            // const passw = hasher.update(req.body.repassword).digest('hex');

            const passw = crypto.createHash('md5').update(req.body.repassword).digest('hex');

            const UserModel = users.initModel(sequelize)
            await UserModel.update({
                user_Passw: passw,
            }, {
                where: {
                    user_Id: id
                }
            })

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "success",
            })

        } catch (err) {
            console.log('User-controller-add', err);
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to add",
            })
        } finally {
            sequelize?.close()
        }
    },
        // {
        //     req.body: t.Object({
        //         email: t.String({
        //             required: true,
        //             format: "email"
        //         }),
        //         full_name: t.String(),
        //         password: t.String({
        //             required: true,
        //         })
        //     })
        // }
    )
    .post('/avatar', auth(), async (req, res) => {
        const schema = Joi.object({
            // seo: Joi.string().required(),
        })

        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
            const errMsg = error.details.map((v, k) => { return v.message });
            return res.status(400).json({
                responseCode: "001",
                responseMessage: errMsg
            });
        }


        try {

            let last_uploaded

            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        responseCode: "002",
                        responseMessage: "failed to upd " + err.message,
                    })
                }

                const sequelize = await bky_sequelize();
                try {
                    const userModel = users.initModel(sequelize)
                    const findOne = await userModel.findOne({
                        where: {
                            user_Id: req.logged_user.user_Id
                        }
                    })

                    let files = req.files
                    if (files) {
                        files.forEach((file) => {
                            last_uploaded = file.filename
                        })
                    }

                    if (last_uploaded) {
                        await userModel.update({
                            user_Avatar: last_uploaded
                        }, {
                            where: {
                                user_Id: findOne?.user_Id
                            }
                        })
                    }

                    return res.status(200).json({
                        responseCode: "000",
                        responseMessage: "update success",
                        data: {
                            last_uploaded: `${req.protocol}://${req.get('host')}/uploads/` + last_uploaded
                        }
                    })
                } catch (err) {
                    console.log('Place-controller-add', err)
                    return res.status(400).json({
                        responseCode: "002",
                        responseMessage: "failed to upd " + err.message,
                    })
                } finally {
                    sequelize.close()
                }
            })


        } catch (err) {
            console.log('Place-controller-add', err)
            return res.status(400).json({
                responseCode: "002",
                responseMessage: "failed to upd " + err.message,
            })
        }
    })


export default UsersController  