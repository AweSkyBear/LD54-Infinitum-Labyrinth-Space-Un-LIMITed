import { createSoundFX } from './common/createSoundFX'
import { createStartScreen } from './common/createStartScreen'
import { createStartFlow } from './game/createStartFlow'
import { createResetGameConfig } from './common/createResetGameConfig'
import { createMazeURLLoader, getMazeUrlParam } from './freeRoam/createMazeURLLoader'
import { setContainer } from './common/container'

export const run = (containerSelector) => {
  //// GLOBAL OBJECT TO BE USED VIA `getContainer`
  setContainer(containerSelector)

  if (!getMazeUrlParam()) {
    createStartFlow()
    createStartScreen()
  }

  createSoundFX()

  createResetGameConfig()

  // FreeRoam mode-related
  createMazeURLLoader()
}
;(window as any).run = run
