import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

export default function CaloriesCountScreen({ route }: any) {
  const userId = route.params?.userId || '28uc1K8XMjWYMKatD8BjqiAYPM43'; 

  // DATE SELECTION LOGIC
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getFormattedDate = (dateObj: Date) => dateObj.toISOString().split('T')[0];
  const currentDateString = getFormattedDate(selectedDate);
  const isToday = currentDateString === new Date().toISOString().split('T')[0];

  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const [meals, setMeals] = useState<any[]>([]);
  const [consumed, setConsumed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    setLoading(true);
    const query = {
      query: `query GetDailyMeals($userId: ID!, $date: String!) { getDailyMeals(userId: $userId, date: $date) { id name calories time } }`,
      variables: { userId, date: currentDateString }
    };
    try {
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      const result = await response.json();
      if (result.data && result.data.getDailyMeals) {
        setMeals(result.data.getDailyMeals);
        const total = result.data.getDailyMeals.reduce((sum: number, meal: any) => sum + meal.calories, 0);
        setConsumed(total);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) { Alert.alert("Permission", "Camera access needed!"); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0].base64) scanAndSaveMeal(result.assets[0].base64);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) { Alert.alert("Permission", "Gallery access needed!"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0].base64) scanAndSaveMeal(result.assets[0].base64);
  };

  const scanAndSaveMeal = async (base64String: string) => {
    setScanning(true);
    const scanQuery = {
      query: `mutation ScanFoodImage($imageBase64: String!) { scanFoodImage(imageBase64: $imageBase64) { foodName estimatedCalories } }`,
      variables: { imageBase64: base64String }
    };

    try {
      const scanResponse = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scanQuery) });
      const scanResult = await scanResponse.json();
      
      if (scanResult.data && scanResult.data.scanFoodImage) {
        const { foodName, estimatedCalories } = scanResult.data.scanFoodImage;
        
        const saveQuery = {
          query: `mutation SaveMeal($userId: ID!, $name: String!, $calories: Int!, $date: String!) { saveMeal(userId: $userId, name: $name, calories: $calories, date: $date) { success } }`,
          variables: { userId, name: foodName, calories: estimatedCalories, date: currentDateString }
        };
        
        await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveQuery) });
        
        Alert.alert("AI Magic! 🤖", `Gemini ne ${foodName} (${estimatedCalories} kcal) detect karke log me add kar diya!`);
        fetchMeals(); 
      }
    } catch (error) {
      Alert.alert("AI Error", "Lagta hai API Key nahi hai ya network issue hai.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>🔥 Calorie Tracker</Text>
      
      {/* Date Selector UI */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateTextMain}>{isToday ? 'Today' : selectedDate.toDateString()}</Text>
          <Text style={styles.dateTextSub}>{currentDateString}</Text>
        </View>

        <TouchableOpacity onPress={() => changeDate(1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{isToday ? "Today's Summary" : "Day's Summary"}</Text>
        <View style={styles.consumedContainer}>
          <Text style={styles.consumedLabel}>Total Calories Eaten</Text>
          <Text style={styles.consumedValue}>{consumed} <Text style={styles.kcalText}>kcal</Text></Text>
        </View>
      </View>

      {/* 🟢 NAYA FIX: Agar aaj ka din hai tabhi Add button dikhega */}
      {isToday ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Food with AI 🤖</Text>
          <Text style={styles.subText}>Logging food for Today</Text>
          
          {scanning ? (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <ActivityIndicator size="large" color="#e91e63" />
              <Text style={{ marginTop: 10, color: '#e91e63', fontWeight: 'bold' }}>Gemini is analyzing food...</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.aiButton} onPress={takePhoto}>
                <Text style={styles.aiButtonText}>📸 Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.aiButton, { backgroundColor: '#208AEF' }]} onPress={pickImage}>
                <Text style={styles.aiButtonText}>🖼️ Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.lockedCard}>
          <Text style={styles.lockedText}>🔒 You cannot add meals to a past or future date. History is view-only!</Text>
        </View>
      )}

      {/* Logs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🍽️ Meals Log</Text>
        {loading ? (
          <ActivityIndicator color="#e91e63" />
        ) : meals.length === 0 ? (
          <Text style={styles.noData}>Is din koi khana add nahi kiya gaya tha.</Text>
        ) : (
          meals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealCal}>{meal.cal || meal.calories} kcal</Text>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fce4ec', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 40 },
  
  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 20, shadowColor: '#000', elevation: 3 },
  arrowButton: { paddingHorizontal: 20, paddingVertical: 10 },
  arrowText: { fontSize: 20, color: '#e91e63', fontWeight: 'bold' },
  dateTextContainer: { alignItems: 'center' },
  dateTextMain: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dateTextSub: { fontSize: 12, color: 'gray' },

  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  subText: { fontSize: 13, color: 'gray', marginBottom: 15, marginTop: 5 },
  
  consumedContainer: { alignItems: 'center', marginVertical: 15, padding: 20, backgroundColor: '#fdf0f4', borderRadius: 12, borderWidth: 1, borderColor: '#f8bbd0' },
  consumedLabel: { fontSize: 16, color: '#e91e63', fontWeight: 'bold', marginBottom: 5 },
  consumedValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  kcalText: { fontSize: 18, color: 'gray', fontWeight: 'normal' },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  aiButton: { flex: 1, backgroundColor: '#e91e63', padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  aiButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // 🟢 NAYA FIX: Locked Card Styles
  lockedCard: { backgroundColor: '#ffebee', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#ffcdd2', alignItems: 'center' },
  lockedText: { color: '#d32f2f', fontStyle: 'italic', textAlign: 'center', fontWeight: '500' },

  mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  mealName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  mealTime: { fontSize: 12, color: 'gray', marginTop: 2 },
  mealCal: { fontSize: 16, fontWeight: 'bold', color: '#e91e63' },
  noData: { textAlign: 'center', color: 'gray', marginVertical: 10 }
});