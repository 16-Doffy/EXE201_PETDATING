import { Text, View } from 'react-native';

type Props = {
  text: string;
  isMine: boolean;
  timeLabel?: string;
  statusLabel?: string;
};

const ChatBubble = ({ text, isMine, timeLabel, statusLabel }: Props) => {
  return (
    <View className={`mb-2 ${isMine ? 'items-end' : 'items-start'}`}>
      <View className={`px-4 py-3 rounded-2xl max-w-[80%] ${isMine ? 'bg-rose' : 'bg-white'}`}>
        <Text className={`${isMine ? 'text-white' : 'text-ink'}`}>{text}</Text>
      </View>

      <View className={`flex-row mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {timeLabel ? <Text className="text-[11px] text-slate-500">{timeLabel}</Text> : null}
        {isMine && statusLabel ? <Text className="text-[11px] text-slate-500 ml-2">{statusLabel}</Text> : null}
      </View>
    </View>
  );
};

export default ChatBubble;
