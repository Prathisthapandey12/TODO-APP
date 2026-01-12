const { ApolloServer, gql, AuthenticationError } = require('apollo-server');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = 'my_super_secret_key'; 

const pool = new Pool({
  user: 'postgres', host: 'localhost', database: 'expo_todo',
  password: 'pandey@10', port: 5433,
});

const typeDefs = gql`
  type User { id: ID!, username: String! }
  type Todo { id: ID!, task: String!, completed: Boolean!, user: User! }
  type AuthPayload { token: String, user: User }

  type Query { getTodos(completed: Boolean): [Todo] }

  type Mutation { 
    authenticate(username: String!, password: String!): AuthPayload
    addTodo(task: String!): Todo  
    toggleTodo(id: ID!): Todo 
    deleteTodo(id: ID!): Todo
  }
`;

const resolvers = {
  Todo: {
    user: async (parent) => {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [parent.user_id]);
      return res.rows[0];
    }
  },
  Query: {
    getTodos: async (_, { completed }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      let query = 'SELECT * FROM todos WHERE user_id = $1';
      const params = [user.id];
      if (completed !== undefined) {
        query += ' AND completed = $2';
        params.push(completed);
      }
      const res = await pool.query(query, params);
      return res.rows;
    },
  },
  Mutation: {
    authenticate: async (_, { username, password }) => {
      const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      let user = res.rows[0];

      if (user) {
        // Login Logic
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Incorrect password');
      } else {
        // Register Logic
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
          'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
          [username, hashedPassword]
        );
        user = newUser.rows[0];
      }
      const token = jwt.sign({ id: user.id }, SECRET);
      return { token, user };
    },
    addTodo: async (_, { task }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      const res = await pool.query('INSERT INTO todos (task, user_id) VALUES ($1, $2) RETURNING *', [task, user.id]);
      return res.rows[0];
    },
    toggleTodo: async (_, { id }, { user }) => {
      const res = await pool.query('UPDATE todos SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *', [id, user.id]);
      return res.rows[0];
    },
    deleteTodo: async (_, { id }, { user }) => {
      const res = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *', [id, user.id]);
      return res.rows[0];
    }
  },
};

const server = new ApolloServer({ 
  typeDefs, resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try { return { user: jwt.verify(token.replace('Bearer ', ''), SECRET) }; }
      catch (e) { return {}; }
    }
    return {};
  }
});

server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`));