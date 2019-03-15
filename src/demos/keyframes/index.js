import React, { useState } from 'react';
import { useSpring, animated } from '../../spring/targets/web';
import './styles.css';

/*
0 % { transform: scale(1); }
25 % { transform: scale(.97); }
35 % { transform: scale(.9); }
45 % { transform: scale(1.1); }
55 % { transform: scale(.9); }
65 % { transform: scale(1.1); }
75 % { transform: scale(1.03); }
100 % { transform: scale(1); }
`*/

export default function Demo() {
  const [state, toggle] = useState(true);
  const { x, color } = useSpring({
    from: { x: 0, color: 'red' },
    x: state ? 1 : 0,
    color: 'green',
    config: { duration: 1000 }
  });
  return (
    <div className="kf-main" onClick={() => toggle(!state)}>
      <animated.div
        style={{
          color,
          opacity: x.interpolate({ output: [0.3, 1] }),
          transform: x
            .interpolate(
              [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
              [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1]
            )
            .interpolate(x => `scale(${x})`)
        }}
      >
        {x.interpolate(n => n.toFixed(2)) /* innerText interpolation ... */}
      </animated.div>
    </div>
  );
}
