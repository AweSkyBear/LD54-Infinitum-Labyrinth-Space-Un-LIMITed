import {
  constructEvents,
  createThrottledDispatch,
  dispatchEvent,
  IEvent,
  obsDispCreator,
  obsDispEvents,
  TEventTarget,
} from '../OD'
import { Func } from './types'
import { exposeToWindow } from './func'
import { TEventDispatchOptions } from 'obs-disp/dist/obs-disp'

export const createHTMLEvents = obsDispCreator<{
  /** Parent container - events are tracked when happen inside of this container; @default document.body */
  containerElOrSelector?: string | HTMLElement
  /**
   * Event names to track, values that would be received by addEventListener(<EVENT>)
   * Providing this overrides the default events that are tracked
   */
  trackEvents?: string[]
  /** ObsDispCreate target, e.g. a given Observer! */
  dispatchTarget?: TEventTarget
}>(({ containerElOrSelector, trackEvents, dispatchTarget } = {}) => {
  const state = {
    $: null as HTMLElement,
    eventHandlersByEvent: {} as Record<string, Func<any, void>>,
  }

  return {
    [obsDispEvents.OBS_CREATE]: () => {
      // attach all the events
      state.$ = getContainerEl(containerElOrSelector || document.body)
      const $ = state.$

      const evNames = trackEvents ? trackEvents : getSupportedEventNames()

      evNames.forEach((evName) => {
        state.eventHandlersByEvent[evName] = (...args: any[]) => {
          const ev = args[0] as KeyboardEvent
          const target = args[0].target
          const type = args[0].type as string

          ///// -> AD-HOC patch
          if (type === 'keydown') {
            if (target.tagName === 'INPUT') {
              return true
            }
          }

          ///// <-
          dispatchEvent(ODHTMLEvents.HTML_EV_ANY, {
            target: dispatchTarget,
            payload: { target, type: type, wrappedEventArgs: args },
          })
        }

        $.addEventListener(evName, state.eventHandlersByEvent[evName])
      })
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      Object.keys(state.eventHandlersByEvent).forEach((evName) =>
        state.$.removeEventListener(evName, state.eventHandlersByEvent[evName])
      )
    },
  }
})

const getContainerEl = (containerElOrSelector: string | HTMLElement) => {
  return typeof containerElOrSelector === 'string'
    ? document.querySelector<HTMLElement>(containerElOrSelector)
    : containerElOrSelector
}

/** Possibly non-exhaustive */
const getSupportedEventNames = () => {
  return Array.from(
    new Set(
      [
        ...Object.getOwnPropertyNames(document),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document))),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(window)),
      ].filter((k: any) => k.startsWith('on'))
    )
  ).map((evName) => evName.slice(2))
}
exposeToWindow({ getSupportedEventNames })

export const ODHTMLEvents = constructEvents(['HTML_EV_ANY'])
