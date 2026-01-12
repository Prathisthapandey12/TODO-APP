import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { gql} from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { setAuthToken } from '../_layout';

// 1. GraphQL Operations
const AUTHENTICATE = gql`
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
      token
      user { username }
    }
  }
`;

const GET_TODOS = gql`
  query GetTodos($completed: Boolean) {
    getTodos(completed: $completed) {
      id task completed
      user { username }
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!) {
    addTodo(task: $task) { id task completed user { username } }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) { id completed }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) { id }
  }
`;

// 2. TypeScript Interfaces (The Fix for 'unknown' errors)
interface Todo {
  id: string; task: string; completed: boolean;
  user: { username: string };
}
interface GetTodosData { getTodos: Todo[]; }
interface AuthData {
  authenticate: { token: string; user: { username: string }; };
}

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  const [taskText, setTaskText] = useState('');

  // Hooks with Generics
  const { loading, error, data, refetch } = useQuery<GetTodosData>(GET_TODOS, {
    variables: { completed: filter },
    skip: !isLoggedIn
  });

  const [authenticate, { loading: authLoading }] = useMutation<AuthData>(AUTHENTICATE, {
    onCompleted: (data) => {
      if (data?.authenticate?.token) {
        setAuthToken(data.authenticate.token);
        setIsLoggedIn(true);
      }
    },
    onError: (err) => Alert.alert("Auth Error", err.message)
  });

  const [addTodo] = useMutation(ADD_TODO, { onCompleted: () => { setTaskText(''); refetch(); } });
  const [toggleTodo] = useMutation(TOGGLE_TODO, { onCompleted: () => refetch() });
  const [deleteTodo] = useMutation(DELETE_TODO, { onCompleted: () => refetch() });

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Text style={styles.header}>Todo Login / Register</Text>
        <TextInput style={styles.input1} placeholder="Username" onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input1} placeholder="Password" secureTextEntry onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={() => authenticate({ variables: { username, password } })}>
          {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>
        <Text style={styles.hint}>First time? We'll create an account for you.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}> My Todos </Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="New Task..." value={taskText} onChangeText={setTaskText} />
        <TouchableOpacity style={styles.button} onPress={() => addTodo({ variables: { task: taskText } })}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter(undefined)}><Text style={filter === undefined && styles.bold}>All</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter(true)}><Text style={filter === true && styles.bold}>Done</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter(false)}><Text style={filter === false && styles.bold}>Pending</Text></TouchableOpacity>
      </View>

      <FlatList
        data={data?.getTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}> 
            <View>
              <Text style={[styles.taskText, item.completed && { textDecorationLine: 'line-through' }]}>{item.task}</Text>
              <Text style={styles.userTag}>Owner: {item.user.username}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => toggleTodo({ variables: { id: item.id } })} style={[styles.deleteButton, { backgroundColor: '#34c759' }]}>
                <Text style={styles.deleteText}>{item.completed ? "Undo" : "Done"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTodo({ variables: { id: item.id } })} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginRight: 10 },
  input1: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskText: { fontSize: 16 },
  userTag: { fontSize: 10, color: 'gray' },
  deleteButton: { marginLeft: 10, backgroundColor: '#ff3b30', padding: 8, borderRadius: 5 },
  deleteText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#eee', marginBottom: 10 },
  bold: { fontWeight: 'bold', color: '#007AFF' },
  hint: { marginTop: 15, color: '#666', fontSize: 12 }
});