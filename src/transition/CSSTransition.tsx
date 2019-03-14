import React, { Component } from 'react';
import {
  addClass as addOneClass,
  removeClass as removeOneClass
} from './utils/class';
import Transition from './Transition';
import { CSSTransitionProps } from './types/CSSTransition';
import { EnterHandler } from './types/Transition';

const addClass = (node: HTMLElement, classes: string) =>
  node && classes && classes.split(' ').forEach(c => addOneClass(node, c));
const removeClass = (node: HTMLElement, classes: string) =>
  node && classes && classes.split(' ').forEach(c => removeOneClass(node, c));

export default class CSSTransition extends Component<CSSTransitionProps> {
  onEnter: EnterHandler = (node, appearing) => {
    const { className } = this.getClassNames(appearing ? 'appear' : 'enter');

    this.removeClasses(node, 'exit');
    addClass(node, className);

    if (this.props.onEnter) {
      this.props.onEnter(node, appearing);
    }
  };

  onEntering: EnterHandler = (node, appearing) => {
    const { activeClassName } = this.getClassNames(
      appearing ? 'appear' : 'enter'
    );

    this.reflowAndAddClass(node, activeClassName);

    if (this.props.onEntering) {
      this.props.onEntering(node, appearing);
    }
  };

  onEntered: EnterHandler = (node, appearing) => {
    const { doneClassName } = this.getClassNames('enter');

    this.removeClasses(node, appearing ? 'appear' : 'enter');
    addClass(node, doneClassName);

    if (this.props.onEntered) {
      this.props.onEntered(node, appearing);
    }
  };

  onExit = (node: HTMLElement) => {
    const { className } = this.getClassNames('exit');

    this.removeClasses(node, 'appear');
    this.removeClasses(node, 'enter');
    addClass(node, className);

    if (this.props.onExit) {
      this.props.onExit(node);
    }
  };

  onExiting = (node: HTMLElement) => {
    const { activeClassName } = this.getClassNames('exit');

    this.reflowAndAddClass(node, activeClassName);

    if (this.props.onExiting) {
      this.props.onExiting(node);
    }
  };

  onExited = (node: HTMLElement) => {
    const { doneClassName } = this.getClassNames('exit');

    this.removeClasses(node, 'exit');
    addClass(node, doneClassName);

    if (this.props.onExited) {
      this.props.onExited(node);
    }
  };

  getClassNames = (type: string) => {
    const { classNames } = this.props;

    let className =
      typeof classNames !== 'string'
        ? classNames[type]
        : classNames + '-' + type;

    let activeClassName =
      typeof classNames !== 'string'
        ? classNames[type + 'Active']
        : className + '-active';

    let doneClassName =
      typeof classNames !== 'string'
        ? classNames[type + 'Done']
        : className + '-done';

    return {
      className,
      activeClassName,
      doneClassName
    };
  };

  removeClasses(node: HTMLElement, type: string) {
    const { className, activeClassName, doneClassName } = this.getClassNames(
      type
    );
    className && removeClass(node, className);
    activeClassName && removeClass(node, activeClassName);
    doneClassName && removeClass(node, doneClassName);
  }

  reflowAndAddClass(node: HTMLElement, className: string) {
    // This is for to force a repaint,
    // which is necessary in order to transition styles when adding a class name.
    if (className) {
      /* eslint-disable no-unused-expressions */
      node && node.scrollTop;
      /* eslint-enable no-unused-expressions */
      addClass(node, className);
    }
  }

  render() {
    const props = { ...this.props };

    delete props.classNames;

    return (
      <Transition
        {...props}
        onEnter={this.onEnter}
        onEntered={this.onEntered}
        onEntering={this.onEntering}
        onExit={this.onExit}
        onExiting={this.onExiting}
        onExited={this.onExited}
      />
    );
  }
}
