import { inject } from "../../core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "../../core/types";
import { ScraperMessage } from "../../../model/ScraperMessage.model";
import {
    ExtractConfig,
    ExtractedData,
    FieldMapping,
} from "../../../model/ParseFormat.model";
import { ParserMessageRaw } from "../../../model/ParserMessage.model";

const TO_CONFIG_FN = (spec: RegExp | ExtractConfig<any>): ExtractConfig<any> =>
    spec instanceof RegExp ? { pattern: spec } : spec;

const EXTRACT_DATA_FN = <M extends FieldMapping>(
    text: string,
    format: M,
): ExtractedData<M> | null => {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(format)) {
        const cfg = TO_CONFIG_FN(format[key]);

        if (cfg.multi) {
            if (!cfg.pattern.global) {
                throw new Error(
                    `parserService field "${key}" is multi but pattern is not global`,
                );
            }
            const matches = Array.from(text.matchAll(cfg.pattern));
            if (matches.length === 0) {
                if (!cfg.optional) return null;
                result[key] = [];
                continue;
            }
            const values = matches.map((m) => {
                const raw = m[cfg.group ?? 1] ?? m[0];
                return cfg.transform ? cfg.transform(raw, m) : raw;
            });
            if (cfg.validate && !values.every((v) => cfg.validate!(v))) {
                return null;
            }
            result[key] = values;
            continue;
        }

        const match = text.match(cfg.pattern);
        if (!match) {
            if (!cfg.optional) return null;
            continue;
        }
        const raw = match[cfg.group ?? 1] ?? match[0];
        const value = cfg.transform ? cfg.transform(raw, match) : raw;
        if (cfg.validate && !cfg.validate(value)) {
            return null;
        }
        result[key] = value;
    }

    return result as ExtractedData<M>;
};

export class ParserService {
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    public parseDay = async <M extends FieldMapping>(
        messages: ScraperMessage[],
        format: M,
    ): Promise<ParserMessageRaw<M>[]> => {
        this.loggerService.log("parserService parseDay", {
            messagesLen: messages.length,
        });

        const result: ParserMessageRaw<M>[] = [];

        for (const msg of messages) {
            const extracted = EXTRACT_DATA_FN(msg.content, format);
            result.push({
                ...msg,
                data: extracted,
            });
        }

        return result;
    };
}

export default ParserService;
