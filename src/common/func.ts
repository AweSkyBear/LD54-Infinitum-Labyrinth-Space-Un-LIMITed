import Prando from 'prando'
import { complement, curry, isNil, prop } from 'ramda'
import { dispatchEvent, IEvent } from '../OD'
import { Func, Pos } from './types'

declare const window: any

export const debugLogEvent = (ev: IEvent) =>
  !isProduction() && console.warn('>>>>>>>>>>>>>>>', ev.name, ev.payload)

export const isProduction = () => process.env.NODE_ENV === 'production'

export const exposeToWindow = (varObj: any) => {
  if (process.env.NODE_ENV === 'production') return

  const result = Object.keys(varObj).map((key) => {
    const value = varObj[key]
    window[key] = value
    window.__EXPOSED = window.__EXPOSED || {}
    window.__EXPOSED[key] = value

    return [key, value]
  })

  return result
}

export const noop = () => {}

export const isNotNil = complement(isNil)

export const createHtmlEl = (html: string = '', tag: string = 'div') => {
  const el = document.createElement(tag)
  if (html) {
    el.innerHTML = html
  }
  return el
}
export const decorateCreateHtmlEl =
  (...args: Parameters<typeof createHtmlEl>) =>
  (decorateEl: (el: HTMLElement) => void) => {
    const el = createHtmlEl(...args)

    return ((el: HTMLElement) => {
      decorateEl(el)
      return el
    })(el)
  }

/** An alternative to the switch {} statement */
export const basedOn =
  <T extends string | number | symbol, K extends any = void>(paths: Record<T, Func<never, K>>) =>
  (choice: T) => {
    return paths[choice]()
  }
export const switchOn = basedOn
export const basedOnPartial =
  <T extends string | number | symbol, K extends any = void>(
    paths: Partial<Record<T, Func<never, K>>>
  ) =>
  (choice: T) => {
    return paths[choice] && paths[choice]()
  }

export const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const wait = (ms = 1) => new Promise((resolve) => setTimeout(resolve, ms))

const getX = prop<number>('x')
const getY = prop<number>('y')

export const posEquals = curry(
  (pos1: Pos, pos2: Pos) => pos1 && pos2 && getX(pos1) === getX(pos2) && getY(pos1) === getY(pos2)
)

export const addAndRemoveClass = (el: HTMLElement, classname: string, removeAfterMs = 1000) => {
  el.classList.remove(classname)
  el.classList.add(classname)
  const timeout = setTimeout(() => el.classList.remove(classname), removeAfterMs)
  return timeout
}

export const attachEventOnElClick = (
  el: HTMLElement,
  ...dispatchParams: Parameters<typeof dispatchEvent>
) => el.addEventListener('click', () => dispatchEvent(...dispatchParams))

export const randomDegFor = (seed: string | number) => new Prando(seed).next(0, 359)

export const distance = (pos1: Pos, pos2: Pos) =>
  pos1 && pos2 ? Math.hypot(getX(pos2) - getX(pos1), getY(pos2) - getY(pos1)) : Infinity

export const waitForCondition = (
  predicate: () => boolean,
  checkEveryMs = 1000,
  timeoutMs = 10000
) => {
  const startTime = Date.now()

  return new Promise<void>((resolve, reject) => {
    ;(function checker() {
      if (predicate()) {
        resolve()
        return
      } else {
        setTimeout(function () {
          if (timeoutMs && Date.now() - startTime > timeoutMs) {
            resolve()
            return
          }
          checker()
        }, checkEveryMs)
      }
    })()
  })
}

export const requestFullScreen = () =>
  !document.fullscreenElement && document.documentElement.requestFullscreen()

export const toggleFullScreen = () => {
  requestFullScreen()
  document.exitFullscreen && document.exitFullscreen()
}
