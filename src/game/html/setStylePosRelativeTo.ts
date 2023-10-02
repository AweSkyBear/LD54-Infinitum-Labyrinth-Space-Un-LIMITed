import { IHTMLElWrapper } from '../../htmlEl/addHtmlEl'

export const setStylePosRelativeTo = (
  htmlWrapperToRepos: IHTMLElWrapper,
  relativeEl: HTMLElement,
  offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
  htmlWrapperToRepos.el.style.left = `${parseInt(relativeEl.offsetLeft as any) - offset.x}px`
  htmlWrapperToRepos.el.style.top = `${parseInt(relativeEl.offsetTop as any) + offset.y}px`
}
