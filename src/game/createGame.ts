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
import { createLevelProcessor } from './createLevelProcessor'
import { createHeader } from './html/createHeader'
import { createScreenZoomer } from '../common/createScreenZoomer'
import { createMusic } from '../common/createMusic'
import { createUIControls } from '../common/createUIControls'
import { createLightsSwitcher } from '../common/createLightsSwitcher'
import { createGameWonCutscene } from './html/cutscene/createGameWonCutscene'
import { createSoundFX } from '../common/createSoundFX'
import { createDocumentVisibilityChangeDetect } from '../common/createDocumentVisibilityChangeDetect'
import { createLevelFruit } from './collectibles/createLevelFruit'
import { createAttackVisuals } from './html/player/createAttackVisuals'
import { createHints } from './createHints'
import { setCurrentTopos } from './global/currentTopos'
import { createGameExit } from './createGameExit'
import { createPause } from '../common/createPause'
import { requestFullScreen, wait } from '../common/func'
import { createMazePerfOptimizer } from '../common/createMazePerfOptimizer'

export const createGame = obsDispCreator(
  () => {
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs(async (obs) => {
        requestFullScreen()
        setCurrentTopos('the-game')

        await wait()

        // TODOLAPI -> addOD -> multiple ones!
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
        obs.addOD(createHeader({ topos: 'the-game' }))
        obs.addOD(createLevelInfoBar())

        // !! Levels - core
        obs.addOD(createLevelProcessor())
        obs.addOD(createAttackVisuals())
        obs.addOD(createLevelFruit())
        obs.addOD(createHints())
        obs.addOD(createGameWonCutscene())

        // ADDITIONAL/MISC
        obs.addOD(createMazePerfOptimizer())
        obs.addOD(createGameExit())
        obs.addOD(createPause())
        obs.addOD(createUIControls())
        obs.addOD(createMusic())
        obs.addOD(createSoundFX())
        obs.addOD(createLightsSwitcher())

        obs.addOD(createDocumentVisibilityChangeDetect()) // helper
        obs.addOD(createDPIChangeDetect()) // helper - important for resizing
        obs.addOD(createScreenZoomer())
        // obs.addOD(createHexaAroundMaze()) // EXPERIMENTAL

        // initialize the start!
        dispatchEvent('GAME_START')
      }),
    }
  },
  { id: 'game' }
)
