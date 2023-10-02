// @ts-ignore
import duck1 from './duck/duck-svgrepo-com (1).svg'
// @ts-ignore
import duck2 from './duck/duck-svgrepo-com (3).svg'
// @ts-ignore
import duck3 from './duck/duck-animal-svgrepo-com.svg'
// @ts-ignore
import duck1 from './duck/duck-svgrepo-com (1).svg'
// @ts-ignore
import duck4 from './duck/duck-svgrepo-com.svg'
// @ts-ignore
import duck5 from './duck/animal-duck-ducks-svgrepo-com.svg'

export const createRandomDuckSvg = () => {
  const ducks = [duck1, duck2, duck3, duck4, duck5]
  const selected = parseInt((Math.random() * 10) as any) % ducks.length
  return ducks[selected]
}
