import React, { Component } from 'react';
import { Transition } from '../../transition';
import './demo.css';

interface State {
  show: boolean;
  entered: boolean;
}

export default class TransitionDEMO extends Component<any, State> {
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
          <Transition in={show} timeout={1000} unmountOnExit>
            {state => {
              switch (state) {
                case 'entering':
                  return 'Entering…';
                case 'entered':
                  return 'Entered!';
                case 'exiting':
                  return 'Exiting…';
                case 'exited':
                  return 'Exited!';
              }
            }}
          </Transition>
        </div>
      </div>
    );
  }
}
