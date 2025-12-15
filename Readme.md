# Backend for similar to youtube 
# 📽️ Video Streaming Platform – Backend API  
A fully-featured, production-ready backend for a video streaming platform (YouTube-like).  
Built using **Node.js**, **Express**, **MongoDB**, **JWT Authentication**, **Cloudinary**, and follows clean architecture & scalable design principles.

---

## 🚀 Features

### 🔐 Authentication & User Management
- Register user with avatar & cover image upload  
- Login using JWT (Access + Refresh token)  
- Protected routes using JWT middleware  
- Update profile, avatar, cover image  
- Change password  
- Logout, refresh tokens  
- Get current logged-in user  

---

### 🎞️ Video Management
- Publish a video (upload video + thumbnail to Cloudinary)  
- Get all videos with **cursor-based pagination**  
- Get video by ID + view count increment  
- Update video (title, description, thumbnail)  
- Delete video with **cascade delete**:
  - Likes  
  - Comments  
  - Watch history  
  - Playlist references  
- Toggle publish/unpublish  

---

### 📚 Playlist Management
- Create playlist  
- Update playlist  
- Delete playlist  
- Add video to playlist  
- Remove video from playlist  
- Get playlist by ID  
- Get all playlists of a user  

---

### ❤️ Like System
- Like/Unlike:
  - Video  
  - Comment  
  - Tweet (extendable)  
- Get all liked videos  
- Uses a single `Like` model with flexible references  

---

### 💬 Comments
- Add comment  
- Update comment  
- Delete comment  
- Get comments for a video using cursor pagination  
- Delete allowed for **comment owner + video owner**  

---

### 👥 Subscription System
- Subscribe / Unsubscribe to a channel  
- Get subscribers of a channel  
- Get channels subscribed by a user  
- Prevent duplicate subscriptions  
- Prevent self-subscription  

---

### 📊 Channel Analytics
- Total videos uploaded  
- Total views (sum of video views)  
- Total likes (across all videos)  
- Total subscribers  
- Get all videos uploaded by a channel  

---

### ☁️ Cloudinary Integration
- Upload videos  
- Upload images (avatar, thumbnail, cover image)  
- Delete uploaded files using Cloudinary `publicId`  
- Auto cleanup of local files  

---

### 🧪 Postman Testing
- All APIs tested with Postman  
- FormData used for file uploads  
- Bearer Token (JWT) for secured APIs  
- Proper error and success responses  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Storage | Cloudinary |
| Auth | JWT (Access + Refresh Tokens) |
| Upload | Multer |
| Security | HTTP-Only Cookies |
| Pagination | Cursor-based |
| Tools | Postman, Nodemon |


