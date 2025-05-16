import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/image.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          <Text style={styles.welcomeText}>Добро пожаловать в{'\n'}<Text style={styles.brand}>Money Talks! 🎉</Text></Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Далее</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  textWrapper: {
    marginTop: '55%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
  },
  brand: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
