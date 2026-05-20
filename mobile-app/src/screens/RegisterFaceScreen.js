import React, { useState, useRef, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { AuthContext, API_BASE_URL } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RegisterFaceScreen() {
  const { userToken } = useContext(AuthContext);
  const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-off-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
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
      <View style={[styles.container, styles.successContainer]}>
        <Ionicons name="checkmark-circle-outline" size={100} color="#10B981" />
        <Text style={styles.successTitle}>Face Registered!</Text>
        <Text style={styles.successSub}>You can now use your face for attendance.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="front"
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <View style={styles.faceOutline} />
            <Text style={styles.instructionText}>
              Position your face in the circle to register your biometric data.
            </Text>
          </View>

          <View style={styles.footer}>
            {loading ? (
              <View style={styles.loadingSpinnerContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingMsgText}>Processing face data...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.captureBtnInner}>
                  <Ionicons name="camera-outline" size={32} color="#0F172A" />
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  centerContainer: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 24 },
  statusText: { color: '#94A3B8', fontSize: 14, marginTop: 14 },
  errorText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  permissionBtn: { backgroundColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, marginTop: 20 },
  permissionBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'space-between', padding: 24 },
  guideContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  faceOutline: { width: width * 0.7, height: width * 0.7, borderRadius: (width * 0.7) / 2, borderWidth: 3, borderColor: '#F59E0B', borderStyle: 'dashed', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  instructionText: { color: '#F8FAFC', fontSize: 14, textAlign: 'center', marginTop: 24, fontWeight: '600', backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, overflow: 'hidden' },
  footer: { marginBottom: 20, alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245, 158, 11, 0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F59E0B' },
  captureBtnInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
  loadingSpinnerContainer: { backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  loadingMsgText: { color: '#F8FAFC', fontSize: 13, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginTop: 24, textAlign: 'center' },
  successSub: { color: '#94A3B8', fontSize: 14, marginTop: 10 },
});
