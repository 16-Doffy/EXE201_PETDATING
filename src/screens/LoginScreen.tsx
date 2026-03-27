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
import { LinearGradient } from 'expo-linear-gradient';

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
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E0EAFC', '#FFFFFF']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 w-full max-w-[420px] self-center px-6 py-8 justify-center">
            <Text className="text-center text-[42px] font-extrabold tracking-widest text-primary italic mb-2">BOSSITIVE</Text>
            <Text className="text-center text-textSub mb-12 font-medium">Kết nối tình yêu cho thú cưng</Text>

            <FigmaInput
              label="Email / Số điện thoại"
              placeholder="Nhập email hoặc SĐT của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
            />

            <FigmaInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity className="self-end mb-8">
                <Text className="text-primary font-bold">Quên mật khẩu?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              onPress={onLogin}
              disabled={loading}
              className="mb-6 shadow-lg shadow-primary/30"
            />

            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="px-4 text-textSub text-xs">HOẶC TIẾP TỤC VỚI</Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <View className="flex-row justify-between mb-10">
                <PrimaryButton
                    title="GOOGLE"
                    variant="secondary"
                    className="flex-1 mr-2"
                    textClassName="text-textMain text-sm"
                    onPress={() => {}}
                />
                <PrimaryButton
                    title="FACEBOOK"
                    variant="secondary"
                    className="flex-1 ml-2"
                    textClassName="text-textMain text-sm"
                    onPress={() => {}}
                />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-center text-textSub">
                Bạn chưa có tài khoản? <Text className="text-primary font-bold">Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
