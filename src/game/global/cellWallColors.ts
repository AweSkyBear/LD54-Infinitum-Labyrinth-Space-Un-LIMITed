import { clone, equals } from 'ramda'
import { getContainer } from '../../common/container'
import { isCurrentlyOptimized } from '../../common/createMazePerfOptimizer'
import { exposeToWindow } from '../../common/func'
import { IMazeLoadConfig } from '../../freeRoam/IMazeLoadConfig'

const DEFAULT_WALL_COLORS = {
  c1: '#3e68ff',
  c2: '#3e68ff',
  c3: '#3e68ff',
  c4: '#3e68ff',
}

let _wallColors = {
  ...DEFAULT_WALL_COLORS,
}

export const resetWallColorsToDefaults = () => {
  Object.assign(_wallColors, DEFAULT_WALL_COLORS)
  setAllColorsFromConfig(_wallColors)
}
export const setAllColorsFromConfig = (walls: IMazeLoadConfig['walls'] = _wallColors) => {
  walls && Object.assign(_wallColors, walls)

  setCellWallColor({ colorKey: 'c1', colorHex: walls.c1 })
  setCellWallColor({ colorKey: 'c2', colorHex: walls.c2 })
  setCellWallColor({ colorKey: 'c3', colorHex: walls.c3 })
  setCellWallColor({ colorKey: 'c4', colorHex: walls.c4 })
}

export const setCellWallColor = (
  params?: { colorKey: string; colorHex: string },
  forceUpdate = false
) => {
  params && (_wallColors[params.colorKey] = params.colorHex)
  if (!haveWallColorsChanged() && !forceUpdate) {
    // optimization
    return
  }

  resetCellInlineStyles()

  if (isCurrentlyOptimized()) {
    getContainer()
      .querySelectorAll('.cell')
      .forEach((el: HTMLElement) => {
        if (el.classList.contains('up')) {
          return (el.style.borderColor = _wallColors.c1)
        }
        if (el.classList.contains('down')) {
          return (el.style.borderColor = _wallColors.c2)
        }
        if (el.classList.contains('left')) {
          return (el.style.borderColor = _wallColors.c3)
        }
        if (el.classList.contains('right')) {
          return (el.style.borderColor = _wallColors.c4)
        }

        // drop-shadow(-1px -1px 0px ${_wallColors.c1})
        // drop-shadow(2px -1px 0px ${_wallColors.c2})
        // drop-shadow(2px 2px 0px ${_wallColors.c3})
        // drop-shadow(-1px 2px 0px ${_wallColors.c4})
        // `
      })
  } else {
    getContainer()
      .querySelectorAll('.cell')
      .forEach((el: HTMLElement) => {
        el.style.filter = `
            drop-shadow(-1px -1px 0px ${_wallColors.c1})
            drop-shadow(2px -1px 0px ${_wallColors.c2})
            drop-shadow(2px 2px 0px ${_wallColors.c3})
            drop-shadow(-1px 2px 0px ${_wallColors.c4})
        `
      })
  }
}

export const getWallColors = () => clone(_wallColors)

export const haveWallColorsChanged = () => !equals(_wallColors, DEFAULT_WALL_COLORS)

export const resetCellInlineStyles = () => {
  document.querySelectorAll<HTMLElement>('.cell').forEach((e) => {
    e.style.filter = ''
    e.style.borderColor = ''
  })
}

exposeToWindow({ setCellWallColor })
