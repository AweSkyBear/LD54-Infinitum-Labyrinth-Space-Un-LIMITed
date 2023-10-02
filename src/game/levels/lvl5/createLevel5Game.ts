import {
  ObsDispCreate,
  IObserver,
  dispatchEvent,
  obsDispCreator,
  obsDispEvents,
  removeObs,
  removeObsById,
} from '../../../OD'
import { createFakeDiamond } from '../../html/lvl5Game/createFakeDiamond'
import { repeat } from 'ramda'
import { createRealDiamond } from '../../html/lvl5Game/createRealDiamond'
import { LVL5_HOAX_DIAMOND_ID } from '../../html/lvl5Game/createHoaxDiamond'
import { setGameStateFlag } from '../../global/gameState'
import { isProduction } from '../../../common/func'

export const createDiamondGame = obsDispCreator(
  () => {
    const TIME_MS_TO_NEXT_PHASE = isProduction() ? 1000 * 5 : 1000 // 1000 * 5 - 5 second wait between events */

    const state = {
      obs: null as IObserver,
      fakeDiamonds: [] as IObserver[],
      realDiamond: null as IObserver,
      phase: -1,
      interval: -1 as any as NodeJS.Timeout,
      paused: false,
    }

    const nextPhase = () => {
      if (state.paused) return

      state.phase = Math.min(state.phase + 1, 9)
      if (state.phase === 0) {
        state.fakeDiamonds.push(...repeat(0, 9).map(createFakeDiamond))
        state.realDiamond = createRealDiamond()
      } else {
        removeOneFakeDiamond()
      }
    }

    const resetGame = () => {
      state.phase = -1
      resetIntervalOnly()
      removeAllDiamonds()
    }

    const resetIntervalOnly = () => {
      killInterval()
      state.interval = setInterval(nextPhase, TIME_MS_TO_NEXT_PHASE)
    }
    const killInterval = () => clearInterval(state.interval)

    const removeOneFakeDiamond = () => {
      const itemToRemove = state.fakeDiamonds.length > 0 && state.fakeDiamonds.pop()
      removeObs(itemToRemove)
    }

    const removeAllDiamonds = () => {
      state.fakeDiamonds.forEach((o) => removeObs(o))
      removeObs(state.realDiamond)
    }

    const diamondGameWon = () => {
      dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 6 } })

      setGameStateFlag('diamondTaken', true)

      removeObsById(LVL5_HOAX_DIAMOND_ID)
      removeObs(state.obs) // remove self - the game
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
        resetGame()
      }),
      LEVEL5_GAME_RESET_FULL: resetGame,
      LEVEL5_GAME_RESET_TIMER: resetIntervalOnly,
      PLAYER_POS_CHANGED: resetIntervalOnly,
      LEVEL5_GAME_WON: diamondGameWon,
      GAME_PAUSE: () => {
        state.paused = true
        killInterval()
      },
      GAME_RESUME: () => {
        state.paused = false
        resetIntervalOnly()
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        resetGame()
        killInterval()
      },
    }
  },
  { id: 'level5-game' }
)
