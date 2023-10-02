import { resetWallColorsToDefaults } from '../game/global/cellWallColors'
import { setCurrentSeed } from '../game/global/currentSeed'
import { setCurrentTopos } from '../game/global/currentTopos'
import { setMazeSize } from '../game/global/mazeSize'
import { setSeedSuffix } from '../game/global/seedSuffix'
import { obsDispCreator } from '../OD'

export const createResetGameConfig = obsDispCreator(
  {
    GAME_EXIT: () => {
      Howler.stop() // bug fix
      // DEFAULTS:
      setMazeSize(10, 10)
      setCurrentSeed('0')
      setSeedSuffix('')
      resetWallColorsToDefaults()

      setCurrentTopos('start-screen')
    },
  },
  { id: 'reset-game-config' }
)
