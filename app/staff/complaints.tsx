import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Complaint {
  complaint_id: string;
  booking_id: string;
  user_id: string;
  message: string;
  status: ComplaintStatus;
  created_at: string;
}

interface ComplaintResponse {
  complaints: Complaint[];
  total: number;
}

type ComplaintStatus = "open" | "resolved" | "pending";

interface StatusColors {
  [key: string]: string;
}

const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const statusOptions: ComplaintStatus[] = ["open", "resolved", "pending"];
  const statusColors: StatusColors = {
    open: "bg-yellow-500",
    resolved: "bg-green-500",
    pending: "bg-blue-500",
  };

  const fetchComplaints = async (): Promise<void> => {
    try {
      const response = await axios.get<ComplaintResponse>(
        `${BASE_URL}complaints/?skip=0&limit=100`
      );
      setComplaints(response.data.complaints);
      setError(null);
    } catch (err) {
      setError("Failed to fetch complaints");
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus
  ): Promise<void> => {
    setUpdatingStatus(complaintId);
    try {
      await axios.patch(`${BASE_URL}complaints/${complaintId}/status`, null, {
        params: { status: newStatus },
      });

      // Update local state to reflect the change
      setComplaints(
        complaints.map((complaint) =>
          complaint.complaint_id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (err) {
      console.error("Error updating complaint status:", err);
      alert("Failed to update complaint status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const renderComplaint = ({ item }: { item: Complaint }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <View className="mb-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">
            Booking ID: {item.booking_id.substring(0, 8)}...
          </Text>
          <Text className="text-sm text-gray-500">
            {formatDate(item.created_at)}
          </Text>
        </View>

        <Text className="text-base text-gray-600 mt-2" numberOfLines={3}>
          {item.message}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">
          User ID: {item.user_id.substring(0, 8)}...
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
              } ${updatingStatus === item.complaint_id ? "opacity-50" : ""}`}
              onPress={() => updateComplaintStatus(item.complaint_id, status)}
              disabled={updatingStatus === item.complaint_id}
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
        <Text className="text-gray-600">Loading complaints...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 p-4 justify-center items-center">
        <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded"
          onPress={fetchComplaints}
        >
          <Text className="text-white text-base font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Complaints Management
      </Text>
      <FlatList
        data={complaints}
        renderItem={renderComplaint}
        keyExtractor={(item: Complaint) => item.complaint_id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

export default ComplaintsPage;
