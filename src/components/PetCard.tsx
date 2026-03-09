import { Image, Text, View } from 'react-native';
import { PetModel } from '@/types';

type Props = {
  pet: PetModel;
};

const PetCard = ({ pet }: Props) => {
  return (
    <View className="bg-[#E980AF] rounded-[24px] overflow-hidden w-full self-center">
      <Image source={{ uri: pet.image }} className="w-full h-[360px]" resizeMode="cover" />

      <View className="bg-[#BA678C] px-5 py-4">
        <Text className="text-white text-[24px] font-semibold">
          {pet.name} • {pet.age}
        </Text>
        <Text className="text-figmaPink text-base mt-1">
          {pet.gender} • {pet.breed}
        </Text>
        <Text className="text-figmaPink text-base mt-1">{pet.location}</Text>
        <Text className="text-white/90 text-sm mt-2" numberOfLines={2}>
          {pet.bio || 'vài dòng giới thiệu ngắn'}
        </Text>
      </View>
    </View>
  );
};

export default PetCard;
