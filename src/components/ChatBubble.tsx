import { Image, Text, View } from 'react-native';

type Props = {
  text: string;
  isMine: boolean;
  otherAvatar?: string;
};

const ChatBubble = ({ text, isMine, otherAvatar }: Props) => {
  return (
    <View className={`flex-row mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <Image
          source={{ uri: otherAvatar || 'https://via.placeholder.com/30' }}
          className="w-8 h-8 rounded-full self-end mr-2"
        />
      )}

      <View
        className={`px-4 py-2.5 max-w-[75%] ${
          isMine
            ? 'bg-[#0084ff] rounded-t-2xl rounded-l-2xl rounded-br-md'
            : 'bg-gray-100 rounded-t-2xl rounded-r-2xl rounded-bl-md'
        }`}
      >
        <Text className={`text-[16px] ${isMine ? 'text-white' : 'text-black'}`}>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;
