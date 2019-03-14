import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  TransitionProps,
  TransitionGroupContext,
  TransitionState,
  StatusType,
  FunctionOrNull,
  Callback,
  Timeout,
  TransitionStatus
} from './types/Transition';

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

function noop() {}

export default class Transition extends Component<
  TransitionProps,
  TransitionState
> {
  static defaultProps = {
    in: false,
    mountOnEnter: false,
    unmountOnExit: false,
    appear: false,
    enter: true,
    exit: true,

    onEnter: noop,
    onEntering: noop,
    onEntered: noop,

    onExit: noop,
    onExiting: noop,
    onExited: noop
  };
  static UNMOUNTED = 0;
  static EXITED = 1;
  static ENTERING = 2;
  static ENTERED = 3;
  static EXITING = 4;

  static contextTypes = {
    transitionGroup: () => {}
  };
  static childContextTypes = {
    transitionGroup: () => {}
  };
  getChildContext() {
    return { transitionGroup: null }; // allows for nested Transitions
  }

  appearStatus: StatusType;
  nextCallback: FunctionOrNull;

  constructor(props: TransitionProps, context: TransitionGroupContext) {
    super(props, context);
    let parentGroup = context.transitionGroup;
    // In the context of a TransitionGroup all enters are really appears
    let appear =
      parentGroup && !parentGroup.isMounting ? props.enter : props.appear;

    let initialStatus: TransitionStatus;

    this.appearStatus = null;
    if (props.in) {
      if (appear) {
        initialStatus = EXITED;
        this.appearStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    this.state = { status: initialStatus };

    this.nextCallback = null;
  }

  static getDerivedStateFromProps(
    { in: nextIn }: TransitionProps,
    prevState: TransitionState
  ) {
    if (nextIn && prevState.status === UNMOUNTED) {
      return { status: EXITED };
    }
    return null;
  }

  componentDidMount() {
    this.updateStatus(true, this.appearStatus);
  }

  componentDidUpdate(prevProps: TransitionProps) {
    let nextStatus: StatusType = null;
    if (prevProps !== this.props) {
      const { status } = this.state;

      if (this.props.in) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }
    this.updateStatus(false, nextStatus);
  }

  componentWillUnmount() {
    this.cancelNextCallback();
  }

  getTimeouts() {
    const { timeout } = this.props;
    let exit, enter, appear;

    exit = enter = appear = timeout;

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit;
      enter = timeout.enter;
      // TODO: remove fallback for next major
      appear = timeout.appear !== undefined ? timeout.appear : enter;
    }
    return { exit, enter, appear };
  }

  updateStatus(mounting = false, nextStatus: TransitionStatus | null) {
    if (nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback();
      const node = ReactDOM.findDOMNode(this) as HTMLElement;

      if (nextStatus === ENTERING) {
        this.performEnter(node, mounting);
      } else {
        this.performExit(node);
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED });
    }
  }

  performEnter(node: HTMLElement, mounting: boolean) {
    const { enter, onEntered, onEnter, onEntering } = this.props;
    const appearing = this.context.transitionGroup
      ? this.context.transitionGroup.isMounting
      : mounting;

    const timeouts = this.getTimeouts();
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter;
    // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set
    if (!mounting && !enter) {
      this.safeSetState({ status: ENTERED }, () => {
        onEntered && onEntered(node);
      });
      return;
    }

    onEnter && onEnter(node, appearing);

    this.safeSetState({ status: ENTERING }, () => {
      onEntering && onEntering(node, appearing);

      this.onTransitionEnd(node, enterTimeout, () => {
        this.safeSetState({ status: ENTERED }, () => {
          onEntered && onEntered(node, appearing);
        });
      });
    });
  }

  performExit(node: HTMLElement) {
    const { exit, onExited, onExit, onExiting } = this.props;
    const timeouts = this.getTimeouts();

    // no exit animation skip right to EXITED
    if (!exit) {
      this.safeSetState({ status: EXITED }, () => {
        onExited && onExited(node);
      });
      return;
    }
    onExit && onExit(node);

    this.safeSetState({ status: EXITING }, () => {
      onExiting && onExiting(node);

      this.onTransitionEnd(node, timeouts.exit, () => {
        this.safeSetState({ status: EXITED }, () => {
          onExited && onExited(node);
        });
      });
    });
  }

  cancelNextCallback() {
    if (this.nextCallback !== null) {
      (this.nextCallback as any).cancel();
      this.nextCallback = null;
    }
  }

  safeSetState(nextState: TransitionState, callback: Callback) {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    callback = this.setNextCallback(callback);
    this.setState(nextState, callback as () => void);
  }

  setNextCallback(callback: Callback): Callback {
    let active = true;

    this.nextCallback = (event: Event) => {
      if (active) {
        active = false;
        this.nextCallback = null;

        callback(event);
      }
    };

    (this.nextCallback as any).cancel = () => {
      active = false;
    };

    return this.nextCallback;
  }

  onTransitionEnd(
    node: HTMLElement,
    timeout: Timeout | undefined,
    handler: Callback
  ) {
    this.setNextCallback(handler);

    const doesNotHaveTimeoutOrListener =
      timeout == null && !this.props.addEndListener;
    if (!node || doesNotHaveTimeoutOrListener) {
      this.nextCallback && setTimeout(this.nextCallback, 0);
      return;
    }

    if (this.props.addEndListener && this.nextCallback) {
      this.props.addEndListener(node, this.nextCallback as () => {});
    }

    if (timeout != null) {
      this.nextCallback && setTimeout(this.nextCallback, timeout as number);
    }
  }

  render() {
    const status = this.state.status;
    if (status === UNMOUNTED) {
      return null;
    }

    const { children, ...childProps } = this.props;
    // filter props for Transtition
    delete childProps.in;
    delete childProps.mountOnEnter;
    delete childProps.unmountOnExit;
    delete childProps.appear;
    delete childProps.enter;
    delete childProps.exit;
    delete childProps.timeout;
    delete childProps.addEndListener;
    delete childProps.onEnter;
    delete childProps.onEntering;
    delete childProps.onEntered;
    delete childProps.onExit;
    delete childProps.onExiting;
    delete childProps.onExited;

    if (typeof children === 'function') {
      return (children as any)(status, childProps);
    }
    const child = React.Children.only(children);
    return React.cloneElement(child as any, childProps);
  }
}
