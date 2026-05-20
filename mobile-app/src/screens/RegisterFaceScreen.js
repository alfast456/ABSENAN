import React, { useState, useRef, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function RegisterFaceScreen() {
  const { userToken } = useContext(AuthContext);
  const { theme, themeColors, isDarkMode } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>Requesting camera permission...</Text>
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

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);

      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: false,
      });

      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        name: 'face_register.jpg',
        type: 'image/jpeg',
      });

      const endpoint = `${API_BASE_URL}/face/register`;
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      setSuccess(true);
      
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 3000);

    } catch (error) {
      console.log('Registration failed:', error);
      const message = error.response?.data?.message || 'Failed to register face. Please try again.';
      Alert.alert('Registration Failed', message, [
        { text: 'Try Again', onPress: () => {} }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="checkmark-circle-outline" size={100} color={theme.success} />
        <Text style={[styles.successTitle, { color: theme.text }]}>Face Registered!</Text>
        <Text style={[styles.successSub, { color: theme.textSecondary }]}>You can now use your face for attendance.</Text>
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
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <View style={[styles.faceOutline, { borderColor: themeColors.primary, shadowColor: themeColors.primary }]} />
            <Text style={[styles.instructionText, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)', color: theme.text }]}>
              Position your face in the circle to register your biometric data.
            </Text>
          </View>

          <View style={styles.footer}>
            {loading ? (
              <View style={[styles.loadingSpinnerContainer, { backgroundColor: theme.card }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={[styles.loadingMsgText, { color: theme.text }]}>Processing face data...</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.captureBtn, { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primary }]} onPress={handleCapture} activeOpacity={0.85}>
                <View style={[styles.captureBtnInner, { backgroundColor: themeColors.primary }]}>
                  <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
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
  container: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statusText: { fontSize: 14, marginTop: 14 },
  errorText: { fontSize: 16, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  permissionBtn: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, marginTop: 20 },
  permissionBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'space-between', padding: 24 },
  guideContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  faceOutline: { width: width * 0.7, height: width * 0.7, borderRadius: (width * 0.7) / 2, borderWidth: 3, borderStyle: 'dashed', backgroundColor: 'rgba(255, 255, 255, 0.05)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 15, elevation: 10 },
  instructionText: { fontSize: 14, textAlign: 'center', marginTop: 24, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, overflow: 'hidden' },
  footer: { marginBottom: 20, alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  captureBtnInner: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  loadingSpinnerContainer: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  loadingMsgText: { fontSize: 13, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 24, textAlign: 'center' },
  successSub: { fontSize: 14, marginTop: 10 },
});
