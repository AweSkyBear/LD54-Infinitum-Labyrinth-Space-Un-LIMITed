import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents } from '../OD'
import { createMaze } from './createMaze'
import { createPlayer } from './createPlayer'
import { createGameLoop } from './createGameLoop'
import { createHTMLEvents } from '../common/createHTMLEvents'
import { createInput } from '../common/createInput'
import { createPortals } from './createPortals'
import { createMazeTitle } from './createMazeTitle'
import { createDPIChangeDetect } from '../common/createDPIChangeDetect'
import { createLevelInfoBar } from './html/createLevelInfoBar'
import { createHeader } from './html/createHeader'
import { createScreenZoomer } from '../common/createScreenZoomer'
import { createMusic } from '../common/createMusic'
import { createUIControls } from '../common/createUIControls'
import { createLightsSwitcher } from '../common/createLightsSwitcher'
import { createSoundFX } from '../common/createSoundFX'
import { createDocumentVisibilityChangeDetect } from '../common/createDocumentVisibilityChangeDetect'
import { setCurrentTopos } from './global/currentTopos'
import { createGameExit } from './createGameExit'
import { requestFullScreen, wait } from '../common/func'
import { createPause } from '../common/createPause'
import { createMazeConfigurer } from '../freeRoam/createMazeConfigurer'
import { createMazeConfigureModal } from '../freeRoam/createMazeConfigureModal'
import { createUserSignCreator, TAllSignsMap } from '../freeRoam/createUserSignCreator'
import { setCurrentSeed } from './global/currentSeed'
import { createMazeURLLoader } from '../freeRoam/createMazeURLLoader'
import { createMazeShareModal } from '../freeRoam/createMazeShareModal'
import { createMazePerfOptimizer } from '../common/createMazePerfOptimizer'

type TFreeRoamParams = {
  allSignsMap: TAllSignsMap
}

export const createFreeRoam = obsDispCreator<TFreeRoamParams>(
  ({ allSignsMap }) => {
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs(async (obs) => {
        requestFullScreen()
        setCurrentTopos('infinite-roam')

        await wait()

        // Game & Maze - core
        obs.addOD(createGameLoop())
        obs.addOD(createPortals())
        obs.addOD(createMaze())
        obs.addOD(createPlayer())
        const inputObs = createInput()
        obs.addOD(inputObs)
        obs.addOD(
          createHTMLEvents({
            containerElOrSelector: document.body,
            // dispatchTarget: inputObs,
            trackEvents: ['keypress', 'keydown', 'keyup'],
          })
        )
        obs.addOD(createMazeTitle())

        // UI:
        obs.addOD(createHeader({ topos: 'infinite-roam' }))
        obs.addOD(createLevelInfoBar())

        // !! Levels - core - irrelevant to free roam
        // obs.addOD(createLevelProcessor())
        // obs.addOD(createAttackVisuals())
        // obs.addOD(createLevelFruit())
        // obs.addOD(createHints())
        // obs.addOD(createGameWonCutscene())

        // ADDITIONAL/MISC
        obs.addOD(createMazePerfOptimizer())
        obs.addOD(createGameExit())
        obs.addOD(createPause())
        obs.addOD(createUIControls())
        obs.addOD(createMusic())
        obs.addOD(createSoundFX())
        obs.addOD(createLightsSwitcher())
        obs.addOD(createUserSignCreator({ allSignsMap }))

        obs.addOD(createDocumentVisibilityChangeDetect()) // helper
        obs.addOD(createDPIChangeDetect()) // helper - important for resizing
        obs.addOD(createScreenZoomer()) // helper - zooming programmatically

        // FREE-ROAM SPECIAL
        obs.addOD(createMazeConfigureModal())
        obs.addOD(createMazeConfigurer())
        obs.addOD(createMazeShareModal())
        obs.addOD(createMazeURLLoader())

        // initialize the start!
        dispatchEvent('GAME_START')
      }),
      // QUICK WORKAROUND: we are currently not setting the current seed anywhere (for FreeRoam)
      PORTAL_ENTERED: (ev) => {
        setCurrentSeed(ev.payload.seed)
        dispatchEvent('PORTAL_ENTERED_DEFERRED')
      },
    }
  },
  { id: 'free-roam' }
)
