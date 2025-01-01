import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { TokenManager } from "@/utility/tokenManagementUtility";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useStripe } from "@stripe/stripe-react-native";

interface BookingForm {
  check_in_date: Date;
  check_out_date: Date;
  number_of_guests: string;
  special_requests: string;
}

interface UserData {
  user_id: string;
  name: string;
  email: string;
  user_type: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const BookingPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room_price } = useLocalSearchParams<{ room_price: string }>();
  const [form, setForm] = useState<BookingForm>({
    check_in_date: new Date(),
    check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
    number_of_guests: "1",
    special_requests: "",
  });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const initialize = async () => {
      await fetchUserData();
      if (userData) {
        await initializePaymentSheet();
      }
    };
    initialize();
  }, [userData?.user_id]);

  const fetchUserData = async () => {
    try {
      const token = await TokenManager.getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}auth/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load user data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (
    _: unknown,
    selectedDate: Date | undefined,
    dateType: "check_in_date" | "check_out_date"
  ) => {
    if (dateType === "check_in_date") setShowCheckIn(false);
    if (dateType === "check_out_date") setShowCheckOut(false);

    if (selectedDate) {
      setForm((prev) => ({
        ...prev,
        [dateType]: selectedDate,
      }));
    }
  };

  const validateForm = (): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (form.check_in_date < today) {
      Toast.show({
        type: "error",
        text1: "Invalid Date",
        text2: "Check-in date cannot be in the past",
      });
      return false;
    }

    if (form.check_out_date <= form.check_in_date) {
      Toast.show({
        type: "error",
        text1: "Invalid Date",
        text2: "Check-out date must be after check-in date",
      });
      return false;
    }

    const guestCount = parseInt(form.number_of_guests, 10);
    if (isNaN(guestCount) || guestCount < 1) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Number of guests must be at least 1",
      });
      return false;
    }

    return true;
  };

  const createBooking = async () => {
    try {
      const token = await TokenManager.getToken();
      if (!token || !userData) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${API_URL}bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: id,
          user_id: userData.user_id,
          number_of_guests: parseInt(form.number_of_guests, 10),
          special_requests: form.special_requests,
          check_in_date: form.check_in_date.toISOString(),
          check_out_date: form.check_out_date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Booking failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const token = await TokenManager.getToken();
      const response = await fetch(`${API_URL}bookings/payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseInt(room_price, 10),
          currency: "eur",
        }),
      });
      console.log("Response", response.ok);
      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
      console.log("paymentIntent", paymentIntent);
      console.log(ephemeralKey);
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Booking App",
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        defaultBillingDetails: {
          name: userData?.name,
          email: userData?.email,
        },
      });

      if (error) {
        console.log("Error occured");
        throw error;
      }

      setIsPaymentSheetReady(true);
    } catch (error) {
      console.error("Error initializing PaymentSheet:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to initialize payment. Please try again.",
      });
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await presentPaymentSheet();
      
      if (error) {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: error.message || "Please try again",
        });
        return;
      }

      await createBooking();
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your booking has been confirmed!",
      });

      router.replace("/");
    } catch (error) {
      console.error("Error during checkout:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to complete booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={publishableKey || ""}
      merchantIdentifier="merchant.identifier"
      urlScheme="your-url-scheme"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="relative">
          <TouchableOpacity
            className="absolute top-12 left-4 z-10 bg-white rounded-full p-2 shadow"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View className="p-4 mt-20">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Book Your Stay
          </Text>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Check-in Date
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3"
              onPress={() => setShowCheckIn(true)}
            >
              <Text>{form.check_in_date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showCheckIn && (
              <DateTimePicker
                value={form.check_in_date}
                mode="date"
                onChange={(event, date) =>
                  handleDateChange(event, date, "check_in_date")
                }
              />
            )}
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Check-out Date
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3"
              onPress={() => setShowCheckOut(true)}
            >
              <Text>{form.check_out_date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showCheckOut && (
              <DateTimePicker
                value={form.check_out_date}
                mode="date"
                onChange={(event, date) =>
                  handleDateChange(event, date, "check_out_date")
                }
              />
            )}
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Number of Guests
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              keyboardType="numeric"
              value={form.number_of_guests}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, number_of_guests: value }))
              }
              placeholder="Enter number of guests"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Special Requests
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-32"
              multiline
              textAlignVertical="top"
              value={form.special_requests}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, special_requests: value }))
              }
              placeholder="Any special requests? (Optional)"
            />
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 mb-6 ${
              isSubmitting || !isPaymentSheetReady ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleCheckout}
            disabled={isSubmitting || !isPaymentSheetReady}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isSubmitting ? "Processing..." : "Checkout"}
            </Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </ScrollView>
    </StripeProvider>
  );
};

export default BookingPage;