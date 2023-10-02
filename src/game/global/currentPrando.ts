import { getCurrentPrando } from './currentSeed'

export const getNextRandomDeg = () => getCurrentPrando().next(0, 359)
