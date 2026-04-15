import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getExplorePets, likePet, getPetByOwnerId } from '@/services/petService';
import { PetModel } from '@/types';
import { getRandomImage } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const HomeSwipeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin';

  const [pets, setPets] = useState<PetModel[]>([]);
  const [myPet, setMyPet] = useState<PetModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'Dog' | 'Cat'>('Dog');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailPet, setDetailPet] = useState<PetModel | null>(null);

  const position = useRef(new Animated.ValueXY()).current;

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const [data, me] = await Promise.all([
        getExplorePets(),
        getPetByOwnerId(),
      ]);
      setPets(Array.isArray(data) ? data : []);
      setMyPet(me);
      setCurrentIndex(0);
      position.setValue({ x: 0, y: 0 });
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách thú cưng');
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const filteredPets = useMemo(
    () => pets.filter((p) => (p.type || 'Dog') === category),
    [pets, category]
  );

  const currentPet = filteredPets[currentIndex];

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const nextPet = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLike = async (pet: PetModel) => {
    try {
      const result = await likePet(pet.id);
      if (result?.matched) {
        Alert.alert('Match 🎉', `Bạn và ${pet.name} đã match. Mở chat ngay nhé!`);
      }
    } catch {
      // silent fallback
    }
  };

  const swipeRight = () => {
    if (!currentPet) return;

    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 120, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(async () => {
      await handleLike(currentPet);
      nextPet();
    });
  };

  const swipeLeft = () => {
    if (!currentPet) return;

    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 120, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      nextPet();
    });
  };

  const handleUndo = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-14deg', '0deg', '14deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [20, SCREEN_WIDTH / 3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 3, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const showEmpty =
    !loading && (filteredPets.length === 0 || currentIndex >= filteredPets.length);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#fff7fb', '#ffffff']} className="absolute inset-0" />

      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        {/* Avatar & tên pet của mình */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          className="flex-row items-center"
        >
          <Image
            source={{ uri: myPet?.image || getRandomImage(myPet?.type || 'Dog', 'me') }}
            className="w-10 h-10 rounded-full border-2 border-pink-300 bg-gray-100"
          />
          <View className="ml-2">
            <Text className="text-xs text-gray-400 font-medium">Xin chào</Text>
            <Text className="text-sm font-bold text-gray-800 leading-tight">
              {myPet?.name || '...'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="text-2xl font-extrabold text-pink-500">PetDating</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Filter')}
          className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="options-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View className="px-5 pb-3">
        <View className="bg-gray-100 rounded-full p-1 flex-row">
          {[
            { key: 'Dog', label: 'Chó' },
            { key: 'Cat', label: 'Mèo' },
          ].map((item) => {
            const active = category === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  setCategory(item.key as 'Dog' | 'Cat');
                  setCurrentIndex(0);
                  position.setValue({ x: 0, y: 0 });
                }}
                className={`flex-1 py-3 rounded-full items-center ${active ? 'bg-white' : ''}`}
              >
                <Text className={`${active ? 'text-pink-500' : 'text-gray-400'} font-bold`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-4">
        {isAdmin ? (
          <View className="items-center px-8">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#2d1050' }}>
              <MaterialCommunityIcons name="shield-lock" size={52} color="#c084fc" />
            </View>
            <Text className="text-center text-xl font-bold text-gray-300">
              Quản trị viên không thể sử dụng
            </Text>
            <Text className="text-center text-sm text-gray-500 mt-3">
              Tài khoản Admin được giới hạn quyền truy cập tính năng ghép đôi thú cưng.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminDashboard')}
              className="mt-8 rounded-full px-8 py-4"
              style={{ backgroundColor: '#4a1a7a' }}
            >
              <Text className="text-purple-200 font-bold text-base">Mở Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color="#ec4899" />
        ) : showEmpty ? (
          <View className="items-center px-8">
            <Ionicons name="paw-outline" size={72} color="#cbd5e1" />
            <Text className="text-center text-lg font-bold text-gray-500 mt-4">
              {pets.length === 0
                ? 'Chưa có thú cưng nào để khám phá'
                : 'Bạn đã xem hết danh sách rồi'}
            </Text>
            <Text className="text-center text-sm text-gray-400 mt-2">
              {pets.length === 0
                ? 'Hãy seed dữ liệu mẫu từ backend (POST /pets/seed/demo)'
                : ' Quay lại sau nhé!'}
            </Text>
            <TouchableOpacity
              onPress={loadPets}
              className="mt-5 bg-pink-500 px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Tải lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              width: SCREEN_WIDTH - 32,
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            }}
            className="rounded-[32px] overflow-hidden bg-white shadow-xl"
          >
            <TouchableOpacity activeOpacity={0.95} onPress={() => setDetailPet(currentPet)}>
              <Image
                source={{ uri: currentPet?.image }}
                style={{ width: '100%', height: 520 }}
                resizeMode="cover"
              />

              <Animated.View
                style={{ opacity: likeOpacity }}
                className="absolute top-10 left-6 rotate-[-16deg]"
              >
                <Text className="text-green-500 border-4 border-green-500 px-4 py-2 rounded-2xl text-3xl font-black">
                  LIKE
                </Text>
              </Animated.View>

              <Animated.View
                style={{ opacity: nopeOpacity }}
                className="absolute top-10 right-6 rotate-[16deg]"
              >
                <Text className="text-red-500 border-4 border-red-500 px-4 py-2 rounded-2xl text-3xl font-black">
                  NOPE
                </Text>
              </Animated.View>

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.92)']}
                className="absolute left-0 right-0 bottom-0 h-64 justify-end px-6 pb-7"
              >
                <View className="flex-row items-center">
                  <Text className="text-white text-3xl font-extrabold">
                    {currentPet?.name}, {currentPet?.age}
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#4ade80"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-sharp" size={14} color="#cbd5e1" />
                  <Text className="text-slate-300 ml-1 text-xs">{currentPet?.location}</Text>
                </View>

                <View className="flex-row flex-wrap mt-4">
                  <View className="bg-white/15 px-3 py-2 rounded-full mr-2 mb-2">
                    <Text className="text-white text-xs font-bold">{currentPet?.breed}</Text>
                  </View>
                  <View className="bg-white/15 px-3 py-2 rounded-full mr-2 mb-2">
                    <Text className="text-white text-xs font-bold">
                      {currentPet?.gender === 'Male'
                        ? 'Đực'
                        : currentPet?.gender === 'Female'
                        ? 'Cái'
                        : 'Khác'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {!loading && !showEmpty && !isAdmin && (
        <View className="px-5 pb-8 pt-4 flex-row items-center justify-around">
          <TouchableOpacity
            disabled={currentIndex === 0}
            onPress={handleUndo}
            className={`w-14 h-14 rounded-full bg-white items-center justify-center shadow ${
              currentIndex === 0 ? 'opacity-40' : ''
            }`}
          >
            <MaterialCommunityIcons name="backup-restore" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={swipeLeft}
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons name="close" size={34} color="#f43f5e" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={swipeRight}
            className="w-16 h-16 rounded-full bg-pink-500 items-center justify-center shadow"
          >
            <Ionicons name="heart" size={32} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={loadPets}
            className="w-14 h-14 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons name="refresh" size={24} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={!!detailPet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailPet(null)}
      >
        {detailPet && (
          <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
              <TouchableOpacity onPress={() => setDetailPet(null)} className="p-2">
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-lg font-bold text-gray-900 pr-10">
                Thông tin thú cưng
              </Text>
            </View>

            <ScrollView>
              <Image
                source={{ uri: detailPet.image }}
                style={{ width: '100%', height: 320 }}
                resizeMode="cover"
              />

              <View className="px-5 py-5">
                <Text className="text-3xl font-extrabold text-gray-900">
                  {detailPet.name}, {detailPet.age}
                </Text>

                <View className="mt-4">
                  <Text className="text-gray-500 leading-6">
                    {detailPet.bio || 'Chưa có mô tả cho thú cưng này.'}
                  </Text>
                </View>

                <View className="mt-5 space-y-2">
                  <Text className="text-gray-800 font-medium">Giống: {detailPet.breed}</Text>
                  <Text className="text-gray-800 font-medium">Giới tính: {detailPet.gender}</Text>
                  <Text className="text-gray-800 font-medium">Địa điểm: {detailPet.location}</Text>
                  {!!detailPet.ownerContact && (
                    <Text className="text-gray-800 font-medium">
                      Liên hệ: {detailPet.ownerContact}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    handleLike(detailPet);
                    setDetailPet(null);
                  }}
                  className="mt-8 bg-pink-500 py-4 rounded-2xl items-center"
                >
                  <Text className="text-white font-bold text-lg">Thích ngay ❤️</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default HomeSwipeScreen;