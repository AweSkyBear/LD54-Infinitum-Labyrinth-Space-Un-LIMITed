import { exposeToWindow } from '../../common/func'

export type TTopos = 'start-screen' | 'the-game' | 'infinite-roam'

let _currentTopos = null as TTopos

export const setCurrentTopos = (topos: TTopos) => {
  _currentTopos = topos
}

export const getCurrentTopos = () => _currentTopos

exposeToWindow({ getCurrentTopos })
