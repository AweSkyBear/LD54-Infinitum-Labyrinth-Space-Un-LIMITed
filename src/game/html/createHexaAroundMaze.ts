import { ObsDispCreate, obsDispCreator, obsDispEvents } from '../../OD'
import { addSVG } from '../../htmlEl/addSVG'
// @ts-ignore
import hexagonSVG from '../../svg/hexagon.svg'
import { IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { getFirstMazeCellEl } from '../global/getFirstMazeCellEl'
import { setStylePosRelativeTo } from './setStylePosRelativeTo'
import { MAZE_CELL_SIZE } from '../const'
import { getMazeSize } from '../global/mazeSize'

export const createHexaAroundMaze = obsDispCreator(() => {
  const state = {
    hexaEl: null as IHTMLElWrapper,
    currentOpacity: 0, // 0.1,
  }

  const updateHexaSizePos = () => {
    setStylePosRelativeTo(state.hexaEl, getFirstMazeCellEl(), { x: 150 * 1.5, y: -150 * 1.5 })

    state.hexaEl.el.style.width = `${getMazeSize().rows * MAZE_CELL_SIZE + 300}px`
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    GAME_START: async () => {
      state.hexaEl = addSVG({
        attrs: { class: 'maze-hexa', style: 'opacity: 0' },
        svg: hexagonSVG,
      })

      setTimeout(() => {
        updateHexaSizePos()
        state.hexaEl.el.style.opacity = `${state.currentOpacity}`
      })
      //   renderMFaze({ seed: '123456' })
    },
    HEXA_ROTATE: () => state.hexaEl.el.classList.add('rotate'),
    HEXA_ROTATE_STOP: () => {
      state.hexaEl.el.classList.remove('rotate')
    },
    HEXA_HIDE: () => (state.hexaEl.el.style.opacity = '0'),
    HEXA_SHOW: () => {
      state.currentOpacity = Math.max(0.1, state.currentOpacity)
      state.hexaEl.el.style.opacity = `${state.currentOpacity}`
    },
    DPI_CHANGE: () => {
      updateHexaSizePos()
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      state.hexaEl.remove()
    },
  }
})
