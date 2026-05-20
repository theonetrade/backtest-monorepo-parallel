import * as mongoose from 'mongoose';
import { CandleInterval } from 'backtest-kit';

interface ILogger {
    log(topic: string, ...args: any[]): void;
    debug(topic: string, ...args: any[]): void;
    info(topic: string, ...args: any[]): void;
    warn(topic: string, ...args: any[]): void;
}
declare class LoggerService implements ILogger {
    private _commonLogger;
    log: (topic: string, ...args: any[]) => Promise<void>;
    debug: (topic: string, ...args: any[]) => Promise<void>;
    info: (topic: string, ...args: any[]) => Promise<void>;
    warn: (topic: string, ...args: any[]) => Promise<void>;
    setLogger: (logger: ILogger) => void;
}

interface ScraperMessage {
    id: number;
    channel: string;
    content: string;
    date: Date;
}

declare class ScraperService {
    private readonly loggerService;
    scrapeDay: (channel: string, date: Date) => Promise<ScraperMessage[]>;
}

type ExtractConfig<T = string> = {
    pattern: RegExp;
    group?: number;
    transform?: (raw: string, match: RegExpMatchArray) => T;
    validate?: (value: T) => boolean;
    multi?: boolean;
    optional?: boolean;
};
type FieldMapping = {
    [key: string]: RegExp | ExtractConfig<any>;
};
type ExtractedData<M extends FieldMapping> = {
    [K in keyof M]: M[K] extends ExtractConfig<infer R> ? M[K] extends {
        multi: true;
    } ? R[] : R : M[K] extends RegExp ? string : never;
};
type ParseFormat<T> = {
    [K in keyof T]: RegExp | ExtractConfig<T[K] extends (infer U)[] ? U : T[K]>;
};

interface ParserMessageRaw<M extends FieldMapping> extends ScraperMessage {
    data: ExtractedData<M> | null;
}

declare class ParserService {
    private readonly loggerService;
    parseDay: <M extends FieldMapping>(messages: ScraperMessage[], format: M) => Promise<ParserMessageRaw<M>[]>;
}

type SignalFields = {
    symbol: string;
    direction: "short" | "long";
    entry: {
        from: number;
        to: number;
    };
    targets: number[];
    stoploss: number;
};
declare class CryptoYodaScreenService {
    private readonly loggerService;
    private readonly parserService;
    private readonly scraperService;
    parseDay: (scraperList: ScraperMessage[]) => Promise<ParserMessageRaw<ParseFormat<SignalFields>>[]>;
    screenDay: (date: Date) => Promise<ParserMessageRaw<ParseFormat<SignalFields>>[]>;
}

interface ICandleDto {
    symbol: string;
    interval: CandleInterval;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
interface ICandleRow extends ICandleDto {
    id: string;
    exchangeName: string;
    createDate: Date;
    updatedDate: Date;
}

declare const CandleDbService_base: (new () => {
    readonly loggerService: LoggerService;
    readonly TargetModel: mongoose.Model<any>;
    create(dto: object): Promise<any>;
    update(id: string, dto: object): Promise<any>;
    findById(id: string): Promise<any>;
    findByFilter(filterData: object, sort?: object): Promise<any>;
    findAll(filterData?: object, limit?: number): Promise<any[]>;
    iterate(filterData?: object, sort?: object): AsyncGenerator<any, void, unknown>;
    paginate(filterData: object, pagination: {
        limit: number;
        offset: number;
    }, sort?: object): Promise<{
        rows: any[];
        total: number;
    }>;
}) & Omit<{
    new (TargetModel: mongoose.Model<any>): {
        readonly loggerService: LoggerService;
        readonly TargetModel: mongoose.Model<any>;
        create(dto: object): Promise<any>;
        update(id: string, dto: object): Promise<any>;
        findById(id: string): Promise<any>;
        findByFilter(filterData: object, sort?: object): Promise<any>;
        findAll(filterData?: object, limit?: number): Promise<any[]>;
        iterate(filterData?: object, sort?: object): AsyncGenerator<any, void, unknown>;
        paginate(filterData: object, pagination: {
            limit: number;
            offset: number;
        }, sort?: object): Promise<{
            rows: any[];
            total: number;
        }>;
    };
}, "prototype">;
declare class CandleDbService extends CandleDbService_base {
    readonly loggerService: LoggerService;
    create: (dto: ICandleDto) => Promise<ICandleRow>;
    hasCandle: (symbol: string, interval: CandleInterval, timestamp: number) => Promise<boolean>;
    findBySymbolIntervalTimestamp: (symbol: string, interval: CandleInterval, timestamp: number) => Promise<ICandleRow | null>;
}

declare const ioc: {
    cryptoYodaScreenService: CryptoYodaScreenService;
    candleDbService: CandleDbService;
    scraperService: ScraperService;
    parserService: ParserService;
    loggerService: LoggerService;
};
declare global {
    var core: typeof ioc;
}

export { ioc };
