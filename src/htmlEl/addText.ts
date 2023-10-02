import { addHtmlEl } from './addHtmlEl'

export const addText = (
  props: {
    text?: string
    parentAttrs?: Record<string, unknown>
    attrs?: Record<string, unknown>
    onClick?: (b: HTMLButtonElement, ev: MouseEvent) => any
    attachTo?: HTMLElement
    prependTo?: HTMLElement
    doNotAttach?: boolean
    tag?: string
    parent?: boolean
  } = {} as any
) =>
  addHtmlEl<HTMLDivElement>({
    tag: props.tag || 'div',
    text: props.text || '',
    doNotAttach: props.doNotAttach,
    prependTo: props.prependTo,
    attachTo: props.attachTo,
    attrs: props.attrs,
    parent: props.parent,
    parentAttrs: props.parentAttrs,
  })
