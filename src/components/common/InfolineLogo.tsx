import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/theme';

export const InfolineLogo: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
    <Text style={styles.poweredText}>Powered by</Text>

      <Image
        source={require('../../../assets/images/infoline.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
});

InfolineLogo.displayName = 'InfolineLogo';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoImage: {
    width: 180,
    height: 60,
  },
  poweredText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 6,
  },
});
