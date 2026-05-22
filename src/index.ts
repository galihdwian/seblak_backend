import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from "dotenv";
import Excel from "exceljs";
import express from "express";
import http from 'http';
import path from "path";
import bky_sequelize from "./config/sequelize";
import { instrumen } from "./models/instrumen";
import { instrumen_set } from "./models/instrumen_set";
import { instrumen_set_list } from "./models/instrumen_set_list";
import BiologicaltestController from "./modules/BiologicaltestControllers";
import BowiedickController from "./modules/BowiedickControllers";
import CleaningController from "./modules/CleaningControllers";
import DashboardController from "./modules/DashboardController";
import InstrumenControllers from "./modules/InstrumenControllers";
import MesinController from "./modules/MesinControllers";
import PinjamControllers from "./modules/PinjamControllers";
import ReturnControllers from "./modules/ReturnControllers";
import RuanganControllers from "./modules/RuanganControllers";
import SettingController from "./modules/SettingControllers";
import SterilController from "./modules/SterilControllers";
import UsersControllers from "./modules/UsersControllers";

process.env.TZ = 'Asia/Jakarta';

// const __filenameee = fileURLToPath(import.meta.url);
// const __dirnameee = path.dirname(path.dirname(__filenameee));
dotenv.config({ path: path.resolve('.env') });
const { HTTP_PORT, HTTP_HOST, HTTP_DIR } = process.env
let BASE_URL = `${HTTP_HOST}:${HTTP_PORT}`
if (HTTP_DIR) {
  BASE_URL = BASE_URL + HTTP_DIR
}


const app = express()
let server = {}
let options = {}

server = http.createServer(app)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  exposedHeaders: ['Content-Disposition','Content-Type']
}))

app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))
app.use('/dashboard', DashboardController)
app.use('/pinjam', PinjamControllers)
app.use('/user', UsersControllers)
app.use('/ruangan', RuanganControllers)
app.use('/instrumen', InstrumenControllers)
app.use('/return', ReturnControllers)
app.use('/cleaning', CleaningController)
app.use('/mesin', MesinController)
app.use('/setting', SettingController)
app.use('/bowiedick', BowiedickController)
app.use('/biologicaltest', BiologicaltestController)
app.use('/steril', SterilController)

app.get('/', (req, res) => {
  res.status(200).json("OK")
})

const cleanString = (str) => {
  if (typeof str === 'undefined') {
    return ''
  } else if (str === null) {
    return ''
  }
  return str
}

app.get(`/excel`, async (req, res) => {
  const workbook = new Excel.Workbook()
  const UPLOAD_DIR = path.join(process.cwd(), 'public', 'try.xlsx');
  await workbook.xlsx.readFile(UPLOAD_DIR)

  const instrumens = []
  const set_list = []

  try {
    const sequelize = OPEN_SEQUELIZE
    const instrumenModel = instrumen.initModel(sequelize)
    const instrumen_set_list_Model = instrumen_set_list.initModel(sequelize)
    const instrumen_set_Model = instrumen_set.initModel(sequelize)


    workbook.eachSheet((sheet, sheetId) => {
      if (['akun', 'master', 'berceklist', 'tanpa ceklist'].indexOf(sheet.name.toLocaleLowerCase()) < 0) {

        let set_name = ''
        let start_row_instru = false, end_row_instru = false
        let key_end_row = ['TANDA TANGAN SERAH TERIMA INSTRUMEN', 'TANDA TANGAN SERAH TERIMA', 'JUMLAH']
        let set_instrumens = []
        sheet.eachRow((row, rowId) => {
          let instrumen = []
          if (rowId === 5) {
            set_name = row.getCell(1).value?.toString()
          }
          if (start_row_instru && !end_row_instru) {
            if (key_end_row.indexOf(row.getCell(1).value?.toString().toUpperCase()) < 0) {
              instrumen.push(cleanString(row.getCell(2).value?.toString()))
              instrumen.push(cleanString(row.getCell(3).value?.toString()))
              instrumen.push(cleanString(row.getCell(9).value?.toString()))
              instrumen.push(cleanString(row.getCell(4).value?.toString()))
            }
          }
          if ((row.getCell(1).value?.toString().toLocaleLowerCase() === 'no')
            && (row.getCell(2).value?.toString().toLocaleLowerCase() === 'nama instrumen')) {
            start_row_instru = true
          }
          if (key_end_row.indexOf(row.getCell(1).value?.toString().toUpperCase()) >= 0) {
            end_row_instru = true
          }
          if (instrumen.length) {
            set_instrumens.push(instrumen)

            const new_i = [...instrumen]
            new_i.pop()
            let joiner = new_i.join('|')
            if (instrumens.indexOf(joiner) < 0) {
              instrumens.push(joiner);
            }
          }
        })

        set_list.push({
          name: set_name,
          instrumen: set_instrumens,
        })
      }
    })

    instrumens.sort()
    let instrumen_db_mapped = {}
    try {
      await sequelize.query(`truncate instrumen`)
      let bulkIns = []
      instrumens.map((v, k) => {
        const explode = v.split("|")
        bulkIns.push({
          iru_Nama: explode[0],
          iru_NoKatalog: explode[1],
          iru_Brand: explode[2],
          iru_Satuan: 'CHK',
          iru_InsBy: 0,
        })
      })

      await instrumenModel.bulkCreate(bulkIns)

      let find = await instrumenModel.findAll({
        attributes: ['iru_Id', 'iru_Nama', 'iru_NoKatalog', 'iru_Brand']
      })

      Promise.all(find.map((v, k) => {
        const cols = [v.iru_Nama.replace(/\s/g, ""), v.iru_NoKatalog.replace(/\s/g, ""), v.iru_Brand.replace(/\s/g, "")]
        const cols_joiner = cols.join('|')
        instrumen_db_mapped[cols_joiner] = v
      }))

      await sequelize.query('truncate instrumen_set_list')
      await sequelize.query('truncate instrumen_set')

      Promise.all(set_list.map(async (v, k) => {
        if (v.instrumen.length) {
          const modelSet = await instrumen_set_Model.create({
            set_Nama: v.name,
            set_InsBy: 0,
            set_Status: 1
          })
          if (modelSet.set_Id) {
            await Promise.all(v.instrumen.map(async (vv, kk) => {
              if (vv[0].length && vv[3].length) {
                const cols = [vv[0].replace(/\s/g, ""), vv[1].replace(/\s/g, ""), vv[2].replace(/\s/g, "")]
                const cols_joiner = cols.join('|')
                const iru = instrumen_db_mapped[cols_joiner]
                if (iru) {
                  await instrumen_set_list_Model.create({
                    list_InsBy: 0,
                    list_set_Id: modelSet.set_Id,
                    list_Jumlah: vv[3],
                    list_iru_Id: iru['iru_Id']
                  })
                }


              }
            }))

          }
        }
      }))


    } catch (err) {
      console.log(err)
    }

    workbook.eachSheet((sheet, sheetId) => {
      if (sheet.name === 'MASTER') {
        sheet.eachRow(async (row, rowId) => {
          if (row.getCell(3).value?.toString().toLowerCase() === 'tanpa ceklist') {
            try {
              await instrumenModel.create({
                iru_Nama: row.getCell(2).value,
                iru_Satuan: 'PCS',
                iru_InsBy: 0
              })
            } catch (err) {
              console.log(err)
            }
          }
        })
      }
    })


  } catch (err) {
    console.log(err)
  }

  res.status(200).json({
    success: true,
    set_list: set_list,
  })
})

let OPEN_SEQUELIZE

(async () => {
  try {
    OPEN_SEQUELIZE = await bky_sequelize()
  } catch (err) {
    console.log(err)
  }
})()




server.listen(HTTP_PORT, async () => {
  console.log("App running on", HTTP_PORT)
})

// const app = new Elysia({ adapter: node() })
//   .use(cors())
//   .use(UsersControllers)
//   .use(RuanganControllers)
//   .use(InstrumenControllers)
//   .use(PinjamControllers)
//   .use(ReturnControllers)
//   .get("/", () => "Hello Elysia")
//   .listen(PORT, ({ hostname, port }) => {
//     console.log(
//       `🦊 Elysia is running at ${hostname}:${port}`
//     )
//   })
export default BASE_URL;