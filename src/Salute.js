import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TouchableWithoutFeedback,
  Animated,
  Text,
  View,
  Image,
  SafeAreaView,
} from 'react-native';
import defaultStyles from './styles';
import defaultIcons from './icons';
import types from './types';

const noop = () => {};

export default class Salute extends Component {
  static propTypes = {
    type: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    icon: PropTypes.object,
    styles: PropTypes.object,
    duration: PropTypes.number,
    minHeight: PropTypes.number,
    onShow: PropTypes.func,
    onVisible: PropTypes.func,
    onHide: PropTypes.func,
    onHidden: PropTypes.func,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    type: types.INFO,
    icon: null,
    styles: defaultStyles.info,
    duration: null,
    minHeight: 50,
    onClick: null,
    onShow: noop,
    onVisible: noop,
    onHide: noop,
    onHidden: noop,
    onPress: noop,
  }

  state = {
    timeoutRef: null,
    animatedValue: new Animated.Value(0),
  }

  componentDidMount() {
    this.state.animatedValue.addListener(this.onAnimationEnd);
  }
  componentDidMount() {
    this.show();
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutRef);
  }

  onAnimationEnd = ({ value }) => {
    if (value === 0) {
      this.onHidden();
    } else if (value === 1) {
      this.onVisible();
    }
  }

  onPress = () => {
    const { onPress } = this.props;
    if (onPress) {
      onPress(this.hide);
    }
  }


  onVisible = () => {
    // debugger;
    if (this.props.duration) {
      setTimeout(this.hide, this.props.duration);
    }
    this.props.onVisible();
  }

  onHidden = () => {
    this.props.onHidden();
  }

  hide = () => {
    const { onHide } = this.props;
    if (onHide) {
      onHide();
    }

    Animated.timing(
      this.state.animatedValue,{
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
  }

  show = () => {
    const { onShow } = this.props;
    if (onShow) {
      onShow();
    }

    Animated.timing(
      this.state.animatedValue,{
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
  }

  renderContent() {
    const { type, content, styles, icon } = this.props;
    const currentStyles = defaultStyles[type];
    const currentIcon = defaultIcons[type];

    const iconContainer = (icon || currentIcon) && (
      <View style={[currentStyles.iconContainer, styles.iconContainer]}>
        {icon || <Image source={currentIcon} />}
      </View>
    );

    if (Object.prototype.toString.call(content) === '[object String]') {
      return (
        <SafeAreaView>
          <View style={[currentStyles.container, styles.container]}>
            {iconContainer}
            <View style={[currentStyles.textContainer, styles.textContainer]}>
              <Text style={[currentStyles.text, styles.text]}>
                {content}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    return content;
  }

  render() {
    const y = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-this.props.minHeight, 0],
    });

    const style = {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      zIndex: 9999,
      minHeight: this.props.minHeight,
      opacity: this.state.animatedValue,
      transform: [{ translateY: y }],
    };

    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <Animated.View style={style}>
          {this.renderContent()}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}
