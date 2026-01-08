import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

// 1. Define GraphQL Operations
const GET_TODOS = gql`
  query GetTodos {
    getTodos {
      id
      task
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!) {
    addTodo(task: $task) {
      id
      task
      completed
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      task
      completed
    }
  }
`;
const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      task
      completed
    }
  }
`;

export default function HomeScreen() {
  const [taskText, setTaskText] = useState('');

  const { loading, error, data, refetch } = useQuery<any>(GET_TODOS);

  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => {
      setTaskText('');
      refetch();
    }
  });

  const handleAdd = () => {
    if (!taskText.trim()) return;
    addTodo({ variables: { task: taskText } });
  };

  const [toggleTodo] = useMutation(TOGGLE_TODO, {
    onCompleted: () => refetch(),
  });

  const handleToggle = (id: string) => {
    toggleTodo({ variables: { id } });
  };

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onCompleted: () => {
      // refetch will also be called here, but call explicitly to be sure
      try { refetch(); } catch (e) { /* noop */ }
    },
    onError: (err) => console.error('Delete mutation error:', err),
  });

  const handleDelete = (id: string) => {
    console.log("Deleting todo with id:", id);
    deleteTodo({ variables: { id } });
  };


  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text>Error: {error.message}</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Todo List</Text>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Task..."
          value={taskText}
          onChangeText={setTaskText}
        />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* List Section */}

      <FlatList
        data={data?.getTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}> 
            <TouchableOpacity 
              style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }} 
              onPress={() => handleToggle(item.id)}
            >
              <Text style={[
                styles.taskText, 
                item.completed && { textDecorationLine: 'line-through', color: 'gray' }
              ]}>
                {item.task}
              </Text>
              <Text style={[styles.status, { color: item.completed ? 'green' : 'gray' }]}>
                {item.completed ? "Done" : "Pending"}
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity 
              onPress={() => handleDelete(item.id)} 
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginRight: 10 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  taskText: { fontSize: 16 },
  status: { fontSize: 12, fontWeight: 'bold' },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between' 
  },
  deleteButton: {
    marginLeft: 15,
    backgroundColor: '#ff3b30',
    padding: 8,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});