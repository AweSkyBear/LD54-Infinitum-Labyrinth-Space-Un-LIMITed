import { dispatchEvent, removeObs } from '../../../OD'
import { createInteractibleItem } from '../createInteractibleItem'
// @ts-ignore
import diamondSVG from '../../../svg/diamond6-svgrepo-com.svg'
import { getRandomMazePos } from '../../gameUtil'

export const createFakeDiamond = () => {
  return createInteractibleItem()({
    pos: getRandomMazePos(),
    svg: diamondSVG,
    classname: 'diamond blinking',
    onPlayerInteraction: ({ obs }) => {
      dispatchEvent('LEVEL5_GAME_RESET_FULL')

      removeObs(obs)
    },
  })
}
