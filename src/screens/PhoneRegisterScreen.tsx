import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { registerWithEmail } from '@/services/authService';
import FigmaInput from '@/components/ui/FigmaInput';
import PrimaryButton from '@/components/ui/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneRegister'>;

const PhoneRegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập email đúng định dạng.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email, password);
      navigation.replace('CreatePetProfile');
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-figmaBlue">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 w-full max-w-[420px] self-center px-6 py-8 justify-center">
            <Text className="text-center text-[38px] font-extrabold tracking-wide text-figmaPink mb-10">BOSSITIVE</Text>

            <FigmaInput
              label="Email"
              containerClassName="mb-5"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <FigmaInput
              label="Mật khẩu"
              containerClassName="mb-5"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <FigmaInput
              label="Xác nhận mật khẩu"
              containerClassName="mb-8"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <PrimaryButton
              title={loading ? 'ĐANG XỬ LÝ...' : 'HOÀN THÀNH'}
              onPress={onRegister}
              disabled={loading}
              className="self-center w-44 h-12 mb-6"
              textClassName="text-base"
            />

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-center text-figmaPink text-sm">Quay lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneRegisterScreen;
