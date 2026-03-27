import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#00B4DB', '#0083B0']}
        className="absolute left-0 right-0 top-0 bottom-0"
      />
      <View className="flex-1 items-center justify-center">
        <View className="bg-white/20 p-8 rounded-[40px] border border-white/30 backdrop-blur-md">
            <Text className="text-[48px] font-extrabold tracking-[4px] text-white italic">
                BOSSITIVE
            </Text>
        </View>

        <View className="absolute bottom-20">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-white/80 mt-4 font-medium tracking-wide">
                Đang chuẩn bị dữ liệu...
            </Text>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;
