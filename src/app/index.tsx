import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, useMutation, gql } from '@apollo/client';

// Backend ka URL setup
// Android emulator ke liye 10.0.2.2 use hota hai. Agar physical phone pe WiFi se test kar rahe ho, toh yahan apne PC ka IP address dalo (e.g., 'http://192.168.1.5:5000/graphql')
const client = new ApolloClient({
  uri: 'http://10.0.2.2:5000/graphql', 
  cache: new InMemoryCache()
});

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`;

function RegistrationScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [createUser, { data, loading }] = useMutation(CREATE_USER);

  const handleRegister = async () => {
    try {
      await createUser({
        variables: {
          input: { name, email, age: 25, gender: "Female" }
        }
      });
      Alert.alert("Success", "User Database me save ho gaya! 🔥");
    } catch (e) {
      Alert.alert("Error", "Kuch gadbad hui, terminal check karo.");
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preventive Healthcare</Text>
      <TextInput style={styles.input} placeholder="Naam" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <Button title={loading ? "Saving..." : "Register User"} onPress={handleRegister} />
      {data && <Text style={styles.success}>User ID: {data.createUser.id}</Text>}
    </View>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RegistrationScreen />
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, backgroundColor: '#fff' },
  success: { marginTop: 20, color: 'green', textAlign: 'center', fontWeight: 'bold' }
});