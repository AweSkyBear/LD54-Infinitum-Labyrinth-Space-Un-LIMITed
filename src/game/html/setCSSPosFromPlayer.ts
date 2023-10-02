import { Pos } from '../../common/types'
import { IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { getPlayerEl } from '../global/getPlayerEl'

export const setCSSPosFromPlayer = (el: IHTMLElWrapper, offset: Pos = { x: 0, y: 0 }) => {
  el.el.style.left = `${parseInt(getPlayerEl().style.left) + offset.x}px`
  el.el.style.top = `${parseInt(getPlayerEl().style.top) + offset.y}px`
  return el
}
