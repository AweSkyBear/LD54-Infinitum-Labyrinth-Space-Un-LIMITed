import { addHtmlEl } from './addHtmlEl'

export const addTextModal = (
  props: {
    text?: string
    attrs?: Record<string, unknown>
    onClick?: (b: HTMLButtonElement, ev: MouseEvent) => any
    attachTo?: HTMLElement
    doNotAttach?: boolean
    tag?: string
  } = {} as any
) =>
  addHtmlEl<HTMLDivElement>({
    tag: props.tag || 'div',
    text: props.text || 'Modal text!',
    doNotAttach: props.doNotAttach,
    attachTo: props.attachTo,
    attrs: {
      ...props.attrs,
      class: 'modal',
    },
  })
