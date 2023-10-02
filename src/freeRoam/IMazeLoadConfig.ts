import { TAllSignsMap } from './createUserSignCreator'

export interface IMazeLoadConfig {
  size: {
    w: number
    h: number
  }
  fat: boolean
  seedSuffix: string
  walls: {
    c1: string
    c2: string
    c3: string
    c4: string
  }
  notes: TAllSignsMap
}
