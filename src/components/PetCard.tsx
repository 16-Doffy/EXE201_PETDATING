import { Image, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetModel, RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  pet: PetModel;
};

const PetCard = ({ pet }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
      className="bg-white rounded-[32px] overflow-hidden w-full h-[580px] shadow-lg shadow-black/20"
    >
      <Image source={{ uri: pet.image }} className="w-full h-full" resizeMode="cover" />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        className="absolute bottom-0 left-0 right-0 h-1/2 justify-end px-5 pb-8"
      >
        <View className="flex-row items-center">
            <Text className="text-white text-[32px] font-bold">
            {pet.name}, {pet.age}
            </Text>
            <Ionicons name="checkmark-circle" size={20} color="#0084ff" style={{ marginLeft: 8, marginTop: 4 }} />
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-sharp" size={16} color="white" />
          <Text className="text-white/90 text-sm ml-1">{pet.location}</Text>
        </View>

        <View className="flex-row flex-wrap mt-4 gap-2">
          {pet.tags?.map((tag, i) => (
            <View key={i} className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/30">
              <Text className="text-white text-xs font-medium">{tag}</Text>
            </View>
          )) || (
            <>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/30">
                <MaterialCommunityIcons name="pill" size={14} color="white" />
                <Text className="text-white text-xs font-medium ml-1">Vaccinated</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/30">
                <Ionicons name="happy-outline" size={14} color="white" />
                <Text className="text-white text-xs font-medium ml-1">Good with Kids</Text>
              </View>
            </>
          )}
        </View>
      </LinearGradient>

      {/* "i" info icon like Tinder */}
      <View className="absolute bottom-10 right-5">
         <Ionicons name="information-circle" size={28} color="white" />
      </View>
    </TouchableOpacity>
  );
};

export default PetCard;
