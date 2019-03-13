import React, { Component } from 'react';
import { stepper, shouldStopAnimation, stripStyle, mapToZero } from './utils';
import {
  MotionProps,
  PlainStyle,
  Velocity,
  ReactElement,
  Style
} from './types';

interface MotionState {
  currentStyle: PlainStyle;
  currentVelocity: Velocity;
  lastIdealStyle: PlainStyle;
  lastIdealVelocity: Velocity;
}

// 1 帧所需要的毫秒数
const msPerFrame = 1000 / 60;

export default class Motion extends Component<MotionProps, MotionState> {
  state: MotionState = this.defaultState();
  defaultState(): MotionState {
    const { defaultStyle, style } = this.props;
    const currentStyle = defaultStyle || stripStyle(style);
    const currentVelocity = mapToZero(currentStyle);
    return {
      currentStyle,
      currentVelocity,
      lastIdealStyle: currentStyle,
      lastIdealVelocity: currentVelocity
    };
  }

  unmounting = false;
  wasAnimating = false;
  accumulatedTime = 0;
  prevTime = 0;
  animationID: number | null = null;
  unreadPropStyle: Style | null = null;

  componentDidMount() {
    this.prevTime = performance.now();
    this.startAnimationIfNecessary();
  }

  componentWillReceiveProps(props: MotionProps) {
    if (this.unreadPropStyle != null) {
      // previous props haven't had the chance to be set yet; set them here
      this.clearUnreadPropStyle(this.unreadPropStyle);
    }

    this.unreadPropStyle = props.style;
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
    const renderedChildren = this.props.children(this.state.currentStyle);
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
      const { style: propsStyle } = this.props;
      if (
        shouldStopAnimation(
          this.state.currentStyle,
          propsStyle,
          this.state.currentVelocity
        )
      ) {
        if (this.wasAnimating && this.props.onRest) {
          this.props.onRest();
        }
        this.animationID = null;
        this.wasAnimating = false;
        this.accumulatedTime = 0;
        return;
      }

      this.wasAnimating = true;

      const currentTime = timestamp || performance.now();
      const timeDelta = currentTime - this.prevTime;
      this.prevTime = currentTime;

      this.accumulatedTime = this.accumulatedTime + timeDelta;

      // 累计时间超过 10帧所需时间则认为在切换浏览器 tab，需要重新开始动画
      if (this.accumulatedTime > msPerFrame * 10) {
        this.accumulatedTime = 0;
        this.animationID = null;
        this.startAnimationIfNecessary();
        return;
      }

      // 当前完成的帧数 (整数) 所需毫秒数 = Math.floor(当前累计时间 / 1帧所需毫秒数 ) * 1帧所需毫秒数
      // 当前完成的帧数 = 当前完成的帧数 (整数) 所需毫秒数 / 1帧所需毫秒数

      let currentFrameCompletion =
        (this.accumulatedTime -
          Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) /
        msPerFrame;

      // 需要补回的帧数 = 当前累计时间 / 1帧所需毫秒数
      const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);

      let newLastIdealStyle: PlainStyle = {};
      let newLastIdealVelocity: Velocity = {};
      let newCurrentStyle: PlainStyle = {};
      let newCurrentVelocity: Velocity = {};

      Object.keys(propsStyle).forEach(key => {
        const styleValue = propsStyle[key];

        // 判断是否需要引入缓动函数
        if (typeof styleValue === 'number') {
          newCurrentStyle[key] = styleValue;
          newCurrentVelocity[key] = 0;
          newLastIdealStyle[key] = styleValue;
          newLastIdealVelocity[key] = 0;
        } else {
          let newLastIdealStyleValue = this.state.lastIdealStyle[key];
          let newLastIdealVelocityValue = this.state.lastIdealVelocity[key];

          // 当浏览器切换时，需要补回的帧动画
          for (let i = 0; i < framesToCatchUp; i++) {
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

          // 求得弹力模式下的新目标值和速度
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
      });

      this.animationID = null;

      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyle: newCurrentStyle,
        currentVelocity: newCurrentVelocity,
        lastIdealStyle: newLastIdealStyle,
        lastIdealVelocity: newLastIdealVelocity
      });

      this.unreadPropStyle = null;

      this.startAnimationIfNecessary();
    });
  };

  clearUnreadPropStyle = (destStyle: Style): void => {
    let dirty = false;
    let {
      currentStyle,
      currentVelocity,
      lastIdealStyle,
      lastIdealVelocity
    } = this.state;

    for (let key in destStyle) {
      if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
        continue;
      }

      const styleValue = destStyle[key];
      if (typeof styleValue === 'number') {
        if (!dirty) {
          dirty = true;
          currentStyle = { ...currentStyle };
          currentVelocity = { ...currentVelocity };
          lastIdealStyle = { ...lastIdealStyle };
          lastIdealVelocity = { ...lastIdealVelocity };
        }

        currentStyle[key] = styleValue;
        currentVelocity[key] = 0;
        lastIdealStyle[key] = styleValue;
        lastIdealVelocity[key] = 0;
      }
    }

    if (dirty) {
      this.setState({
        currentStyle,
        currentVelocity,
        lastIdealStyle,
        lastIdealVelocity
      });
    }
  };
}
