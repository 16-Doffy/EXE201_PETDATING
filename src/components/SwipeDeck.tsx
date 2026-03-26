import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetModel } from '@/types';
import PetCard from './PetCard';

type Props = {
  pets: PetModel[];
  onSwipeLeft: (pet: PetModel) => void;
  onSwipeRight: (pet: PetModel) => void;
};

const SWIPE_THRESHOLD = 120;

const SwipeDeck = ({ pets, onSwipeLeft, onSwipeRight }: Props) => {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentPet = pets[index];

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            swipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            swipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [index, currentPet]
  );

  const swipe = (direction: 'left' | 'right') => {
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? 500 : -500, y: 0 },
      duration: 240,
      useNativeDriver: false,
    }).start(() => {
      if (!currentPet) return;
      direction === 'right' ? onSwipeRight(currentPet) : onSwipeLeft(currentPet);
      position.setValue({ x: 0, y: 0 });
      setIndex((prev) => {
        if (pets.length === 0) return 0;
        return (prev + 1) % pets.length;
      });
    });
  };

  const undo = () => {
    if (index === 0) {
      resetPosition();
      return;
    }
    setIndex((prev) => Math.max(prev - 1, 0));
    resetPosition();
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  if (!currentPet) {
    return (
      <View className="items-center justify-center mt-20 px-6">
        <Text className="text-lg text-gray-500 text-center">Tạm thời chưa có bé phù hợp gần bạn.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center">
        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [...position.getTranslateTransform()] }}
        >
          <PetCard pet={currentPet} />
        </Animated.View>
      </View>

      {/* Control Buttons Based on Image 1 */}
      <View className="flex-row justify-between items-center px-4 py-8">
        <TouchableOpacity
          onPress={undo}
          className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center"
        >
          <MaterialCommunityIcons name="backup-restore" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipe('left')}
          className="w-16 h-16 rounded-full bg-[#00A78E] items-center justify-center shadow-lg shadow-[#00A78E]/40"
        >
          <Ionicons name="close" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipe('right')}
          className="w-16 h-16 rounded-full bg-[#A389F4] items-center justify-center shadow-lg shadow-[#A389F4]/40"
        >
          <Ionicons name="heart" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center"
        >
          <Ionicons name="bookmark" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SwipeDeck;
