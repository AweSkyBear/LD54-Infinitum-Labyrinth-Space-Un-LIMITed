import { createInteractibleItem } from './createInteractibleItem'
// @ts-ignore
import scrollSVG from '../../svg/scroll3-svgrepo-com.svg'
import { getRandomMazePos } from '../gameUtil'

export const createScrollItem = ({ fullText }: { fullText: string }) => {
  return createInteractibleItem()({
    pos: getRandomMazePos(),
    svg: scrollSVG,
    classname: 'scroll',
    fullText,
  })
}
