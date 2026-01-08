const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');

// Connect to your local Postgres
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'expo_todo',
  password: 'pandey@10',
  port: 5433,
});

const typeDefs = gql`
  type Todo { id: ID!, task: String!, completed: Boolean! }
  type Query { getTodos: [Todo] }
  type Mutation { 
    addTodo(task: String!): Todo  
    toggleTodo(id: ID!): Todo 
  }

`;

const resolvers = {
  Query: {
    getTodos: async () => {
      const res = await pool.query('SELECT * FROM todos');
      return res.rows;
    },
  },
  Mutation: {
    addTodo: async (_, { task }) => {
      const res = await pool.query(
        'INSERT INTO todos (task) VALUES ($1) RETURNING *',
        [task]
      );
      return res.rows[0];
    },
    toggleTodo: async (_, { id }) => {
      const res = await pool.query(
        'UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *',
        [id]
      );
      return res.rows[0];
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`));