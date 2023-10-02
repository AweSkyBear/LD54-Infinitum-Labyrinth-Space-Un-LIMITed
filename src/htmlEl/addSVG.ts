import { getContainer } from '../common/container'
import { addHtmlEl } from './addHtmlEl'

export const addSVG = (
  props: {
    svg: string
    attrs?: Record<string, unknown>
    onClick?: (b: HTMLButtonElement, ev: MouseEvent) => any
    parentAttrs?: Record<string, unknown>
    attachTo?: HTMLElement
    doNotAttach?: boolean
    tag?: string
    parent?: boolean
  } = {} as any
) =>
  addHtmlEl({
    attrs: props.attrs,
    attachTo: getContainer() || props.attachTo,
  }).setHTML(props.svg)
