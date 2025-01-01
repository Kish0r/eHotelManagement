import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TokenManager } from "@/utility/tokenManagementUtility";
import { RoomDetail } from "@/utility/types";

const STATUS_STYLES = {
  available: {
    container: "bg-green-100",
    text: "text-green-800",
  },
  unavailable: {
    container: "bg-red-100",
    text: "text-red-800",
  },
};

const checkLoginStatus = () => {
  const tokenExists = TokenManager.getFullToken();
  return !!tokenExists;
};

const handleBookingPress = (room_id: string, price_per_night: number) => {
  if (checkLoginStatus()) {
    router.push({
      pathname: "/booking/[id]",
      params: { id: room_id, room_price: price_per_night },
    });
  } else {
    router.push("/login");
  }
};
const RoomDetailPage = () => {
  const { id } = useLocalSearchParams();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}rooms/id/${id}`);
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!room) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-600">Room not found</Text>
      </View>
    );
  }

  const {
    title,
    image,
    price_per_night,
    status,
    description,
    amenities,
    created_at,
    room_id,
  } = room;
  const statusStyle =
    STATUS_STYLES[status === "available" ? "available" : "unavailable"];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        <TouchableOpacity
          className="absolute top-12 left-4 z-10 bg-white rounded-full p-2 shadow"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Image
          source={{ uri: `${apiUrl}${image}` }}
          className="w-full h-72 mt-10"
          resizeMode="cover"
        />
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
            {title}
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold text-green-600">
              ${price_per_night}
            </Text>
            <Text className="text-gray-500 text-sm ml-1">/night</Text>
          </View>
        </View>

        <View
          className={`self-start rounded-full px-3 py-1 ${statusStyle.container} mb-4`}
        >
          <Text className={`text-sm ${statusStyle.text} capitalize`}>
            {status}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            About this room
          </Text>
          <Text className="text-gray-600 leading-6">{description}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-3">
            Room Features
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <View
                key={index}
                className="bg-gray-50 rounded-full px-4 py-2 mb-2"
              >
                <Text className="text-gray-600 capitalize">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className="text-sm text-gray-500 mb-6">
          Listed since: {new Date(created_at).toLocaleDateString()}
        </Text>

        {status === "available" && (
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 mb-6"
            onPress={() => handleBookingPress(room_id, price_per_night)}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Book Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default RoomDetailPage;
