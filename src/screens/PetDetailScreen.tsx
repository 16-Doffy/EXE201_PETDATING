import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { RootStackParamList, PetModel } from '@/types';
import { getPetById, likePet, unlikePet, getPetByOwnerId, addLocalMatch, getMatches } from '@/services/petService';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

const { width } = Dimensions.get('window');

const PetDetailScreen = ({ route, navigation }: Props) => {
  const [pet, setPet] = useState<PetModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [myPetId, setMyPetId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [me, item, matches] = await Promise.all([
            getPetByOwnerId(),
            getPetById(route.params.petId),
            getMatches().catch(() => [])
        ]);

        if (me) setMyPetId(me.id);
        setPet(item);

        const matched = matches.some(m => m.pet1 === route.params.petId || m.pet2 === route.params.petId);
        setIsLiked(matched);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [route.params.petId]);

  const toggleLike = async () => {
    if (!pet) return;

    try {
        if (isLiked) {
            await unlikePet(pet.id);
            setIsLiked(false);
            Alert.alert('Thông báo', `Đã bỏ thích ${pet.name}`);
        } else {
            const result = await likePet(pet.id);
            setIsLiked(true);
            if (myPetId) await addLocalMatch(myPetId, pet);

            if (result.matched) {
                Alert.alert("It's a Match!", `Bạn và ${pet.name} đã thích nhau!`);
            } else {
                Alert.alert('Thành công', `Đã gửi tim cho ${pet.name}`);
            }
        }
    } catch (err) {
        Alert.alert('Lỗi', 'Không thể thực hiện thao tác này lúc này.');
    }
  };

  const goToChat = async () => {
    if (!pet) return;
    try {
        const matches = await getMatches();
        const match = matches.find(m => m.pet1 === pet.id || m.pet2 === pet.id);
        if (match) {
            navigation.navigate('Chat', {
                matchId: match.id,
                otherPetName: pet.name,
                otherPetId: pet.id
            });
        } else {
            Alert.alert('Chưa Match', `Bạn cần match với ${pet.name} trước khi nhắn tin.`);
        }
    } catch {
        Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#00B4DB" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Không tìm thấy thông tin thú cưng.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
            <Text className="text-primary font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image source={{ uri: pet.image }} className="w-full h-[400px]" resizeMode="cover" />
          <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="absolute top-12 left-4 w-10 h-10 bg-black/20 rounded-full items-center justify-center"
            >
                <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-white -mt-12 rounded-t-[40px] px-6 pt-8 pb-32 shadow-2xl">
          <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-3xl font-bold text-textMain">{pet.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="location-sharp" size={16} color="#94A3B8" />
                    <Text className="text-textSub ml-1 text-sm">{pet.location}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={toggleLike} className="p-3 bg-white shadow-md rounded-full">
                <Ionicons name="heart" size={32} color={isLiked ? "#FF5A8A" : "#E2E8F0"} />
            </TouchableOpacity>
          </View>

          <Text className="text-lg font-bold text-textMain mt-6 mb-3">Thông tin chi tiết:</Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-brandLight rounded-xl px-4 py-3 flex-row items-center min-w-[110px]">
                <Ionicons name={pet.gender === 'Male' ? 'male' : 'female'} size={20} color="#00B4DB" />
                <Text className="ml-2 text-textMain font-medium">{pet.gender}</Text>
            </View>
            <View className="bg-brandLight rounded-xl px-4 py-3 flex-row items-center min-w-[110px]">
                <MaterialCommunityIcons name="needle" size={20} color="#00B4DB" />
                <Text className="ml-2 text-textMain font-medium">Đã tiêm</Text>
            </View>
            <View className="bg-brandLight rounded-xl px-4 py-3 flex-row items-center min-w-[110px]">
                <MaterialCommunityIcons name="weight" size={20} color="#00B4DB" />
                <Text className="ml-2 text-textMain font-medium">{pet.weight || '3.0 kg'}</Text>
            </View>
            <View className="bg-brandLight rounded-xl px-4 py-3 flex-row items-center min-w-[110px]">
                <FontAwesome5 name="award" size={18} color="#00B4DB" />
                <Text className="ml-2 text-textMain font-medium">Có chứng chỉ</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-textMain mt-8 mb-2">Mô tả</Text>
          <Text className="text-textSub leading-6 text-[15px]">
            {pet.bio || `${pet.name} là một bé ${pet.type === 'Dog' ? 'chó' : 'mèo'} vô cùng đáng yêu. Bé đang tìm kiếm một gia đình yêu thương.`}
          </Text>

          <View className="mt-10 p-5 bg-slate-50 rounded-[24px] flex-row items-center border border-slate-100">
             <View className="flex-1">
                <Text className="font-bold text-[17px] text-textMain">Chủ sở hữu</Text>
                <Text className="text-textSub text-xs mt-0.5">Phản hồi nhanh • Đã xác thực</Text>
             </View>
             <View className="flex-row gap-3">
                <TouchableOpacity onPress={goToChat} className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
                    <Ionicons name="chatbubble-ellipses" size={24} color="#00B4DB" />
                </TouchableOpacity>
                <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100">
                    <Ionicons name="call" size={24} color="#00B4DB" />
                </TouchableOpacity>
             </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
            onPress={toggleLike}
            className="rounded-2xl overflow-hidden shadow-lg shadow-primary/30"
        >
            <LinearGradient
                colors={['#00B4DB', '#0083B0']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="py-4 items-center"
            >
                <Text className="text-white text-lg font-bold">Thích bé ngay</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PetDetailScreen;
