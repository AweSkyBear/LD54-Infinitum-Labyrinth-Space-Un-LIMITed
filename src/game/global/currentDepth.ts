import { getCurrentSeed } from './currentSeed'

/** The depth level we are at inside the maze */
export const getCurrentDepth = () => getCurrentSeed().length - 1
