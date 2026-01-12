import { ApolloClient, InMemoryCache, HttpLink} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';

let userToken = '';

const link = new HttpLink({
  uri: 'http://172.21.70.80:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: userToken ? `Bearer ${userToken}` : "",
    }
  }
});

// 1. Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
});

export const setAuthToken = (token: string) => { userToken = token; };

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'My Quick Todos' }} />
      </Stack>
    </ApolloProvider>
  );
}