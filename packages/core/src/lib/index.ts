import "./core/provide";
import { inject, init } from "./core/di";
import TYPES from "./core/types";

import LoggerService from "./services/base/LoggerService";

import ScraperService from "./services/core/ScraperService";
import ParserService from "./services/core/ParserService";
import CryptoYodaScreenService from "./services/screen/CryptoYodaScreenService";

import CandleDbService from "./services/db/CandleDbService";

const baseServices = {
  loggerService: inject<LoggerService>(TYPES.loggerService),
};

const dbServices = {
  candleDbService: inject<CandleDbService>(TYPES.candleDbService),
};

const coreServices = {
  scraperService: inject<ScraperService>(TYPES.scraperService),
  parserService: inject<ParserService>(TYPES.parserService),
};

const screenServices = {
  cryptoYodaScreenService: inject<CryptoYodaScreenService>(TYPES.cryptoYodaScreenService),
}

export const ioc = {
  ...baseServices,
  ...coreServices,
  ...dbServices,
  ...screenServices,
};

init();

declare global {
  var core: typeof ioc;
}

Object.assign(globalThis, { core: ioc });

export default ioc;
