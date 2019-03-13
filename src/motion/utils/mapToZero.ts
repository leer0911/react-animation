import { Style, PlainStyle } from '../types';

export default function mapToZero(obj: Style | PlainStyle): PlainStyle {
  let ret: PlainStyle = {};
  Object.keys(obj).forEach(key => {
    ret[key] = 0;
  });
  return ret;
}
