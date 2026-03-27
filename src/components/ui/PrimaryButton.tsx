import React from 'react';
import { Text, TouchableOpacity, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'yellow' | 'outline';
  disabled?: boolean;
  className?: string;
  textClassName?: string;
};

const PrimaryButton = ({ title, onPress, style, variant = 'primary', disabled, className, textClassName }: Props) => {
  const isOutline = variant === 'outline';

  const getColors = () => {
    switch (variant) {
      case 'yellow': return ['#F8BE38', '#F59E0B'];
      case 'secondary': return ['#E0EAFC', '#CFDEF3'];
      default: return ['#00B4DB', '#0083B0'];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={style}
      className={`rounded-2xl overflow-hidden shadow-sm ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {isOutline ? (
        <View className="bg-white border border-primary py-4 px-8 items-center rounded-2xl">
          <Text className={`text-primary font-bold text-lg ${textClassName ?? ''}`}>{title}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-4 px-8 items-center"
        >
          <Text className={`text-white font-bold text-lg ${textClassName ?? ''}`}>{title}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
