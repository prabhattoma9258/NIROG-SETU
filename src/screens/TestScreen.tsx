import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.29.201:5000/graphql';

export default function TestScreen({ route }: any) {
  const userId = route.params?.userId || '28uc1K8XMjWYMKatD8BjqiAYPM43'; 

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [sugar, setSugar] = useState('');
  
  const [preventionTarget, setPreventionTarget] = useState('');
  const [userDiseases, setUserDiseases] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchingGraph, setFetchingGraph] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>(null);

  const screenWidth = Dimensions.get("window").width;

  // 1. Screen khulte hi sirf user ki bimariyan laao
  useEffect(() => {
    fetchUserDiseases();
  }, []);

  // 2. Jab bimari (Tab) change ho, tab backend ko bol kar sirf uska data mangwao
  useEffect(() => {
    if (preventionTarget) {
      fetchVitalsForTarget(preventionTarget);
    }
  }, [preventionTarget]);

  const fetchUserDiseases = async () => {
    setLoading(true);
    const query = {
      query: `query GetUser($userId: ID!) { getUser(id: $userId) { diseases } }`,
      variables: { userId }
    };
    try {
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      const result = await response.json();
      if (result.data?.getUser?.diseases?.length > 0) {
        setUserDiseases(result.data.getUser.diseases);
        setPreventionTarget(result.data.getUser.diseases[0]); // Set first disease as active
      } else {
        setUserDiseases(['General Health']);
        setPreventionTarget('General Health');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NAYA FIX: Frontend sirf us bimari ka naam bhej raha hai, baaki backend khud karega
  const fetchVitalsForTarget = async (target: string) => {
    setFetchingGraph(true);
    const query = {
      query: `
        query GetWeeklyVitals($userId: ID!, $target: String!) {
          getWeeklyVitals(userId: $userId, target: $target) {
            systolic
            diastolic
            sugar
            preventionTarget
            date
          }
        }
      `,
      variables: { userId, target }
    };
    try {
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      const result = await response.json();
      
      if (result.data?.getWeeklyVitals) {
        const records = result.data.getWeeklyVitals;
        setHistoryLogs([...records].reverse());

        if (records.length > 0) {
          const labels = records.map((r: any) => r.date.substring(5));
          const datasets = [];
          const legend = [];

          const isDiabetes = target.toLowerCase().includes('diab');
          const isBP = target.toLowerCase().includes('blood') || target.toLowerCase().includes('hyper') || target.toLowerCase().includes('heart');

          if (isBP || (!isBP && !isDiabetes)) {
            datasets.push({ data: records.map((r: any) => r.systolic || 0), color: () => `rgba(220, 53, 69, 1)`, strokeWidth: 2 });
            legend.push("BP (Systolic)");
          }
          if (isDiabetes || (!isBP && !isDiabetes)) {
            datasets.push({ data: records.map((r: any) => r.sugar || 0), color: () => `rgba(32, 138, 239, 1)`, strokeWidth: 2 });
            legend.push("Blood Sugar");
          }
          setGraphData({ labels, datasets, legend });
        } else {
          setGraphData(null);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setFetchingGraph(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const query = {
      query: `
        mutation SaveVitals($userId: ID!, $systolic: Float!, $diastolic: Float!, $sugar: Float!, $preventionTarget: String!) {
          saveVitals(userId: $userId, systolic: $systolic, diastolic: $diastolic, sugar: $sugar, preventionTarget: $preventionTarget) { success }
        }
      `,
      variables: { 
        userId, 
        systolic: systolic ? parseFloat(systolic) : 0, 
        diastolic: diastolic ? parseFloat(diastolic) : 0, 
        sugar: sugar ? parseFloat(sugar) : 0, 
        preventionTarget 
      }
    };
    try {
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      const result = await response.json();
      if (result.data?.saveVitals?.success) {
        Alert.alert("Success! 🎉", `${preventionTarget} data saved securely.`);
        setSystolic(''); setDiastolic(''); setSugar('');
        fetchVitalsForTarget(preventionTarget); 
      }
    } catch (error) {
      Alert.alert("Error", "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const isDiabetesActive = preventionTarget.toLowerCase().includes('diab');
  const isBPActive = preventionTarget.toLowerCase().includes('blood') || preventionTarget.toLowerCase().includes('hyper') || preventionTarget.toLowerCase().includes('heart');
  const showBoth = !isDiabetesActive && !isBPActive; 

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#208AEF" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>📊 My Health Records</Text>
      
      {/* Target Selector Tabs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Health Target</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {userDiseases.map((disease, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.chip, preventionTarget === disease && styles.activeChip]}
              onPress={() => setPreventionTarget(disease)}
            >
              <Text style={[styles.chipText, preventionTarget === disease && styles.activeChipText]}>{disease}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Dynamic Graph */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{preventionTarget} Progress</Text>
        {fetchingGraph ? (
          <ActivityIndicator size="large" color="#208AEF" style={{ marginVertical: 30 }} />
        ) : graphData ? (
          <LineChart
            data={graphData} width={screenWidth - 60} height={220}
            chartConfig={{
              backgroundColor: "#fff", backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
              decimalPlaces: 0, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 }, propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
            }}
            bezier style={styles.graphStyle}
          />
        ) : (
          <Text style={{ textAlign: 'center', color: 'gray', marginVertical: 30 }}>No data for {preventionTarget} yet.</Text>
        )}
      </View>

      {/* Input Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Log {preventionTarget} Vitals</Text>
        {(isBPActive || showBoth) && (
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BP (Systolic)</Text>
              <TextInput style={styles.input} placeholder="120" keyboardType="numeric" value={systolic} onChangeText={setSystolic} />
            </View>
            <Text style={styles.slash}>/</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BP (Diastolic)</Text>
              <TextInput style={styles.input} placeholder="80" keyboardType="numeric" value={diastolic} onChangeText={setDiastolic} />
            </View>
          </View>
        )}
        {(isDiabetesActive || showBoth) && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fasting Blood Sugar (mg/dL)</Text>
            <TextInput style={styles.input} placeholder="95" keyboardType="numeric" value={sugar} onChangeText={setSugar} />
          </View>
        )}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Record</Text>}
        </TouchableOpacity>
      </View>

      {/* Filtered History Logs */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🕒 {preventionTarget} History</Text>
        {fetchingGraph ? (
          <ActivityIndicator color="#208AEF" />
        ) : historyLogs.length === 0 ? (
          <Text style={{ textAlign: 'center', color: 'gray' }}>No history found.</Text>
        ) : (
          historyLogs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.logTarget}>{log.preventionTarget}</Text>
              </View>
              <View style={styles.logDetails}>
                {(isBPActive || showBoth) && log.systolic > 0 && (
                  <Text style={styles.logText}>🩸 BP: <Text style={styles.boldText}>{log.systolic}/{log.diastolic}</Text></Text>
                )}
                {(isDiabetesActive || showBoth) && log.sugar > 0 && (
                  <Text style={styles.logText}>🍬 Sugar: <Text style={styles.boldText}>{log.sugar} mg/dL</Text></Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 15 },
  chipContainer: { flexDirection: 'row', paddingBottom: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  activeChip: { backgroundColor: '#208AEF' },
  chipText: { color: '#555', fontWeight: '500' },
  activeChipText: { color: '#fff' },
  graphStyle: { marginVertical: 8, borderRadius: 16, alignSelf: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  inputGroup: { flex: 1, marginBottom: 10 },
  label: { fontSize: 12, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fafafa' },
  slash: { fontSize: 24, color: '#888', marginHorizontal: 10, marginTop: 15 },
  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logItem: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  logDate: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  logTarget: { fontSize: 12, color: '#208AEF', backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  logDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  logText: { fontSize: 14, color: '#555' },
  boldText: { fontWeight: 'bold', color: '#111' }
});