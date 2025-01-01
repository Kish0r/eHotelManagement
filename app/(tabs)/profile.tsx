import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { TokenManager } from "@/utility/tokenManagementUtility";
import { UserData } from "@/utility/types";

const ProfilePage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchUserData = async () => {
    try {
      const token = await TokenManager.getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const response = await fetch(`${API_URL}auth/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load user data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await TokenManager.clearTokens();
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to logout. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <View className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
          <Text className="text-xl font-semibold text-center text-gray-800 mb-6">
            Please log in to view your profile
          </Text>
          <TouchableOpacity
            className="w-full bg-blue-600 rounded-2xl py-4 items-center shadow-sm"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white font-semibold text-lg">
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md mx-auto">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
            Profile
          </Text>

          <View className="space-y-6">
            {/* Profile Info Items */}
            {[
              { label: "Name", value: userData.name },
              { label: "Email", value: userData.email },
              { label: "User Type", value: userData.user_type },
              { label: "User ID", value: userData.user_id }
            ].map((item, index) => (
              <View key={index} className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-sm text-gray-500 mb-1">
                  {item.label}
                </Text>
                <Text className="text-base font-medium text-gray-800">
                  {item.value}
                </Text>
              </View>
            ))}

            {/* Action Buttons */}
            <View className="space-y-4 pt-4">
              <Link href={`/complaints/${userData.user_id}`} asChild>
                <TouchableOpacity 
                  className="w-full bg-blue-600 rounded-2xl py-4 items-center shadow-sm"
                >
                  <Text className="text-white font-semibold text-lg">
                    View History
                  </Text>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                className="w-full bg-red-500 rounded-2xl py-4 items-center shadow-sm my-2"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold text-lg">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfilePage;