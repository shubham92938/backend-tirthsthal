# Tirthstal Backend

Express 5 + MongoDB (Mongoose 9) API for the Tirthstal website.
Frontend: https://tirthsthalweb.netlify.app

## Requirements
- Node.js 20 or newer (see `engines` in `package.json`)
- MongoDB — local, or MongoDB Atlas

## Local setup
```bash
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run dev              # or: npm start
```
The API listens on `PORT` (default **3000**) at `http://localhost:3000/api`.
Check it with `GET /api/health`.

Optional seeds (run after setting `MONGO_URI`):
```bash
npm run seed:temples     # temple directory
npm run seed:goseva      # gaushala listings
```

## Environment variables
| Variable | Required | Example | Notes |
|---|---|---|---|
| `MONGO_URI` | yes | `mongodb+srv://user:pass@cluster.mongodb.net/tirthstal` | Local or Atlas |
| `JWT_SECRET` | yes | 96-char hex string | Server refuses to start without it |
| `JWT_EXPIRE` | no | `7d` | Default `7d` |
| `PORT` | no | `3000` | Hosts inject this automatically |
| `NODE_ENV` | no | `production` | Hides 5xx error details; disables localhost CORS origins |
| `CLIENT_URL` | no | `https://tirthsthalweb.netlify.app` | Comma-separated CORS origins. Production Netlify site is always allowed |
| `FRONTEND_URL` | no | `https://tirthsthalweb.netlify.app` | Used for password-reset links. Falls back to first `CLIENT_URL` |
| `ALLOW_NETLIFY_PREVIEWS` | no | `false` | `true` also allows `https://<branch>--tirthsthalweb.netlify.app` |
| `DNS_OVERRIDE` | no | `false` | `true` forces DNS to 1.1.1.1 / 8.8.8.8 (only if Atlas SRV lookups fail) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | for email | Gmail SMTP + app password | Password reset and contact emails |
| `CONTACT_RECIPIENT` | no | `team@example.com` | Defaults to `EMAIL_USER` |

## MongoDB Atlas
Atlas blocks connections by default. Under **Network Access**, add the IP addresses your
host uses. For testing you can allow `0.0.0.0/0`; tighten this for production when your
host publishes fixed egress IPs. Without this the server exits at startup with
"MongoDB connection failed".

## Deployment (Render / Railway)
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`
- Set the environment variables above in the dashboard. Do not commit `.env`.

## Rate limits
Per IP: login 20 / 15 min, register 20 / hour, forgot-password 5 / hour. Responses are `429` with `{success:false, message}`.

## Response format
Success: `{ success: true, ... }`. Errors: `{ success: false, message: "..." }`
(validation errors also include `errors: [{ field, message }]`).
