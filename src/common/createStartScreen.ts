import { ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { createHeader } from '../game/html/createHeader'

export const createStartScreen = obsDispCreator(
  () => {
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        obs.addOD(createHeader({ topos: 'start-screen' }))
      }),
    }
  },
  { id: 'start-screen' }
)
