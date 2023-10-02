import { compose, defaultTo } from 'ramda'
import { escapeHtml, wait } from '../common/func'
import { getContainer } from '../common/container'
import { TPortalWithPos } from './createPortals'
import { getPortalTitleBySeed } from './levels/portalNamesMap'
import { getMazeSize } from '../game/global/mazeSize'
import { Pos } from '../common/types'
import { IHTMLElWrapper } from '../htmlEl/addHtmlEl'
import { dispatchEvent, getAllObservers, removeObs } from '../OD'

export const findCell = (pos: { x: number; y: number }) =>
  getContainer().querySelector<HTMLElement>(
    `.row:nth-child(${pos.y + 1}) > .cell:nth-child(${pos.x + 1})`
  )
export const matchesPos = (pos: { x: number; y: number }) => (portal: TPortalWithPos) =>
  portal.pos.x === pos.x && portal.pos.y === pos.y

export const getReadablePortalTitle = (seed: string = '', isMovingBack = false) =>
  compose(
    (seed: string) => defaultTo([], seed.match(/.{1,2}/g)).join('&nbsp;'),
    (seed: string) => (isMovingBack ? getMazePreviousSeed(seed) : seed)
  )(seed)

/**
 * Since our seeds would always start with 0, remove it from the title
 */
export const getMazeTitle = (seed: string = '0') =>
  seed === '0' ? escapeHtml('<The Genesis Maze>') : getReadablePortalTitle(seed.substring(1))
export const getMazePreviousSeed = (seed: string) => seed.slice(0, -1)

export const getPortalTitle = (
  seed: string,
  currentSeed: string,
  isMovingBack: boolean,
  backToSymbol: string,
  customTitle = false
) =>
  `${
    (seed === currentSeed && !isMovingBack) || currentSeed?.slice(0, -1) === seed
      ? `<span class="back-to">${backToSymbol}${getReadablePortalTitle(
          currentSeed?.slice(1, -1),
          isMovingBack
        )}</span>`
      : !customTitle
      ? /**/ getMazeTitle(seed)
      : /**/ defaultTo(getMazeTitle(seed), getPortalTitleBySeed(seed))
  }`
// }${!customTitle ? getMazeTitle(seed) : defaultTo(getMazeTitle(seed), getPortalTitleBySeed(seed))}

export const isEdgePos = (pos: Pos) => {
  return [
    [0, 0],
    [0, getMazeSize().cols - 1],
    [getMazeSize().rows - 1, 0],
    [getMazeSize().rows - 1, getMazeSize().cols - 1],
  ].find((edge) => edge[0] === pos.x && edge[1] === pos.y)
}

export const getRandomMazePos = () => {
  const pos: Pos = { x: 0, y: 0 }
  // we don't want edge positions / they are with portals
  do {
    pos.x = parseInt((Math.random() * getMazeSize().cols) as any)
    pos.y = parseInt((Math.random() * getMazeSize().rows) as any)
  } while (isEdgePos(pos))

  return pos
}

const _getInnerEl = (elOrElWrapper: IHTMLElWrapper | HTMLElement) =>
  defaultTo(elOrElWrapper, (elOrElWrapper as IHTMLElWrapper)?.el) as HTMLElement

export const setCSSAbsPosByCell = (elWrapper: IHTMLElWrapper | HTMLElement, pos: Pos) => {
  const cell = findCell(pos)
  if (!cell) return {}

  const htmlEl = _getInnerEl(elWrapper)
  if (!htmlEl) return

  htmlEl.style.transition = '0.2s all'
  htmlEl.style.position = `absolute`
  htmlEl.style.top = `${cell.offsetTop}px`
  htmlEl.style.left = `${cell.offsetLeft}px`
}

export const setCSSRotationDeg = (elWrapper: IHTMLElWrapper | HTMLElement, angle: number) => {
  const htmlEl = _getInnerEl(elWrapper)
  htmlEl && (htmlEl.style.rotate = `${angle}deg`)
}

export const stringifyPos = (pos: Pos) => `${pos.x}to${pos.y}`

export const parseStringifiesPos = (posStr: string) => {
  const arr = posStr.split('to').map(parseInt)
  return { x: arr[0], y: arr[1] } as Pos
}

export const resetGameRaw = async () => {
  dispatchEvent('MUSIC_STOP')

  wait().then(() => {
    getAllObservers().forEach((o) => removeObs(o))

    document.querySelector('#maze').innerHTML = ''
    ;(window as any).run('#maze')

    // remove the hash
    history.pushState('', document.title, window.location.pathname + window.location.search)
    // re-run init logic
    ;(window as any).run('#maze') // see index.html
  })
}
