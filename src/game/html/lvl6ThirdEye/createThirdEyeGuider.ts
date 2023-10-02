import { IObserver } from '../../../OD'
import { Pos } from '../../../common/types'
import { createThirdEyeSvg } from '../../../svg/createThirdEyeSvg'
import { createInteractibleItem } from '../createInteractibleItem'

export const createThirdEyeGuider = (
  pos: Pos,
  onPlayerInteraction?: ({ obs }: { obs: IObserver }) => void
) => {
  return createInteractibleItem()({
    pos,
    html: `${createThirdEyeSvg()}`,
    classname: 'third-eye-portal-hint',
    onPlayerInteraction: ({ obs }) => {
      onPlayerInteraction && onPlayerInteraction({ obs })
    },
  })
}
