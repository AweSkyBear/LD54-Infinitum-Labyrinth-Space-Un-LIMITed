import { dispatchEvent, removeObs } from '../../../OD'
import { createInteractibleItem } from '../createInteractibleItem'
// @ts-ignore
import diamondSVG from '../../../svg/diamond6-svgrepo-com.svg'
import { getRandomMazePos } from '../../gameUtil'

export const LVL5_HOAX_DIAMOND_ID = 'level5-hoax-diamond'

export const createHoaxDiamond = () => {
  return createInteractibleItem({ id: LVL5_HOAX_DIAMOND_ID })({
    pos: getRandomMazePos(),
    svg: diamondSVG,
    classname: 'diamond',
    onPlayerInteraction: ({ obs }) => {
      dispatchEvent('LEVEL5_GAME_RESET_FULL')

      // destroy and create on a random pos
      setTimeout(() => {
        removeObs(obs)
        createHoaxDiamond()
      })
    },
  })
}
