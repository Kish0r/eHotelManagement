import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Booking } from "@/utility/types";

export default function ComplaintScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const { user_id } = useLocalSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}bookings/${user_id}/bookings`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError("Failed to fetch bookings");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleComplaint = (bookingId: string, userId: string): void => {
    router.push({
      pathname: "/complaints/createcomplaints",
      params: { user_id: userId, booking_id: bookingId },
    })
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Booking History</Text>

        {bookings.map((booking) => (
          <View
            key={booking.booking_id}
            className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold">Booking ID:</Text>
              <Text className="text-gray-600">
                {booking.booking_id.slice(0, 8)}...
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold">Check In:</Text>
              <Text className="text-gray-600">
                {formatDate(booking.check_in_date)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold">Check Out:</Text>
              <Text className="text-gray-600">
                {formatDate(booking.check_out_date)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold">Status:</Text>
              <Text
                className={`capitalize ${
                  booking.status === "confirmed"
                    ? "text-green-600"
                    : "text-blue-600"
                }`}
              >
                {booking.status}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold">Guests:</Text>
              <Text className="text-gray-600">{booking.number_of_guests}</Text>
            </View>

            {booking.special_requests && (
              <View className="mb-2">
                <Text className="font-semibold">Special Requests:</Text>
                <Text className="text-gray-600 mt-1">
                  {booking.special_requests}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="w-full bg-blue-600 rounded-md py-3 items-center mt-4"
              onPress={() =>
                handleComplaint(booking.booking_id, booking.user_id)
              }
            >
              <Text className="text-white font-semibold">File a Complaint</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
