import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
} from 'react-native';
import hoistNonReactStatic from 'hoist-non-react-statics';
import Salute from './Salute';
import Store from './Store';
import { typeFromString } from './types';

const actions = {
  push: 'Salute/PUSH',
  shift: 'Salute/SHIFT',
};

const store = new Store({ index: [], salutes: {}},
  (state, action) => {
    switch (action.type) {
      case actions.push: {
        return {
          ...state,
          index: [...state.index, action.payload.id],
          salutes: {
            ...state.salutes,
            [action.payload.id]: action.payload,
          }
        }
      }
      case actions.shift: {
        return {
          ...state,
          index: state.index.slice(1),
        }
      }
      default: {
        return state;
      }
    }
  }
)

export const giveSalute = (props) => {
  store.dispatch({
    type: 'Salute/PUSH',
    payload: {
      ...props,
      id: Math.random().toString(36),
    }
  })
}

export default (WrappedComponent) => {
  class WithCommander extends Component {
    static childContextTypes = {
      addSalute: PropTypes.func,
    };

    state = {
      ...store.getState(),
    }

    onStoreChange = (state) => {
      this.setState(state);
    }

    componentDidMount() {
      this._storeChangeUnsubscribe = store.subscribe(this.onStoreChange);
    }

    componentWillUnmount() {
      this._storeChangeUnsubscribe();
    }

    getChildContext() {
      const { addSalute } = this;
      return {
        addSalute,
      };
    }

    addSalute = (props = {}) => {
      store.dispatch({
        type: 'Salute/PUSH',
        payload: {
          ...props,
          id: Math.random().toString(36),
        }
      })
    }

    dispatch = (action) => {
      store.dispatch(action);
    }

    getSalutes() {
      const { index, salutes } = store.getState();
      return index.map((id, idx) => ({
        ...salutes[id],
        visible: idx === 0,
      }));
    }

    renderSalutes() {
      return this.getSalutes().map(
        salute => (
          salute.visible ?
            <Salute
              key={salute.id}
              type={typeFromString(salute.type)}
              content={salute.text}
              icon={salute.icon}
              styles={salute.styles}
              duration={salute.duration}
              onHidden={() => {
                this.dispatch({
                  type: 'Salute/SHIFT'
                })
              }}
              onPress={salute.onPress}
            /> : null
        )
      )
    }

    render() {
      const props = {
        ...this.props,
        addSalute: this.addSalute,
      }
      return (
        <View style={{ flex: 1 }}>
          <WrappedComponent {...props} />
          { this.renderSalutes() }
        </View>
      );
    }
  }
  hoistNonReactStatic(WithCommander, WrappedComponent);
  return WithCommander;
};
