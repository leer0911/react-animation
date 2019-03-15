## config

mass
tension
friction
clamp
precision
velocity
duration
easing

## generic presets

config.default { mass: 1, tension: 170, friction: 26 }
config.gentle { mass: 1, tension: 120, friction: 14 }
config.wobbly { mass: 1, tension: 180, friction: 12 }
config.stiff { mass: 1, tension: 210, friction: 20 }
config.slow { mass: 1, tension: 280, friction: 60 }
config.molasses { mass: 1, tension: 280, friction: 120 }

## properties

from
to
delay
immediate
config (contains mass tension friction etc)
reset

## Interpolations

extrapolateLeft
extrapolateRight
extrapolate
range
output
map

A range shortcut ： `value.interpolate([...inputRange],[...outputRange])`

or a function : `value.interpolate(v => ...)`

## API

### useSpring

Turns values into animated-values

- overwrite values to change the animation

if you re-render the component with changed props the animation will update

```js
const props = useSpring({ opacity: toggle ? 1 : 0 });
```

- pass a function that returns values,and update using "set"

```js
const [props, set, stop] = useSpring(() => ({ opaction: 1 }));

set({ opacity: toggle ? 1 : 0 });
stop();

return <animate.div style={props}>i will fade</animate.div>;
```

## To-prop shortcut

Any property that useSpring does not recognize will be combined into "to", for instance `opacity:1` will become to `{opacity:1}`

## Async chains/scripts

The to-property also allows you to either script your animation or chain multiple animations together.Since these animations will execute

asynchroneously make sure to provide a 'from' property for base values otherwise props will be empty

```js
const props = useSpring({
  to: async (next, cancel) => {
    await next({ opacity: 1, color: '#ffaaee' });
    await next({ opacity: 0, color: 'rgb(14,26,19' });
  },
  from: {
    opacity: 0,
    color: 'red'
  }
});
```
