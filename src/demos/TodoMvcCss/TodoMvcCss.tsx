import React from 'react';
import './index.css';
import { CSSTransition, TransitionGroup } from '../../transition';

export default class TodoMvcCss extends React.Component {
  state = {
    todos: [
      // key is creation date
      { key: 't1', data: { text: 'Board the plane', isDone: false } },
      { key: 't2', data: { text: 'Sleep', isDone: false } },
      {
        key: 't3',
        data: { text: 'Try to finish conference slides', isDone: false }
      },
      {
        key: 't4',
        data: { text: 'Eat cheese and drink wine', isDone: false }
      },
      { key: 't5', data: { text: 'Go around in Uber', isDone: false } },
      {
        key: 't6',
        data: { text: 'Talk with conf attendees', isDone: false }
      },
      { key: 't7', data: { text: 'Show Demo 1', isDone: false } },
      { key: 't8', data: { text: 'Show Demo 2', isDone: false } },
      {
        key: 't9',
        data: { text: 'Lament about the state of animation', isDone: false }
      },
      { key: 't10', data: { text: 'Show Secret Demo', isDone: false } },
      { key: 't11', data: { text: 'Go home', isDone: false } }
    ],
    value: '',
    selected: 'all'
  };

  render() {
    const { todos, value, selected } = this.state;
    const itemsLeft = todos.filter(({ data: { isDone } }) => !isDone).length;
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input
              autoFocus={true}
              className="new-todo"
              placeholder="What needs to be done?"
              value={value}
              onChange={this.handleChange}
            />
          </form>
        </header>
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            checked={itemsLeft === 0}
            style={{ display: todos.length === 0 ? 'none' : 'inline' }}
            onChange={this.handleToggleAll}
          />
          <ul className="todo-list">
            <TransitionGroup>
              {todos.map(({ key, data: { isDone, text } }: any) => (
                <CSSTransition
                  key={key}
                  timeout={500}
                  classNames="fade"
                >
                  <li key={key} className={isDone ? 'completed' : ''}>
                    <div className="view">
                      <input
                        className="toggle"
                        type="checkbox"
                        onChange={this.handleDone.bind(null, key)}
                        checked={isDone}
                      />
                      <label>{text}</label>
                      <button
                        className="destroy"
                        onClick={this.handleDestroy.bind(null, key)}
                      />
                    </div>
                  </li>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>{itemsLeft}</strong> {itemsLeft === 1 ? 'item' : 'items'}{' '}
            left
          </span>
          <ul className="filters">
            <li>
              <a
                className={selected === 'all' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'all')}
              >
                All
              </a>
            </li>
            <li>
              <a
                className={selected === 'active' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'active')}
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={selected === 'completed' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'completed')}
              >
                Completed
              </a>
            </li>
          </ul>
          <button
            className="clear-completed"
            onClick={this.handleClearCompleted}
          >
            Clear completed
          </button>
        </footer>
      </section>
    );
  }

  handleChange = ({ target: { value } }: any) => {
    this.setState({ value });
  };

  handleSubmit = (e: any) => {
    e.preventDefault();
    const newItem = {
      key: 't' + Date.now(),
      data: { text: this.state.value, isDone: false }
    };
    // append at head
    this.setState({ todos: [newItem].concat(this.state.todos) });
  };

  handleDone = (doneKey: any) => {
    this.setState({
      todos: this.state.todos.map(todo => {
        const {
          key,
          data: { text, isDone }
        } = todo;
        return key === doneKey
          ? { key: key, data: { text: text, isDone: !isDone } }
          : todo;
      })
    });
  };

  handleToggleAll = () => {
    const allNotDone = this.state.todos.every(({ data }) => data.isDone);
    this.setState({
      todos: this.state.todos.map(({ key, data: { text, isDone } }) => ({
        key: key,
        data: { text: text, isDone: !allNotDone }
      }))
    });
  };

  handleSelect = (selected: any) => {
    this.setState({ selected });
  };

  handleClearCompleted = () => {
    this.setState({
      todos: this.state.todos.filter(({ data }) => !data.isDone)
    });
  };

  handleDestroy = (date: any) => {
    this.setState({
      todos: this.state.todos.filter(({ key }) => key !== date)
    });
  };
}
