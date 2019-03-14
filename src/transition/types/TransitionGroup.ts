import { ReactType, ReactElement } from 'react';
import { TransitionActions, TransitionProps } from './Transition';

export interface IntrinsicTransitionGroupProps<
  T extends keyof JSX.IntrinsicElements = 'div'
> extends TransitionActions {
  component?: T | null;
}

export interface ComponentTransitionGroupProps<T extends ReactType>
  extends TransitionActions {
  component: T;
}

export type TransitionGroupProps<
  T extends keyof JSX.IntrinsicElements = 'div',
  V extends ReactType = any
> =
  | (IntrinsicTransitionGroupProps<T> & JSX.IntrinsicElements[T])
  | (ComponentTransitionGroupProps<V>) & {
      children?:
        | ReactElement<TransitionProps>
        | Array<ReactElement<TransitionProps>>;
      childFactory?(child: ReactElement): ReactElement;
      [prop: string]: any;
    };
