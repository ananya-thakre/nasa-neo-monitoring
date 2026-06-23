# 🚀 NASA Asteroid Monitoring System ☄️

A real-time monitoring system that tracks Near-Earth Objects using NASA's NeoWs API and visualizes insights using Prometheus and Grafana.

---

## 🌟 Features

- ☄️ Real-time asteroid data from NASA API  
- 📊 KPI-based monitoring (count, hazard, speed, size)  
- 📈 Prometheus metrics integration  
- 📉 Grafana dashboard visualization  
- 🐳 Fully Dockerized setup  

---

## 🧠 Architecture

NASA API → Node.js Backend → Prometheus → Grafana

---

## 📊 KPIs

- Total Asteroids ☄️  
- Hazardous Asteroids ☠️  
- Closest Approach Distance 🌍  
- Fastest Asteroid 🚀  
- Size Distribution 📏  
- Speed Categories 📊  

---

## ⚙️ Tech Stack

- Node.js  
- Express.js  
- Prometheus  
- Grafana  
- Docker  
- NASA NeoWs API  

---
## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ananya-thakre/nasa-neo-monitoring.git
cd nasa-neo-monitoring
```
---

### 2️⃣ Install Dependencies
```bash
npm install
```


---

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root folder:

```env
API_KEY=your_nasa_api_key_here
```

---

### 4️⃣ Run the Backend Server

```bash
node index.js
```

Server runs at:  
http://localhost:4000  

Metrics endpoint:  
http://localhost:4000/metrics  

---

## 🐳 Running with Docker

### 5️⃣ Build Docker Image

```bash
docker build -t nasa-neo-monitor .
```

---

### 6️⃣ Run Docker Container

```bash
docker run -p 4000:4000 nasa-neo-monitor
```

---

## 📊 Prometheus Setup

### 7️⃣ Run Prometheus

```bash
docker run -d -p 9090:9090 \
  -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

Open:  
http://localhost:9090  

---

## 📈 Grafana Setup

### 8️⃣ Run Grafana

```bash
docker run -d -p 3000:3000 grafana/grafana
```

Open:  
http://localhost:3000  

Login:  
Username: admin  
Password: admin  

---

### 9️⃣ Add Prometheus Data Source

1. Go to **Settings → Data Sources**  
2. Click **Add data source**  
3. Select **Prometheus**  
4. Set URL:

```text
http://host.docker.internal:9090
```

5. Click **Save & Test**

---

## 📸 Dashboard Preview

![Grafana Dashboard](screenshots/dashboard.png)

---

## ⚠️ Notes

- The API shows asteroids within a **7-day window**
- Data updates periodically (not real-time every second)
- Free NASA API has **rate limits**

---

## 🎯 Use Cases

- 🚀 Space monitoring systems  
- 📊 Real-time dashboards  
- 📈 Data visualization projects  
- 🎓 Educational demos  

---

## 👩‍💻 Author

**Ananya Thakre**

---

## ⭐ Acknowledgment

Data provided by **NASA NeoWs API**
