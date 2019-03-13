import { Style, PlainStyle } from '../types';

export default function stripStyle(style: Style): PlainStyle {
  let ret: PlainStyle = {};
  Object.keys(style).forEach(key => {
    ret[key] =
      typeof style[key] === 'number' ? style[key] : (style as any)[key].val;
  });
  return ret;
}
