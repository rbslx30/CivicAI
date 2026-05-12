# CivicAI 🏛️🤖 - Next-Gen AI Governance Platform

> **Your Voice, AI-Powered Justice.** The next generation of public grievance redressal for a smarter, more inclusive democracy.

---

## 🚀 Overview

CivicAI is a production-grade, AI-driven grievance system designed to bridge the gap between citizens and government administration. By leveraging cutting-edge NLP and automated routing, it eliminates manual bottlenecks, language barriers, and lack of transparency in civic administration.

### 🔴 The Problem
Traditional public grievance systems are plagued by:
- **Manual Bottlenecks:** Complaints take days just to be sorted.
- **Language Barriers:** Non-English speakers are often excluded from digital governance.
- **Misrouting:** Complaints often reach the wrong department, causing dead-ends.
- **Opacity:** Citizens have no real-time insight into the resolution lifecycle.

### 🟢 The Solution
CivicAI transforms this workflow into an intelligent governance engine:
- **Multilingual Inclusion:** Native language support with real-time translation.
- **AI-Driven Routing:** Automated classification and department assignment.
- **Predictive Prioritization:** Urgency detection to escalate safety-critical issues.
- **Transparency:** End-to-end tracking with a futuristic audit timeline.

---

## 🧠 AI Workflow

1.  **Citizen Submission:** User files a grievance in any of the 20+ supported Indian languages (Voice/Text).
2.  **Language Detection:** AI identifies the input language using Unicode block analysis.
3.  **Real-time Translation:** The engine translates the grievance to English for administrative processing.
4.  **NLP Classification:** Deep analysis of the text to identify one of 20+ civic categories.
5.  **Priority & Urgency Detection:** Sentiment analysis and keyword matching to assign priority (Low to Critical).
6.  **Smart Department Routing:** Automatic mapping to the correct government department (PWD, Health, etc.).
7.  **Lifecycle Management:** Real-time status updates and predictive resolution estimates.

---

## 🏗️ Architecture

```text
[ Citizen UI ] <---> [ REST API Layer ] <---> [ MongoDB Atlas ]
                          |
                  [ AI Governance Engine ]
                 /        |         \
        [ NLP Pipeline ] [ Routing ] [ Predictors ]
```

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (Zero-dependency), HTML5, CSS3 (Advanced Grid/Flex).
- **Backend:** Node.js, Express.js (RESTful API).
- **Database:** MongoDB Atlas (NoSQL) with Performance Indexing.
- **AI Engine:** Custom NLP Classification & Google Translate API Integration.
- **Security:** Helmet.js, Express-Rate-Limit, Mongo-Sanitize, JWT Authentication.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/complaints` | Submit a new grievance (supports multi-part/voice) |
| `GET` | `/api/complaints/track` | Track grievance status via ID or Phone |
| `GET` | `/api/dashboard/stats` | (Admin) Get aggregate governance metrics |
| `GET` | `/api/dashboard/complaints` | (Admin) List all grievances with filters |
| `PUT` | `/api/dashboard/complaints/:id/status` | (Admin) Update status/department |
| `GET` | `/api/dashboard/export` | (Admin) Export governance report (CSV) |

---

## 📦 Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/CivicAI.git
    cd CivicAI
    ```

2.  **Configure Environment**
    Create a `.env` file in the root:
    ```env
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    PORT=5000
    FRONTEND_URL=http://localhost:5500
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Seed Demo Data (Optional)**
    ```bash
    node generateDemoData.js
    ```

5.  **Run the Server**
    ```bash
    npm start
    ```

---

## 🔮 Roadmap

- [ ] **WhatsApp Integration:** File and track grievances via a dedicated bot.
- [ ] **Smart City IoT:** Automatic detection of infrastructure failures (e.g., street lights).
- [ ] **Geospatial Heatmaps:** Deep visual analytics for district-wise risk assessment.
- [ ] **Executive Summaries:** Generative AI for automated governance reports.

---
*Developed for [Hackathon Name] 2026*

## 🚀 Key Features
- **Multilingual NLP**: Support for 20+ Indian regional languages with automatic translation.
- **AI Routing Engine**: Automatic classification, priority detection, and department assignment.
- **Voice Complaints**: Accessibility-first audio recording and processing.
- **Governance Dashboard**: Real-time analytics, lifecycle tracking, and heatmaps for administrators.
- **Smart Escalation**: Automatic "Urgent" flagging for public safety threats (fire, harassment).

## 🛠️ Tech Stack
- **Frontend**: Vanilla JS (Blazing fast), HTML5, CSS3 Variables.
- **Backend**: Node.js, Express.js, Helmet Security.
- **Database**: MongoDB Atlas (Cloud) with performance indexing.
- **AI Integration**: Custom NLP keyword mapping & Translation API middleware.

## 📦 Setup & Deployment

### 1. Environment Variables
Create a `.env` file in the root:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_secret
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Installation
```bash
npm install
npm start
```

## 📽️ Presentation Tips
1. **Demo Mode**: Use the toggle in the Admin Dashboard to show live AI routing simulations.
2. **Multilingual Demo**: Submit a complaint in Hindi or Marathi to showcase the real-time AI translation feature.
3. **Emergency Check**: Use words like "fire" or "accident" to demonstrate the auto-escalation system.

## 🛡️ Security & Scalability
- **Rate Limiting**: Protects against API spam.
- **NoSQL Injection Protection**: Via `mongo-sanitize`.
- **Compression**: Optimized for low-bandwidth rural mobile networks.

---
*Built for [Hackathon Name] 2026*