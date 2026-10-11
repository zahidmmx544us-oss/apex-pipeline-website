# DevSphere - Full-Stack Blog Platform (Node.js + Express + MongoDB)

Welcome to your full-stack Blog application! This project provides a complete backend built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, coupled with a responsive, modern frontend UI (Visuals).

---

## 📁 Project Structure

```text
d:\MyWebsite\
├── config\
│   └── db.js              # Database connection logic (Mongoose + automatic fallback)
├── controllers\
│   └── postController.js  # CRUD operations (Get, Create, Update, Delete, Likes, Comments)
├── models\
│   └── Post.js            # Mongoose Schema & Data Model
├── routes\
│   └── postRoutes.js      # Express REST API Routes
├── public\
│   ├── index.html         # Visual Blog Interface & API Tester
│   ├── style.css          # Modern styling, dark/light themes & glassmorphism
│   └── app.js             # Client-side JavaScript fetching data from REST APIs
├── .env                   # Configuration (PORT, MONGODB_URI)
├── package.json           # Node.js dependencies & scripts
├── server.js              # Main backend server entry point
└── README.md              # Documentation & Guide
```

---

## 🚀 How to Run the Application

### 1. Start the Server
Open your terminal inside `d:\MyWebsite` and run:
```powershell
node server.js
```
or
```powershell
npm start
```

### 2. View in Your Browser
- **Visual Blog UI**: Open [http://localhost:5000](http://localhost:5000)
- **REST API Endpoint**: Open [http://localhost:5000/api/posts](http://localhost:5000/api/posts)
- **Server Health Check**: Open [http://localhost:5000/api/status](http://localhost:5000/api/status)

---

## 🗄️ MongoDB Setup (Local or Cloud Atlas)

Your backend has **Dual-Engine Support**:
1. **With MongoDB running**: When MongoDB is connected, all posts, likes, and comments are stored directly in your MongoDB database.
2. **Without MongoDB running (Fallback Mode)**: The server automatically falls back to an in-memory database so you can test, write blogs, and inspect APIs immediately without any crash.

### To Connect to MongoDB Atlas (Free Cloud Database):
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Copy your connection string.
3. Open `d:\MyWebsite\.env` and paste your URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blogdb?retryWrites=true&w=majority
```
4. Restart the server (`node server.js`).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/posts` | Get all blog articles (supports `?search=` and `?category=`) |
| **GET** | `/api/posts/:id` | Get single article by ID |
| **POST** | `/api/posts` | Create a new blog post |
| **PUT** | `/api/posts/:id` | Update an existing post |
| **DELETE** | `/api/posts/:id` | Delete an article |
| **POST** | `/api/posts/:id/like` | Increment like count |
| **POST** | `/api/posts/:id/comments` | Add comment to an article |
| **GET** | `/api/status` | Live server telemetry & DB status |
