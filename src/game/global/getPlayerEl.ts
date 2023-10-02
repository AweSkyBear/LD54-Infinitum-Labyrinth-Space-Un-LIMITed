import { getContainer } from '../../common/container'

export const getPlayerEl = () =>
  getContainer().querySelector('.player').parentElement as HTMLElement
