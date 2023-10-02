import { getContainer } from '../../common/container'

export const getTopMazeEl = () => document.querySelector<HTMLElement>('#maze')

export const getMazeEl = () => getContainer().querySelector<HTMLElement>('.maze')
