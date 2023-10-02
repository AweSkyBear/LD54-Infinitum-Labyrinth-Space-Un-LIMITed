import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents } from '../OD'
import { setGameStateFlag } from '../game/global/gameState'
import { basedOnPartial } from './func'
import { Func } from './types'

export const createInput = obsDispCreator(
  () => {
    const state = {
      inputEnabled: true,
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      spaceOnes: false,
      __lastEvent: null as Event,
      __canSpaceOnes: true,
    }

    const handleKeyOfInterest = (cb: Func<never, void>) => () => {
      if (!state.inputEnabled) return

      state.__lastEvent.preventDefault()
      cb()
    }

    const handleSpaceDown = handleKeyOfInterest(() => {
      state.space = true

      /// RAW CODE -> INPUT_ONCE event
      if (state.__canSpaceOnes) {
        // bug fix - GAME_UPDATE does not dispatch the correct state for such cases??
        state.spaceOnes = true
        state.__canSpaceOnes = false

        dispatchEvent('INPUT_ONCE', { payload: { ...state } })
      }
    })
    const handleSpaceUp = handleKeyOfInterest(() => {
      state.space = false

      state.spaceOnes = false
      state.__canSpaceOnes = true
    })

    return {
      HTML_EV_ANY: ({ payload }) => {
        const key = payload.wrappedEventArgs[0].key
        const event = payload.wrappedEventArgs[0]

        basedOnPartial({
          keydown: () => {
            state.__lastEvent = event

            basedOnPartial({
              a: handleKeyOfInterest(() => (state.left = true)),
              s: handleKeyOfInterest(() => (state.down = true)),
              w: handleKeyOfInterest(() => (state.up = true)),
              d: handleKeyOfInterest(() => (state.right = true)),
              ArrowLeft: handleKeyOfInterest(() => (state.left = true)),
              ArrowDown: handleKeyOfInterest(() => (state.down = true)),
              ArrowUp: handleKeyOfInterest(() => (state.up = true)),
              ArrowRight: handleKeyOfInterest(() => (state.right = true)),
              ' ': handleSpaceDown,
              e: handleSpaceDown,
            })(key)
          },
          keyup: () => {
            state.__lastEvent = event

            basedOnPartial({
              a: handleKeyOfInterest(() => (state.left = false)),
              s: handleKeyOfInterest(() => (state.down = false)),
              w: handleKeyOfInterest(() => (state.up = false)),
              d: handleKeyOfInterest(() => (state.right = false)),
              ArrowLeft: handleKeyOfInterest(() => (state.left = false)),
              ArrowDown: handleKeyOfInterest(() => (state.down = false)),
              ArrowUp: handleKeyOfInterest(() => (state.up = false)),
              ArrowRight: handleKeyOfInterest(() => (state.right = false)),
              ' ': handleSpaceUp,
              e: handleSpaceUp,
            })(key)
          },
        })(payload.type)
      },
      INPUT_DISABLE: () => (state.inputEnabled = false),
      INPUT_ENABLE: () => (state.inputEnabled = true),
      GAME_UPDATE: () => {
        state.inputEnabled && dispatchEvent('INPUT_UPDATE', { payload: { ...state } })
      },
    }
  },
  { id: 'input' }
)
