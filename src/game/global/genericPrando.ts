import Prando from 'prando'

const genericPrando = new Prando()

export const getRandomArrayItem = <T>(array: T[]) => genericPrando.nextArrayItem(array)
