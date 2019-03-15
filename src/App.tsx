import React, { Component } from 'react';
import Toggle from './demos/Toggle/Toggle';
import Transition from './demos/Transition/Transition';
import CssTransition from './demos/CssTransition/CssTransition';
import ChatHeads from './demos/chatHeads/ChatHeads';
import TodoMvc from './demos/TodoMvc/TodoMvc';
import TodoMvcCss from './demos/TodoMvcCss/TodoMvcCss';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <Toggle /> */}
        {/* <ChatHeads /> */}
        <TodoMvcCss />
        {/* <TodoMvc /> */}
        {/* <Transition /> */}
        {/* <CssTransition /> */}
      </div>
    );
  }
}

export default App;
