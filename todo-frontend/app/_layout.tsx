import { ApolloClient, InMemoryCache, HttpLink} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';

const link = new HttpLink({
  uri: 'http://172.21.71.189:4000/graphql',
});

// 1. Initialize Apollo Client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'My Quick Todos' }} />
      </Stack>
    </ApolloProvider>
  );
}