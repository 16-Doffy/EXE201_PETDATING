import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import PrimaryButton from '@/components/ui/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-figmaBlue">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 w-full max-w-[420px] self-center px-6 py-8 justify-center">
          <Text className="text-center text-[38px] font-extrabold tracking-wide text-figmaPink mb-14">BOSSITIVE</Text>

          <PrimaryButton
            title="ĐĂNG KÝ BẰNG EMAIL / SĐT"
            variant="yellow"
            className="mb-4"
            textClassName="text-base"
            onPress={() => navigation.navigate('PhoneRegister')}
          />

          <PrimaryButton title="LIÊN KẾT TÀI KHOẢN GOOGLE" variant="yellow" className="mb-4" textClassName="text-base" />

          <PrimaryButton title="LIÊN KẾT TÀI KHOẢN FACEBOOK" variant="yellow" className="mb-8" textClassName="text-base" />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-center text-figmaPink text-sm">Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
