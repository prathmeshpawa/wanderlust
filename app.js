require("dotenv").config({ path: "./.env" });

console.log("MAP KEY:", process.env.MAPTILER_API_KEY);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ================= DB =================
const dbUrl = process.env.ATLASDB_URL;

// ================= APP CONFIG =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// ================= START SERVER AFTER DB =================
async function startServer() {
  try {
    await mongoose.connect(dbUrl);
    console.log("connected to DB ✅");

// ================= SESSION =================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("SESSION STORE ERROR ", err);
});

const sessionOptions = {
  store,
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

    // ================= PASSPORT =================
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // ================= GLOBAL LOCALS =================
    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
    });

    // ================= ROUTES =================
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // ================= 404 =================
    app.use((req, res, next) => {
      next(new ExpressError(404, "Page Not Found"));
    });

    // ================= ERROR HANDLER =================
    app.use((err, req, res, next) => {
      if (res.headersSent) {
        return next(err);
      }
      const { statusCode = 500, message = "Something went wrong!" } = err;
      res.status(statusCode).render("error", { message });
    });

    // ================= SERVER =================
    app.listen(8080, () => {
      console.log("server is listening to port 8080 🚀");
    });

  } catch (err) {
    console.log("DB CONNECTION ERROR ", err);
  }
}

startServer();