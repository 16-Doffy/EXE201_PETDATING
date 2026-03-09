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
import { loginWithEmail } from '@/services/authService';
import FigmaInput from '@/components/ui/FigmaInput';
import PrimaryButton from '@/components/ui/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!emailOrPhone.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email/số điện thoại và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(emailOrPhone, password);
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message);
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
              label="Email / Số điện thoại"
              containerClassName="mb-5"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
            />

            <FigmaInput
              label="Mật khẩu"
              containerClassName="mb-8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              title={loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              onPress={onLogin}
              disabled={loading}
              className="self-center w-44 h-12 mb-10"
              textClassName="text-base"
            />

            <PrimaryButton title="LOG IN WITH GOOGLE" variant="yellow" className="mb-3" textClassName="text-base" />

            <PrimaryButton title="LOG IN WITH FACEBOOK" variant="yellow" className="mb-6" textClassName="text-base" />

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-center text-figmaPink text-sm">Bạn chưa có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
