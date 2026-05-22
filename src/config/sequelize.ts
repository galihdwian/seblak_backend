import dotenv from "dotenv";
import path from "path";
import { Sequelize } from "sequelize";

export default async function bky_sequelize() {
    dotenv.config({ path: path.resolve('.env') });
    try {
        const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT } = process.env
        const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
            host: DB_HOST,
            port: DB_PORT,
            dialect: 'mysql',
            logging: false,
            define: {
                timestamps: false,
                freezeTableName: true
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
        await sequelize
            .authenticate()
            .then(() => {
                // console.log((new Date()).toLocaleString()  +  ' sequelize connect')
            })
            .catch((err) => {
                throw err;
            })
        return sequelize
    } catch (err) {
        console.log('sequelize', '::', err)
    }
}