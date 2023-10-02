import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents } from '../OD'
import { wait } from './func'

export const createScreenZoomer = obsDispCreator(() => {
  const getZoom = () => parseFloat((document.body.style as any).zoom || 1) as number

  const state = {
    useAnim: false, // off for now
    zoomAmount: 0.25,
    zoomStepAmount: 0.02,
    zoomStepMs: 15,
    doZoomIn: false,
    doZoomOut: false,
    interval: null,
    currentZoom: getZoom(),
  }

  const setZoom = (z: number) => ((document.body.style as any).zoom = `${z}`)
  const incrZoom = (z: number) => setZoom(getZoom() + z)

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    SCREEN_ZOOM_STOP: () => {
      state.doZoomIn = false
      state.doZoomOut = false
    },
    SCREEN_ZOOM_RESET: async () => {
      setZoom(1)
    },
    SCREEN_ZOOM_IN: async () => {
      const nextZoom = getZoom() + state.zoomAmount

      if (!state.useAnim) {
        setZoom(nextZoom)
      } else {
        state.doZoomIn = true
        state.doZoomOut = false
        while (getZoom() < nextZoom && state.doZoomIn) {
          await wait(state.zoomStepMs)
          incrZoom(state.zoomStepAmount)
        }
      }
    },
    SCREEN_ZOOM_OUT: async () => {
      const nextZoom = getZoom() - state.zoomAmount

      if (!state.useAnim) {
        setZoom(nextZoom)
      } else {
        state.doZoomOut = true
        state.doZoomIn = false
        while (getZoom() > nextZoom && state.doZoomOut) {
          await wait(state.zoomStepMs)
          incrZoom(-state.zoomStepAmount)
        }
      }
    },
    GAME_UPDATE: () => {
      const zoom = getZoom()
      if (zoom !== state.currentZoom) {
        state.currentZoom = getZoom()
        dispatchEvent('SCREEN_ZOOM_CHANGED', { payload: { zoom } })
      }
    },
  }
})
