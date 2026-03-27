// App.tsx placeholder
import {
  ActivityIndicator, Alert, Animated, Dimensions, Image, Modal, PanResponder, Text,
  TouchableOpacity, View, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getExplorePets, likePet } from '@/services/petService';
import { PetModel } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const HomeSwipeScreen = ({ navigation }: any) => {
  const [pets, setPets] = useState<PetModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'Dog' | 'Cat'>('Dog');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailPet, setDetailPet] = useState<PetModel | null>(null);
  const position = useRef(new Animated.ValueXY()).current;

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExplorePets();
      setPets(data);
      setCurrentIndex(0);
      position.setValue({ x: 0, y: 0 });
    } catch {
      Alert.alert('Loi', 'Khong the tai danh sach');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPets(); }, []);

  const handleCategoryChange = (cat: 'Dog' | 'Cat') => {
    setCategory(cat);
    setCurrentIndex(0);
    position.setValue({ x: 0, y: 0 });
  };

  const filteredPets = pets.filter(p => p.type === category);
  const currentPet = filteredPets[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: gesture.dy }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) swipeRight();
        else if (gesture.dx < -SWIPE_THRESHOLD) swipeLeft();
        else resetPosition();
      },
    })
  ).current;

  const swipeRight = () => {
    if (!currentPet) return;
    Animated.timing(position, { toValue: { x: SCREEN_WIDTH + 100, y: 0 }, duration: 250, useNativeDriver: false }).start(() => {
      handleLike(currentPet);
      nextPet();
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, { toValue: { x: -SCREEN_WIDTH - 100, y: 0 }, duration: 250, useNativeDriver: false }).start(() => nextPet());
  };

  const nextPet = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev < filteredPets.length - 1 ? prev + 1 : filteredPets.length);
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
  };

  const handleLike = async (pet: PetModel) => {
    try {
      const result = await likePet(pet.id);
      if (result.matched) Alert.alert('Match! 🎉', `Ban va ${pet.name} da thich nhau! Hay tro chuyen ngay.`);
    } catch {}
  };

  const handleUndo = () => {
    if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); position.setValue({ x: 0, y: 0 }); }
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({ inputRange: [0, SCREEN_WIDTH / 4], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 4, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const showEmpty = !loading && filteredPets.length > 0 && currentIndex >= filteredPets.length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#E0EAFC', '#FFFFFF']} className="absolute inset-0" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 h-14 z-10">
        <TouchableOpacity onPress={() => navigation.navigate('Filter')}>
          <Ionicons name="options-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#00B4DB] italic">bossitive</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View className="px-4 py-2 z-10">
        <View className="flex-row bg-gray-200/50 p-1 rounded-full max-w-[320px] mx-auto">
          {[{ key: 'Dog', label: 'Cho' }, { key: 'Cat', label: 'Meo' }].map(item => (
            <TouchableOpacity key={item.key} onPress={() => handleCategoryChange(item.key as 'Dog' | 'Cat')}
              className={`flex-1 py-2.5 rounded-full items-center ${category === item.key ? 'bg-white shadow-sm' : ''}`}>
              <Text className={`font-bold text-base ${category === item.key ? 'text-[#00B4DB]' : 'text-gray-400'}`}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Swipe Area */}
      <View className="flex-1 justify-center items-center">
        {loading ? (
          <ActivityIndicator size="large" color="#00B4DB" />
        ) : showEmpty ? (
          <View className="items-center justify-center px-8">
            <Ionicons name="paw-outline" size={80} color="#CBD5E1" />
            <Text className="text-xl font-bold text-gray-400 mt-4 text-center">Da xem het danh sach nay.</Text>
            <TouchableOpacity onPress={loadPets} className="mt-6 bg-[#00B4DB] px-8 py-3 rounded-full shadow-lg shadow-[#00B4DB]/30">
              <Text className="text-white font-bold text-base">Tai lai</Text>
            </TouchableOpacity>
          </View>
        ) : filteredPets.length === 0 ? (
          <View className="items-center justify-center px-8">
            <MaterialCommunityIcons name="dog" size={80} color="#CBD5E1" />
            <Text className="text-xl font-bold text-gray-400 mt-4 text-center">
              Chua co {category === 'Dog' ? 'cho' : 'meo'} nao o day.
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center w-full">
            {[...filteredPets].reverse().map((pet, revIdx) => {
              const idx = filteredPets.length - 1 - revIdx;
              if (idx < currentIndex || idx > currentIndex + 1) return null;
              const isCurrent = idx === currentIndex;
              const translateX = isCurrent ? position.x : (idx === currentIndex + 1 ? Animated.add(position.x, new Animated.Value(SCREEN_WIDTH + 50)) : new Animated.Value(SCREEN_WIDTH + 50));
              return (
                <Animated.View
                  key={pet.id}
                  {...(isCurrent ? panResponder.panHandlers : {})}
                  style={{
                    position: 'absolute', width: SCREEN_WIDTH - 32, left: 16,
                    transform: [
                      { translateX: isCurrent ? position.x : SCREEN_WIDTH + 50 },
                      { translateY: isCurrent ? position.y : 0 },
                      { rotate: isCurrent ? rotate : '0deg' },
                    ],
                  }}
                  className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-black/10"
                >
                  <TouchableOpacity activeOpacity={0.95} onPress={() => setDetailPet(pet)} style={{ height: 480 }}>
                    <Image source={{ uri: pet.image }} className="w-full h-full" resizeMode="cover" />

                    {isCurrent && (
                      <>
                        <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
                          <Text className="text-green-500 font-black text-4xl border-4 border-green-500 rounded-2xl px-4 py-1">THICH</Text>
                        </Animated.View>
                        <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
                          <Text className="text-red-500 font-black text-4xl border-4 border-red-500 rounded-2xl px-4 py-1">BO QUA</Text>
                        </Animated.View>
                      </>
                    )}

                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} className="absolute bottom-0 left-0 right-0 h-1/2 justify-end px-6 pb-8">
                      <View className="flex-row items-center">
                        <Text className="text-white text-[32px] font-bold" numberOfLines={1}>{pet.name}, {pet.age}</Text>
                        <View className="bg-green-500/20 p-1 rounded-full ml-2">
                          <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="location-sharp" size={14} color="#CBD5E1" />
                        <Text className="text-slate-300 text-xs ml-1">{pet.location}</Text>
                      </View>
                      <View className="flex-row flex-wrap mt-3 gap-2">
                        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                          <Text className="text-white text-[11px] font-bold">{pet.breed}</Text>
                        </View>
                        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                          <Text className="text-white text-[11px] font-bold capitalize">{pet.gender === 'Male' ? 'Duc' : pet.gender === 'Female' ? 'Cai' : 'Khac'}</Text>
                        </View>
                        <View className="bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/40">
                          <Text className="text-green-400 text-[11px] font-bold">Da tiam phong</Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <TouchableOpacity onPress={() => setDetailPet(pet)} className="absolute top-6 right-6 w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md">
                      <Ionicons name="information-circle" size={24} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {!showEmpty && filteredPets.length > 0 && (
        <View className="flex-row justify-around items-center pb-8 px-4 z-10">
          <TouchableOpacity onPress={handleUndo} disabled={currentIndex === 0}
            className={`w-14 h-14 rounded-full bg-white items-center justify-center shadow-md ${currentIndex === 0 ? 'opacity-30' : ''}`}>
            <MaterialCommunityIcons name="backup-restore" size={26} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={swipeLeft} className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg">
            <Ionicons name="close" size={36} color="#F43F5E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={swipeRight} className="w-16 h-16 rounded-full bg-[#00B4DB] items-center justify-center shadow-lg shadow-[#00B4DB]/40">
            <Ionicons name="heart" size={34} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadPets} className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
            <Ionicons name="refresh" size={26} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Pet Detail Modal */}
      <Modal visible={detailPet !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailPet(null)}>
        {detailPet && (
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={() => setDetailPet(null)} className="p-2">
                <Ionicons name="close" size={28} color="#1E293B" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-lg font-bold text-textMain pr-10">Thong tin thu cung</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={{ uri: detailPet.image }} className="w-full" style={{ height: 300 }} resizeMode="cover" />
              <View className="px-6 py-5">
                <View className="flex-row items-center mb-4">
                  <Text className="text-3xl font-bold text-textMain">{detailPet.name}</Text>
                  <View className="ml-3 bg-[#00B4DB]/10 px-3 py-1 rounded-full">
                    <Text className="text-[#00B4DB] font-bold">{detailDetail.age}</Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-3 mb-6">
                  <View className="bg-gray-50 px-4 py-3 rounded-2xl flex-row items-center">
                    <MaterialCommunityIcons name="paw" size={18} color="#00B4DB" />
                    <Text className="ml-2 font-medium text-textMain">{detailPet.breed}</Text>
                  </View>
                  <View className="bg-gray-50 px-4 py-3 rounded-2xl flex-row items-center">
                    <Ionicons name={detailPet.gender === 'Male' ? 'male' : 'female'} size={18} color="#00B4DB" />
                    <Text className="ml-2 font-medium text-textMain">{detailPet.gender === 'Male' ? 'Duc' : detailPet.gender === 'Female' ? 'Cai' : 'Khac'}</Text>
                  </View>
                  <View className="bg-gray-50 px-4 py-3 rounded-2xl flex-row items-center">
                    <Ionicons name="location" size={18} color="#00B4DB" />
                    <Text className="ml-2 font-medium text-textMain">{detailPet.location}</Text>
                  </View>
                  <View className="bg-green-50 px-4 py-3 rounded-2xl flex-row items-center">
                    <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
                    <Text className="ml-2 font-medium text-green-600">Da tiam phong</Text>
                  </View>
                </View>
                {detailPet.bio && (
                  <View className="mb-6">
                    <Text className="text-base font-bold text-textMain mb-2">Gioi thieu</Text>
                    <Text className="text-textSub leading-relaxed">{detailPet.bio}</Text>
                  </View>
                )}
                {detailPet.ownerContact && (
                  <View className="mb-4">
                    <Text className="text-base font-bold text-textMain mb-2">Lien he chu nuoi</Text>
                    <TouchableOpacity className="bg-[#00B4DB] rounded-2xl py-4 items-center flex-row justify-center">
                      <Ionicons name="call" size={20} color="white" />
                      <Text className="ml-2 text-white font-bold">{detailPet.ownerContact}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => { handleLike(detailPet); setDetailPet(null); }}
                  className="bg-[#00B4DB] rounded-2xl py-4 items-center shadow-lg shadow-[#00B4DB]/30">
                  <Text className="text-white font-bold text-lg">Thich ❤️</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles: Record<string, any> = {
  stamp: { position: 'absolute', top: 50, zIndex: 10 },
  likeStamp: { left: 30, transform: [{ rotate: '-20deg' }] },
  nopeStamp: { right: 30, transform: [{ rotate: '20deg' }] },
};

export default HomeSwipeScreen;
