const express = require("express");
const axios = require("axios");
const client = require("prom-client");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 4000;

// 🔑 Replace with your REAL NASA API key
const API_KEY = process.env.API_KEY;

// ==========================
// Prometheus Setup
// ==========================
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ===== Custom Metrics =====
const neoCount = new client.Gauge({
  name: "neo_count_total",
  help: "Total near earth objects",
});

const hazardousCount = new client.Gauge({
  name: "neo_hazardous_count",
  help: "Potentially hazardous asteroids",
});

const nonHazardousCount = new client.Gauge({
  name: "neo_non_hazardous_count",
  help: "Non-hazardous asteroids",
});

const neoMaxSize = new client.Gauge({
  name: "neo_max_size_m",
  help: "Max asteroid size in meters",
});

const neoAvgSize = new client.Gauge({
  name: "neo_avg_size_m",
  help: "Average asteroid size in meters",
});

const neoClosest = new client.Gauge({
  name: "neo_closest_distance_km",
  help: "Closest asteroid distance in km",
});

const neoFastest = new client.Gauge({
  name: "neo_fastest_speed_kmh",
  help: "Fastest asteroid speed",
});

// 🎯 GROUPED METRICS
const neoSizeCategory = new client.Gauge({
  name: "neo_size_category",
  help: "Asteroids by size category",
  labelNames: ["type"],
});

const neoSpeedCategory = new client.Gauge({
  name: "neo_speed_category",
  help: "Asteroids by speed category",
  labelNames: ["type"],
});

// Register metrics
register.registerMetric(neoCount);
register.registerMetric(hazardousCount);
register.registerMetric(nonHazardousCount);
register.registerMetric(neoMaxSize);
register.registerMetric(neoAvgSize);
register.registerMetric(neoClosest);
register.registerMetric(neoFastest);
register.registerMetric(neoSizeCategory);
register.registerMetric(neoSpeedCategory);

// ==========================
// Fetch NASA NeoWs Data
// ==========================
async function fetchNeoData() {
  try {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 7);

    const format = (date) => date.toISOString().split("T")[0];

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${format(
      today
    )}&end_date=${format(end)}&api_key=${API_KEY}`;

    const response = await axios.get(url);

    const neoData = response.data.near_earth_objects;

    let allAsteroids = [];

    Object.keys(neoData).forEach((date) => {
      allAsteroids = allAsteroids.concat(neoData[date]);
    });

    console.log("☄️ Asteroids fetched:", allAsteroids.length);

    // Reset metrics
    neoCount.set(0);
    hazardousCount.set(0);
    nonHazardousCount.set(0);
    neoMaxSize.set(0);
    neoAvgSize.set(0);
    neoClosest.set(999999999);
    neoFastest.set(0);

    neoSizeCategory.reset();
    neoSpeedCategory.reset();

    let totalSize = 0;
    let sizeCount = 0;

    let maxSize = 0;
    let closest = Infinity;
    let fastest = 0;

    let hazardous = 0;
    let nonHazardous = 0;

    const sizeBuckets = { small: 0, medium: 0, large: 0 };
    const speedBuckets = { slow: 0, medium: 0, fast: 0 };

    allAsteroids.forEach((ast) => {
      const size =
        ast.estimated_diameter.meters.estimated_diameter_max || 0;

      const isHazard = ast.is_potentially_hazardous_asteroid;

      const approach = ast.close_approach_data[0];

      const distance = parseFloat(
        approach?.miss_distance.kilometers || 0
      );

      const speed = parseFloat(
        approach?.relative_velocity.kilometers_per_hour || 0
      );

      // Total count
      neoCount.inc();

      // Hazard count
      if (isHazard) {
        hazardous++;
      } else {
        nonHazardous++;
      }

      // Size tracking
      if (size > 0) {
        totalSize += size;
        sizeCount++;

        if (size > maxSize) maxSize = size;

        // Size buckets
        if (size < 50) sizeBuckets.small++;
        else if (size < 200) sizeBuckets.medium++;
        else sizeBuckets.large++;
      }

      // Distance
      if (distance > 0 && distance < closest) {
        closest = distance;
      }

      // Speed
      if (speed > fastest) fastest = speed;

      if (speed < 20000) speedBuckets.slow++;
      else if (speed < 50000) speedBuckets.medium++;
      else speedBuckets.fast++;
    });

    // Set values
    hazardousCount.set(hazardous);
    nonHazardousCount.set(nonHazardous);

    neoMaxSize.set(maxSize);
    neoClosest.set(closest);
    neoFastest.set(fastest);

    if (sizeCount > 0) {
      neoAvgSize.set(totalSize / sizeCount);
    }

    // Set grouped metrics
    Object.keys(sizeBuckets).forEach((key) => {
      neoSizeCategory.set({ type: key }, sizeBuckets[key]);
    });

    Object.keys(speedBuckets).forEach((key) => {
      neoSpeedCategory.set({ type: key }, speedBuckets[key]);
    });

    console.log("✅ Metrics updated successfully");
  } catch (error) {
    console.error("❌ Error fetching NASA data:", error.message);
  }
}

// Run every 1 min
setInterval(fetchNeoData, 60000);
fetchNeoData();

// ==========================
// Routes
// ==========================
app.get("/", (req, res) => {
  res.send("☄️ NASA NeoWs Monitoring Server Running");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
