import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { LoginData, AuthResponse } from "@/utility/types";
import { Link, router } from "expo-router";

const { width } = Dimensions.get("window");

const TOKEN_KEY = "auth_token";
const TOKEN_TYPE_KEY = "token_type";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const storeToken = async (token: string, tokenType: string, userType: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(TOKEN_TYPE_KEY, tokenType);
      await SecureStore.setItemAsync("user_type", userType);
      return true;
    } catch (error) {
      console.error("Error storing token:", error);
      return false;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showToast = (type: "success" | "error", text: string) => {
    Toast.show({
      type,
      position: "top",
      text1: type === "success" ? "Success" : "Error",
      text2: text,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
      props: {
        style: {
          width: width - 32,
          marginHorizontal: 16,
        },
      },
    });
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }).toString(),
      });

      const data: AuthResponse = await response.json();
      if (response.ok && data.access_token && data.user_type === "customer") {
        const stored = await storeToken(data.access_token, data.token_type, data.user_type);

        if (stored) {
          showToast("success", "Login successful!");
          router.replace("/");
        } else {
          showToast("error", "Failed to store credentials");
        }
      } else {
        showToast("error", "Invalid credentials");
      }

      if (response.ok && data.access_token && data.user_type === "staff") {
        const stored = await storeToken(data.access_token, data.token_type, data.user_type);

        if (stored) {
          showToast("success", "Login successful!");
          router.replace("/staff/home");
        } else {
          showToast("error", "Failed to store credentials");
        }
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    field: keyof LoginData,
    placeholder: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address";
    }
  ) => (
    <View className="mb-4">
      <Text className="text-gray-700 mb-2 font-medium ml-1">{placeholder}</Text>
      <TextInput
        className={`h-12 px-4 rounded-xl bg-gray-50 border ${fieldErrors[field] ? "border-red-500" : "border-gray-200"
          }`}
        placeholder={`Enter your ${placeholder.toLowerCase()}`}
        value={formData[field]}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          if (fieldErrors[field]) {
            setFieldErrors({ ...fieldErrors, [field]: "" });
          }
        }}
        autoCapitalize="none"
        {...options}
      />
      {fieldErrors[field] && (
        <Text className="text-red-500 text-sm mt-1 ml-1">
          {fieldErrors[field]}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="items-center mt-12">
        <Image
          source={require("../../assets/images/login-icon.png")}
          className="w-40 h-40"
          resizeMode="contain"
        />
      </View>

      <View className="p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-center text-gray-800">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Please sign in to continue
          </Text>
        </View>

        {renderInput("username", "Username")}
        {renderInput("password", "Password", { secureTextEntry: true })}
        <TouchableOpacity
          className={`h-12 rounded-xl justify-center items-center mb-4 ${loading ? "bg-gray-400" : "bg-blue-500"
            }`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mt-4">
          <Text className="text-gray-600 text-center">
            Don't have an account?{" "}
            <Link href="/(auth)/registration">
              <Text className="text-blue-500 font-medium">Register</Text>
            </Link>
          </Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

export default LoginScreen;
