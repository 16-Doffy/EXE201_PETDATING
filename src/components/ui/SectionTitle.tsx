import { Text } from 'react-native';

type Props = {
  title: string;
  className?: string;
};

const SectionTitle = ({ title, className }: Props) => {
  return <Text className={`text-figmaTextBlue text-2xl font-semibold mb-3 ${className ?? ''}`}>{title}</Text>;
};

export default SectionTitle;
