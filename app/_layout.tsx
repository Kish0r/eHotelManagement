import { Stack } from "expo-router";
import "../global.css";
import { StripeProvider } from "@stripe/stripe-react-native";

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.error("Stripe publishable key is missing!");
}
export default function RootLayout() {
  return (
    <StripeProvider publishableKey={publishableKey || ""}>
      <Stack>
        <Stack.Screen 
          name="roomdetail/[id]"
          options={{ headerShown: false, title: "Room detail" }}
        />
        <Stack.Screen
          name="complaints/[user_id]"
          options={{ headerShown: true, title: "Booking and Complaints" }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{ headerShown: false, title: "Booking" }}
        />
        <Stack.Screen
          name="complaints/createcomplaints"
          options={{ headerShown: true, title: "Complaints" }}
        />
         <Stack.Screen
          name="staff"
          options={{ headerShown: true, title: "eHotelManager" }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{ headerShown: true, title: "Login" }}
        />
         <Stack.Screen
          name="(auth)/registration"
          options={{ headerShown: true, title: "Registration" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </StripeProvider>
  );
}
