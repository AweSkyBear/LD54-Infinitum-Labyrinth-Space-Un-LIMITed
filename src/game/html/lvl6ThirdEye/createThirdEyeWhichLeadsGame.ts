import {
  dispatchEvent,
  ObsDispCreate,
  IObserver,
  obsDispCreator,
  obsDispEvents,
  removeObs,
} from '../../../OD'
import { Pos } from '../../../common/types'
import { createThirdEyeSvg } from '../../../svg/createThirdEyeSvg'
import { createInteractibleItem } from '../createInteractibleItem'

export const createThirdEyeWhichLeadsGame = obsDispCreator(
  () => {
    const state = {
      thirdEye: null as IObserver,
      // pathEyes: [] as IObserver[],
      // generateSolution: null as TGenerateSolutionFunc,
    }

    const createFirstThirdEyeGuider = (pos: Pos, onPlayerInteraction?: () => void) => {
      removeObs(state.thirdEye)

      // show first hint - an eye onto the top-left exit
      state.thirdEye = createInteractibleItem()({
        pos,
        html: `${createThirdEyeSvg()}`,
        classname: 'third-eye-portal-hint',
        onPlayerInteraction: ({ obs }) => {
          removeObs(state.thirdEye)

          onPlayerInteraction && onPlayerInteraction()
        },
      })

      return state.thirdEye
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.thirdEye = createFirstThirdEyeGuider({ x: 2, y: 2 }, () => {
          removeObs(state.thirdEye)

          dispatchEvent('LEVEL6_THIRD_EYE_TAKEN')

          obs.addOD(createFirstThirdEyeGuider({ x: 0, y: 0 }))
        })
      }),
      MAZE_GENERATED_DELAYED: (ev) => {
        // X:ENHANCE THE SCENE by drawing the actual path
        // state.generateSolution = ev.payload.generateSolution as TGenerateSolutionFunc
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        removeObs(state.thirdEye)
      },
    }
  },
  {
    id: 'third-eye-which-leads-game',
  }
)
