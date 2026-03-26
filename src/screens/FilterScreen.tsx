import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Filter'>;

const FilterScreen = ({ navigation }: Props) => {
  const [category, setCategory] = useState('Chó');
  const [gender, setGender] = useState('Tất cả');
  const [distance, setDistance] = useState(10);

  // Strictly Dog and Cat as requested
  const categories = ['Tất cả', 'Chó', 'Mèo'];
  const genders = ['Tất cả', 'Đực', 'Cái'];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#E0EAFC', '#FFFFFF']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-textMain">Bộ lọc tìm kiếm</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary font-bold text-lg">Xong</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Categories */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-textMain mb-4">Loài thú cưng</Text>
          <View className="flex-row flex-wrap">
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                className={`mr-3 mb-3 px-6 py-3 rounded-full ${
                  category === item ? 'bg-primary shadow-md shadow-primary/30' : 'bg-white border border-gray-100'
                }`}
              >
                <Text
                  className={`font-bold ${
                    category === item ? 'text-white' : 'text-textSub'
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-textMain mb-4">Giới tính</Text>
          <View className="flex-row">
            {genders.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setGender(item)}
                className={`flex-1 items-center py-3 rounded-xl mr-2 ${
                  gender === item ? 'bg-primary' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-bold ${
                    gender === item ? 'text-white' : 'text-textSub'
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-textMain">Khoảng cách</Text>
            <Text className="text-primary font-bold">{distance} km</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full relative">
             <View className="absolute left-0 top-0 bottom-0 bg-primary rounded-full" style={{ width: `${(distance/50)*100}%` }} />
             <View
                className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full -top-2"
                style={{ left: `${(distance/50)*100}%`, marginLeft: -12 }}
             />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-textSub text-xs">0 km</Text>
            <Text className="text-textSub text-xs">50 km</Text>
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View className="p-6">
        <TouchableOpacity
            className="rounded-full overflow-hidden"
            onPress={() => navigation.goBack()}
        >
            <LinearGradient
                colors={['#00B4DB', '#0083B0']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="py-4 items-center"
            >
                <Text className="text-white font-bold text-lg">Áp dụng bộ lọc</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FilterScreen;
