import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents, payload } from '../OD'
import { defaultTo } from 'ramda'
import { createRandomDuckSvg } from '../svg/createRandomDuckSvg'
import { getRandomArrayItem } from './global/genericPrando'
import { LevelInfoBarEvents } from './html/createLevelInfoBar'
import { levels } from './levels/levels'

const NEW_HINT_FOR = 10

export const createHints = obsDispCreator(
  () => {
    const state = {
      fruitCollectedCount: 0,
      usedHintCount: 0,
      //
      levelHints: [] as string[],
      currentLevelHintInt: -1,
    }

    const getSwearingWithB = () =>
      getRandomArrayItem(['b*tch!', '**tch!', 'bi*ch', 'b*t*h', 'b**ch'])

    const getNeededForNextHintCount = () => state.usedHintCount * NEW_HINT_FOR + NEW_HINT_FOR
    const getNeededForNextHintMsg = () => {
      return `Fruit count: ${
        state.fruitCollectedCount
      }🍉 of ${getNeededForNextHintCount()}🍉 needed for next hint.
        You've used ${state.usedHintCount} 🪩 hints in total<br>`
    }

    const getNoMoreHintsHereAreAllForLevelMsg = () => `
        ${createRandomDuckSvg()} ${getNeededForNextHintMsg()}
        No more hints for you on this level, you sugary babeee.<br> 
        Here are the ones I already gave you:<br><br><hr>

        ${state.levelHints.join('<br><br>')}
        ...
    `

    const checkAlreadyShowedLastHint = () =>
      state.currentLevelHintInt === state.levelHints.length - 1
    const handleShowNextLevelHint = () => {
      const nextHint = state.levelHints[state.currentLevelHintInt + 1]
      if (nextHint && !checkAlreadyShowedLastHint()) {
        dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
          payload: {
            text: `${createRandomDuckSvg()} You have ${
              state.fruitCollectedCount
            }🍉. I will use ${getNeededForNextHintCount()}🍉
                <br>Here's your next clue, <em> you ${getSwearingWithB()}</em>
                <br><br>
                ${state.levelHints[++state.currentLevelHintInt]}`,
            closeable: true,
          },
        })

        state.usedHintCount++
      } else
        dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
          payload: {
            text:
              state.levelHints.length > 0
                ? getNoMoreHintsHereAreAllForLevelMsg()
                : `${createRandomDuckSvg()} ${getNeededForNextHintMsg()} I will give you NO hint for this level... <br> 💩 muahhahahaha 🌵`,
            closeable: true,
          },
        })
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      FRUIT_COUNT_UPDATED: (ev) => {
        state.fruitCollectedCount = ev.payload.count
      },
      HINT_REQUEST_GET: () => {
        const canUseHint =
          state.fruitCollectedCount - state.usedHintCount * NEW_HINT_FOR >= NEW_HINT_FOR ||
          checkAlreadyShowedLastHint()

        const lastHint = state.levelHints[state.currentLevelHintInt]
        canUseHint
          ? handleShowNextLevelHint()
          : dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
              payload: {
                text: `${createRandomDuckSvg()} ${getNeededForNextHintMsg()}
                ${
                  lastHint
                    ? `<br>You last hint: ${state.levelHints[state.currentLevelHintInt]}`
                    : ''
                }
                ...<br>...<br>...<br>...<br><br>
                <em>Just so you know, you ${getSwearingWithB()}!</em>
                `,
                closeable: true,
              },
            })

        //// disallow moving when reading a hint
        dispatchEvent('INPUT_DISABLE')
      },
      LEVEL_STARTED: (ev) => {
        state.currentLevelHintInt = -1
        state.levelHints = defaultTo([], levels[ev.payload.levelInd]?.hints)
      },
    }
  },
  { id: 'hints' }
)
