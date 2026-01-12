# Full-Stack Todo App (Expo, Apollo & PostgreSQL)

A mobile-responsive Todo application featuring a **GraphQL API** and persistent **PostgreSQL** storage.




<p align="center">
 <img width="200" height="800" alt="image" src="https://github.com/user-attachments/assets/c77cb71d-7f77-4857-87f4-28cf1d537b4b" />
 <img width="200" height="800" alt="image" src="https://github.com/user-attachments/assets/0b147e84-fb30-4cf5-816b-6472e32fc0ec" />
 <img width="200" height="800" alt="image" src="https://github.com/user-attachments/assets/198bc45e-c608-4fcc-9166-7074bd42d72b" />
 <img width="200" height="800" alt="image" src="https://github.com/user-attachments/assets/265a98ee-f4ad-4f60-81e0-83c8c4856be9" />
</p>


## 🛠️ Tech Stack
* **Frontend:** React Native with **Expo Go** and **Apollo Client**.
* **Backend:** **Apollo Server** (Node.js).
* **Database:** **PostgreSQL** for data persistence.
* **Navigation:** **Expo Router** for screen management.

---

## 🚀 Features
* **Add Tasks:** Save new todos directly to the PostgreSQL database via GraphQL mutations.
* **Toggle Status:** Update completion status ("Done" vs "Pending") with instant UI feedback.
* **Delete Tasks:** Remove entries from the database (Logic integrated across frontend and backend).
* **Real-time Synchronization:** Utilizes `useQuery` and `refetch` to keep the list updated across sessions.

---

## ⚙️ Setup and Installation

### 1. Database Configuration
1.  Ensure **PostgreSQL** is running on your machine.
2.  Create a database named `expo_todo`.
3.  The server connects via port `5433` using the credentials defined in your database pool.
4.  Run the following SQL to create your table:
    ```sql
    CREATE TABLE todos (
      id SERIAL PRIMARY KEY,
      task TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    );
    ```

### 2. Backend Setup (Apollo Server)
1.  Navigate to your server directory.
2.  Install dependencies: `npm install apollo-server pg graphql`.
3.  Start the server:
    ```bash
    node index.js
    ```
4.  The server will be ready at `http://localhost:4000/`.

### 3. Frontend Setup (Expo Go)
1.  Navigate to your mobile project directory.
2.  Install dependencies: `npm install @apollo/client graphql`.
3.  **Critical Step:** Update the `HttpLink` URI in `_layout.tsx` to match your computer's local IP address (currently set to `172.21.71.189`) so your mobile device can communicate with your local server.
4.  Start the app:
    ```bash
    npx expo start
    ```
5.  Open the **Expo Go** app on your phone and scan the QR code.

---

## 📂 Project Structure
* `index.js`: The backend server containing the GraphQL schema (TypeDefs) and PostgreSQL resolvers.
* `_layout.tsx`: Configures the Apollo Provider and establishes the network link to the API.
* `index.tsx`: The main application screen handling task input, the task list (FlatList), and mutation triggers.
