import { exposeToWindow } from '../../common/func'

/** The global seed 'name' - appended onto seeds throughout the game/free roam */
let _seedSuffix = ''

/** Control the global seed 'name' - prepended/appended onto seeds throughout the game/free roam */
export const setSeedSuffix = (seedName: string) => (_seedSuffix = seedName)
export const getSeedSuffix = () => _seedSuffix

exposeToWindow({ setSeedSuffix, getSeedSuffix })
