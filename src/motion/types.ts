import { ReactElement } from 'react';

export type ReactElement = ReactElement;

export interface SpringHelperConfig {
  stiffness?: number;
  damping?: number;
  precision?: number;
}

export interface OpaqueConfig {
  val: number;
  stiffness: number;
  damping: number;
  precision: number;
}

export interface Style {
  [key: string]: number | OpaqueConfig;
}

export interface PlainStyle {
  [key: string]: number;
}

export interface Velocity {
  [key: string]: number;
}

export interface MotionProps {
  defaultStyle?: PlainStyle;
  style: Style;
  children: (interpolatedStyle: PlainStyle) => ReactElement;
  onRest?: () => void;
}

export interface StaggeredProps {
  defaultStyles?: Array<PlainStyle>;
  styles: (previousInterpolatedStyles?: Array<PlainStyle>) => Array<Style>;
  children: (interpolatedStyles: Array<PlainStyle>) => ReactElement;
}

export interface TransitionStyle {
  key: string;
  data?: any;
  style: Style;
}

export interface TransitionPlainStyle {
  key: string;
  data?: any;
  style: PlainStyle;
}

export type WillEnter = (styleThatEntered: TransitionStyle) => PlainStyle;
export type WillLeave = (styleThatLeft: TransitionStyle) => Style;
export type DidLeave = (styleThatLeft: { key: string; data?: any }) => void;

export interface TransitionProps {
  defaultStyles?: Array<TransitionPlainStyle>;
  styles:
    | Array<TransitionStyle>
    | ((
        previousInterpolatedStyles?: Array<TransitionPlainStyle>
      ) => Array<TransitionStyle>);
  children: (interpolatedStyles: Array<TransitionPlainStyle>) => ReactElement;
  willEnter?: WillEnter;
  willLeave?: WillLeave;
  didLeave?: DidLeave;
}
