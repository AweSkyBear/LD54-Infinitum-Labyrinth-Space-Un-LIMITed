import {
  dispatchEvent,
  ObsDispCreate,
  // GlobalObservers,
  obsDispCreator,
  obsDispEvents,
  removeObs,
} from '../../../OD'
import { getContainer } from '../../../common/container'
import { wait } from '../../../common/func'
import { addHtmlEl } from '../../../htmlEl/addHtmlEl'
import { resetGameRaw } from '../../gameUtil'
import { createDuckPalmSvg } from '../../../svg/createDuckPalmSvg'

export const createGameWonCutscene = obsDispCreator(() => {
  const state = {}

  const getMazeEl = () => document.querySelector<HTMLElement>('#maze')
  const getGameEndText = () => document.body.querySelector<HTMLElement>('.game-end-text')

  const blurMaze = () => getMazeEl().classList.add('slow-blur')
  const setMazeBlurred = () => getMazeEl().classList.add('blurred')
  const scaleTextAndDuckPalm = () => {
    getGameEndText().classList.add('slow-scale-up')
    getGameEndText().querySelector('.well-done').classList.add('zoom-duck-in')
  }

  const showGameWonText = () =>
    addHtmlEl({ attachTo: document.body }).setHTML(`
      <h1 class="game-end-text">
        <p class="well-done">${createDuckPalmSvg()} Well done, Doughnuty...</p>
        End of Part 1
      </h1>
    `)

  const clean = () => {
    getMazeEl().classList.remove('blurred')
    getGameEndText().remove()
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    GAME_WON: async () => {
      dispatchEvent('INPUT_DISABLE')

      blurMaze()

      await wait(5000)

      showGameWonText()
      setMazeBlurred()

      await wait(3000)

      scaleTextAndDuckPalm()

      await wait(10000)

      // (raw) reset the whole game
      clean()
      resetGameRaw()
    },
  }
})
