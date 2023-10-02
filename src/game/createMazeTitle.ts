import { obsDispCreator, payloadProp } from '../OD'
import { decorateCreateHtmlEl } from '../common/func'
import { getMazeTitle } from './gameUtil'
import { getContainer } from '../common/container'
import { addAndRemoveClass } from '../common/func'

export const createMazeTitle = obsDispCreator(
  () => {
    const state = {
      timeout: null as NodeJS.Timeout,
    }
    const getMazeTitleEl = () => getContainer().querySelector<HTMLElement>('.maze-title')

    const animateMazeTitle = () => {
      clearTimeout(state.timeout)

      state.timeout = addAndRemoveClass(getMazeTitleEl(), 'entering-portal', 1000)
    }

    return {
      MAZE_GENERATED: (ev) => {
        const seed = payloadProp<string>('seed')(ev)
        const titleEl =
          getMazeTitleEl() ||
          decorateCreateHtmlEl(getMazeTitle(seed))((el) => {
            el.classList.add('maze-title')
            getContainer().appendChild(el)
            return el
          })

        titleEl.innerHTML = getMazeTitle(seed)
      },
      PORTAL_ENTERED: () => {
        animateMazeTitle()
      },
    }
  },
  { id: 'maze-title' }
)
