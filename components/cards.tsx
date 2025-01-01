import { Link, router } from "expo-router";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface CardProps {
  room_id: string;
  title: string;
  price: number;
  amenities: string[];
  description: string;
  imageSource: any;
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const Cards = ({
  room_id,
  title,
  price,
  amenities,
  description,
  imageSource,
}: CardProps) => {
  const handleRoomPress = () => {
    router.push({
      pathname: "/roomdetail/[id]",
      params: { id: room_id },
    });
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 mb-4 elevation-3"
      onPress={handleRoomPress}
    >
      <View className="w-full h-52 relative">
        <Image
          source={{ uri: `${apiUrl}${imageSource}` }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-black/30 px-4 py-2 rounded-full">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-white">${price}</Text>
            <Text className="text-white text-sm ml-1">/night</Text>
          </View>
        </View>
      </View>

      {/* Content Container */}
      <View className="p-5">
        {/* Title */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">
            {title}
          </Text>
        </View>

        {/* Amenities Scroll */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {amenities.map((amenity, index) => (
            <View 
              key={index} 
              className="bg-blue-50 rounded-full px-4 py-1.5 border border-blue-100"
            >
              <Text className="text-sm text-blue-700 font-medium">
                {amenity}
              </Text>
            </View>
          ))}
        </View>

        {/* Description with truncation */}
        <Text 
          className="text-gray-600 text-sm leading-6 mb-4"
          numberOfLines={2}
        >
          {description}
        </Text>

        {/* View Details Button */}
        <TouchableOpacity 
          className="bg-blue-600 rounded-2xl py-3.5 px-4"
          onPress={handleRoomPress}
        >
          <Text className="text-white text-center font-semibold text-base">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default Cards;