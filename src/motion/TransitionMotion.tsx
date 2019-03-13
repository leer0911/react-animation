import React from 'react';
import {
  stepper,
  shouldStopAnimation,
  stripStyle,
  mapToZero,
  mergeDiff
} from './utils';

import {
  ReactElement,
  PlainStyle,
  Velocity,
  TransitionStyle,
  TransitionPlainStyle,
  WillEnter,
  WillLeave,
  DidLeave,
  TransitionProps
} from './types';

const msPerFrame = 1000 / 60;

function rehydrateStyles(
  mergedPropsStyles: Array<TransitionStyle>,
  unreadPropStyles: Array<TransitionStyle> | null,
  plainStyles: Array<PlainStyle>
): Array<TransitionPlainStyle> {
  const cUnreadPropStyles = unreadPropStyles;
  if (cUnreadPropStyles == null) {
    return mergedPropsStyles.map((mergedPropsStyle, i) => ({
      key: mergedPropsStyle.key,
      data: mergedPropsStyle.data,
      style: plainStyles[i]
    }));
  }
  return mergedPropsStyles.map((mergedPropsStyle, i) => {
    for (let j = 0; j < cUnreadPropStyles.length; j++) {
      if (cUnreadPropStyles[j].key === mergedPropsStyle.key) {
        return {
          key: cUnreadPropStyles[j].key,
          data: cUnreadPropStyles[j].data,
          style: plainStyles[i]
        };
      }
    }
    return {
      key: mergedPropsStyle.key,
      data: mergedPropsStyle.data,
      style: plainStyles[i]
    };
  });
}

function shouldStopAnimationAll(
  currentStyles: Array<PlainStyle>,
  destStyles: Array<TransitionStyle>,
  currentVelocities: Array<Velocity>,
  mergedPropsStyles: Array<TransitionStyle>
): boolean {
  if (mergedPropsStyles.length !== destStyles.length) {
    return false;
  }

  for (let i = 0; i < mergedPropsStyles.length; i++) {
    if (mergedPropsStyles[i].key !== destStyles[i].key) {
      return false;
    }
  }

  for (let i = 0; i < mergedPropsStyles.length; i++) {
    if (
      !shouldStopAnimation(
        currentStyles[i],
        destStyles[i].style,
        currentVelocities[i]
      )
    ) {
      return false;
    }
  }

  return true;
}

function mergeAndSync(
  willEnter: WillEnter,
  willLeave: WillLeave,
  didLeave: DidLeave,
  oldMergedPropsStyles: Array<TransitionStyle>,
  destStyles: Array<TransitionStyle>,
  oldCurrentStyles: Array<PlainStyle>,
  oldCurrentVelocities: Array<Velocity>,
  oldLastIdealStyles: Array<PlainStyle>,
  oldLastIdealVelocities: Array<Velocity>
): [
  Array<TransitionStyle>,
  Array<PlainStyle>,
  Array<Velocity>,
  Array<PlainStyle>,
  Array<Velocity>
] {
  const newMergedPropsStyles = mergeDiff(
    oldMergedPropsStyles,
    destStyles,
    (oldIndex: any, oldMergedPropsStyle: any) => {
      const leavingStyle = willLeave(oldMergedPropsStyle);
      if (leavingStyle == null) {
        didLeave({
          key: oldMergedPropsStyle.key,
          data: oldMergedPropsStyle.data
        });
        return null;
      }
      if (
        shouldStopAnimation(
          oldCurrentStyles[oldIndex],
          leavingStyle,
          oldCurrentVelocities[oldIndex]
        )
      ) {
        didLeave({
          key: oldMergedPropsStyle.key,
          data: oldMergedPropsStyle.data
        });
        return null;
      }
      return {
        key: oldMergedPropsStyle.key,
        data: oldMergedPropsStyle.data,
        style: leavingStyle
      };
    }
  );

  let newCurrentStyles = [];
  let newCurrentVelocities = [];
  let newLastIdealStyles = [];
  let newLastIdealVelocities = [];
  for (let i = 0; i < newMergedPropsStyles.length; i++) {
    const newMergedPropsStyleCell = newMergedPropsStyles[i];
    let foundOldIndex = null;
    for (let j = 0; j < oldMergedPropsStyles.length; j++) {
      if (oldMergedPropsStyles[j].key === newMergedPropsStyleCell.key) {
        foundOldIndex = j;
        break;
      }
    }
    if (foundOldIndex == null) {
      const plainStyle = willEnter(newMergedPropsStyleCell);
      newCurrentStyles[i] = plainStyle;
      newLastIdealStyles[i] = plainStyle;

      const velocity = mapToZero(newMergedPropsStyleCell.style);
      newCurrentVelocities[i] = velocity;
      newLastIdealVelocities[i] = velocity;
    } else {
      newCurrentStyles[i] = oldCurrentStyles[foundOldIndex];
      newLastIdealStyles[i] = oldLastIdealStyles[foundOldIndex];
      newCurrentVelocities[i] = oldCurrentVelocities[foundOldIndex];
      newLastIdealVelocities[i] = oldLastIdealVelocities[foundOldIndex];
    }
  }

  return [
    newMergedPropsStyles,
    newCurrentStyles,
    newCurrentVelocities,
    newLastIdealStyles,
    newLastIdealVelocities
  ];
}

interface TransitionMotionState {
  currentStyles: Array<PlainStyle>;
  currentVelocities: Array<Velocity>;
  lastIdealStyles: Array<PlainStyle>;
  lastIdealVelocities: Array<Velocity>;
  mergedPropsStyles: Array<TransitionStyle>;
}

export default class TransitionMotion extends React.Component<
  TransitionProps,
  TransitionMotionState
> {
  static defaultProps = {
    willEnter: (styleThatEntered: any) => stripStyle(styleThatEntered.style),
    willLeave: () => null,
    didLeave: () => {}
  };
  state = this.defaultState();
  defaultState(): TransitionMotionState {
    const {
      defaultStyles,
      styles,
      willEnter,
      willLeave,
      didLeave
    } = this.props;

    const destStyles: Array<TransitionStyle> =
      typeof styles === 'function' ? styles(defaultStyles) : styles;

    let oldMergedPropsStyles: Array<TransitionStyle>;

    if (defaultStyles == null) {
      oldMergedPropsStyles = destStyles;
    } else {
      oldMergedPropsStyles = defaultStyles.map(defaultStyleCell => {
        for (let i = 0; i < destStyles.length; i++) {
          if (destStyles[i].key === defaultStyleCell.key) {
            return destStyles[i];
          }
        }
        return defaultStyleCell;
      });
    }

    const oldCurrentStyles =
      defaultStyles == null
        ? destStyles.map(s => stripStyle(s.style))
        : defaultStyles.map(s => stripStyle(s.style));
    const oldCurrentVelocities =
      defaultStyles == null
        ? destStyles.map(s => mapToZero(s.style))
        : defaultStyles.map(s => mapToZero(s.style));

    const [
      mergedPropsStyles,
      currentStyles,
      currentVelocities,
      lastIdealStyles,
      lastIdealVelocities
    ] = mergeAndSync(
      willEnter as any,
      willLeave as any,
      didLeave as any,
      oldMergedPropsStyles,
      destStyles,
      oldCurrentStyles,
      oldCurrentVelocities,
      oldCurrentStyles,
      oldCurrentVelocities
    );

    return {
      currentStyles,
      currentVelocities,
      lastIdealStyles,
      lastIdealVelocities,
      mergedPropsStyles
    };
  }

  unmounting: boolean = false;
  animationID: number | null = null;
  prevTime = 0;
  accumulatedTime = 0;
  unreadPropStyles: Array<TransitionStyle> | null = null;

  componentDidMount() {
    this.prevTime = performance.now();
    this.startAnimationIfNecessary();
  }

  componentWillReceiveProps(props: TransitionProps) {
    if (this.unreadPropStyles) {
      this.clearUnreadPropStyle(this.unreadPropStyles);
    }

    const styles = props.styles;
    if (typeof styles === 'function') {
      this.unreadPropStyles = styles(
        rehydrateStyles(
          this.state.mergedPropsStyles,
          this.unreadPropStyles,
          this.state.lastIdealStyles
        )
      );
    } else {
      this.unreadPropStyles = styles;
    }

    if (this.animationID == null) {
      this.prevTime = performance.now();
      this.startAnimationIfNecessary();
    }
  }

  componentWillUnmount() {
    this.unmounting = true;
    if (this.animationID != null) {
      cancelAnimationFrame(this.animationID);
      this.animationID = null;
    }
  }

  render(): ReactElement {
    const hydratedStyles = rehydrateStyles(
      this.state.mergedPropsStyles,
      this.unreadPropStyles,
      this.state.currentStyles
    );
    const renderedChildren = this.props.children(hydratedStyles);
    return renderedChildren && React.Children.only(renderedChildren);
  }

  startAnimationIfNecessary = (): void => {
    if (this.unmounting || this.animationID != null) {
      return;
    }

    this.animationID = requestAnimationFrame(timestamp => {
      if (this.unmounting) {
        return;
      }

      const propStyles = this.props.styles;
      let destStyles: Array<TransitionStyle> =
        typeof propStyles === 'function'
          ? propStyles(
              rehydrateStyles(
                this.state.mergedPropsStyles,
                this.unreadPropStyles,
                this.state.lastIdealStyles
              )
            )
          : propStyles;

      if (
        shouldStopAnimationAll(
          this.state.currentStyles,
          destStyles,
          this.state.currentVelocities,
          this.state.mergedPropsStyles
        )
      ) {
        this.animationID = null;
        this.accumulatedTime = 0;
        return;
      }

      const currentTime = timestamp || performance.now();
      const timeDelta = currentTime - this.prevTime;
      this.prevTime = currentTime;
      this.accumulatedTime = this.accumulatedTime + timeDelta;
      if (this.accumulatedTime > msPerFrame * 10) {
        this.accumulatedTime = 0;
      }

      if (this.accumulatedTime === 0) {
        this.animationID = null;
        this.startAnimationIfNecessary();
        return;
      }

      let currentFrameCompletion =
        (this.accumulatedTime -
          Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) /
        msPerFrame;
      const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);

      let [
        newMergedPropsStyles,
        newCurrentStyles,
        newCurrentVelocities,
        newLastIdealStyles,
        newLastIdealVelocities
      ] = mergeAndSync(
        this.props.willEnter as any,
        this.props.willLeave as any,
        this.props.didLeave as any,
        this.state.mergedPropsStyles,
        destStyles,
        this.state.currentStyles,
        this.state.currentVelocities,
        this.state.lastIdealStyles,
        this.state.lastIdealVelocities
      );
      for (let i = 0; i < newMergedPropsStyles.length; i++) {
        const newMergedPropsStyle = newMergedPropsStyles[i].style;
        let newCurrentStyle: PlainStyle = {};
        let newCurrentVelocity: Velocity = {};
        let newLastIdealStyle: PlainStyle = {};
        let newLastIdealVelocity: Velocity = {};

        for (let key in newMergedPropsStyle) {
          if (!Object.prototype.hasOwnProperty.call(newMergedPropsStyle, key)) {
            continue;
          }

          const styleValue = newMergedPropsStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyle[key] = styleValue;
            newCurrentVelocity[key] = 0;
            newLastIdealStyle[key] = styleValue;
            newLastIdealVelocity[key] = 0;
          } else {
            let newLastIdealStyleValue = newLastIdealStyles[i][key];
            let newLastIdealVelocityValue = newLastIdealVelocities[i][key];
            for (let j = 0; j < framesToCatchUp; j++) {
              [newLastIdealStyleValue, newLastIdealVelocityValue] = stepper(
                msPerFrame / 1000,
                newLastIdealStyleValue,
                newLastIdealVelocityValue,
                styleValue.val,
                styleValue.stiffness,
                styleValue.damping,
                styleValue.precision
              );
            }
            const [nextIdealX, nextIdealV] = stepper(
              msPerFrame / 1000,
              newLastIdealStyleValue,
              newLastIdealVelocityValue,
              styleValue.val,
              styleValue.stiffness,
              styleValue.damping,
              styleValue.precision
            );

            newCurrentStyle[key] =
              newLastIdealStyleValue +
              (nextIdealX - newLastIdealStyleValue) * currentFrameCompletion;
            newCurrentVelocity[key] =
              newLastIdealVelocityValue +
              (nextIdealV - newLastIdealVelocityValue) * currentFrameCompletion;
            newLastIdealStyle[key] = newLastIdealStyleValue;
            newLastIdealVelocity[key] = newLastIdealVelocityValue;
          }
        }

        newLastIdealStyles[i] = newLastIdealStyle;
        newLastIdealVelocities[i] = newLastIdealVelocity;
        newCurrentStyles[i] = newCurrentStyle;
        newCurrentVelocities[i] = newCurrentVelocity;
      }

      this.animationID = null;
      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        lastIdealStyles: newLastIdealStyles,
        lastIdealVelocities: newLastIdealVelocities,
        mergedPropsStyles: newMergedPropsStyles
      });

      this.unreadPropStyles = null;

      this.startAnimationIfNecessary();
    });
  };
  clearUnreadPropStyle = (unreadPropStyles: Array<TransitionStyle>): void => {
    let [
      mergedPropsStyles,
      currentStyles,
      currentVelocities,
      lastIdealStyles,
      lastIdealVelocities
    ] = mergeAndSync(
      this.props.willEnter as any,
      this.props.willLeave as any,
      this.props.didLeave as any,
      this.state.mergedPropsStyles,
      unreadPropStyles,
      this.state.currentStyles,
      this.state.currentVelocities,
      this.state.lastIdealStyles,
      this.state.lastIdealVelocities
    );

    for (let i = 0; i < unreadPropStyles.length; i++) {
      const unreadPropStyle = unreadPropStyles[i].style;
      let dirty = false;

      for (let key in unreadPropStyle) {
        if (!Object.prototype.hasOwnProperty.call(unreadPropStyle, key)) {
          continue;
        }

        const styleValue = unreadPropStyle[key];
        if (typeof styleValue === 'number') {
          if (!dirty) {
            dirty = true;
            currentStyles[i] = { ...currentStyles[i] };
            currentVelocities[i] = { ...currentVelocities[i] };
            lastIdealStyles[i] = { ...lastIdealStyles[i] };
            lastIdealVelocities[i] = { ...lastIdealVelocities[i] };
            mergedPropsStyles[i] = {
              key: mergedPropsStyles[i].key,
              data: mergedPropsStyles[i].data,
              style: { ...mergedPropsStyles[i].style }
            };
          }
          currentStyles[i][key] = styleValue;
          currentVelocities[i][key] = 0;
          lastIdealStyles[i][key] = styleValue;
          lastIdealVelocities[i][key] = 0;
          mergedPropsStyles[i].style[key] = styleValue;
        }
      }
    }

    this.setState({
      currentStyles,
      currentVelocities,
      mergedPropsStyles,
      lastIdealStyles,
      lastIdealVelocities
    });
  };
}
