# 🚀 Deployment Guide: CivicAI

## 1. 🗄️ Database Setup (MongoDB Atlas)
1. Create a new Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database named `civicai`.
3. Create a DB User with read/write access.
4. Whitelist `0.0.0.0/0` (for hackathon demo) in Network Access.
5. Copy the connection string.

## 2. 🌐 Backend Deployment (Render/Railway)
1. Connect your GitHub repository.
2. Set the Build Command: `npm install`
3. Set the Start Command: `node server.js`
4. Configure Environment Variables:
   - `MONGO_URI`: (Your Atlas connection string)
   - `JWT_SECRET`: (Any secure string)
   - `PORT`: 5000
   - `NODE_OPTIONS`: --dns-result-order=ipv4first
   - `NODE_ENV`: production
   - `FRONTEND_URL`: (Your Netlify/Vercel URL)

## 3. 🎨 Frontend Deployment (Vercel/Netlify)
1. Connect the repository.
2. Ensure `API_BASE_URL` in `script.js`, `dashboard.js`, and `track.js` points to your deployed backend URL.
3. Deploy!

## 🧪 Final Checklist
- [ ] Ensure CORS is configured correctly in `server.js` for your frontend domain.
- [ ] Test the `/api/health` endpoint to verify DB connectivity.
- [ ] Run the `generateDemoData.js` script to populate the live dashboard.
- [ ] Verify that Google Translate UI is successfully hidden via the custom CSS in `translations.js`.

---
*Production Note: For real-world use, ensure JWT expiration is set and `MONGO_URI` is restricted to specific IP ranges.*