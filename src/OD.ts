import * as ObsDisp from 'obs-disp'
import { createAPI } from 'obs-disp'
import { exposeToWindow } from './common/func'

export const ODAPI = createAPI({
  //// for debugging
  onEvent: (ev) =>
    !['INPUT_UPDATE', 'GAME_UPDATE'].includes(ev.name) && console.log('EVENT DISP', ev),
  onObsCreated: (obs) => console.log('OBS ADDED', obs),
  onObsRemoved: (obs) => console.log('OBS REMOVED', obs),
  onWarn: ({ msg, params }) => console.log('WARN: ', msg, params),
})

export const {
  ObsDispCreate,
  obsDispEvents,
  payloadPropOr,
  payloadProp,
  payload,
  constructEvents,
} = ObsDisp
export const {
  dispatchEvent,
  removeObs,
  obsDispCreator,
  removeObsById,
  createThrottledDispatch,
  getAllObservers,
} = ODAPI

export type IObserver = ObsDisp.IObserver
export type IObserverOptions = ObsDisp.IObserverOptions
export type IEvent = ObsDisp.IEvent
export type TEventTarget = ObsDisp.TEventTarget

exposeToWindow({ OD: ODAPI }) // for tinkering only - expose the whole API
