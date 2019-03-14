import { TransitionProps } from './Transition';

export interface CSSTransitionClassNames {
  appear?: string;
  appearActive?: string;
  enter?: string;
  enterActive?: string;
  enterDone?: string;
  exit?: string;
  exitActive?: string;
  exitDone?: string;
  [key: string]: any;
}

export interface CSSTransitionProps extends TransitionProps {
  classNames: string | CSSTransitionClassNames;
}
