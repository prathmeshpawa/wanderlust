require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL, { maxPoolSize: 10 });
    console.log("connected to DB ✅");
    
    // Delete existing listings
    await Listing.deleteMany({});
    console.log("cleared existing listings");
    
    // Map owner to each listing
    const listingsWithOwner = initData.data.map((obj) => ({
      ...obj, 
      owner: "696b69a0c92f4d9b1630bbbd"
    }));
    
    // Insert new listings
    await Listing.insertMany(listingsWithOwner);
    console.log(`✅ Successfully inserted ${listingsWithOwner.length} listings`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();