import {
  ObsDispCreate,
  IObserver,
  dispatchEvent,
  obsDispCreator,
  obsDispEvents,
  removeObs,
} from '../OD'
import { TLevelConfig, levels } from './levels/levels'
import { LevelInfoBarEvents } from './html/createLevelInfoBar'
import { exposeToWindow, isProduction, wait } from '../common/func'
import { addAndRemoveClass, debugLogEvent } from '../common/func'
import { resetRandomFoesRandomizer } from './html/createRandomFoe'
import { setCurrentSeed } from './global/currentSeed'
import { createLevelFoes } from './foes/createLevelFoes'
import { getMazeEl } from './global/getMazeEl'
import { getLevelIndexEl } from './global/getLevelIndexEl'
import { TGenerateSolutionFunc } from './createMaze'

export const createLevelProcessor = obsDispCreator(
  () => {
    const state = {
      levelConfig: levels[0],
      levelInd: 0,
      /** Those to be removed each time we exit a portal */
      createdElements: [] as IObserver[],
      _lastPortalEnteredPayload: null as any,
    }

    const handleLevelStart = async ({ isMovingBack } = { isMovingBack: false }) => {
      exposeToWindow({ levelInd: state.levelInd })

      await wait()

      if (state.levelInd !== 0) {
        ///// handle start of every other than the 1st level
        addAndRemoveClass(getMazeEl(), 'anim-level-started', 1000)
        wait().then(() => addAndRemoveClass(getLevelIndexEl(), 'anim-level-ind-switches', 3000))

        dispatchEvent('INPUT_DISABLE')
        wait(1000).then(() => {
          dispatchEvent('INPUT_ENABLE')

          state.createdElements.push(...(state.levelConfig.handleLevelStart() || []))
        })
      } else {
        state.createdElements.push(...(state.levelConfig.handleLevelStart() || []))
      }

      !isMovingBack && handleLevelIntroText(state.levelConfig)

      dispatchEvent('LEVEL_STARTED', { payload: { levelInd: state.levelInd } })

      return wait(1200)
    }

    // note: we are using state._lastPortalEnteredPayload since we need to call this after level start with
    // the last PORTAL_ENTERED payload
    const handlePortalEntered = (payload: any, reuseLast: boolean = false) => {
      dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)

      const { portal, isMovingBack, fromPortal, seed } = !reuseLast
        ? payload
        : state._lastPortalEnteredPayload
      reuseLast && (state._lastPortalEnteredPayload = null)

      state._lastPortalEnteredPayload = payload

      state.createdElements.push(
        ...(state.levelConfig.handlePortalEntering({
          seed,
          portal,
          isMovingBack,
          fromPortal,
        }) || [])
      )

      setCurrentSeed(seed)
      resetRandomFoesRandomizer()

      !reuseLast && state.createdElements.push(...createLevelFoes())
    }

    const cleanupLastCreatedElements = () => {
      state.createdElements.forEach((elToRemove) => removeObs(elToRemove))
      state.createdElements = []
    }

    const handleLevelSwitch = () => {
      try {
        state.levelConfig = levels[state.levelInd]
      } catch (ex) {
        !isProduction() && console.warn('LEVEL CONFIG DOES NOT EXIST: ', state.levelInd)
      }

      handleLevelStart().then(() => {
        handlePortalEntered(state._lastPortalEnteredPayload, true)
      })
    }
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      GAME_START: () => {
        handleLevelStart()
      },
      LEVEL_SET: (ev) => {
        state.levelInd = ev.payload.levelInd
        if (!ev.payload.levelInd) throw new Error('define levelInd with payload')
        handleLevelSwitch()
      },
      LEVEL_REQUEST_START: (ev) => {
        dispatchEvent(
          ev.payload.levelInd < state.levelInd
            ? 'LEVEL_REQUEST_START_PREVIOUS'
            : 'LEVEL_REQUEST_START_NEXT'
        )

        state.levelInd = ev.payload.levelInd
        if (!ev.payload.levelInd) throw new Error('define levelInd with payload')
        handleLevelSwitch()
      },
      LEVEL_PREV: () => {
        state.levelInd--
        try {
          state.levelConfig = levels[state.levelInd]
        } catch (ex) {
          !isProduction() && console.warn('COULD NOT SWITCH TO PREV LEVEL', state.levelInd)
        }

        handleLevelStart({ isMovingBack: true })
      },
      LEVEL_STORE_CREATED_ELEMENTS: (ev) => {
        const createdElements = ev.payload.createdElements as IObserver[]
        state.createdElements.push(...createdElements)
      },
      LEVEL_CLEAR_CREATED_ELEMENTS: cleanupLastCreatedElements,
      /// HANDLING of events
      PORTAL_EXITED: (ev) => {
        debugLogEvent(ev)

        const { fromSeed, isMovingBack } = ev.payload
        state.levelConfig.handlePortalExited &&
          state.levelConfig.handlePortalExited({ fromSeed, isMovingBack })

        cleanupLastCreatedElements()
      },
      PORTAL_ENTERED: (ev) => {
        dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)

        handlePortalEntered(ev.payload)
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        cleanupLastCreatedElements()
      },
    }
  },
  { id: 'levelProcessor' }
)

const handleLevelIntroText = async (conf: TLevelConfig) => {
  if (conf.introText) {
    await wait(1500)
    dispatchEvent('PLAYER_SPEACH_BUBBLE_SHOW')

    await wait(1000)
    dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
      payload: { text: conf.introText.join(' '), shouldRemain: true, closeable: true },
    })

    await wait(2000)
    dispatchEvent('PLAYER_SPEACH_BUBBLE_HIDE')

    // not needed after we have a close X button (shouldRemain: true)
    // await wait(conf.introText.join(' ').length * 60)
    // dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
  }
}
