# Deployment Guide

This project is a monorepo with two deployable apps:

| App | What it is | Default port | Needs |
|-----|------------|--------------|-------|
| `apps/backend` | Express REST API (`/api/...`) | 5022 | Node 18+, MongoDB (Atlas) |
| `apps/frontend` | Next.js website | 3022 | Node 18+, a reachable backend |

The browser only ever talks to the **frontend**. Next.js forwards every `/api/...` request to the backend
(`BACKEND_URL`), so login cookies stay on one site and the backend can stay private.

```
Browser  ->  https://yourdomain.com  (frontend, Next.js)  ->  /api/*  ->  backend (Express)  ->  MongoDB Atlas
```

Two routes are described below: **Route A**, one Linux server (full control, step by step), and
**Route B**, managed hosting (Render or Railway for the backend, Vercel for the frontend). Do **Part 1** and **Part 2**
first in both cases.

---

## Part 1: Before you deploy (do not skip)

### 1.1 Remove the hard-coded database password
`apps/backend/src/lib/mongodb.ts` still contains a fallback connection string with an Atlas username and password
(`DIRECT_REPLICA_SET_URI`). Anyone with the repository can read it.

1. In MongoDB Atlas go to **Database Access**, open that database user and **change its password** (or create a new
   user and delete the old one).
2. Delete the `DIRECT_REPLICA_SET_URI` constant and the fallback block that uses it, so the server connects only with
   `MONGODB_URI` from the environment.

### 1.2 Set a real JWT secret
`apps/backend/src/lib/auth.ts` falls back to a public default secret when `JWT_SECRET` is missing. Always set
`JWT_SECRET` in production. Generate one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 1.3 Plan a strong admin password
The seed script creates `admin@sportsportal.com`. Its default password (`admin123`) is public. You will set your own
when you seed (step 2.4 / A6).

### 1.4 Check the build works on your machine
```bash
npm install
npm run typecheck
npm run build
```
All three must pass before you deploy.

---

## Part 2: Database (MongoDB Atlas)

1. Create a free or paid **cluster** at https://cloud.mongodb.com.
2. **Database Access**: create a user (read and write on any database) with a strong password.
3. **Network Access**: add the IP address of the machine that runs the **backend**.
   Managed hosts without a fixed IP (Render, Railway) need `0.0.0.0/0`; use a strong password in that case.
4. **Connect, Drivers**: copy the connection string and put the database name in it:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/apexarena?retryWrites=true&w=majority`
   (URL-encode special characters in the password, for example `@` becomes `%40`).
5. Turn on **Backup** for the cluster (Atlas, Backup) if your plan allows it.

You will use this string as `MONGODB_URI`.

---

## Route A: One Linux server (Ubuntu 22.04 / 24.04)

Works on any VPS (DigitalOcean, AWS Lightsail or EC2, Hetzner, Azure VM...). You need a domain name pointing at the
server's IP (an `A` record for `yourdomain.com`).

### A1. Prepare the server
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git ufw
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v    # v20.x
```

Firewall: only SSH and web traffic are public. The backend port stays closed.
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### A2. Get the code
```bash
sudo mkdir -p /var/www && sudo chown $USER /var/www
cd /var/www
git clone <your-repository-url> club-portal
cd club-portal
npm install
```

### A3. Configure the backend
Create `/var/www/club-portal/apps/backend/.env`:
```ini
NODE_ENV=production
PORT=5022
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/apexarena?retryWrites=true&w=majority
JWT_SECRET=<the long random value from step 1.2>
CORS_ORIGIN=https://yourdomain.com
```
`NODE_ENV=production` matters: it makes the login cookie `Secure`, which needs HTTPS (set up in A8).

### A4. Configure the frontend
Create `/var/www/club-portal/apps/frontend/.env.production`:
```ini
BACKEND_URL=http://127.0.0.1:5022
```
Important: Next.js reads `BACKEND_URL` **when it builds**, not when it starts. If you change it later, rebuild.

### A5. Build
```bash
cd /var/www/club-portal
npm run build
```
This produces `apps/backend/dist/server.js` and `apps/frontend/.next`.

### A6. Create the first admin and the scoring rules
Run these once against the production database (they read `apps/backend/.env`):
```bash
cd /var/www/club-portal/apps/backend
ADMIN_PASSWORD="choose-a-strong-password" npm run seed:admin
npm run seed:scoring-rules
```
Do **not** run `seed:players`, `seed:matches` or `seed:roster` in production unless you want demo or roster data.
Add your clubs, sports and players from the admin screens (or import a roster CSV on the Players page).

### A7. Start both apps with PM2
```bash
cd /var/www/club-portal
pm2 start npm --name club-backend  --cwd apps/backend  -- run start
pm2 start npm --name club-frontend --cwd apps/frontend -- run start
pm2 save
pm2 startup        # run the command it prints, so the apps restart after a reboot
```
Check them:
```bash
pm2 status
curl http://127.0.0.1:5022/api/health      # backend
curl http://127.0.0.1:3022/api/health      # frontend forwarding to the backend
```
Both must return `{"success":true,"status":"ok",...}`.

### A8. Nginx and HTTPS
Create `/etc/nginx/sites-available/club-portal`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10m;          # roster CSV imports

    location / {
        proxy_pass http://127.0.0.1:3022;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable it and get a free certificate:
```bash
sudo ln -s /etc/nginx/sites-available/club-portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot edits the file for HTTPS and renews the certificate automatically.

### A9. Verify
1. Open `https://yourdomain.com`: the home page loads with the schedule and points table.
2. Open `https://yourdomain.com/login`, sign in as `admin@sportsportal.com` with the password from A6.
3. In the browser developer tools (Application, Cookies) the `auth_token` cookie should be marked **Secure** and **HttpOnly**.
4. Open Admin, Scoring Rules: the rules are listed.

### A10. Updating later
```bash
cd /var/www/club-portal
git pull
npm install
npm run build
pm2 restart club-backend club-frontend
```
Useful commands: `pm2 logs club-backend`, `pm2 logs club-frontend`, `pm2 monit`.

---

## Route B: Managed hosting (Render or Railway + Vercel)

### B1. Backend on Render (Railway is almost identical)
1. Push the repository to GitHub.
2. Render, **New, Web Service**, connect the repository.
3. Settings:
   - **Root Directory**: leave empty (the repository root)
   - **Build Command**: `npm install && npm run build -w @club-portal/backend`
   - **Start Command**: `npm run start -w @club-portal/backend`
   - **Health Check Path**: `/api/health`
4. Environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN=https://<your-vercel-domain>`.
   (Render sets `PORT` itself; the server reads it.)
5. In Atlas Network Access allow `0.0.0.0/0` (Render has no fixed IP on most plans).
6. After the first deploy, open `https://<your-service>.onrender.com/api/health`. It should answer `ok`.
   Free instances sleep when idle, so the first request after a pause is slow. Use a paid instance for a live event.

### B2. Frontend on Vercel
1. Vercel, **Add New, Project**, import the same repository.
2. Settings:
   - **Root Directory**: `apps/frontend`
   - Turn on **Include source files outside of the Root Directory in the Build Step** (the frontend uses `packages/shared`)
   - **Framework Preset**: Next.js (build and output settings stay default)
   - **Install Command**: `cd ../.. && npm install`
3. Environment variable: `BACKEND_URL=https://<your-service>.onrender.com` (no trailing slash).
   It must be set **before the build**, because Next.js bakes it in at build time. After changing it, redeploy.
4. Deploy, then add your custom domain under Domains (Vercel issues the HTTPS certificate).

### B3. Create the admin and rules
Run the two seed commands from your own computer against the production database. Put the production `MONGODB_URI`
in `apps/backend/.env` temporarily, then:
```bash
cd apps/backend
ADMIN_PASSWORD="choose-a-strong-password" npm run seed:admin
npm run seed:scoring-rules
```
Switch the file back to your development database afterwards.

### B4. Verify
Same checks as A9, using your Vercel domain.

---

## Environment variables at a glance

| Variable | App | Required | Meaning |
|----------|-----|----------|---------|
| `MONGODB_URI` | backend | yes | Atlas connection string |
| `JWT_SECRET` | backend | yes | Long random secret that signs login tokens |
| `NODE_ENV` | backend | yes | Set `production` (secure cookies) |
| `PORT` | backend | no | Defaults to 5022 |
| `CORS_ORIGIN` | backend | no | Frontend origin; only matters for direct browser calls to the API |
| `BACKEND_URL` | frontend | yes, **at build time** | Where Next.js forwards `/api/*` |

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---------|----------------------|
| Site loads but data is empty and `/api/health` returns 500 | `BACKEND_URL` was wrong when the frontend was built. Fix it and **rebuild**. |
| Login works locally but not in production | `NODE_ENV=production` sets a Secure cookie, so the site must be served over HTTPS. |
| Everyone is logged out after a restart | `JWT_SECRET` changed or is missing. Keep the same value. |
| `MongoServerSelectionError` or timeout | The backend's IP is not in Atlas Network Access, or the password in `MONGODB_URI` needs URL-encoding. |
| `EADDRINUSE` on start | Another process holds the port. Change `PORT` (and `BACKEND_URL`, then rebuild) or stop the other process. |
| `413` when importing a CSV | Raise `client_max_body_size` in Nginx. |

---

## Security checklist before going public

- [ ] Atlas password rotated and the hard-coded fallback removed (1.1)
- [ ] Strong `JWT_SECRET` set (1.2)
- [ ] Admin password changed from the default (A6 / B3)
- [ ] HTTPS on, `NODE_ENV=production` on the backend
- [ ] Backend port not exposed publicly (Route A) or reachable only through the frontend
- [ ] Atlas backups enabled; `.env` files are not in git (they are git-ignored)
