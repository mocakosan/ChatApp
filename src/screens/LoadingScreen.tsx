import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Screen from '../components/screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingScreen;
