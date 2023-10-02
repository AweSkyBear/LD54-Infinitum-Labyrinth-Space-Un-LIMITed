import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'

export const createDocumentVisibilityChangeDetect = obsDispCreator(
  () => {
    const state = {
      onVisibilityChangeHandler: () => {
        document.visibilityState === 'visible' &&
          dispatchEvent('DOCUMENT_VISIBILITY_CHANGED_TO_VISIBLE')
        document.visibilityState !== 'visible' &&
          dispatchEvent('DOCUMENT_VISIBILITY_CHANGED_TO_INVISIBLE')

        dispatchEvent('DOCUMENT_VISIBILITY_CHANGED', {
          payload: { visible: document.visibilityState === 'visible' },
        })
      },
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        document.addEventListener('visibilitychange', state.onVisibilityChangeHandler)
      }),
      [obsDispEvents.OBS_REMOVE]: () => {
        document.removeEventListener('visibilitychange', state.onVisibilityChangeHandler)
      },
    }
  },
  { id: 'DocumentVisibilityChangeDetect' }
)
