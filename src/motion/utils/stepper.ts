let reusedTuple: [number, number] = [0, 0];
// k：劲度系数，又称弹簧常数，刚性系数
// b: 阻尼

export default function stepper(
  secondPerFrame: number,
  x: number,
  v: number,
  destX: number,
  k: number,
  b: number,
  precision: number
): [number, number] {
  // 弹簧的拉力 = -劲度系数 * 形变量 ( F=-k·x )
  const Fspring = -k * (x - destX);
  // 弹簧的阻尼力
  const Fdamper = -b * v;
  // 假定质量相同，F = ma 加速度等于 a = F
  const a = Fspring + Fdamper;

  const newV = v + a * secondPerFrame;
  const newX = x + newV * secondPerFrame;

  if (Math.abs(newV) < precision && Math.abs(newX - destX) < precision) {
    reusedTuple[0] = destX;
    reusedTuple[1] = 0;
    return reusedTuple;
  }

  reusedTuple[0] = newX;
  reusedTuple[1] = newV;
  return reusedTuple;
}
