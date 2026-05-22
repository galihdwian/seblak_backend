
import crypto from "crypto";   
import { sessions } from "../models/sessions";

export default async function newSession(sequelize, user_id) {
    const SessionModel = sessions.initModel(sequelize);

    const updateFirst = await SessionModel.update(
        { sess_Status: 9 },
        {
            where: {
                sess_user_Id: user_id,
                sess_Status: 1,
            }
        }
    )

    if (updateFirst) {

        const sesKey = crypto.randomBytes(32).toString("base64")
        const model = await SessionModel.create({
            sess_user_Id: user_id,
            sess_InsTime: new Date(),
            sess_Expire: new Date(),
            sess_Key: sesKey,
            sess_Status: 1
        })
        return model
    }

}