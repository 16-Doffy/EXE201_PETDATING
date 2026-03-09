import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FAQ'>;

const faqs = [
  {
    q: 'Làm sao để bắt đầu ghép đôi?',
    a: 'Vào tab Home và vuốt phải để thích một thú cưng. Khi cả hai cùng thích nhau, bạn sẽ thấy match trong tab Matches.',
  },
  {
    q: 'Tôi có thể cập nhật hồ sơ thú cưng ở đâu?',
    a: 'Vào Profile > My profile để xem thông tin hiện tại. Bạn có thể mở hồ sơ chi tiết để cập nhật trong các bản tới.',
  },
  {
    q: 'Tính năng Health Information dùng để làm gì?',
    a: 'Giúp bạn lưu cơ bản thông tin tiêm chủng, dị ứng và ghi chú sức khỏe để theo dõi tiện hơn.',
  },
];

const FaqScreen = ({ navigation }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView>
        <View className="w-full max-w-[420px] self-center px-4 pt-2 pb-8">
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-[24px] font-bold text-slate-900">FAQ</Text>
          </View>

          {faqs.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <TouchableOpacity
                key={item.q}
                onPress={() => setOpenIndex(open ? null : idx)}
                className="bg-white rounded-2xl border border-[#EEF2FF] p-4 mb-3"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center">
                  <Text className="flex-1 text-slate-900 font-semibold">{item.q}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
                </View>
                {open ? <Text className="text-slate-600 mt-3 leading-6">{item.a}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaqScreen;
