import { Image, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetModel } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  pet: PetModel;
  navigation: any; // Nhận navigation từ cha truyền xuống
};

const PetCard = ({ pet, navigation }: Props) => {
  // Điều chỉnh chiều cao thẻ linh hoạt
  const cardHeight = SCREEN_HEIGHT * 0.62;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
      style={{ height: cardHeight }}
      className="bg-white rounded-[40px] overflow-hidden w-full shadow-xl shadow-black/10"
    >
      <Image source={{ uri: pet.image }} className="w-full h-full" resizeMode="cover" />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        className="absolute bottom-0 left-0 right-0 h-1/2 justify-end px-6 pb-10"
      >
        <View className="flex-row items-center">
            <Text className="text-white text-[30px] font-bold" numberOfLines={1}>
            {pet.name}, {pet.age}
            </Text>
            <View className="bg-primary/20 p-1 rounded-full ml-2 border border-white/20">
                <Ionicons name="checkmark-circle" size={18} color="#00B4DB" />
            </View>
        </View>

        <View className="flex-row items-center mt-2">
          <Ionicons name="location-sharp" size={14} color="#CBD5E1" />
          <Text className="text-slate-300 text-xs ml-1 font-medium">{pet.location}</Text>
        </View>

        <View className="flex-row flex-wrap mt-4 gap-2">
          <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <Text className="text-white text-[11px] font-bold">{pet.breed}</Text>
          </View>
          <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <Text className="text-white text-[11px] font-bold">Đã tiêm phòng</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="absolute top-6 right-6">
         <TouchableOpacity className="w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-md">
            <Ionicons name="information-circle" size={24} color="white" />
         </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PetCard;
