import { dispatchEvent, IEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { getMazeSize, setMazeSize } from '../game/global/mazeSize'
import { getSeedSuffix, setSeedSuffix } from '../game/global/seedSuffix'
import { setCellWallColor } from '../game/global/cellWallColors'
import { MAX_MAZE_SIZE } from '../game/const'

export const getResizeDims = (ev: IEvent) => {
  const { size, width, height } = ev.payload
  return {
    width: width === height ? size : Math.min(MAX_MAZE_SIZE, width),
    height: width === height ? size : Math.min(MAX_MAZE_SIZE, height),
  }
}

export const createMazeConfigurer = obsDispCreator(() => ({
  [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
  MAZE_RESIZE: (ev) => {
    const dims = getResizeDims(ev)
    setMazeSize(dims.width, dims.height)
  },
  MAZE_RESEED: (ev) => {
    setSeedSuffix(ev.payload.mazeTitle)
  },
  MAZE_RECONFIGURE: (ev) => {
    const dims = getResizeDims(ev)
    setMazeSize(dims.width, dims.height)
    setSeedSuffix(ev.payload.mazeTitle)

    dispatchEvent('MAZE_RESIZE', { payload: ev.payload })
    dispatchEvent('MAZE_RETITLE', { payload: { mazeTitle: getSeedSuffix() } })
  },
  MAZE_LOADED: () => {
    dispatchEvent('MAZE_RETITLE', { payload: { mazeTitle: getSeedSuffix() } })
  },
  MAZE_RECONFIGURE_SET_COLOR: (ev) => {
    setCellWallColor(ev.payload as any)
  },
}))
