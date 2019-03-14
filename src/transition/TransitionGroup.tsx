import React, { Component } from 'react';
import { TransitionGroupProps } from './types/TransitionGroup';
import {
  getChildMapping,
  getInitialChildMapping,
  getNextChildMapping
} from './utils/ChildMapping';

const values =
  Object.values || ((obj: any) => Object.keys(obj).map(k => obj[k]));

interface State {
  children: any;
  handleExited: (child: any, node: any) => void;
  firstRender: boolean;
}

export default class TransitionGroup extends Component<
  TransitionGroupProps,
  State
> {
  static defaultProps = {
    component: 'div',
    childFactory: (child: any) => child
  };
  static childContextTypes = {
    transitionGroup: () => {}
  };

  appeared = false;
  mounted = false;

  state = {
    children: {},
    handleExited: this.handleExited.bind(this),
    firstRender: true
  };

  getChildContext() {
    return {
      transitionGroup: { isMounting: !this.appeared }
    };
  }

  componentDidMount() {
    this.appeared = true;
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromProps(
    nextProps: TransitionGroupProps,
    { children: prevChildMapping, handleExited, firstRender }: any
  ) {
    return {
      children: firstRender
        ? getInitialChildMapping(nextProps, handleExited)
        : getNextChildMapping(nextProps, prevChildMapping, handleExited),
      firstRender: false
    };
  }

  handleExited(child: any, node: any) {
    let currentChildMapping = getChildMapping(this.props.children, () => {});

    if (child.key in currentChildMapping) return;

    if (child.props.onExited) {
      child.props.onExited(node);
    }

    if (this.mounted) {
      this.setState((state: any) => {
        let children = { ...state.children };

        delete children[child.key];
        return { children };
      });
    }
  }

  render() {
    const { component: Component, childFactory, ...props } = this.props as any;
    const children = values(this.state.children).map(childFactory);

    delete props.appear;
    delete props.enter;
    delete props.exit;

    if (Component === null) {
      return children;
    }
    return <Component {...props}>{children}</Component>;
  }
}
