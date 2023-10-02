import { getMazeEl } from './getMazeEl'

export const getFirstMazeCellEl = () => getMazeEl().querySelector<HTMLElement>('.cell')
