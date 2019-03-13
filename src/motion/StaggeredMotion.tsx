import React, { Component } from 'react';
import { stepper, shouldStopAnimation, stripStyle, mapToZero } from './utils';
import {
  StaggeredProps,
  PlainStyle,
  Velocity,
  ReactElement,
  Style
} from './types';

const msPerFrame = 1000 / 60;

type StaggeredMotionState = {
  currentStyles: Array<PlainStyle>;
  currentVelocities: Array<Velocity>;
  lastIdealStyles: Array<PlainStyle>;
  lastIdealVelocities: Array<Velocity>;
};

function shouldStopAnimationAll(
  currentStyles: Array<PlainStyle>,
  styles: Array<Style>,
  currentVelocities: Array<Velocity>
): boolean {
  for (let i = 0; i < currentStyles.length; i++) {
    if (
      !shouldStopAnimation(currentStyles[i], styles[i], currentVelocities[i])
    ) {
      return false;
    }
  }
  return true;
}

export default class StaggeredMotion extends Component<
  StaggeredProps,
  StaggeredMotionState
> {
  state: StaggeredMotionState = this.defaultState();
  defaultState(): StaggeredMotionState {
    const { defaultStyles, styles } = this.props;
    const currentStyles: Array<PlainStyle> =
      defaultStyles || styles().map(stripStyle);
    const currentVelocities = currentStyles.map(currentStyle =>
      mapToZero(currentStyle)
    );
    return {
      currentStyles,
      currentVelocities,
      lastIdealStyles: currentStyles,
      lastIdealVelocities: currentVelocities
    };
  }

  unmounting = false;
  accumulatedTime = 0;
  prevTime = 0;
  animationID: number | null = null;
  unreadPropStyles: Array<Style> | null = null;

  componentDidMount() {
    this.prevTime = performance.now();
    this.startAnimationIfNecessary();
  }

  componentWillReceiveProps(props: StaggeredProps) {
    if (this.unreadPropStyles != null) {
      this.clearUnreadPropStyle(this.unreadPropStyles);
    }

    this.unreadPropStyles = props.styles(this.state.lastIdealStyles);
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
    const renderedChildren = this.props.children(this.state.currentStyles);
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

      const destStyles: Array<Style> = this.props.styles(
        this.state.lastIdealStyles
      );

      if (
        shouldStopAnimationAll(
          this.state.currentStyles,
          destStyles,
          this.state.currentVelocities
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
        this.animationID = null;
        this.startAnimationIfNecessary();
        return;
      }

      let currentFrameCompletion =
        (this.accumulatedTime -
          Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) /
        msPerFrame;
      const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);

      let newLastIdealStyles = [];
      let newLastIdealVelocities = [];
      let newCurrentStyles = [];
      let newCurrentVelocities = [];

      for (let i = 0; i < destStyles.length; i++) {
        const destStyle = destStyles[i];
        let newCurrentStyle: PlainStyle = {};
        let newCurrentVelocity: Velocity = {};
        let newLastIdealStyle: PlainStyle = {};
        let newLastIdealVelocity: Velocity = {};

        for (let key in destStyle) {
          if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
            continue;
          }

          const styleValue = destStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyle[key] = styleValue;
            newCurrentVelocity[key] = 0;
            newLastIdealStyle[key] = styleValue;
            newLastIdealVelocity[key] = 0;
          } else {
            let newLastIdealStyleValue = this.state.lastIdealStyles[i][key];
            let newLastIdealVelocityValue = this.state.lastIdealVelocities[i][
              key
            ];
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

        newCurrentStyles[i] = newCurrentStyle;
        newCurrentVelocities[i] = newCurrentVelocity;
        newLastIdealStyles[i] = newLastIdealStyle;
        newLastIdealVelocities[i] = newLastIdealVelocity;
      }

      this.animationID = null;
      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        lastIdealStyles: newLastIdealStyles,
        lastIdealVelocities: newLastIdealVelocities
      });

      this.unreadPropStyles = null;

      this.startAnimationIfNecessary();
    });
  };

  clearUnreadPropStyle = (unreadPropStyles: Array<Style>): void => {
    let {
      currentStyles,
      currentVelocities,
      lastIdealStyles,
      lastIdealVelocities
    } = this.state;

    let someDirty = false;
    for (let i = 0; i < unreadPropStyles.length; i++) {
      const unreadPropStyle = unreadPropStyles[i];
      let dirty = false;

      for (let key in unreadPropStyle) {
        if (!Object.prototype.hasOwnProperty.call(unreadPropStyle, key)) {
          continue;
        }

        const styleValue = unreadPropStyle[key];
        if (typeof styleValue === 'number') {
          if (!dirty) {
            dirty = true;
            someDirty = true;
            currentStyles[i] = { ...currentStyles[i] };
            currentVelocities[i] = { ...currentVelocities[i] };
            lastIdealStyles[i] = { ...lastIdealStyles[i] };
            lastIdealVelocities[i] = { ...lastIdealVelocities[i] };
          }
          currentStyles[i][key] = styleValue;
          currentVelocities[i][key] = 0;
          lastIdealStyles[i][key] = styleValue;
          lastIdealVelocities[i][key] = 0;
        }
      }
    }

    if (someDirty) {
      this.setState({
        currentStyles,
        currentVelocities,
        lastIdealStyles,
        lastIdealVelocities
      });
    }
  };
}
