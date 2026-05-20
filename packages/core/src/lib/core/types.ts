const baseServices = {
    loggerService: Symbol('loggerService'),
};

const dbServices = {
    candleDbService: Symbol('candleDbService'),
}

const coreServices = {
    scraperService: Symbol('scraperService'),
    parserService: Symbol('parserService'),
}

const screenServices = {
    cryptoYodaScreenService: Symbol('cryptoYodaScreenService'),
}

export const TYPES = {
    ...baseServices,
    ...dbServices,
    ...coreServices,
    ...screenServices,
}

export default TYPES;
