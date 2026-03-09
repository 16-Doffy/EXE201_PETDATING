import { Text, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

const TagChip = ({ label, selected, onPress, className }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`border border-figmaTextRed rounded-full px-4 py-2 mr-2 mb-3 ${selected ? 'bg-figmaTextRed' : 'bg-white'} ${className ?? ''}`}
    >
      <Text className={`${selected ? 'text-white' : 'text-figmaTextRed'} text-lg`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default TagChip;
