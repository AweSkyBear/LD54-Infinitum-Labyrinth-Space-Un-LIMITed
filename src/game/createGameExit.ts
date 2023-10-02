import { ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { resetGameRaw } from './gameUtil'

export const createGameExit = obsDispCreator(
  {
    GAME_EXIT: () => resetGameRaw(),
  },
  { id: 'game-exit' }
)
