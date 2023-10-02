import { dispatchEvent, obsDispCreator, obsDispEvents } from '../OD'
import { throttle } from 'throttle-debounce'
import { wait } from './func'

export const dispatchReadjustDPIChange = throttle(300, () =>
  dispatchEvent({ name: 'DPI_CHANGE', payload: { dpi: window.devicePixelRatio } })
)

export const createDPIChangeDetect = obsDispCreator(
  () => {
    const state = {
      lastDevicePixelRatio: window.devicePixelRatio,
      lastClientWidth: document.body.clientWidth,
      lastClientHeight: document.body.clientHeight,
      dpiCheckInterval: setInterval(() => {
        state.lastDevicePixelRatio !== window.devicePixelRatio &&
          (dispatchReadjustDPIChange as any)({ payload: { dpi: window.devicePixelRatio } })

        state.lastDevicePixelRatio = window.devicePixelRatio
      }, 300),
    }

    return {
      GAME_UPDATE: () => {
        if (
          document.body.clientWidth !== state.lastClientWidth ||
          document.body.clientHeight !== state.lastClientHeight
        ) {
          state.lastClientWidth = document.body.clientWidth
          state.lastClientHeight = document.body.clientHeight

          dispatchReadjustDPIChange()
        }
      },
      GAME_PAUSE: () => wait(300).then(dispatchReadjustDPIChange),
      GAME_RESUME: dispatchReadjustDPIChange,
      [obsDispEvents.OBS_REMOVE]: () => {
        clearInterval(state.dpiCheckInterval)
      },
    }
  },
  { id: 'dpiChangeDetect' }
)
