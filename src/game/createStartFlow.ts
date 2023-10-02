import {
  dispatchEvent,
  ObsDispCreate,
  IObserver,
  obsDispCreator,
  obsDispEvents,
  removeObsById,
  removeObs,
} from '../OD'
import { basedOnPartial } from '../common/func'
import { playSound } from '../common/sound'
import { addHtmlEl, IHTMLElWrapper } from '../htmlEl/addHtmlEl'
import { createFreeRoam } from './createFreeRoam'
import { createGame } from './createGame'
import { TStartMenuButton } from './html/createHeader'
import { creditsHTML, freeRoamInstructionsHtml, gameInstructionsHtml } from './instructions'
import { TAllSignsMap } from '../freeRoam/createUserSignCreator'
import { setMazeSize } from './global/mazeSize'

const _cleanBeforeStart = () => {
  removeObsById('header')
}

const startTheGame = () => {
  _cleanBeforeStart()
  createGame()
}
export const startFreeRoam = (allSignsMap?: TAllSignsMap) => {
  _cleanBeforeStart()
  createFreeRoam({ allSignsMap })
}

export const createStartFlow = obsDispCreator(
  () => {
    const state = {
      obs: null as IObserver,
      showsInstructionsForMode: null as TStartMenuButton,
      instructionsEl: null as IHTMLElWrapper,
    }

    const renderGameInstructions = () => {
      state.showsInstructionsForMode = 'start-the-game'
      state.instructionsEl?.remove()
      document.querySelector('.credits-wrap')?.remove()

      state.instructionsEl = addHtmlEl({ attachTo: document.querySelector('.header') })
        .setHTML(gameInstructionsHtml)
        .then((res) => {
          res.el.querySelector('.start-the-game')?.addEventListener('click', () => {
            dispatchEvent('BUTTON_CLICK', {
              payload: { button: 'start-the-game' as TStartMenuButton },
            })
          })

          res.el.querySelector('.maze-size')?.addEventListener('input', (ev) => {
            const newSize = (ev.target as any).value as string
            const cellCount = parseInt(newSize)

            const sizeVerdict =
              cellCount < 4
                ? 'Microscopic'
                : cellCount <= 6
                ? 'Miniscule'
                : cellCount < 10
                ? 'Tiny'
                : cellCount === 10
                ? 'Original'
                : cellCount < 20
                ? 'Big'
                : cellCount < 30
                ? 'Large'
                : cellCount < 50
                ? 'EXTREME BIG!!!'
                : ''

            res.el.querySelector(
              '.maze-size-choice'
            ).innerHTML = `${newSize} cells - ${sizeVerdict}`

            setMazeSize(parseInt(newSize), parseInt(newSize))
          })
        })
    }

    const renderFreeRoamInstructions = () => {
      state.showsInstructionsForMode = 'start-free-roam'
      state.instructionsEl?.remove()
      document.querySelector('.credits-wrap')?.remove()

      state.instructionsEl = addHtmlEl({ attachTo: document.querySelector('.header') })
        .setHTML(freeRoamInstructionsHtml)
        .then((res) => {
          res.el.querySelector('.start-free-roam')?.addEventListener('click', () => {
            dispatchEvent('BUTTON_CLICK', {
              payload: { button: 'start-free-roam' as TStartMenuButton },
            })
          })
        })
    }

    const renderCredits = () => {
      state.showsInstructionsForMode = 'credits'
      state.instructionsEl?.remove()
      state.instructionsEl = addHtmlEl({ attachTo: document.querySelector('.header') }).setHTML(
        creditsHTML
      )
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
      }),
      BUTTON_CLICK: (ev) => {
        const button = ev.payload.button as string
        basedOnPartial({
          'start-the-game': () => {
            !(state.showsInstructionsForMode === 'start-the-game')
              ? [renderGameInstructions(), playSound('buttonClick')]
              : [startTheGame(), playSound('startLevel'), removeObs(state.obs)]
          },
          'start-free-roam': () => {
            !(state.showsInstructionsForMode === 'start-free-roam')
              ? [renderFreeRoamInstructions(), playSound('buttonClick')]
              : [startFreeRoam(), playSound('startLevel'), removeObs(state.obs)]
          },
          credits: () => {
            !(state.showsInstructionsForMode === 'credits') && [
              renderCredits(),
              playSound('buttonClick'),
            ]
          },
        })(button as TStartMenuButton)
        //   renderMFaze({ seed: '123456' })
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        state.instructionsEl?.remove()
      },
    }
  },
  { id: 'start-flow' }
)
