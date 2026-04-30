import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import styles from './Chat.styles';

const TypingIndicator = ({ users = [] }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} está escribiendo...`;
    } else if (users.length === 2) {
      return `${users[0]} y ${users[1]} están escribiendo...`;
    } else {
      return 'Varias personas están escribiendo...';
    }
  };

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingDots}>
        <Animated.View
          style={[
            styles.typingDot,
            {
              transform: [
                {
                  translateY: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              transform: [
                {
                  translateY: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              transform: [
                {
                  translateY: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      <Text style={styles.typingText}>{getTypingText()}</Text>
    </View>
  );
};

export default TypingIndicator;
