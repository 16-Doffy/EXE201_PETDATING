import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { createPetProfile } from '@/services/petService';
import { getRandomImage } from '@/constants/images';
import PrimaryButton from '@/components/ui/PrimaryButton';
import FigmaInput from '@/components/ui/FigmaInput';
import AppIcon from '@/components/ui/AppIcon';

const personalityOptions = ['Thân thiện', 'Nghịch ngợm', 'Hiền lành', 'Lanh lợi', 'Dễ gần'];

const CreatePetProfileScreen = ({ navigation }: any) => {
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
  const [weight, setWeight] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const togglePersonality = (value: string) => {
    setPersonality((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const applyPickedAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const nextImage = asset.base64
      ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
      : asset.uri;

    setImage(nextImage);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return;
    applyPickedAsset(result.assets[0]);
  };

  const captureImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền máy ảnh', 'Vui lòng cho phép ứng dụng truy cập máy ảnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return;
    applyPickedAsset(result.assets[0]);
  };

  const normalizeTags = () =>
    Array.from(
      new Set(
        tagsInput
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );

  const onSave = async () => {
    if (!name.trim() || !age.trim() || !breed.trim() || !location.trim() || !ownerContact.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đủ tên, tuổi, giống, khu vực và liên hệ.');
      return;
    }

    try {
      setLoading(true);
      const finalImage = image || getRandomImage(type, Date.now().toString());
      const tags = Array.from(new Set([...normalizeTags(), ...personality]));

      await createPetProfile({
        name: name.trim(),
        age: age.trim(),
        breed: breed.trim(),
        gender,
        type,
        location: location.trim(),
        bio: bio.trim(),
        image: finalImage,
        ownerContact: ownerContact.trim(),
        weight: weight.trim(),
        tags,
      });

      Alert.alert(
        'Tạo hồ sơ thành công',
        `Hồ sơ của ${name.trim()} đã sẵn sàng. Bây giờ bạn có thể vào Trang chủ để bắt đầu ghép đôi.`,
        [
          {
            text: 'Vào Trang chủ',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                })
              );
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Không thể tạo hồ sơ', error?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute left-0 right-0 top-0 bottom-0" />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8">
          <Text className="text-3xl font-bold text-textMain mb-2">Tạo hồ sơ thú cưng</Text>
          <Text className="text-textSub font-medium">
            Điền đầy đủ thông tin để hồ sơ của bé hiển thị đẹp hơn khi ghép đôi.
          </Text>
        </View>

        <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-textMain font-bold">Ảnh đại diện</Text>
              <Text className="text-textSub text-xs mt-1">Nên dùng ảnh vuông, rõ mặt thú cưng</Text>
            </View>
            {image ? (
              <View className="rounded-full bg-emerald-50 px-3 py-1 flex-row items-center">
                <AppIcon name="check" size={14} color="#10B981" />
                <Text className="ml-1 text-emerald-600 text-xs font-bold">Đã chọn ảnh</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-60 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 items-center justify-center overflow-hidden"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center px-6">
                <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                  <AppIcon name="image" size={30} color="#64748B" />
                </View>
                <Text className="text-textMain mt-3 font-bold">Chọn ảnh hồ sơ cho bé</Text>
                <Text className="text-textSub text-center mt-2">
                  Ảnh sẽ được lưu cùng hồ sơ để những máy khác vẫn xem được đầy đủ.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row flex-wrap mt-4">
            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 min-w-[46%] bg-primary rounded-2xl py-3 items-center mr-2 mb-2 flex-row justify-center"
            >
              <AppIcon name="gallery" size={18} color="#fff" />
              <Text className="text-white font-bold ml-2">Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={captureImage}
              className="flex-1 min-w-[46%] bg-slate-900 rounded-2xl py-3 items-center ml-2 mb-2 flex-row justify-center"
            >
              <AppIcon name="camera" size={18} color="#fff" />
              <Text className="text-white font-bold ml-2">Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setImage(getRandomImage(type, `${Date.now()}`))}
              className="flex-1 min-w-[46%] bg-slate-100 rounded-2xl py-3 items-center mr-2 flex-row justify-center"
            >
              <AppIcon name="sparkle" size={18} color="#475569" />
              <Text className="text-textMain font-bold ml-2">Ảnh mẫu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setImage('')}
              className="flex-1 min-w-[46%] bg-rose-50 rounded-2xl py-3 items-center ml-2 flex-row justify-center"
            >
              <AppIcon name="trash" size={18} color="#e11d48" />
              <Text className="text-rose-600 font-bold ml-2">Xóa ảnh</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 flex-row items-start">
            <View className="mt-0.5">
              <AppIcon name="camera" size={18} color="#0f172a" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-700 font-bold text-sm">Mẹo chọn ảnh</Text>
              <Text className="text-slate-500 text-xs mt-1 leading-5">
                Chọn ảnh chỉ có thú cưng của bạn, đủ sáng và không lẫn ảnh màn hình hoặc hình minh họa khác.
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-6 shadow-sm">
          <Text className="text-textMain font-bold mb-4">Loại thú cưng</Text>
          <View className="flex-row mb-5">
            <TouchableOpacity
              onPress={() => setType('Dog')}
              className={`flex-1 py-4 rounded-2xl items-center mr-2 border ${type === 'Dog' ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <AppIcon name="paw" size={24} color={type === 'Dog' ? '#ffffff' : '#94A3B8'} />
              <Text className={`font-bold mt-1 ${type === 'Dog' ? 'text-white' : 'text-textSub'}`}>Chó</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType('Cat')}
              className={`flex-1 py-4 rounded-2xl items-center ml-2 border ${type === 'Cat' ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <AppIcon name="cat" size={24} color={type === 'Cat' ? '#ffffff' : '#94A3B8'} />
              <Text className={`font-bold mt-1 ${type === 'Cat' ? 'text-white' : 'text-textSub'}`}>Mèo</Text>
            </TouchableOpacity>
          </View>

          <FigmaInput label="Tên thú cưng" placeholder="Ví dụ: Coco" value={name} onChangeText={setName} />

          <View className="flex-row">
            <FigmaInput
              label="Tuổi"
              placeholder="Ví dụ: 2 tuổi"
              value={age}
              onChangeText={setAge}
              containerClassName="flex-1 mr-2"
            />
            <FigmaInput
              label="Giống"
              placeholder="Ví dụ: Poodle"
              value={breed}
              onChangeText={setBreed}
              containerClassName="flex-1 ml-2"
            />
          </View>

          <View className="flex-row">
            <FigmaInput
              label="Cân nặng"
              placeholder="Ví dụ: 3.2 kg"
              value={weight}
              onChangeText={setWeight}
              containerClassName="flex-1 mr-2"
            />
            <FigmaInput
              label="Khu vực"
              placeholder="Ví dụ: Quận 7, TP.HCM"
              value={location}
              onChangeText={setLocation}
              containerClassName="flex-1 ml-2"
            />
          </View>

          <FigmaInput
            label="Liên hệ chủ nuôi"
            placeholder="Số điện thoại hoặc Zalo"
            value={ownerContact}
            onChangeText={setOwnerContact}
            keyboardType="phone-pad"
          />

          <Text className="text-textMain font-bold mb-3 mt-1">Giới tính</Text>
          <View className="flex-row mb-2">
            {[
              { label: 'Đực', value: 'Male' as const, icon: 'male' as const },
              { label: 'Cái', value: 'Female' as const, icon: 'female' as const },
              { label: 'Khác', value: 'Other' as const, icon: 'ellipse-outline' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setGender(item.value)}
                className={`flex-1 py-3 rounded-2xl items-center border mx-1 ${gender === item.value ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <AppIcon
                  name={
                    item.value === 'Male' ? 'male' : item.value === 'Female' ? 'female' : 'sparkle'
                  }
                  size={18}
                  color={gender === item.value ? '#fff' : '#64748B'}
                />
                <Text className={`font-bold mt-1 ${gender === item.value ? 'text-white' : 'text-textSub'}`}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-gray-100 p-5 mb-6 shadow-sm">
          <Text className="text-textMain font-bold mb-4">Tính cách và sở thích</Text>
          <View className="flex-row flex-wrap mb-3">
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

          <FigmaInput
            label="Từ khóa nổi bật"
            placeholder="Ví dụ: thích chạy bộ, thích ăn pate, ngoan, nghe lời"
            value={tagsInput}
            onChangeText={setTagsInput}
          />

          <Text className="text-textMain font-bold mb-3">Mô tả thêm</Text>
          <FigmaInput
            placeholder="Giới thiệu đôi chút về bé, thói quen, món ăn yêu thích..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={5}
            inputClassName="h-36 pt-4"
            textAlignVertical="top"
          />
        </View>

        <PrimaryButton
          title={loading ? 'ĐANG LƯU...' : 'TẠO HỒ SƠ'}
          onPress={onSave}
          disabled={loading}
          className="mb-12 shadow-lg shadow-primary/30"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePetProfileScreen;
