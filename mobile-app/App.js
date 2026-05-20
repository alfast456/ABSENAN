import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
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
  const { theme, isDarkMode, themeColors } = useContext(ThemeContext);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Text style={[styles.loadingLogo, { color: themeColors.primary }]}>ABSENAN</Text>
        <ActivityIndicator size="large" color={themeColors.primary} style={styles.spinner} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Initializing system...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors.primary,
            shadowColor: themeColors.primaryDark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
            borderBottomWidth: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            letterSpacing: 0.5,
          },
          cardStyle: { backgroundColor: theme.background },
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 20,
    textShadowColor: 'rgba(25, 194, 243, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    letterSpacing: 1,
  },
});
