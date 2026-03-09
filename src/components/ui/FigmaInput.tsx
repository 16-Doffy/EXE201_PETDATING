import { Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  containerClassName?: string;
  inputClassName?: string;
};

const FigmaInput = ({ label, containerClassName, inputClassName, ...props }: Props) => {
  return (
    <View className={containerClassName}>
      {label ? <Text className="text-figmaPink text-[19px] mb-2">{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={props.placeholderTextColor ?? '#776E86'}
        className={`bg-figmaPink rounded-xl px-4 py-4 text-ink text-base ${inputClassName ?? ''}`}
      />
    </View>
  );
};

export default FigmaInput;
