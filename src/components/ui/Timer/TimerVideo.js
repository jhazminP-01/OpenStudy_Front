import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles';

const TimerVideo = ({ size = 140, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={require('../../../../assets/videos/Diseño sin título.gif')}
        style={[styles.gif, { width: size, height: size }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  gif: {
    borderRadius: 16,
  },
});

export default TimerVideo;
