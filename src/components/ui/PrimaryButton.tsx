import { Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'violet' | 'yellow' | 'pink';
  size?: 'md' | 'lg';
  rounded?: 'full' | 'xl';
  textClassName?: string;
  className?: string;
};

const variantClass: Record<NonNullable<Props['variant']>, string> = {
  violet: 'bg-figmaViolet',
  yellow: 'bg-figmaYellow',
  pink: 'bg-[#F28BA9] border border-figmaTextRed',
};

const sizeClass: Record<NonNullable<Props['size']>, string> = {
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

const roundedClass: Record<NonNullable<Props['rounded']>, string> = {
  full: 'rounded-full',
  xl: 'rounded-xl',
};

const textColorByVariant: Record<NonNullable<Props['variant']>, string> = {
  violet: 'text-white',
  yellow: 'text-figmaViolet',
  pink: 'text-[#FFE8F2]',
};

const PrimaryButton = ({
  title,
  onPress,
  disabled,
  variant = 'violet',
  size = 'lg',
  rounded = 'full',
  textClassName,
  className,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={`${variantClass[variant]} ${sizeClass[size]} ${roundedClass[rounded]} items-center justify-center ${disabled ? 'opacity-70' : ''} ${className ?? ''}`}
    >
      <Text className={`${textColorByVariant[variant]} font-semibold ${textClassName ?? 'text-lg'}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
