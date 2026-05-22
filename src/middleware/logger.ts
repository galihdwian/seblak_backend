import bky_sequelize from "../config/sequelize.js";
import { LogRequestIn } from "../modules/models/LogRequestIn.js";

export default function logger() {
    return async function (req, res, next) {
        const sequelize = await bky_sequelize();
        try {
            const LogModel = await LogRequestIn(sequelize);
            const model = await LogModel.create({
                req_target: req.originalUrl,
                req_IP: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress,
                req_agent: req.get('User-Agent'),
                req_header: JSON.stringify(req.headers),
                req_request: JSON.stringify(req.body),
            });
        } catch (err) {
            console.error(err)
        } finally {
            sequelize.close()
        }
        return next()
    }
}