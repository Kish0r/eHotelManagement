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
import { FormData, ApiError } from "@/utility/types";
import { Link } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = width * 0.4; 

const RegistrationScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    user_type: "customer",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const userTypes = [
    { label: "Customer", value: "customer" },
    { label: "Staff", value: "staff" },
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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

  const handleRegistration = async (): Promise<void> => {
    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("success", "Registration successful!");
        // Add navigation logic here
        // navigation.navigate('Login');
      } else {
        const errorData = data as ApiError;

        if (errorData.errors) {
          const newFieldErrors: Record<string, string> = {};
          Object.entries(errorData.errors).forEach(([key, messages]) => {
            newFieldErrors[key] = messages[0];
          });
          setFieldErrors(newFieldErrors);
        }

        showToast("error", errorData.message || "Registration failed");
      }
    } catch (error) {
      showToast("error", "Network error. Please check your connection");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    field: keyof FormData,
    placeholder: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: "email-address" | "default";
    }
  ) => (
    <View className="mb-4">
      <TextInput
        className={`h-12 px-4 rounded-lg bg-white border ${
          fieldErrors[field] ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
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

  const renderUserTypeSelector = () => (
    <View className="mb-4">
      <View className="flex-row justify-between">
        {userTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            className={`flex-1 h-12 justify-center items-center rounded-lg mx-1 ${
              formData.user_type === type.value
                ? "bg-blue-500"
                : "bg-gray-200"
            }`}
            onPress={() =>
              setFormData({ ...formData, user_type: type.value as "staff" | "customer" })
            }
          >
            <Text
              className={`font-semibold ${
                formData.user_type === type.value
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center mt-8">
        <Image
          source={require('../../assets/images/registration-icon.png')} 
          className="w-32 h-32"
          resizeMode="contain"
        />
      </View>

      <View className="p-6">
        <Text className="text-3xl font-bold text-center mb-8">Register</Text>

        {renderUserTypeSelector()}
        {renderInput("name", "Name")}
        {renderInput("email", "Email", { keyboardType: "email-address" })}
        {renderInput("password", "Password", { secureTextEntry: true })}

        <TouchableOpacity
          className={`h-12 rounded-lg justify-center items-center mt-4 ${
            loading ? "bg-gray-400" : "bg-blue-500"
          }`}
          onPress={handleRegistration}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mt-4">
          <Link href = "/login" className="text-blue-500 text-center">
            Already have an account? Login
          </Link>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

export default RegistrationScreen;