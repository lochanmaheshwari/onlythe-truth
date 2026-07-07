import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, Platform, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// This is the local IP address on your network so your phone can reach the Next.js dev server.
const DEFAULT_URL = 'http://192.168.0.131:3000';

export default function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [hasError, setHasError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not connect to {currentUrl}</Text>
          <Text style={styles.errorSubText}>Make sure your Next.js server (npm run dev) is running on port 3000.</Text>
          <TextInput 
            style={styles.input} 
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.button} onPress={() => { setHasError(false); setCurrentUrl(url); }}>
            <Text style={styles.buttonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView 
          source={{ uri: currentUrl }} 
          style={styles.webview}
          onError={() => setHasError(true)}
          startInLoadingState={true}
          bounces={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Matches your website's typical dark boundaries if it bounces
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
