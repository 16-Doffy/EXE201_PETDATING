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
import { LinearGradient } from 'expo-linear-gradient';
import { getExplorePets, getPetByOwnerId, likePet } from '@/services/petService';
import { PetModel } from '@/types';
import { getRandomImage } from '@/constants/images';
import { useAuth } from '@/hooks/useAuth';
import AppIcon from '@/components/ui/AppIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const resolvePetType = (pet?: PetModel | null): 'Dog' | 'Cat' => {
  if (pet?.type === 'Dog' || pet?.type === 'Cat') return pet.type;

  const source = [
    pet?.breed,
    pet?.name,
    pet?.bio,
    Array.isArray(pet?.tags) ? pet?.tags.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (['cat', 'meo', 'mèo', 'anh', 'mun', 'mướp', 'scottish', 'persian'].some((item) => source.includes(item))) {
    return 'Cat';
  }

  return 'Dog';
};

const ActionButton = ({
  label,
  icon,
  iconColor,
  onPress,
  disabled,
  accent,
}: {
  label: string;
  icon: 'refresh' | 'close' | 'heart' | 'sparkle';
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
}) => (
  <TouchableOpacity
    disabled={disabled}
    onPress={onPress}
    className={`items-center ${disabled ? 'opacity-40' : ''}`}
  >
    <View
      className={`w-16 h-16 rounded-[22px] items-center justify-center shadow-sm ${
        accent ? 'bg-[#ff4f96]' : 'bg-white'
      }`}
      style={{
        shadowColor: accent ? '#ff4f96' : '#cbd5e1',
        shadowOpacity: accent ? 0.35 : 0.18,
        shadowRadius: accent ? 12 : 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
      }}
    >
      <AppIcon name={icon} size={28} color={iconColor} />
    </View>
    <Text className="mt-2 text-[12px] font-semibold text-slate-500">{label}</Text>
  </TouchableOpacity>
);

const HomeSwipeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
      const [data, me] = await Promise.all([getExplorePets(), getPetByOwnerId()]);
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
    () => pets.filter((pet) => resolvePetType(pet) === category),
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
      Alert.alert('Lỗi', 'Không thể gửi lượt thích lúc này.');
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
    outputRange: ['-12deg', '0deg', '12deg'],
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

  const currentType = resolvePetType(currentPet);
  const cardImage = currentPet?.image || getRandomImage(currentType, currentPet?.id);
  const cardSubtitle =
    currentPet?.bio?.trim() ||
    `${currentPet?.name || 'Bé'} đang tìm một người bạn phù hợp để cùng vui chơi mỗi ngày.`;

  return (
    <SafeAreaView className="flex-1 bg-[#fff8fb]">
      <LinearGradient colors={['#fff9fc', '#fff3f6', '#ffffff']} className="absolute inset-0" />

      <View className="px-4 pt-2">
        <View
          className="rounded-[28px] bg-white px-4 py-4 flex-row items-center justify-between"
          style={{
            shadowColor: '#f472b6',
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="flex-row items-center flex-1">
            <Image
              source={{ uri: myPet?.image || getRandomImage(myPet?.type || 'Dog', myPet?.id || 'me') }}
              className="w-12 h-12 rounded-full border-2 border-pink-200 bg-rose-50"
            />
            <View className="ml-3">
              <Text className="text-[12px] font-semibold text-slate-400">Xin chào</Text>
              <Text className="text-[18px] font-black text-slate-800">{myPet?.name || 'Bossitive'}</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-[18px] font-black text-[#ff4f96]">PetDating</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Filter')}
            className="ml-3 w-11 h-11 rounded-full bg-slate-100 items-center justify-center"
          >
            <AppIcon name="filter" size={22} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 pt-4 pb-2">
        <View className="rounded-[24px] bg-[#fff0f6] p-1.5 flex-row">
          {[
            { key: 'Dog', label: 'Chó', icon: 'paw' as const },
            { key: 'Cat', label: 'Mèo', icon: 'cat' as const },
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
                className={`flex-1 rounded-[20px] py-3 flex-row items-center justify-center ${active ? 'bg-white' : ''}`}
                style={
                  active
                    ? {
                        shadowColor: '#fb7185',
                        shadowOpacity: 0.14,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 5 },
                        elevation: 3,
                      }
                    : undefined
                }
              >
                <AppIcon name={item.icon === 'cat' ? 'cat' : 'paw'} size={18} color={active ? '#ff4f96' : '#94a3b8'} />
                <Text className={`ml-2 text-[14px] font-bold ${active ? 'text-[#ff4f96]' : 'text-slate-400'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-1 px-4 pb-3">
        {isAdmin ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6 bg-[#2d1050]">
              <AppIcon name="shield" size={48} color="#c084fc" />
            </View>
            <Text className="text-center text-xl font-bold text-slate-700">
              Quản trị viên không thể ghép đôi
            </Text>
            <Text className="text-center text-sm text-slate-500 mt-3">
              Tài khoản Admin được giới hạn quyền truy cập tính năng ghép đôi thú cưng.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminDashboard')}
              className="mt-8 rounded-full px-8 py-4 bg-[#4a1a7a]"
            >
              <Text className="text-purple-200 font-bold text-base">Mở Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ff4f96" />
            <Text className="mt-3 text-sm font-medium text-slate-500">Đang tải thú cưng phù hợp...</Text>
          </View>
        ) : showEmpty ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm">
              <AppIcon name="paw" size={48} color="#cbd5e1" />
            </View>
            <Text className="text-center text-xl font-bold text-slate-700 mt-5">
              {pets.length === 0 ? 'Chưa có thú cưng nào để khám phá' : 'Bạn đã xem hết danh sách rồi'}
            </Text>
            <Text className="text-center text-sm text-slate-500 mt-2">
              {pets.length === 0
                ? 'Hãy seed dữ liệu mẫu từ backend để có thêm hồ sơ hiển thị.'
                : 'Thử tải lại để xem các hồ sơ mới nhé.'}
            </Text>
            <TouchableOpacity
              onPress={loadPets}
              className="mt-6 rounded-full px-8 py-3 bg-[#ff4f96]"
            >
              <Text className="text-white font-bold">Tải lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 items-center pt-1">
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                width: Math.min(SCREEN_WIDTH - 32, 420),
                transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.96}
                onPress={() => setDetailPet(currentPet)}
                className="rounded-[32px] overflow-hidden bg-white"
                style={{
                  shadowColor: '#f472b6',
                  shadowOpacity: 0.14,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 12 },
                  elevation: 8,
                }}
              >
                <View className="relative">
                  <Image source={{ uri: cardImage }} style={{ width: '100%', height: 360 }} resizeMode="cover" />

                  <Animated.View style={{ opacity: likeOpacity }} className="absolute top-5 left-5 rotate-[-14deg]">
                    <Text className="text-green-500 border-4 border-green-500 px-4 py-2 rounded-2xl text-3xl font-black">
                      LIKE
                    </Text>
                  </Animated.View>

                  <Animated.View style={{ opacity: nopeOpacity }} className="absolute top-5 right-5 rotate-[14deg]">
                    <Text className="text-red-500 border-4 border-red-500 px-4 py-2 rounded-2xl text-3xl font-black">
                      NOPE
                    </Text>
                  </Animated.View>

                  <LinearGradient
                    colors={['transparent', 'rgba(15,23,42,0.35)']}
                    className="absolute left-0 right-0 bottom-0 h-24"
                  />
                </View>

                <View className="bg-white px-5 pt-5 pb-6">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-[30px] leading-8 font-black text-slate-900">
                        {currentPet?.name}, {currentPet?.age}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <AppIcon name="location" size={15} color="#ff4f96" />
                        <Text className="ml-1 text-[13px] font-medium text-slate-500">
                          {currentPet?.location}
                        </Text>
                      </View>
                    </View>

                    <View className="rounded-full bg-rose-50 px-3 py-2 flex-row items-center">
                      <AppIcon name={currentType === 'Cat' ? 'cat' : 'paw'} size={16} color="#ff4f96" />
                      <Text className="ml-1 text-[12px] font-bold text-[#ff4f96]">
                        {currentType === 'Cat' ? 'Mèo' : 'Chó'}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-4 text-[14px] leading-6 text-slate-600" numberOfLines={3}>
                    {cardSubtitle}
                  </Text>

                  {Array.isArray(currentPet?.tags) && currentPet.tags.length > 0 ? (
                    <View className="mt-4 flex-row items-center rounded-2xl bg-rose-50 px-3 py-3">
                      <AppIcon name="sparkle" size={16} color="#ff4f96" />
                      <Text className="ml-2 flex-1 text-[12px] font-medium text-rose-600" numberOfLines={2}>
                        {currentPet.tags.slice(0, 3).join(' · ')}
                      </Text>
                    </View>
                  ) : null}

                  <View className="mt-4 flex-row flex-wrap">
                    <View className="mr-2 mb-2 rounded-full bg-slate-100 px-3 py-2">
                      <Text className="text-[12px] font-bold text-slate-700">{currentPet?.breed || 'Thú cưng đáng yêu'}</Text>
                    </View>
                    <View className="mr-2 mb-2 rounded-full bg-slate-100 px-3 py-2">
                      <Text className="text-[12px] font-bold text-slate-700">
                        {currentPet?.gender === 'Male' ? 'Đực' : currentPet?.gender === 'Female' ? 'Cái' : 'Khác'}
                      </Text>
                    </View>
                    {!!currentPet?.weight && (
                      <View className="mr-2 mb-2 rounded-full bg-slate-100 px-3 py-2">
                        <Text className="text-[12px] font-bold text-slate-700">{currentPet.weight}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View className="w-full max-w-[420px] mt-5 rounded-[28px] bg-white px-5 py-4">
              <Text className="text-center text-[13px] font-semibold text-slate-400">
                Vuốt ngang hoặc dùng các nút bên dưới để chọn nhanh
              </Text>
              <View className="mt-4 flex-row items-center justify-between">
                <ActionButton
                  label="Quay lại"
                  icon="refresh"
                  iconColor="#64748b"
                  onPress={handleUndo}
                  disabled={currentIndex === 0}
                />
                <ActionButton
                  label="Bỏ qua"
                  icon="close"
                  iconColor="#ef4444"
                  onPress={swipeLeft}
                />
                <ActionButton
                  label="Thích"
                  icon="heart"
                  iconColor="#ffffff"
                  onPress={swipeRight}
                  accent
                />
                <ActionButton
                  label="Tải lại"
                  icon="sparkle"
                  iconColor="#f59e0b"
                  onPress={loadPets}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={!!detailPet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailPet(null)}
      >
        {detailPet && (
          <SafeAreaView className="flex-1 bg-[#fff9fb]">
            <View className="px-4 py-3 flex-row items-center">
              <TouchableOpacity onPress={() => setDetailPet(null)} className="p-2">
                <AppIcon name="close" size={26} color="#111827" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-lg font-bold text-slate-900 pr-10">
                Hồ sơ thú cưng
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: detailPet.image || getRandomImage(resolvePetType(detailPet), detailPet.id) }}
                style={{ width: '100%', height: 320 }}
                resizeMode="cover"
              />

              <View className="px-5 py-5">
                <Text className="text-3xl font-black text-slate-900">
                  {detailPet.name}, {detailPet.age}
                </Text>

                <View className="mt-3 flex-row items-center">
                  <AppIcon name="location" size={15} color="#ff4f96" />
                  <Text className="ml-1 text-slate-500">{detailPet.location}</Text>
                </View>

                <Text className="mt-5 text-[15px] leading-7 text-slate-600">
                  {detailPet.bio || 'Chưa có mô tả cho thú cưng này.'}
                </Text>

                <View className="mt-5 flex-row flex-wrap">
                  <View className="mr-2 mb-2 rounded-full bg-rose-50 px-3 py-2">
                    <Text className="text-[12px] font-bold text-[#ff4f96]">{detailPet.breed}</Text>
                  </View>
                  <View className="mr-2 mb-2 rounded-full bg-slate-100 px-3 py-2">
                    <Text className="text-[12px] font-bold text-slate-700">
                      {detailPet.gender === 'Male' ? 'Đực' : detailPet.gender === 'Female' ? 'Cái' : 'Khác'}
                    </Text>
                  </View>
                  {!!detailPet.ownerContact && (
                    <View className="mr-2 mb-2 rounded-full bg-slate-100 px-3 py-2">
                      <Text className="text-[12px] font-bold text-slate-700">{detailPet.ownerContact}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    handleLike(detailPet);
                    setDetailPet(null);
                  }}
                  className="mt-8 bg-[#ff4f96] py-4 rounded-2xl items-center"
                >
                  <Text className="text-white font-bold text-lg">Thích ngay</Text>
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
