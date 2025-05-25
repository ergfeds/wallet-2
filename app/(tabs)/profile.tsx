import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { Shield, CheckCircle, AlertTriangle, LogOut, HelpCircle, Settings, Mail, Camera, Upload } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/auth-store';
import { useSupportStore } from '@/stores/support-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KYC_REQUIREMENTS, KYC_LIMITS, DOCUMENT_TYPES } from '@/constants/kyc';

export default function ProfileScreen() {
  const { user, logout, updateKYC } = useAuthStore();
  const { createTicket } = useSupportStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [documentType, setDocumentType] = useState('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleSupportTicket = () => {
    Alert.alert(
      'Contact Support',
      'What do you need help with?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transaction Issue',
          onPress: () => createSupportTicket('Transaction Issue', 'I am having trouble with a transaction'),
        },
        {
          text: 'Account Problem',
          onPress: () => createSupportTicket('Account Problem', 'I need help with my account'),
        },
        {
          text: 'KYC Verification',
          onPress: () => createSupportTicket('KYC Verification', 'I need help with identity verification'),
        },
        {
          text: 'General Question',
          onPress: () => createSupportTicket('General Question', 'I have a general question'),
        },
        {
          text: 'Email Support',
          onPress: () => handleEmailSupport(),
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    const email = 'agilewalletcustomerservice@gmail.com';
    const subject = 'Customer Support Request';
    const body = 'Hello, I need assistance with...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Could not open email client. Please email us at: agilewalletcustomerservice@gmail.com');
    });
  };

  const createSupportTicket = (subject: string, message: string) => {
    if (user) {
      const ticketId = createTicket(user.id, subject, message);
      Alert.alert('Success', `Support ticket created: ${ticketId}

You can also email us directly at:
agilewalletcustomerservice@gmail.com`);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocumentImage(result.assets[0].uri);
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const handleSelfieUpload = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a selfie.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieImage(result.assets[0].uri);
        Alert.alert('Success', 'Selfie captured successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture selfie. Please try again.');
    }
  };

  const handleKYCUpgrade = async () => {
    if (!user) return;

    if (user.kyc.level === 'none') {
      // Upgrade to basic
      if (!phoneNumber.trim() || !dateOfBirth.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setIsUpgrading(true);
      setTimeout(() => {
        updateKYC({
          level: 'basic',
          phoneNumber: phoneNumber.trim(),
          dateOfBirth: dateOfBirth.trim(),
          submittedAt: Date.now(),
          verifiedAt: Date.now(),
        });
        setIsUpgrading(false);
        Alert.alert('Success', 'KYC upgraded to Basic level!');
        setPhoneNumber('');
        setDateOfBirth('');
      }, 2000);
    } else if (user.kyc.level === 'basic') {
      // Upgrade to verified
      if (!address.trim() || !documentNumber.trim() || !documentImage || !selfieImage) {
        Alert.alert('Error', 'Please fill in all required fields and upload both document and selfie');
        return;
      }

      setIsUpgrading(true);
      setTimeout(() => {
        updateKYC({
          level: 'verified',
          address: address.trim(),
          documentType: documentType as any,
          documentNumber: documentNumber.trim(),
          documentImage,
          selfieImage,
          submittedAt: Date.now(),
          verifiedAt: Date.now(),
        });
        setIsUpgrading(false);
        Alert.alert('Success', 'KYC upgraded to Verified level!');
        setAddress('');
        setDocumentNumber('');
        setDocumentImage(null);
        setSelfieImage(null);
      }, 3000);
    } else if (user.kyc.level === 'verified') {
      // Upgrade to premium
      Alert.alert(
        'Premium Verification',
        'Premium verification requires enhanced due diligence and business verification. Please contact support for assistance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Contact Support', onPress: () => createSupportTicket('Premium KYC', 'I would like to upgrade to Premium KYC level for institutional use') },
        ]
      );
    }
  };

  const getKYCStatusColor = () => {
    if (!user?.kyc?.level) return '#6B7280';
    switch (user.kyc.level) {
      case 'none': return '#EF4444';
      case 'basic': return '#F59E0B';
      case 'verified': return '#10B981';
      case 'premium': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getKYCStatusIcon = () => {
    if (!user?.kyc?.level) return <AlertTriangle size={20} color="#6B7280" />;
    switch (user.kyc.level) {
      case 'none': return <AlertTriangle size={20} color="#EF4444" />;
      case 'basic': return <Shield size={20} color="#F59E0B" />;
      case 'verified': return <CheckCircle size={20} color="#10B981" />;
      case 'premium': return <CheckCircle size={20} color="#6366F1" />;
      default: return <AlertTriangle size={20} color="#6B7280" />;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentLevel = user.kyc?.level || 'none';
  const currentLimits = KYC_LIMITS[currentLevel];
  const nextLevel = currentLevel === 'none' ? 'basic' : currentLevel === 'basic' ? 'verified' : currentLevel === 'verified' ? 'premium' : null;
  const nextLimits = nextLevel ? KYC_LIMITS[nextLevel] : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.kyc?.firstName && user.kyc?.lastName 
                ? `${user.kyc.firstName} ${user.kyc.lastName}` 
                : user.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
          </View>

          <View style={styles.kycSection}>
            <View style={styles.kycHeader}>
              <View style={styles.kycStatus}>
                {getKYCStatusIcon()}
                <Text style={[styles.kycLevel, { color: getKYCStatusColor() }]}>
                  {KYC_REQUIREMENTS[currentLevel].title}
                </Text>
              </View>
            </View>

            <Text style={styles.kycDescription}>
              {KYC_REQUIREMENTS[currentLevel].description}
            </Text>

            <View style={styles.limitsCard}>
              <Text style={styles.limitsTitle}>Current Limits</Text>
              <View style={styles.limitsGrid}>
                <View style={styles.limitItem}>
                  <Text style={styles.limitLabel}>Daily</Text>
                  <Text style={styles.limitValue}>${currentLimits.daily.toLocaleString()}</Text>
                </View>
                <View style={styles.limitItem}>
                  <Text style={styles.limitLabel}>Monthly</Text>
                  <Text style={styles.limitValue}>${currentLimits.monthly.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.spentInfo}>
                <Text style={styles.spentLabel}>Spent Today: ${(user.dailySpent || 0).toLocaleString()}</Text>
                <Text style={styles.spentLabel}>Spent This Month: ${(user.monthlySpent || 0).toLocaleString()}</Text>
              </View>
            </View>

            {nextLevel && (
              <View style={styles.upgradeCard}>
                <Text style={styles.upgradeTitle}>Upgrade to {KYC_REQUIREMENTS[nextLevel].title}</Text>
                <Text style={styles.upgradeDescription}>
                  Increase your limits to ${nextLimits?.daily.toLocaleString()} daily / ${nextLimits?.monthly.toLocaleString()} monthly
                </Text>

                {currentLevel === 'none' && (
                  <View style={styles.upgradeForm}>
                    <Input
                      label="Phone Number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="+1 (555) 123-4567"
                      keyboardType="phone-pad"
                    />
                    <Input
                      label="Date of Birth"
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      placeholder="MM/DD/YYYY"
                    />
                  </View>
                )}

                {currentLevel === 'basic' && (
                  <View style={styles.upgradeForm}>
                    <Input
                      label="Address"
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter your full address"
                      multiline
                      numberOfLines={3}
                    />
                    
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Government ID Type</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={documentType}
                          onValueChange={setDocumentType}
                          style={styles.picker}
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <Picker.Item
                              key={type.value}
                              label={type.label}
                              value={type.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <Input
                      label="Document Number"
                      value={documentNumber}
                      onChangeText={setDocumentNumber}
                      placeholder="Enter your ID number"
                    />

                    <View style={styles.documentUpload}>
                      <Text style={styles.uploadTitle}>Document Upload</Text>
                      <TouchableOpacity 
                        style={[styles.uploadButton, documentImage && styles.uploadButtonSuccess]} 
                        onPress={handleDocumentUpload}
                      >
                        {documentImage ? <CheckCircle size={20} color="#10B981" /> : <Upload size={20} color="#6366F1" />}
                        <Text style={[styles.uploadText, documentImage && styles.uploadTextSuccess]}>
                          {documentImage ? 'Document Uploaded' : 'Upload Government ID'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.uploadButton, selfieImage && styles.uploadButtonSuccess]} 
                        onPress={handleSelfieUpload}
                      >
                        {selfieImage ? <CheckCircle size={20} color="#10B981" /> : <Camera size={20} color="#6366F1" />}
                        <Text style={[styles.uploadText, selfieImage && styles.uploadTextSuccess]}>
                          {selfieImage ? 'Selfie Captured' : 'Take Selfie'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Button
                  title={isUpgrading ? 'Upgrading...' : `Upgrade to ${KYC_REQUIREMENTS[nextLevel].title}`}
                  onPress={handleKYCUpgrade}
                  disabled={isUpgrading}
                  style={[styles.upgradeButton, { backgroundColor: getKYCStatusColor() }]}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleEmailSupport}>
              <Mail size={20} color="#6366F1" />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Email Support</Text>
                <Text style={styles.menuSubtext}>agilewalletcustomerservice@gmail.com</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleSupportTicket}>
              <HelpCircle size={20} color="#6B7280" />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Contact Support</Text>
                <Text style={styles.menuSubtext}>Create a support ticket</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <Settings size={20} color="#6B7280" />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Account Settings</Text>
                <Text style={styles.menuSubtext}>Manage your preferences</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
  },
  userInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  kycSection: {
    marginBottom: 32,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycLevel: {
    fontSize: 18,
    fontWeight: '600',
  },
  kycDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  limitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  limitsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  limitItem: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  spentInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 4,
  },
  spentLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  upgradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  upgradeForm: {
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  picker: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  documentUpload: {
    marginTop: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  uploadButtonSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  uploadTextSuccess: {
    color: '#10B981',
  },
  upgradeButton: {
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});