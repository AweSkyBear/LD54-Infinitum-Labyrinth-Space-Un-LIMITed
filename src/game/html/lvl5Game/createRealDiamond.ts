import { dispatchEvent, removeObs } from '../../../OD'
import { createInteractibleItem } from '../createInteractibleItem'
// @ts-ignore
import diamondSVG from '../../../svg/diamond6-svgrepo-com.svg'
import { getRandomMazePos } from '../../gameUtil'
import { Pos } from '../../../common/types'

export const createRealDiamond = () => {
  return createInteractibleItem({ id: 'lvl5-real-diamond', name: 'lvl5-real-diamond' })({
    meta: { isRealDiamond: true },
    pos: getRandomMazePos(),
    svg: diamondSVG,
    classname: 'diamond blinking',
    onPlayerInteraction: ({ obs }) => {
      dispatchEvent('LEVEL5_GAME_WON')

      removeObs(obs)
    },
  })
}
