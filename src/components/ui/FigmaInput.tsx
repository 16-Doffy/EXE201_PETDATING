import { Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  containerClassName?: string;
  inputClassName?: string;
};

const FigmaInput = ({ label, containerClassName, inputClassName, ...props }: Props) => {
  return (
    <View className={`mb-4 ${containerClassName ?? ''}`}>
      {label ? <Text className="text-textSub font-bold text-sm mb-2 ml-1">{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={props.placeholderTextColor ?? '#94A3B8'}
        className={`bg-white border border-gray-100 rounded-2xl px-5 py-4 text-textMain text-base shadow-sm ${inputClassName ?? ''}`}
      />
    </View>
  );
};

export default FigmaInput;
