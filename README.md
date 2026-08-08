# Wanderlust

[Live demo → Wanderlust on Render](https://wanderlust-4-fhwt.onrender.com/)

Wanderlust is a full-stack travel listings application that helps users discover, share, and review memorable places around the world. Built with real-world production concerns in mind (user authentication, file uploads, persistent sessions, and a cloud-hosted database), Wanderlust demonstrates practical experience designing, implementing, and deploying a modern web application.

Why this project stands out
- Clean, user-first UI with server-side rendered views using EJS.
- Secure authentication using Passport and `passport-local-mongoose`.
- Image upload and storage via Cloudinary for fast, scalable media delivery.
- Persistent sessions backed by MongoDB (session store configured for production).
- Map integration with MapTiler to visualize listing locations.
- Configured and tested for cloud deployment (Render-compatible start/build commands).

Key features
- Browse listings: view curated travel listings with photos, details, and location.
- Create & manage listings: authenticated users can add, edit, and delete their listings.
- Reviews: users may leave reviews and ratings per listing.
- Authentication: secure signup/login with session management and flash messaging.
- Image handling: upload, store, and display listing images using Cloudinary.

Technology stack
- Node.js + Express
- EJS + `ejs-mate` for server-side templating
- MongoDB + Mongoose
- Passport.js (local) for authentication
- Cloudinary for image uploads
- Multer for multipart handling
- Deployed on Render

Quick setup (for reviewers)
1. Clone the repo:

```bash
git clone https://github.com/prathmeshpawa/wanderlust.git
cd wanderlust
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file with the following values (do not commit):

```
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
MAPTILER_API_KEY=your_maptile_key
CLOUD_NAME=your_cloudinary_cloud
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
```

4. Start the app locally:

```bash
npm start
# or
node app.js
```

Deployment notes
- Build command used on Render: `npm install --legacy-peer-deps`
- Start command used on Render: `npm start` (or `node app.js`)
- Recommended env vars: `ATLASDB_URL`, `SECRET`, `MAPTILER_API_KEY`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`, `NPM_CONFIG_LEGACY_PEER_DEPS=true`.

Project structure (high-level)
- `app.js` — application entrypoint and middleware
- `controllers/` — route handlers and business logic
- `models/` — Mongoose schemas
- `views/` — EJS templates
- `public/` — static CSS & client JS

How to evaluate
- Visit the live demo: https://wanderlust-4-fhwt.onrender.com/
- Try signing up and creating a listing to see authentication, image upload, and session handling in action.

Contact & next steps
- GitHub: https://github.com/prathmeshpawa/wanderlust
- If you'd like, I can add a short deployment walkthrough (Render screenshots), CI config, or a short demo video to include here.

---
_Built with a focus on production readiness: secure auth, cloud media storage, and deployable configuration._
# wanderlust