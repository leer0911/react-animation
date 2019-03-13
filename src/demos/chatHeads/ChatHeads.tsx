import React from 'react';
import { StaggeredMotion, spring, presets } from '../../motion';
import { range } from 'lodash';
import './demo.css';

export default class ChatHeads extends React.Component {
  state = { x: 250, y: 300 };
  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);
  }

  handleMouseMove = ({ pageX: x, pageY: y }: any) => {
    this.setState({ x, y });
  };

  handleTouchMove = ({ touches }: any) => {
    this.handleMouseMove(touches[0]);
  };

  getStyles = (prevStyles: any) => {
    const endValue = prevStyles.map((_: any, i: number) => {
      return i === 0
        ? this.state
        : {
            x: spring(prevStyles[i - 1].x, presets.gentle),
            y: spring(prevStyles[i - 1].y, presets.gentle)
          };
    });
    return endValue;
  };

  render() {
    return (
      <StaggeredMotion
        defaultStyles={range(6).map(() => ({ x: 0, y: 0 }))}
        styles={this.getStyles}
      >
        {balls => (
          <div className="demo1">
            {balls.map(({ x, y }, i) => (
              <div
                key={i}
                className={`demo1-ball ball-${i}`}
                style={{
                  WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  zIndex: balls.length - i
                }}
              />
            ))}
          </div>
        )}
      </StaggeredMotion>
    );
  }
}
