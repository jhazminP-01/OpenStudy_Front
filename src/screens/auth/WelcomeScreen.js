import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { Button } from '../../components/ui';

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={COLORS.gradientRooms}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../../assets/inicio.jpeg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>OpenStudy</Text>
        <Text style={styles.subtitle}>Estudia mejor, juntos</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Crear Cuenta"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />

          <Button
            title="Iniciar Sesión"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: SPACING.rooms.paddingX,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.rooms.marginBottomLarge,
  },
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 50,
  },
  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.rooms.gapLarge,
  },
});

export default WelcomeScreen;
