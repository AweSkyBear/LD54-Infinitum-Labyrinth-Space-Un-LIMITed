import { ObsDispCreate, obsDispCreator, obsDispEvents } from './OD'

export const createObs = obsDispCreator(() => {
  const state = {
    someProp: 1,
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    GAME_START: () => {
      //   renderMFaze({ seed: '123456' })
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      // cleanup logic
    },
  }
})
