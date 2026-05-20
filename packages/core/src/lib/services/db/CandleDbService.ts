import BaseCRUD from "../../common/BaseCRUD";
import { ICandleDto, ICandleRow, CandleModel } from "../../../schema/Candle.schema";
import { readTransform } from "../../../utils/readTransform";
import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import { LoggerService } from "../base/LoggerService";
import { CandleInterval } from "backtest-kit";

const EXCHANGE_NAME = "ccxt_binance";

export class CandleDbService extends BaseCRUD(CandleModel) {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  public create = async (dto: ICandleDto): Promise<ICandleRow> => {
    this.loggerService.log("candleDbService create", { dto });
    const filter = {
      symbol: dto.symbol,
      interval: dto.interval,
      timestamp: dto.timestamp,
    };
    const insertOnly = {
      exchangeName: EXCHANGE_NAME,
      open: dto.open,
      high: dto.high,
      low: dto.low,
      close: dto.close,
      volume: dto.volume,
    };
    const document = await CandleModel.findOneAndUpdate(
      filter,
      { $setOnInsert: insertOnly },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const result = readTransform(document.toJSON()) as unknown as ICandleRow;
    return result;
  };

  public hasCandle = async (symbol: string, interval: CandleInterval, timestamp: number): Promise<boolean> => {
    this.loggerService.log("candleDbService hasCandle", { 
      symbol,
      interval,
      timestamp,
    });
    const candle = await this.findBySymbolIntervalTimestamp(symbol, interval, timestamp);
    return !!candle;
  };

  public findBySymbolIntervalTimestamp = async (symbol: string, interval: CandleInterval, timestamp: number): Promise<ICandleRow | null> => {
    this.loggerService.log("candleDbService findBySymbolIntervalTimestamp", { symbol, interval, timestamp });
    return await await super.findByFilter({ symbol, interval, exchangeName: EXCHANGE_NAME, timestamp });
  };

}

export default CandleDbService;
