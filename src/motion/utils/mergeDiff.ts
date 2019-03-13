import { TransitionStyle } from '../types';

export default function mergeDiff(
  prev: Array<TransitionStyle>,
  next: Array<TransitionStyle>,
  onRemove: any
): Array<TransitionStyle> {
  let prevKeyIndex: { [key: string]: number } = {};
  for (let i = 0; i < prev.length; i++) {
    prevKeyIndex[prev[i].key] = i;
  }
  let nextKeyIndex: { [key: string]: number } = {};
  for (let i = 0; i < next.length; i++) {
    nextKeyIndex[next[i].key] = i;
  }

  let ret = [];
  for (let i = 0; i < next.length; i++) {
    ret[i] = next[i];
  }
  for (let i = 0; i < prev.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(nextKeyIndex, prev[i].key)) {
      const fill = onRemove(i, prev[i]);
      if (fill != null) {
        ret.push(fill);
      }
    }
  }

  return ret.sort((a, b) => {
    const nextOrderA = nextKeyIndex[a.key];
    const nextOrderB = nextKeyIndex[b.key];
    const prevOrderA = prevKeyIndex[a.key];
    const prevOrderB = prevKeyIndex[b.key];

    if (nextOrderA != null && nextOrderB != null) {
      return nextKeyIndex[a.key] - nextKeyIndex[b.key];
    } else if (prevOrderA != null && prevOrderB != null) {
      return prevKeyIndex[a.key] - prevKeyIndex[b.key];
    } else if (nextOrderA != null) {
      for (let i = 0; i < next.length; i++) {
        const pivot = next[i].key;
        if (!Object.prototype.hasOwnProperty.call(prevKeyIndex, pivot)) {
          continue;
        }

        if (
          nextOrderA < nextKeyIndex[pivot] &&
          prevOrderB > prevKeyIndex[pivot]
        ) {
          return -1;
        } else if (
          nextOrderA > nextKeyIndex[pivot] &&
          prevOrderB < prevKeyIndex[pivot]
        ) {
          return 1;
        }
      }
      return 1;
    }
    for (let i = 0; i < next.length; i++) {
      const pivot = next[i].key;
      if (!Object.prototype.hasOwnProperty.call(prevKeyIndex, pivot)) {
        continue;
      }
      if (
        nextOrderB < nextKeyIndex[pivot] &&
        prevOrderA > prevKeyIndex[pivot]
      ) {
        return 1;
      } else if (
        nextOrderB > nextKeyIndex[pivot] &&
        prevOrderA < prevKeyIndex[pivot]
      ) {
        return -1;
      }
    }
    return -1;
  });
}
