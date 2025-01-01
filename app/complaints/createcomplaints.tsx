import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Complaint, ComplaintsResponse, ComplaintData } from "@/utility/types";



const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ComplaintPage = () => {
  const params = useLocalSearchParams();
  const userId = params.user_id as string;
  const bookingId = params.booking_id as string;

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchComplaints = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${API_URL}complaints/?skip=0&limit=100`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }
      const data: ComplaintsResponse = await response.json();
      setComplaints(data.complaints);
    } catch (error) {
      Alert.alert("Error", "Failed to load complaints history");
      console.error("Fetch error:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
    fetchComplaints();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your complaint message");
      return;
    }

    setIsSubmitting(true);

    const complaintData: ComplaintData = {
      booking_id: bookingId,
      user_id: userId,
      message: message.trim(),
    };

    try {
      const response = await fetch(`${API_URL}complaints/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      Alert.alert("Success", "Your complaint has been submitted successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to submit complaint. Please try again later."
      );
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold mb-4">File a Complaint</Text>
        <Text className="text-gray-600 mb-2">
          Booking ID: {bookingId.slice(0, 8)}...
        </Text>
        <TouchableOpacity
          onPress={handleViewHistory}
          className="bg-gray-200 rounded-lg py-2 px-4 self-start"
        >
          <Text className="text-gray-700">View Complaints History</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          What went wrong? Please describe your issue:
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 min-h-[120px] text-base"
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter your complaint here..."
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        className={`w-full rounded-lg py-3 items-center ${
          isSubmitting ? "bg-gray-400" : "bg-red-500"
        }`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">
            Submit Complaint
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View className="flex-1 bg-white p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold">Complaints History</Text>
            <TouchableOpacity
              onPress={() => setShowHistory(false)}
              className="p-2"
            >
              <Text className="text-blue-500 text-lg">Close</Text>
            </TouchableOpacity>
          </View>

          {isLoadingHistory ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <ScrollView>
              {complaints.map((complaint) => (
                <View
                  key={complaint.complaint_id}
                  className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-semibold">Status:</Text>
                    <Text
                      className={`capitalize ${
                        complaint.status === "open"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {complaint.status}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <Text className="font-semibold mb-1">Message:</Text>
                    <Text className="text-gray-600">{complaint.message}</Text>
                  </View>

                  <View className="flex-row justify-between mt-2">
                    <Text className="text-sm text-gray-500">
                      Booking: {complaint.booking_id.slice(0, 8)}...
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {formatDate(complaint.created_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ComplaintPage;
