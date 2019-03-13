import React, { Component } from 'react';
import { Motion, spring } from '../../motion';
import './demo.css';

export default class Transition extends Component {
  state = { open: false };
  handleMouseDown = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    return (
      <div>
        <button onMouseDown={this.handleMouseDown}>Toggle</button>
        <Motion
          style={{
            x: spring(this.state.open ? 400 : 0)
          }}
        >
          {({ x }) => (
            <div className="demo0">
              <div
                className="demo0-block"
                style={{
                  WebkitTransform: `translate3d(${x}px,0,0)`,
                  transform: `translate3d(${x}px,0,0)`
                }}
              />
            </div>
          )}
        </Motion>
      </div>
    );
  }
}
