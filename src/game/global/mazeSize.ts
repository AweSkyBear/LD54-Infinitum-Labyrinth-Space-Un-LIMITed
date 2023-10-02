import { exposeToWindow } from '../../common/func'
import { Pos } from '../../common/types'

let _cols = 10
let _rows = 10
export const getMazeSize = () => ({ cols: _cols, rows: _rows })

export const setMazeSize = (cols: number, rows: number) => {
  _cols = cols
  _rows = rows
}

export const constrainPosToMazeSize = (pos: Pos): Pos => ({
  x: Math.min(pos.x, getMazeSize().cols - 1),
  y: Math.min(pos.y, getMazeSize().rows - 1),
})

exposeToWindow({ setMazeSize })
