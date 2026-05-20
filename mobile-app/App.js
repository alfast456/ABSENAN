import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RequestScreen from './src/screens/RequestScreen';
import PayrollScreen from './src/screens/PayrollScreen';
import RegisterFaceScreen from './src/screens/RegisterFaceScreen';

const Stack = createStackNavigator();

const AppContent = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingLogo}>ABSENAN</Text>
        <ActivityIndicator size="large" color="#F59E0B" style={styles.spinner} />
        <Text style={styles.loadingText}>Initializing system...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E293B', // Slate 800
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#F8FAFC', // Slate 50
          headerTitleStyle: {
            fontWeight: 'bold',
            letterSpacing: 0.5,
          },
          cardStyle: { backgroundColor: '#0F172A' }, // Slate 900
        }}
      >
        {userToken === null ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ title: 'Absenan Dashboard' }}
            />
            <Stack.Screen 
              name="Attendance" 
              component={AttendanceScreen} 
              options={{ 
                title: 'Camera Verify',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen} 
              options={{ title: 'Presence History' }}
            />
            <Stack.Screen 
              name="Request" 
              component={RequestScreen} 
              options={{ title: 'Request Permission' }}
            />
            <Stack.Screen 
              name="Payroll" 
              component={PayrollScreen} 
              options={{ title: 'Monthly Payslip' }}
            />
            <Stack.Screen 
              name="RegisterFace" 
              component={RegisterFaceScreen} 
              options={{ 
                title: 'Register Face',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4,
    marginBottom: 20,
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    letterSpacing: 1,
  },
});
