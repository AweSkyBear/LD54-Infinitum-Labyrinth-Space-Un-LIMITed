import { wait } from '../common/func'
import { setAllColorsFromConfig } from '../game/global/cellWallColors'
import { getCurrentTopos } from '../game/global/currentTopos'
import { obsDispCreator } from '../OD'

const optimizeRenderedMaze = () => {
  if (!isCurrentlyOptimized()) {
    document.body.classList.add('optimized')
    setAllColorsFromConfig()
  }
}

const unoptimizeRenderedMaze = () => {
  if (isCurrentlyOptimized()) {
    document.body.classList.remove('optimized')
    setAllColorsFromConfig()
  }
}
export const isCurrentlyOptimized = () => document.body.classList.contains('optimized')

const handleMazeChangedEvent = () =>
  getCurrentTopos() === 'the-game' && wait(2000).then(optimizeRenderedMaze)

export const toggleMazeOptimized = () =>
  isCurrentlyOptimized() ? unoptimizeRenderedMaze() : optimizeRenderedMaze()

export const createMazePerfOptimizer = obsDispCreator({
  GAME_START: handleMazeChangedEvent,
  PORTAL_ENTERED: handleMazeChangedEvent,
})
