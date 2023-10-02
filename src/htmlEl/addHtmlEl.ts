import { addText } from './addText'

export interface IHTMLElWrapper<T extends HTMLElement = HTMLElement> {
  wrapperEl: HTMLElement
  el: T
  setHTML: (html: string) => IHTMLElWrapper<T>
  setText: (text: string) => IHTMLElWrapper<T>
  setValue: (val: any) => IHTMLElWrapper<T>
  setDisabled: (disabled: boolean) => IHTMLElWrapper<T>
  remove: () => void
  then: (cb: (result: IHTMLElWrapper<T>) => void) => IHTMLElWrapper<T>
}

/**
 * Create html elements.. nothing too serious, just improvising :)
 * / probably not production quality
 * */
export const addHtmlEl = <T extends HTMLElement>(
  props: {
    tag?: string
    label?: string
    parent?: boolean
    text?: string
    value?: any
    onClick?: (b: T, ev: MouseEvent) => any
    onChange?: (b: T, ev: Event) => any
    attachTo?: HTMLElement
    prependTo?: HTMLElement
    doNotAttach?: boolean
    attrs?: any
    parentAttrs?: any
  } = {} as any
) => {
  let wrapperEl: HTMLElement | null = null
  if (props.label || props.parent) {
    wrapperEl = document.createElement('div')
    Object.keys(props.parentAttrs).forEach((key, ind) => {
      wrapperEl.setAttribute(key, props.parentAttrs[key])
    })

    wrapperEl.appendChild(addText({ text: props.label, tag: 'span' }).el)
  }

  let el = document.createElement(props.tag || 'div') as T
  if (props.text) el.innerHTML = props.text

  if (props.value) (el as any).value = props.value
  props.onClick && el.addEventListener('click', props.onClick as any)
  props.onChange && el.addEventListener('keyup', props.onChange as any)
  props.onChange && el.addEventListener('change', props.onChange as any)

  wrapperEl && wrapperEl.appendChild(el)
  const finalEl = wrapperEl || el
  !props.doNotAttach && !props.prependTo && (props.attachTo || document.body).appendChild(finalEl)
  !props.doNotAttach && props.prependTo && props.prependTo.prepend(finalEl)

  const attrs = props.attrs || {}
  Object.keys(attrs).forEach((key, ind) => {
    el.setAttribute(key, attrs[key])
  })

  const result: IHTMLElWrapper<T> = {
    wrapperEl,
    el,
    remove: () => {
      wrapperEl && wrapperEl.remove()
      el.remove()
    },
    setHTML: (html) => {
      el.innerHTML = html
      return result
    },
    setText: (text) => {
      el.textContent = text
      return result
    },
    setValue: (val) => {
      ;(el as any).value = val
      return result
    },
    setDisabled: (disabled) => {
      disabled ? el.setAttribute('disabled', '') : el.removeAttribute('disabled')
      return result
    },
    then: (cb) => {
      cb(result)
      return result
    },
  }

  return result
}
