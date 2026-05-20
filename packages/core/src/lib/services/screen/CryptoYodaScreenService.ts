import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ParseFormat } from "../../../model/ParseFormat.model";
import ParserService from "../core/ParserService";
import { ScraperMessage } from "../../../model/ScraperMessage.model";
import ScraperService from "../core/ScraperService";

const CHANNEL_NAME = "crypto_yoda_channel";

const num = (s: string) => parseFloat(s.replace(",", "."));
const isNum = (v: number) => Number.isFinite(v) && v > 0;

type SignalFields = {
    symbol: string;
    direction: "short" | "long";
    entry: { from: number; to: number };
    targets: number[];
    stoploss: number;
};

const SIGNAL_FORMAT: ParseFormat<SignalFields> = {
    symbol: {
        pattern: /#([A-Z0-9]+)\/USDT/,
        group: 1,
        validate: (v) => v.length > 0,
    },
    direction: {
        pattern: /(ШОРТ|ЛОНГ)/i,
        transform: (raw) => (raw.toUpperCase() === "ШОРТ" ? "short" : "long"),
        validate: (v) => v === "short" || v === "long",
    },
    entry: {
        pattern: /зоне\s+\$?([\d.,]+)\s*[-–—]\s*(?:\$?[\d.,]+\s*[-–—]\s*)?\$?([\d.,]+)(?=\s)/i,
        transform: (_, m) => ({ from: num(m[1]), to: num(m[2]) }),
        validate: (v) => isNum(v.from) && isNum(v.to) && v.from < v.to,
    },
    targets: {
        pattern: /Закрыть(?:\s+ордер)?\s+по(?:\s+цене)?\s+\$?([\d.,]+)/gi,
        transform: (_, m) => num(m[1]),
        validate: (v) => isNum(v),
        multi: true,
    },
    stoploss: {
        pattern: /СТОП-?ЛОСС:\s*\$?([\d.,]+)/i,
        transform: (_, m) => num(m[1]),
        validate: (v) => isNum(v),
    },
};

export class CryptoYodaScreenService {
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
    private readonly parserService = inject<ParserService>(TYPES.parserService);
    private readonly scraperService = inject<ScraperService>(TYPES.scraperService);

    public parseDay = async (scraperList: ScraperMessage[]) => {
        this.loggerService.log("cryptoYodaScreenService screenDay", {
            scraperListLen: scraperList.length,
        });
        const parserList = await this.parserService.parseDay(scraperList, SIGNAL_FORMAT);
        return parserList;
    }

    public screenDay = async (date: Date) => {
        this.loggerService.log("cryptoYodaScreenService screenDay", {
            date,
        });
        const scraperList = await this.scraperService.scrapeDay(CHANNEL_NAME, date);
        return await this.parseDay(scraperList);
    }
}

export default CryptoYodaScreenService;
