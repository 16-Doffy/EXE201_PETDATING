import { Text, TouchableOpacity, View } from 'react-native';
import { MatchModel, PetModel } from '@/types';

type Props = {
  match: MatchModel;
  otherPet: PetModel | null;
  onPress: () => void;
};

const MatchCard = ({ match, otherPet, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-ink">
            {otherPet?.name ?? 'Matched pet'}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Tap to open chat
          </Text>
        </View>
        <Text className="text-rose font-bold">💬</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MatchCard;
