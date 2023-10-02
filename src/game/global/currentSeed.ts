import Prando from 'prando'

let _currentSeed = '0'
let _currentPrando: Prando = new Prando(_currentSeed)

const _regenPrando = () => (_currentPrando = new Prando(_currentSeed))

export const setCurrentSeed = (seed: string) => {
  _currentSeed = seed
  _regenPrando()
}

export const getCurrentSeed = () => _currentSeed

export const getCurrentPrando = () => _currentPrando
