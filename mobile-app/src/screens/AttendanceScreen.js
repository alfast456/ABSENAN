import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function AttendanceScreen() {
  const { userToken } = useContext(AuthContext);
  const { theme, themeColors, isDarkMode } = useContext(ThemeContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { actionType } = route.params; // 'checkin' or 'checkout'

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request Location Permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);
      }
    })();
  }, []);

  if (!permission || locationPermission === null) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="camera-off-outline" size={48} color={theme.danger} />
        <Text style={[styles.errorText, { color: theme.text }]}>Camera permission is required.</Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: themeColors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!locationPermission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="location-outline" size={48} color={theme.danger} />
        <Text style={[styles.errorText, { color: theme.text }]}>Location permission is required.</Text>
        <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>We need your location to verify you are at the office.</Text>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      setLoadingMsg('Acquiring high-accuracy location...');

      // 1. Get high accuracy GPS coordinates
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      if (loc.mocked) {
        setLoading(false);
        Alert.alert('Security Alert', 'Fake GPS / Mock Location detected! Attendance rejected.');
        return;
      }
      
      setLocation(loc);

      setLoadingMsg('Capturing face image...');
      // 2. Capture picture
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: false,
      });

      setLoadingMsg('Verifying face and GPS location...');
      
      // 3. Construct FormData
      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        name: 'attendance.jpg',
        type: 'image/jpeg',
      });
      formData.append('latitude', loc.coords.latitude.toString());
      formData.append('longitude', loc.coords.longitude.toString());

      // 4. Submit to Laravel backend
      const endpoint = `${API_BASE_URL}/attendance/${actionType}`;
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      setSuccessData(response.data.data);
      setSuccess(true);
      
      // Wait 3 seconds then return to Dashboard
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 3000);

    } catch (error) {
      console.log('Verification failed:', error);
      const message = error.response?.data?.message || 'Failed to verify presence. Please try again.';
      Alert.alert('Verification Failed', message, [
        { text: 'Try Again', onPress: () => {} }
      ]);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="checkmark-circle-outline" size={100} color={theme.success} />
        <Text style={[styles.successTitle, { color: theme.text }]}>
          {actionType === 'checkin' ? 'Check In Successful!' : 'Check Out Successful!'}
        </Text>
        <Text style={[styles.successTime, { color: theme.success }]}>
          {successData ? new Date(successData.scan_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
        <Text style={[styles.successSub, { color: theme.textSecondary }]}>Thank you. Have a great day!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="front"
        ref={cameraRef}
      >
        {/* Overlay Graphic with centering target */}
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <View style={[styles.faceOutline, { borderColor: themeColors.primary, shadowColor: themeColors.primary }]} />
            <Text style={[styles.instructionText, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)', color: theme.text }]}>
              Place your face inside the circle and ensure adequate lighting.
            </Text>
          </View>

          {/* Action Footer */}
          <View style={styles.footer}>
            {loading ? (
              <View style={[styles.loadingSpinnerContainer, { backgroundColor: theme.card }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={[styles.loadingMsgText, { color: theme.text }]}>{loadingMsg}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.captureBtn, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primary }]} 
                onPress={handleCapture} 
                activeOpacity={0.85}
              >
                <View style={[styles.captureBtnInner, { backgroundColor: themeColors.primary }]}>
                  <Ionicons name="scan-outline" size={32} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    fontSize: 14,
    marginTop: 14,
  },
  errorText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  permissionBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  permissionBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Soft slate overlay
    justifyContent: 'space-between',
    padding: 24,
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  faceOutline: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  footer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  captureBtnInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinnerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingMsgText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 24,
    textAlign: 'center',
  },
  successTime: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10B981',
    marginVertical: 14,
  },
  successSub: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
