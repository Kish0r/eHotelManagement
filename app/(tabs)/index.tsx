import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import Cards from "@/components/cards";
import { Room, RoomsResponse } from "@/utility/types";


const API_URL = process.env.EXPO_PUBLIC_API_URL + 'rooms/?skip=0&limit=100';

export default function Index() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data: RoomsResponse) => {
        setRooms(data.rooms);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="px-4 py-6">


        <View className="space-y-4">
          {rooms.map((room) => (
            <Cards
              key={room.room_id}
              room_id={room.room_id}
              title={room.title}
              price={room.price_per_night}
              amenities={room.amenities}
              description={room.description}
              imageSource={room.image} 
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
