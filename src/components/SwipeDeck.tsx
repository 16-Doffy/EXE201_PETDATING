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
        <Text className="text-lg text-white/90 text-center">Tạm thời chưa có bé phù hợp gần bạn.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [...position.getTranslateTransform()] }}
      >
        <PetCard pet={currentPet} />
      </Animated.View>

      <View className="flex-row justify-around items-center mt-5 mb-2 px-4">
        <TouchableOpacity
          onPress={() => swipe('left')}
          className="w-14 h-14 rounded-full bg-white items-center justify-center"
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={30} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipe('right')}
          className="w-16 h-16 rounded-full bg-white items-center justify-center"
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={30} color="#FF476A" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-white items-center justify-center"
          activeOpacity={0.85}
          onPress={undo}
        >
          <MaterialCommunityIcons name="backup-restore" size={24} color="#F8BE38" />
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default SwipeDeck;
