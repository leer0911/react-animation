export type EndHandler = (node: HTMLElement, done: () => void) => void;
export type EnterHandler = (node: HTMLElement, isAppearing?: boolean) => void;
export type ExitHandler = (node: HTMLElement) => void;
export type Timeout =
  | number
  | { enter?: number; exit?: number; appear?: number | undefined };
export type StatusType = TransitionStatus | null;
export type FunctionOrNull = TimerHandler | null;
export type Callback = ((event?: Event) => void) | Function;

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

export interface TransitionActions {
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
}

export type TransitionStatus =
  | typeof ENTERING
  | typeof ENTERED
  | typeof EXITING
  | typeof EXITED
  | typeof UNMOUNTED;

export type TransitionChildren =
  | React.ReactNode
  | ((status: TransitionStatus) => React.ReactNode);

export interface TransitionProps extends TransitionActions {
  in?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  timeout: Timeout;
  addEndListener?: EndHandler;
  onEnter?: EnterHandler;
  onEntering?: EnterHandler;
  onEntered?: EnterHandler;
  onExit?: ExitHandler;
  onExiting?: ExitHandler;
  onExited?: ExitHandler;
  [prop: string]: any;
  children?: TransitionChildren;
}

export interface TransitionGroupContext {
  transitionGroup: {
    isMounting: boolean;
  };
}

export interface TransitionState {
  status: TransitionStatus;
}
