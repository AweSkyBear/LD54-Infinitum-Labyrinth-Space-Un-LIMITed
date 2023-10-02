import { exposeToWindow } from '../../common/func'

/**
 * Whether to create less of a hectic game - e.g. for example
 * turn enemies off
 */
let _isCalmMode = false

export const setCalmMode = (flag: boolean) => (_isCalmMode = flag)
export const getIsCalmMode = () => _isCalmMode

exposeToWindow({ setCalmMode, getIsCalmMode })
