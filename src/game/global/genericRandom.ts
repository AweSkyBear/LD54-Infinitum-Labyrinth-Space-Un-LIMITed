import Prando from 'prando'

const genericPrandoInst = new Prando()
export const randomDeg = () => genericPrandoInst.next(0, 359)
