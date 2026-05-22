import type { Sequelize } from "sequelize";
import { sterilisasi as _sterilisasi } from "./sterilisasi";
import type { sterilisasiAttributes, sterilisasiCreationAttributes } from "./sterilisasi";

export {
  _sterilisasi as sterilisasi,
};

export type {
  sterilisasiAttributes,
  sterilisasiCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const sterilisasi = _sterilisasi.initModel(sequelize);


  return {
    sterilisasi: sterilisasi,
  };
}
