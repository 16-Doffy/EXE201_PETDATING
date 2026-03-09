import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-figmaCream">
      <ScrollView>
        <View className="w-full max-w-[420px] self-center px-4 pt-2 pb-6">
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-[24px] font-bold text-slate-900">Settings</Text>
          </View>

          <View className="bg-white rounded-2xl border border-[#EEF2FF] p-4 mb-3 flex-row items-center justify-between">
            <Text className="text-slate-800">Push notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>

          <View className="bg-white rounded-2xl border border-[#EEF2FF] p-4 mb-3 flex-row items-center justify-between">
            <Text className="text-slate-800">Dark mode (demo)</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <TouchableOpacity
            className="bg-white rounded-2xl border border-[#EEF2FF] p-4 mb-3"
            onPress={() => Alert.alert('Ngôn ngữ', 'Tính năng sẽ cập nhật sớm.')}
          >
            <Text className="text-slate-800">Language</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl border border-[#EEF2FF] p-4"
            onPress={() => Alert.alert('Đổi mật khẩu', 'Tính năng sẽ cập nhật sớm.')}
          >
            <Text className="text-slate-800">Change password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
