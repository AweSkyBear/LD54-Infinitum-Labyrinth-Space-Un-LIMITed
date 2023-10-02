import { dispatchEvent, removeObs } from '../../OD'
import { Pos } from '../../common/types'
import { getCurrentSeed } from '../global/currentSeed'
import { createInteractibleItem } from './createInteractibleItem'

export const createFruit = ({ pos }: { pos: Pos }) => {
  return createInteractibleItem()({
    pos,
    html: '🍉',
    classname: 'fruit',
    onPlayerInteraction: ({ obs, state }) => {
      removeObs(obs)

      dispatchEvent('FRUIT_COLLECTED', { payload: { seed: getCurrentSeed(), pos: state.pos } })
    },
  })
}
