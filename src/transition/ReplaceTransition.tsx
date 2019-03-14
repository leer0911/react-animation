import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import TransitionGroup from './TransitionGroup';
import { TransitionProps } from './types/Transition';

export default class ReplaceTransition extends Component<TransitionProps, any> {
  handleEnter = (...args: any) => this.handleLifecycle('onEnter', 0, args);
  handleEntering = (...args: any) =>
    this.handleLifecycle('onEntering', 0, args);
  handleEntered = (...args: any) => this.handleLifecycle('onEntered', 0, args);
  handleExit = (...args: any) => this.handleLifecycle('onExit', 1, args);
  handleExiting = (...args: any) => this.handleLifecycle('onExiting', 1, args);
  handleExited = (...args: any) => this.handleLifecycle('onExited', 1, args);

  handleLifecycle(handler: string, idx: number, originalArgs: any) {
    const { children } = this.props;
    const child: any = React.Children.toArray(children)[idx];
    if (!child) {
      return;
    }
    if (child.props[handler]) child.props[handler](...originalArgs);
    if ((this.props as any)[handler])
      (this.props as any)[handler](findDOMNode(this));
  }

  render() {
    const { children, in: inProp, ...props } = this.props;
    const [first, second] = React.Children.toArray(children);

    delete props.onEnter;
    delete props.onEntering;
    delete props.onEntered;
    delete props.onExit;
    delete props.onExiting;
    delete props.onExited;

    return (
      <TransitionGroup {...props}>
        {inProp
          ? React.cloneElement(first as any, {
              key: 'first',
              onEnter: this.handleEnter,
              onEntering: this.handleEntering,
              onEntered: this.handleEntered
            })
          : React.cloneElement(second as any, {
              key: 'second',
              onEnter: this.handleExit,
              onEntering: this.handleExiting,
              onEntered: this.handleExited
            })}
      </TransitionGroup>
    );
  }
}
