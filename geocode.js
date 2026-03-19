const axios = require("axios");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const { data: sampleListings } = require("./init/data.js");

const MAPTILER_KEY = process.env.MAPTILER_KEY;

// Connect to DB
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

const addGeometry = async () => {
  for (let listing of sampleListings) {
    try {
      const query = `${listing.location}, ${listing.country}`;

      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}`
      );

      const features = response.data.features;
      if (!features || features.length === 0) {
        console.log("❌ Not found:", query);
        continue;
      }

      const geometry = features[0].geometry;
      listing.geometry = geometry;

      // Convert coordinates to human-readable format
      const [lng, lat] = geometry.coordinates;
      const latDir = lat >= 0 ? "N" : "S";
      const lngDir = lng >= 0 ? "E" : "W";
      const latFormatted = Math.abs(lat).toFixed(2) + "° " + latDir;
      const lngFormatted = Math.abs(lng).toFixed(2) + "° " + lngDir;

      console.log(`✅ Geometry added for: ${query} → ${latFormatted}, ${lngFormatted}`);

      await new Promise(res => setTimeout(res, 200)); // delay to avoid rate limit

    } catch (err) {
      console.log("⚠️ Error:", listing.location, err.message);
    }
  }

  console.log("🎉 All listings updated!");
};

addGeometry();