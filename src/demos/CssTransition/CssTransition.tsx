import React, { Component } from 'react';
import { CSSTransition } from '../../transition';
import './demo.css';

interface State {
  show: boolean;
  entered: boolean;
}

export default class CSSTransitionDEMO extends Component<any, State> {
  state = {
    show: false,
    entered: false
  };

  render() {
    const { show } = this.state;
    return (
      <div style={{ paddingTop: '2rem' }}>
        <div
          className="btn"
          onClick={() => {
            this.setState(state => ({
              show: !state.show
            }));
          }}
        >
          Toggle
        </div>
        <div style={{ marginTop: '1rem' }} className="well">
          <CSSTransition in={show} timeout={1000} classNames="demo">
            <div>cssTransition</div>
          </CSSTransition>
        </div>
      </div>
    );
  }
}
