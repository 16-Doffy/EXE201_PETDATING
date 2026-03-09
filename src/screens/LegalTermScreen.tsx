import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LegalTerm'>;

const LegalTermScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView>
        <View className="w-full max-w-[420px] self-center px-4 pt-2 pb-8">
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-[24px] font-bold text-slate-900">Legal Term</Text>
          </View>

          <View className="bg-white rounded-2xl border border-[#EEF2FF] p-4">
            <Text className="text-slate-700 leading-6">
              Khi sử dụng Bossitive, bạn đồng ý tuân thủ điều khoản cộng đồng: cung cấp thông tin đúng sự thật, không đăng nội
              dung phản cảm và không sử dụng ứng dụng vào mục đích gây hại. Chúng tôi có quyền khóa tài khoản vi phạm chính
              sách.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalTermScreen;
