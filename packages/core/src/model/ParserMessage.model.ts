import { ExtractedData, FieldMapping } from "./ParseFormat.model";
import { ScraperMessage } from "./ScraperMessage.model";

export interface ParserMessageRaw<M extends FieldMapping> extends ScraperMessage {
  data: ExtractedData<M> | null;
}

export interface ParserMessageSuccess<M extends FieldMapping> extends ScraperMessage {
  data: ExtractedData<M>;
}
