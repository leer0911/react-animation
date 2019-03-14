import React, { Component } from 'react';
import Transition from './demos/transition/Transition';
import ChatHeads from './demos/chatHeads/ChatHeads';
import TodoMvc from './demos/TodoMvc/TodoMvc';
import TodoMvcCss from './demos/TodoMvcCss/TodoMvcCss';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <Transition /> */}
        {/* <ChatHeads /> */}
        <TodoMvcCss />
        {/* <TodoMvc /> */}
      </div>
    );
  }
}

export default App;
