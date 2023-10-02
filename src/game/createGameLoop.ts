import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents } from '../OD'

const FPS = 16

export const createGameLoop = obsDispCreator(() => {
  const state = {
    on: true,
    timer: null as NodeJS.Timeout,
  }

  const DEFAULT_STEP_TIME = 1000 / FPS

  const doUpdate = () => {
    state.on &&
      (state.timer = setExactTimeout(
        () => {
          dispatchEvent('GAME_UPDATE')
          doUpdate()
        },
        DEFAULT_STEP_TIME,
        20
      ))
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
      if (state.on) {
        doUpdate()
      }
    }),
    [obsDispEvents.OBS_REMOVE]: () => {
      clearExactTimeout(state.timer)
    },
  }
})

// helpers around timers

const setExactTimeout = function (callback, duration, resolution) {
  const start = new Date().getTime()
  const timeout = setInterval(function () {
    if (new Date().getTime() - start > duration) {
      callback()
      clearInterval(timeout)
    }
  }, resolution)

  return timeout
}

const clearExactTimeout = function (timeout) {
  clearInterval(timeout)
}
