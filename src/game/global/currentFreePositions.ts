import { repeat } from 'ramda'
import { getMazeSize } from '../../game/global/mazeSize'
import { getRandomMazePos } from '../gameUtil'

export const getCurrentFreePositions = () => repeat(0, getMazeSize().rows).map(getRandomMazePos)
