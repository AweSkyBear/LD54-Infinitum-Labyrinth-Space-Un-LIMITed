import {
  ObsDispCreate,
  constructEvents,
  dispatchEvent,
  obsDispCreator,
  obsDispEvents,
  payloadProp,
  payloadPropOr,
} from '../../OD'
import { throttle } from 'throttle-debounce'
import { addText } from '../../htmlEl/addText'
import { getContainer } from '../../common/container'
import { IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { wait } from '../../common/func'

export type TLevelInfoBarEvent =
  | 'LEVEL_INFO_BAR_SET_TEXT'
  | 'LEVEL_INFO_BAR_TYPE_TEXT'
  | 'LEVEL_INFO_BAR_CLEAR'
  | 'LEVEL_INFO_BAR_WORD_TYPED'
  | 'LEVEL_INFO_BAR_SHOW'
export const LevelInfoBarEvents = constructEvents<TLevelInfoBarEvent>([
  'LEVEL_INFO_BAR_SET_TEXT',
  'LEVEL_INFO_BAR_TYPE_TEXT',
  'LEVEL_INFO_BAR_CLEAR',
  'LEVEL_INFO_BAR_WORD_TYPED',
  'LEVEL_INFO_BAR_SHOW',
])

const DEFAULT_TYPE_WORD_EVERY_N_MS = 60
const regexMatchWordsAndHTMLElements = /(\s|<\w+>[^\<]*?<\/\w+>)/

const dispatchWordTyped = throttle(100, () =>
  dispatchEvent({ name: LevelInfoBarEvents.LEVEL_INFO_BAR_WORD_TYPED })
)

export const createLevelInfoBar = obsDispCreator(
  () => {
    const state = {
      someProp: 1,
      infoBarText: null as IHTMLElWrapper,
      typedText: '',
      typeInterval: null as NodeJS.Timeout,
      typeCurrentWordInd: -1,
      editing: false,
    }

    const showMessage = ({ closeable }: { closeable?: boolean } = {} as any) => {
      state.infoBarText.wrapperEl.style.opacity = '1'
      closeable &&
        !state.infoBarText.wrapperEl.classList.contains('close') &&
        state.infoBarText.wrapperEl.classList.add('close')
    }

    const xButtonHTML = '<div class="close">⛌</div>'
    const getEditInputHTML = (_html: string) =>
      `<input class="edit-text" value="" placeholder="what is it?"/><br>`
    const setHTML = (
      html: string,
      { closeable, editable }: { closeable?: boolean; editable?: boolean } = {} as any
    ) => {
      state.infoBarText
        .setHTML(
          (closeable ? xButtonHTML : '') +
            (editable ? getEditInputHTML(html) : '') +
            `<div class="content">${html}</div>`
        )
        .then((res) => {
          closeable &&
            res.el.querySelector('.close').addEventListener('click', () => {
              dispatchEvent('INPUT_ENABLE')
              dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
            })

          editable &&
            res.el.querySelector('.edit-text').addEventListener('input', (ev) => {
              dispatchEvent('SIGNPOST_EDIT_TEXT', { payload: { text: (ev.target as any).value } })
            })
        })
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.infoBarText = addText({
          parent: true,
          attachTo: getContainer(),
          parentAttrs: { class: 'level-info-bar-wrapper' },
          attrs: { class: 'level-info-bar' },
        }).then((el) => {
          el.wrapperEl.style.opacity = '0'
        })
      }),
      [LevelInfoBarEvents.LEVEL_INFO_BAR_SET_TEXT]: (ev) => {
        const closeable = payloadPropOr<boolean>('closeable', false)(ev)
        showMessage({ closeable })

        setHTML(payloadPropOr<string>('text', '<no text>')(ev), { closeable })
      },
      [LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT]: (ev) => {
        showMessage()
        clearInterval(state.typeInterval)

        const text = payloadPropOr<string>('text', '')(ev)
        const shouldRemain = payloadPropOr<boolean>('shouldRemain', true)(ev)
        const closeable = payloadPropOr<boolean>('closeable', false)(ev)

        const wordsToType = text.split(regexMatchWordsAndHTMLElements)
        state.typeCurrentWordInd = -1

        // let it be faster if too much text:
        const typeWordMs =
          // always type the whole thing in 2 seconds (if more than 12 words)!
          wordsToType.length > 12 ? 2000 / wordsToType.length : DEFAULT_TYPE_WORD_EVERY_N_MS

        wordsToType.length > 50 && state.infoBarText.wrapperEl.classList.add('big')

        state.typeInterval = setInterval(() => {
          // new way:
          state.typeCurrentWordInd++
          const word = wordsToType[state.typeCurrentWordInd]
          state.typedText = wordsToType.slice(0, state.typeCurrentWordInd).join('')

          /// OLD WAY - char by char / not the best when dealing with tagged text like <em>text</em>
          // state.typedText = text.substring(0, state.typedText.length + 1)

          if (state.typeCurrentWordInd === wordsToType.length) {
            clearInterval(state.typeInterval)
            state.typeInterval = null // needed for check below

            state.typedText = ''
            wait(/* 2000 */ wordsToType.length * 100).then(() => {
              if (shouldRemain) return

              // if not currently displaying text
              state.typeInterval === null && dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
              state.typeCurrentWordInd = -1
            })
          } else {
            setHTML(state.typedText + word, { closeable, editable: state.editing })
            state.typedText.length > 0 && dispatchWordTyped()
          }
        }, typeWordMs)
      },
      [LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR]: (ev) => {
        state.infoBarText.wrapperEl.classList.remove('big')
        clearInterval(state.typeInterval)
        setHTML('')
        state.typedText = ''
        state.infoBarText.wrapperEl.style.opacity = '0'
      },
      SIGNPOST_EDIT_START: () => (state.editing = true),
      SIGNPOST_EDIT_END: () => (state.editing = false),
      SIGNPOST_EDIT_TEXT: (ev) => {
        state.infoBarText.wrapperEl.querySelector('.content').innerHTML = ev.payload.text
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        state.infoBarText?.remove()
      },
    }
  },
  { id: 'levelInfoBar' }
)
