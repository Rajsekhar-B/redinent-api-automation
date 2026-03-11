import { v4 as uuidv4 } from 'uuid';

export const createCorrelationId = (): string => `corr-${uuidv4()}`;
