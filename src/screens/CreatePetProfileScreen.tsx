import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  DeviceEventEmitter,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPetProfile } from '@/services/petService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImage } from '@/constants/images';

const personalityOptions = ['Thân thiện', 'Nghịch ngợm', 'Hiền lành', 'Lanh lợi', 'Dễ gần'];

const CreatePetProfileScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [type, setType] = useState<'Dog' | 'Cat'>('Dog');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState<string[]>([]);

  const togglePersonality = (value: string) => {
    if (personality.includes(value)) {
      setPersonality(personality.filter((v) => v !== value));
    } else {
      setPersonality([...personality, value]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
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
      const finalImage = image || getRandomImage(type, Date.now().toString());

      await createPetProfile({
        name,
        age,
        breed,
        gender,
        type,
        location,
        bio: [bio, personality.join(', ')].filter(Boolean).join(' | '),
        image: finalImage,
        ownerContact,
      });

      // PHÁT TÍN HIỆU ĐỂ APPNAVIGATOR CHUYỂN TRANG
      DeviceEventEmitter.emit('petProfileCreated');

      Alert.alert('Thành công', 'Hồ sơ thú cưng đã được tạo!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
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
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8">
            <Text className="text-3xl font-bold text-textMain mb-2">Tạo hồ sơ thú cưng</Text>
            <Text className="text-textSub font-medium">Hãy để mọi người biết về bé yêu của bạn</Text>
        </View>

        <TouchableOpacity
            onPress={pickImage}
            className="w-full h-48 bg-white rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center mb-8 overflow-hidden"
        >
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
            ) : (
                <View className="items-center">
                    <Ionicons name="camera-outline" size={40} color="#94A3B8" />
                    <Text className="text-textSub mt-2 font-bold">Thêm ảnh thú cưng</Text>
                </View>
            )}
        </TouchableOpacity>

        <View className="mb-6">
            <Text className="text-textMain font-bold mb-4">Thông tin cơ bản</Text>

            <View className="flex-row mb-4">
                <TouchableOpacity
                    onPress={() => setType('Dog')}
                    className={`flex-1 py-4 rounded-2xl items-center mr-2 border ${type === 'Dog' ? 'bg-primary border-primary' : 'bg-white border-gray-100'}`}
                >
                    <Ionicons name="paw" size={24} color={type === 'Dog' ? 'white' : '#94A3B8'} />
                    <Text className={`font-bold mt-1 ${type === 'Dog' ? 'text-white' : 'text-textSub'}`}>Chó</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setType('Cat')}
                    className={`flex-1 py-4 rounded-2xl items-center ml-2 border ${type === 'Cat' ? 'bg-primary border-primary' : 'bg-white border-gray-100'}`}
                >
                    <MaterialCommunityIcons name="cat" size={24} color={type === 'Cat' ? 'white' : '#94A3B8'} />
                    <Text className={`font-bold mt-1 ${type === 'Cat' ? 'text-white' : 'text-textSub'}`}>Mèo</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Tên của bé"
                value={name}
                onChangeText={setName}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-4 text-textMain shadow-sm"
            />
            <View className="flex-row mb-4">
                <TextInput
                    placeholder="Tuổi (vd: 2 tuổi)"
                    value={age}
                    onChangeText={setAge}
                    className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-4 mr-2 text-textMain shadow-sm"
                />
                <TextInput
                    placeholder="Giống loài"
                    value={breed}
                    onChangeText={setBreed}
                    className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-4 ml-2 text-textMain shadow-sm"
                />
            </View>
            <TextInput
                placeholder="Khu vực sinh sống"
                value={location}
                onChangeText={setLocation}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-4 text-textMain shadow-sm"
            />
            <TextInput
                placeholder="Số điện thoại liên hệ"
                value={ownerContact}
                onChangeText={setOwnerContact}
                keyboardType="phone-pad"
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-4 text-textMain shadow-sm"
            />
        </View>

        <View className="mb-6">
            <Text className="text-textMain font-bold mb-4">Tính cách</Text>
            <View className="flex-row flex-wrap">
                {personalityOptions.map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => togglePersonality(item)}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${personality.includes(item) ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`${personality.includes(item) ? 'text-white' : 'text-textSub'} font-medium`}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <View className="mb-10">
            <Text className="text-textMain font-bold mb-4">Mô tả thêm</Text>
            <TextInput
                placeholder="Giới thiệu đôi chút về bé..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-textMain shadow-sm h-32"
                textAlignVertical="top"
            />
        </View>

        <PrimaryButton
            title={loading ? "ĐANG LƯU..." : "TẠO HỒ SƠ"}
            onPress={onSave}
            disabled={loading}
            className="mb-12 shadow-lg shadow-primary/30"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePetProfileScreen;
