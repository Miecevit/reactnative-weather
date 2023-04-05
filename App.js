import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = 'YOUR_API_KEY';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          alert('Permission to access location was denied');
          setIsLoading(false); // Update the isLoading state
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const controller = new AbortController();
        const signal = controller.signal;

        // Set a timeout to abort the fetch request
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
          { signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();

        setWeatherData(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false); // Update the isLoading state
      }
    }

    fetchWeatherData();
  }, []);

    if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {weatherData ? (
        <>
          <Text style={styles.temperature}>
            {Math.round(weatherData.main.temp)}°C
          </Text>
          <Text style={styles.description}>
            {weatherData.weather[0].description}
          </Text>
        </>
      ) : (
        <Text>Error fetching weather data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontSize: 48,
  },
  description: {
    fontSize: 24,
  },
});
