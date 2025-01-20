import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Room {
  room_id: string;
  title: string;
  amenities: string[];
  description: string;
  image: string;
  status: RoomStatus;
  price_per_night: number;
  created_at: string;
}

interface RoomResponse {
  rooms: Room[];
  total: number;
}

type RoomStatus = "available" | "unavailable" | "do_not_disturb";

interface StatusColors {
  [key: string]: string;
}

const Staff: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const statusOptions: RoomStatus[] = [
    "available",
    "unavailable",
    "do_not_disturb",
  ];
  const statusColors: StatusColors = {
    available: "bg-green-500",
    unavailable: "bg-red-500",
    "do_not_disturb": "bg-yellow-500",
  };

  const fetchRooms = async (): Promise<void> => {
    try {
      const response = await axios.get<RoomResponse>(
        `${BASE_URL}rooms/?skip=0&limit=100`
      );
      setRooms(response.data.rooms);
      setError(null);
    } catch (err) {
      setError("Failed to fetch rooms");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (
    roomId: string,
    newStatus: RoomStatus
  ): Promise<void> => {
    await axios.patch(
      `${BASE_URL}rooms/${roomId}/status`,
      null, // no body
      {
        params: { status: newStatus },
      }
    );

    // Update local state to reflect the change
    setRooms(
      rooms.map((room) =>
        room.room_id === roomId ? { ...room, status: newStatus } : room
      )
    );
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const renderRoom = ({ item }: { item: Room }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <View className="mb-3">
        <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
        <Text className="text-base text-gray-600 mt-1">
          ${item.price_per_night}/night
        </Text>
        <Text className="text-gray-600 mt-1" numberOfLines={2}>
          {item.description}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Amenities: {item.amenities.join(", ")}
        </Text>
      </View>

      <View className="mt-2">
        <Text className="text-base font-medium mb-2">Status:</Text>
        <View className="flex-row justify-between">
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              className={`flex-1 p-2 rounded mx-1 ${
                item.status === status ? statusColors[status] : "bg-gray-200"
              }`}
              onPress={() => updateRoomStatus(item.room_id, status)}
            >
              <Text
                className={`text-xs font-medium text-center ${
                  item.status === status ? "text-white" : "text-gray-800"
                }`}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 p-4 justify-center items-center">
        <Text className="text-gray-600">Loading rooms...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 p-4 justify-center items-center">
        <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded"
          onPress={fetchRooms}
        >
          <Text className="text-white text-base font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Room Management
      </Text>
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item: Room) => item.room_id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

export default Staff;
