import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPetProfile } from '@/services/petService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SectionTitle from '@/components/ui/SectionTitle';
import TagChip from '@/components/ui/TagChip';

const defaultImage = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=900';

const personalityOptions = ['Thân thiện, dễ gần', 'Hướng ngoại', 'Lanh lợi', 'Nghịch ngợm', 'Hiền lành'];
const activityOptions = ['Tắm nắng', 'Leo cầu thang', 'Bơi', 'Chạy vòng quanh công viên'];

const CreatePetProfileScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [image, setImage] = useState(defaultImage);
  const [loading, setLoading] = useState(false);

  const [personality, setPersonality] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);

  const imageSlots = useMemo(() => Array.from({ length: 6 }), []);
  const videoSlots = useMemo(() => Array.from({ length: 3 }), []);

  const toggleChip = (value: string, selected: string[], setSelected: (list: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
      return;
    }
    setSelected([...selected, value]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!name || !age || !breed || !location || !ownerContact) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      await createPetProfile({
        name,
        age,
        breed,
        gender,
        location,
        bio: [bio, personality.join(', '), activities.join(', ')].filter(Boolean).join(' | '),
        image,
        ownerContact,
      });
      Alert.alert('Thành công', 'Đã lưu hồ sơ thú cưng.');
    } catch (error: any) {
      Alert.alert('Không thể lưu hồ sơ', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#AECCEB]" contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      <SectionTitle title="Images:" className="text-xl mb-3" />
      <View className="flex-row flex-wrap justify-between mb-5">
        {imageSlots.map((_, idx) => (
          <TouchableOpacity
            key={`img-${idx}`}
            className="w-[31%] h-32 mb-3 bg-white border border-figmaViolet rounded-xl items-center justify-center"
            onPress={pickImage}
            activeOpacity={0.85}
          >
            <Text className="text-figmaTextRed text-xl">Thêm</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle title="Videos:" className="text-xl mb-3" />
      <View className="flex-row flex-wrap justify-between mb-8">
        {videoSlots.map((_, idx) => (
          <View
            key={`vid-${idx}`}
            className="w-[31%] h-32 mb-3 bg-white border border-figmaViolet rounded-xl items-center justify-center"
          >
            <Text className="text-figmaTextRed text-xl">Thêm</Text>
          </View>
        ))}
      </View>

      <Text className="text-figmaTextBlue text-xl font-semibold mb-2">“Vài dòng ngắn” về thú cưng của bạn:</Text>
      <TextInput
        className="bg-white border border-figmaViolet rounded-xl px-4 py-3 mb-6"
        value={bio}
        onChangeText={setBio}
      />

      <SectionTitle title="Thông tin cơ bản:" className="text-xl mb-2" />
      <TextInput className="bg-white rounded-xl px-4 py-3 mb-3" placeholder="Tên" value={name} onChangeText={setName} />
      <TextInput className="bg-white rounded-xl px-4 py-3 mb-3" placeholder="Tuổi" value={age} onChangeText={setAge} />
      <TextInput className="bg-white rounded-xl px-4 py-3 mb-3" placeholder="Giống loài" value={breed} onChangeText={setBreed} />
      <TextInput className="bg-white rounded-xl px-4 py-3 mb-3" placeholder="Khu vực" value={location} onChangeText={setLocation} />
      <TextInput className="bg-white rounded-xl px-4 py-3 mb-4" placeholder="Liên hệ" value={ownerContact} onChangeText={setOwnerContact} />

      <View className="flex-row gap-2 mb-5">
        {(['Male', 'Female', 'Other'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            className={`flex-1 py-3 rounded-full border border-figmaTextRed ${gender === option ? 'bg-figmaViolet' : 'bg-white'}`}
            onPress={() => setGender(option)}
          >
            <Text className={`text-center ${gender === option ? 'text-white' : 'text-figmaTextRed'}`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mb-4">
        <SectionTitle title="Kiểu tính cách:" />
        <View className="flex-row flex-wrap">
          {personalityOptions.map((item) => (
            <TagChip
              key={item}
              label={item}
              selected={personality.includes(item)}
              onPress={() => toggleChip(item, personality, setPersonality)}
            />
          ))}
        </View>
      </View>

      <View className="mb-7">
        <SectionTitle title="Hoạt động yêu thích:" />
        <View className="flex-row flex-wrap">
          {activityOptions.map((item) => (
            <TagChip
              key={item}
              label={item}
              selected={activities.includes(item)}
              onPress={() => toggleChip(item, activities, setActivities)}
            />
          ))}
        </View>
      </View>

      <View className="items-center mb-5">
        <Image source={{ uri: image }} className="w-32 h-32 rounded-full mb-4" />
        <PrimaryButton
          title={loading ? 'Đang lưu...' : 'Lưu thông tin'}
          onPress={onSave}
          disabled={loading}
          className="px-10"
          textClassName="text-2xl text-figmaYellow"
        />
      </View>
    </ScrollView>
  );
};

export default CreatePetProfileScreen;
