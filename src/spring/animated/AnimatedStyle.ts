import Animated, { AnimatedObjectWithChildren } from './Animated'
import * as Globals from './Globals'

export default class AnimatedStyle extends AnimatedObjectWithChildren {
  constructor(style: any) {
    super()
    style = style || {}
    if (style.transform && !(style.transform instanceof Animated))
      style = Globals.applyAnimatedValues.transform(style)
    this.payload = style
  }
}
