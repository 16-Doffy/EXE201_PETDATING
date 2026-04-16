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
import { resetPassword } from '@/services/authService';
import FigmaInput from '@/components/ui/FigmaInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu mới.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập đúng email đã đăng ký.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận chưa trùng với mật khẩu mới.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu xong rồi. Bạn có thể đăng nhập lại ngay.', [
        {
          text: 'Đăng nhập',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Không thể đổi mật khẩu', error?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute inset-0" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 w-full max-w-[420px] self-center px-6 py-8 justify-center">
            <Text className="text-center text-[40px] font-extrabold tracking-widest text-primary italic mb-2">BOSSITIVE</Text>
            <Text className="text-center text-textSub mb-10 font-medium">Đặt lại mật khẩu cho tài khoản của bạn</Text>

            <FigmaInput
              label="Email đã đăng ký"
              placeholder="Nhập email tài khoản"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <FigmaInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <FigmaInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <PrimaryButton
              title={loading ? 'ĐANG CẬP NHẬT...' : 'ĐỔI MẬT KHẨU'}
              onPress={onReset}
              disabled={loading}
              className="mt-6 mb-6 shadow-lg shadow-primary/30"
            />

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-center text-textSub font-bold">Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
