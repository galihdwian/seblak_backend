import { QueryTypes } from "sequelize";
import bky_sequelize from "../config/sequelize.js";

export default function auth(role = '') {

    return async function (req, res, next) {

        let token = String(req.get('Authorization'));

        if (role !== 'is_logged') {
            if (!token) {
                return res.status(401).json({
                    responseCode: "001",
                    responseMessage: 'Token key missing'
                })
            }
        }

        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7, token.length)
            }

            const sequelize = await bky_sequelize()
            try {
                let query = `select * from sessions join users on sessions.sess_user_Id = users.user_Id where sess_Key = :token and sess_Status = 1 and user_Status not in (8,9)`
                query += " limit 1"

                const model = await sequelize.query(query, {
                    type: QueryTypes.SELECT,
                    replacements: {
                        token: token
                    }
                })
                const findOne = model[0]
                if (findOne == null) {
                    if (role === 'is_logged') {
                        req.is_logged = false
                        return next()
                    } else {
                        return res.status(401).json({
                            responseCode: "009",
                            responseMessage: 'Token not valid'
                        })
                    }
                } else {
                    const users = await sequelize.query("select * from users where user_Id = :uid", {
                        replacements: { uid: findOne.sess_user_Id },
                        type: QueryTypes.SELECT
                    })

                    const user = users[0]
                    req.is_logged = true
                    req.logged_user = user
                    req.logged_user.token = token
                    return next()
                }

            } catch (err) {
                console.log(err)
                return res.status(401).json({
                    responseCode: "001",
                    responseMessage: 'Token check failed'
                })
            } finally {
                sequelize.close()
            }



            // if (role?.allowed) {
            //     if (role.allowed === 'all') {
            //         return next()
            //     } else if (role.allowed === 'superadmin') {
            //         if (user?.role_Name.toString().toLowerCase() === role.allowed) {
            //             return next()
            //         }
            //     } else {
            //         if (role.allowed.includes(user?.role_Name.toString().toLowerCase())) {
            //             return next()
            //         }
            //     }
            //     return res.status(400).json({
            //         responseCode: "001",
            //         responseMessage: 'you\'re not allowed to access this',
            //     })
            // } else if (role?.allowed_feature) {
            //     if (!user?.role_Data.includes(role.allowed_feature)) {
            //         return res.status(400).json({
            //             responseCode: "001",
            //             responseMessage: 'you\'re not allowed to action this feature',
            //         })
            //     }
            //     next()
            // } else {
            //     return next()
            // }

        }
    }
}