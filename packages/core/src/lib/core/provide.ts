import LoggerService from "../services/base/LoggerService";

import CandleDbService from "../services/db/CandleDbService";

import ParserService from "../services/core/ParserService";
import ScraperService from "../services/core/ScraperService";
import CryptoYodaScreenService from "../services/screen/CryptoYodaScreenService";

import { provide } from "./di";
import TYPES from "./types";

{
    provide(TYPES.loggerService, () => new LoggerService());
}

{
    provide(TYPES.candleDbService, () => new CandleDbService());
}

{
    provide(TYPES.scraperService, () => new ScraperService());
    provide(TYPES.parserService, () => new ParserService());
}

{
    provide(TYPES.cryptoYodaScreenService, () => new CryptoYodaScreenService());
}
