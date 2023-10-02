import { isCurrentlyOptimized, toggleMazeOptimized } from '../common/createMazePerfOptimizer'
import { wait } from '../common/func'
import { startFreeRoam } from '../game/createStartFlow'
import { setAllColorsFromConfig, setCellWallColor } from '../game/global/cellWallColors'
import { setCurrentSeed } from '../game/global/currentSeed'
import { setCurrentTopos } from '../game/global/currentTopos'
import { setMazeSize } from '../game/global/mazeSize'
import { setSeedSuffix } from '../game/global/seedSuffix'
import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { IMazeLoadConfig } from './IMazeLoadConfig'

export const createMazeURLLoader = obsDispCreator(
  () => {
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        handleUrl()
      }),
      MAZE_LOAD: (ev) => {
        const config = ev.payload as IMazeLoadConfig
        setCurrentTopos('infinite-roam')
        setMazeSize(config.size.w, config.size.h)
        setSeedSuffix(config.seedSuffix)
        setCurrentSeed('0')
        ;((config.fat && isCurrentlyOptimized()) || (!config.fat && !isCurrentlyOptimized())) &&
          toggleMazeOptimized()

        startFreeRoam(config.notes)

        // what needs to be after the maze is rendered
        wait().then(() => {
          setAllColorsFromConfig(config.walls)

          dispatchEvent('MAZE_LOADED', { payload: ev.payload })
        })
      },
    }
  },
  { id: 'maze-loader' }
)

export const getMazeUrlParam = () => {
  let parsedParams = null as Record<any, any>
  try {
    parsedParams = JSON.parse(decodeURIComponent(window.location.hash.split('#maze=')[1]))
  } catch (ex) {}

  return parsedParams
}

const handleUrl = () => {
  const mazeParam = window.location.hash.split('#maze=')[1]
  const parsedParams = getMazeUrlParam()

  if (mazeParam) {
    if (!parsedParams) {
      dispatchEvent('MAZE_LOAD_FAILED')
    } else {
      dispatchEvent('MAZE_LOAD', { payload: parsedParams })
    }
  }
}
