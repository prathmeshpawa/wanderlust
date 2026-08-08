const Listing = require("../models/listing");
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const mapToken = process.env.MAPTILER_API_KEY; 

// INDEX
module.exports.index = async (req, res, next) => {
  try {
    console.log('INDEX route - isAuthenticated:', req.isAuthenticated && req.isAuthenticated());
    console.log('INDEX route - req.user:', req.user && req.user._id);
    console.log('INDEX route - session passport:', req.session && req.session.passport);
    const allListings = await Listing.find({});
    console.log("Found listings:", allListings.length);
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    console.error("Listings controller error:", err);
    if (err.name === 'MongooseError' || err.message.includes('buffering')) {
      req.flash("error", "Database connection unavailable. Please try again later.");
      return res.render("listings/index.ejs", { allListings: [] });
    }
    next(err);
  }
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to create listing");
    return res.redirect("/login");
  }
  res.render("listings/new.ejs");
};

// SHOW LISTING
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" }
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing, mapToken });
  } catch (err) {
    if (err.name === 'MongooseError' || err.message.includes('buffering')) {
      req.flash("error", "Database connection unavailable. Please try again later.");
      return res.redirect("/listings");
    }
    next(err);
  }
};

// CREATE LISTING with automatic geometry
module.exports.createListing = async (req, res, next) => {
  try {
    const locationQuery = req.body.listing?.location?.trim();

    if (!locationQuery) {
      req.flash("error", "Location is required.");
      return res.redirect("/listings/new");
    }

    // Geocode the location using MapTiler
    const response = await maptilerClient.geocoding.forward(locationQuery, { limit: 1 });
    const feature = response?.features?.[0];

    // Ensure valid feature and geometry
    if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
      req.flash("error", `Could not find valid coordinates for "${locationQuery}".`);
      return res.redirect("/listings/new");
    }

    // Create new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Set image if uploaded
    if (req.file?.path && req.file?.filename) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Save geometry (must be GeoJSON Point)
    newListing.geometry = feature.geometry;

    // Optional: log coordinates in human-readable format
    const [lng, lat] = feature.geometry.coordinates;
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    const latFormatted = Math.abs(lat).toFixed(4) + "° " + latDir;
    const lngFormatted = Math.abs(lng).toFixed(4) + "° " + lngDir;

    console.log(`✅ Listing added: ${locationQuery} → ${latFormatted}, ${lngFormatted}`);

    // Save listing to DB
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    console.error("🚨 Error creating listing:", err);
    next(err);
  }
};

// EDIT FORM
module.exports.editListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

// UPDATE LISTING with automatic geometry update
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Update fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;

    // Update image if new file uploaded
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // ✅ Update geometry if location or country changed
    if (listing.location && listing.country) {
      const query = `${listing.location}, ${listing.country}`;
      const response = await maptilerClient.geocoding.forward(query, { limit: 1 });
      const feature = response?.features?.[0];

      if (feature) {
        listing.geometry = feature.geometry;
        console.log(`✅ Geometry updated for: ${query}`);
      } else {
        console.warn(`⚠️ Could not find coordinates for: ${query}`);
      }
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("🚨 Error updating listing:", err);
    next(err);
  }
};

// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};