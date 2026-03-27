import { useMemo, useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PetModel } from '@/types';
import PetCard from './PetCard';

type Props = {
  pets: PetModel[];
  onSwipeLeft: (pet: PetModel) => void;
  onSwipeRight: (pet: PetModel) => void;
  navigation: any;
};

const SWIPE_THRESHOLD = 120;

const SwipeDeck = ({ pets, onSwipeLeft, onSwipeRight, navigation }: Props) => {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // TỰ ĐỘNG RESET KHI DANH SÁCH THAY ĐỔI (CHUYỂN TAB)
  useEffect(() => {
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [pets]);

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
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (!currentPet) return;
      direction === 'right' ? onSwipeRight(currentPet) : onSwipeLeft(currentPet);
      position.setValue({ x: 0, y: 0 });
      setIndex((prev) => (prev + 1 < pets.length ? prev + 1 : prev));
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  if (!currentPet || pets.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="paw-outline" size={60} color="#CBD5E1" />
        <Text className="text-textSub mt-4">Đã xem hết danh sách này.</Text>
        <TouchableOpacity className="mt-4 bg-primary px-6 py-2 rounded-full" onPress={() => setIndex(0)}>
            <Text className="text-white font-bold">Xem lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center py-2">
        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [...position.getTranslateTransform()] }}
        >
          <PetCard pet={currentPet} navigation={navigation} />
        </Animated.View>
      </View>

      <View className="flex-row justify-around items-center py-4">
        <TouchableOpacity onPress={() => setIndex(prev => Math.max(0, prev - 1))} className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm">
          <MaterialCommunityIcons name="backup-restore" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => swipe('left')} className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="close" size={36} color="#F43F5E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => swipe('right')} className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="heart" size={34} color="#00B4DB" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm">
          <Ionicons name="flash" size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SwipeDeck;
