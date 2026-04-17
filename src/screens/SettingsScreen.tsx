import { useState } from 'react';
import { Alert, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const isAdmin = (user as any)?.role === 'admin';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-white font-bold text-xl text-center pr-10">Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Admin Dashboard */}
        {isAdmin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminDashboard')}
            className="flex-row items-center rounded-2xl px-5 py-4 mb-5"
            style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#FFD700' }}
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: '#FFD70020' }}>
              <MaterialCommunityIcons name="chart-box" size={20} color="#FFD700" />
            </View>
            <View className="flex-1">
              <Text className="text-yellow-400 font-bold text-sm">Admin Dashboard</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Quản lý người dùng & doanh thu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFD700" />
          </TouchableOpacity>
        )}

        {/* Notifications */}
        <View
          className="flex-row items-center justify-between rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
              <Ionicons name="notifications-outline" size={18} color="#8e8e93" />
            </View>
            <Text className="text-white font-medium">Thông báo đẩy</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: '#0084FF' }} thumbColor="white" />
        </View>

        {/* Account */}
        <Text className="text-gray-500 text-xs font-semibold mb-2 mt-4 ml-1">Tài khoản</Text>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => Alert.alert('Ngôn ngữ', 'Tính năng sẽ cập nhật sớm.')}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="language" size={18} color="#8e8e93" />
          </View>
          <Text className="flex-1 text-white font-medium">Ngôn ngữ</Text>
          <Text className="text-gray-500 text-sm mr-2">Tiếng Việt</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => Alert.alert('Đổi mật khẩu', 'Tính năng sẽ cập nhật sớm.')}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="lock-closed-outline" size={18} color="#8e8e93" />
          </View>
          <Text className="flex-1 text-white font-medium">Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => Alert.alert('Tài khoản', `Email: ${(user as any)?.email || 'N/A'}\nRole: ${(user as any)?.role || 'user'}`)}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="person-outline" size={18} color="#8e8e93" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Thông tin tài khoản</Text>
            <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
              {(user as any)?.email}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        {/* Support */}
        <Text className="text-gray-500 text-xs font-semibold mb-2 mt-4 ml-1">Hỗ trợ</Text>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => navigation.navigate('FAQ')}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="help-circle-outline" size={18} color="#8e8e93" />
          </View>
          <Text className="flex-1 text-white font-medium">FAQ</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => Alert.alert('Về PetDating', 'Phiên bản 1.0.0\nApp hẹn hò cho thú cưng 🐾')}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="information-circle-outline" size={18} color="#8e8e93" />
          </View>
          <Text className="flex-1 text-white font-medium">Về PetDating</Text>
          <Text className="text-gray-500 text-sm mr-2">v1.0</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        {/* Danger zone */}
        <Text className="text-gray-500 text-xs font-semibold mb-2 mt-4 ml-1">Khác</Text>

        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 mb-3"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={() => Alert.alert('Chính sách', 'Tính năng sẽ cập nhật sớm.')}
        >
          <View className="w-10 h-10 rounded-xl bg-[#2c2c2e] items-center justify-center mr-4">
            <Ionicons name="shield-checkmark-outline" size={18} color="#8e8e93" />
          </View>
          <Text className="flex-1 text-white font-medium">Chính sách bảo mật</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

        {/* Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-600 text-xs">PetDating v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
