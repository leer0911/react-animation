import { PlainStyle, Style, Velocity } from '../types';

export default function shouldStopAnimation(
  currentStyle: PlainStyle,
  style: Style,
  currentVelocity: Velocity
): boolean {
  for (let key in style) {
    if (!Object.prototype.hasOwnProperty.call(style, key)) {
      continue;
    }

    if (currentVelocity[key] !== 0) {
      return false;
    }

    const styleValue =
      typeof style[key] === 'number' ? style[key] : (style as any)[key].val;
    if (currentStyle[key] !== styleValue) {
      return false;
    }
  }

  return true;
}
