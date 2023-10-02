export type TStateFlag =
  | 'zoomLevelPasswordUsed'
  | 'touchedRightFalcon'
  | 'diamondTaken'
  | 'thirdEyeTaken'

const _gameState = {} as Record<TStateFlag, boolean>

export const setGameStateFlag = (flag: TStateFlag, value: boolean) => {
  _gameState[flag] = value
}
export const getGameStateFlag = (flag: TStateFlag) => _gameState[flag]
