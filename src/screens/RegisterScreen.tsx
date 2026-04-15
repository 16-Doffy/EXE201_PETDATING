import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E0EAFC', '#FFFFFF']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 w-full max-w-[420px] self-center px-6 py-8 justify-center">
          <Text className="text-center text-[42px] font-extrabold tracking-widest text-primary italic mb-2">BOSSITIVE</Text>
          <Text className="text-center text-textSub mb-14 font-medium">Tạo tài khoản mới để bắt đầu</Text>

          <PrimaryButton
            title="ĐĂNG KÝ BẰNG EMAIL"
            className="mb-6 shadow-lg shadow-primary/30"
            onPress={() => navigation.navigate('PhoneRegister')}
          />

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="px-4 text-textSub text-xs">HOẶC LIÊN KẾT VỚI</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* <PrimaryButton
            title="LIÊN KẾT TÀI KHOẢN GOOGLE"
            variant="secondary"
            className="mb-4"
            textClassName="text-textMain text-base"
            onPress={() => {}}
          />

          <PrimaryButton
            title="LIÊN KẾT TÀI KHOẢN FACEBOOK"
            variant="secondary"
            className="mb-10"
            textClassName="text-textMain text-base"
            onPress={() => {}}
          /> */}

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-center text-textSub">
                Đã có tài khoản? <Text className="text-primary font-bold">Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
