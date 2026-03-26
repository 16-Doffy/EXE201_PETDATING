import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
};

const PrimaryButton = ({ title, onPress, style }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={style}
      className="rounded-full overflow-hidden shadow-md shadow-primary/30"
    >
      <LinearGradient
        colors={['#00B4DB', '#0083B0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-4 px-8 items-center"
      >
        <Text className="text-white font-bold text-lg">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
