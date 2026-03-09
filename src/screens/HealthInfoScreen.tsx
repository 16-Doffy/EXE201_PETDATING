import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '@/components/ui/PrimaryButton';

const inputCls = 'bg-white border border-[#E6EAF2] rounded-2xl px-4 py-3 text-slate-800';

const HealthInfoScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [allergy, setAllergy] = useState('');
  const [disease, setDisease] = useState('');
  const [note, setNote] = useState('');
  const [rabies, setRabies] = useState(false);
  const [deworm, setDeworm] = useState(false);
  const [fvrcp, setFvrcp] = useState(false);

  const vaxItems = [
    { label: 'Vaccine dại', value: rabies, setValue: setRabies },
    { label: 'Tẩy giun định kỳ', value: deworm, setValue: setDeworm },
    { label: 'Vaccine tổng hợp FVRCP', value: fvrcp, setValue: setFvrcp },
  ];

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="w-full max-w-[420px] self-center px-4 pt-2">
          <Text className="text-[28px] font-bold text-slate-900 mb-4">Hồ sơ sức khỏe của thú cưng</Text>

          <View className="mb-5">
            <Text className="text-[22px] font-semibold text-slate-900 mb-3">Thông tin cơ bản</Text>

            <Text className="text-slate-600 mb-1">Tên thú cưng</Text>
            <TextInput placeholder="Nhập tên" value={name} onChangeText={setName} className={`${inputCls} mb-3`} />

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-slate-600 mb-1">Tuổi</Text>
                <TextInput placeholder="Ví dụ: 2 tuổi" value={age} onChangeText={setAge} className={inputCls} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-600 mb-1">Giống</Text>
                <TextInput placeholder="Ví dụ: Poodle" value={breed} onChangeText={setBreed} className={inputCls} />
              </View>
            </View>

            <Text className="text-slate-600 mb-1">Cân nặng (kg)</Text>
            <TextInput placeholder="Nhập cân nặng" value={weight} onChangeText={setWeight} className={inputCls} />
          </View>

          <View className="mb-5">
            <Text className="text-[22px] font-semibold text-slate-900 mb-3">Tiêm chủng</Text>
            <View className="bg-white border border-[#E6EAF2] rounded-2xl px-3 py-2">
              {vaxItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  className="flex-row items-center py-3"
                  onPress={() => item.setValue(!item.value)}
                  activeOpacity={0.85}
                >
                  <View className={`w-5 h-5 rounded-md border mr-3 items-center justify-center ${item.value ? 'bg-[#2C6BED] border-[#2C6BED]' : 'bg-white border-[#CBD5E1]'}`}>
                    {item.value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                  <Text className="text-slate-700">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="mt-3 border border-dashed border-[#2C6BED] rounded-2xl py-3 px-4"
              onPress={() => Alert.alert('Tải ảnh', 'Demo: tính năng tải ảnh sẽ bổ sung sau.')}
            >
              <Text className="text-[#2C6BED] font-medium">Tải ảnh chụp sổ tiêm / hồ sơ</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-[22px] font-semibold text-slate-900 mb-3">Tình trạng sức khỏe</Text>
            <Text className="text-slate-600 mb-1">Dị ứng</Text>
            <TextInput
              placeholder="Ghi chú về dị ứng thức ăn, thuốc..."
              value={allergy}
              onChangeText={setAllergy}
              className={`${inputCls} mb-3`}
            />

            <Text className="text-slate-600 mb-1">Bệnh lý (nếu có)</Text>
            <TextInput
              placeholder="Các bệnh đang điều trị hoặc mãn tính..."
              value={disease}
              onChangeText={setDisease}
              className={`${inputCls} mb-3`}
            />

            <Text className="text-slate-600 mb-1">Ghi chú thêm</Text>
            <TextInput
              placeholder="Thông tin sức khỏe khác của thú cưng..."
              value={note}
              onChangeText={setNote}
              className={inputCls}
            />
          </View>

          <PrimaryButton
            title="Lưu thông tin"
            className="rounded-2xl"
            textClassName="text-base"
            onPress={() => Alert.alert('Thành công', 'Đã lưu thông tin sức khỏe (demo).')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthInfoScreen;
