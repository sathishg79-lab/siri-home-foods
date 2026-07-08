# 🍲 Siri Home Foods — Web Application

A dynamic food catalog and order-taking website for Siri Home Foods, built with **React + Vite**.

---

## ✅ Prerequisites

Before setting up this project, make sure the following software is installed on the server/machine:

| Software | Version | Download Link |
|---|---|---|
| **Node.js** | v18 or above | <https://nodejs.org/> |
| **npm** | v9 or above (comes with Node.js) | Included with Node.js |
| **Git** (optional) | Any | <https://git-scm.com/> |

To verify installations, run:

```bash
node --version
npm --version
```

---

## 🚀 Setup Steps

### Step 1: Copy the Project

Copy the `siri-home-foods` folder to your new server/machine.

If using Git:

```bash
git clone <your-repository-url>
cd siri-home-foods
```

Or simply copy the folder manually via USB / file transfer.

---

### Step 2: Install Dependencies

Open a terminal inside the `siri-home-foods` folder and run:

```bash
npm install
```

This will download all required packages (`react`, `react-router-dom`, `lucide-react`, etc.) listed in `package.json`. This only needs to be done **once** after a fresh copy.

---

### Step 3: Run the Project

#### 🔧 For Development (local testing)

```bash
npm run dev
```

Open your browser and go to: **<http://localhost:5173/>**

#### 🏗️ For Production Build

```bash
npm run build
```

This creates a `dist/` folder with all the optimized static files.

#### 🌐 To Preview the Production Build Locally

```bash
npm run preview
```

---

## 🔐 Admin Dashboard

The Admin Dashboard is accessible only via a direct URL — it is **NOT** linked from the public website.

- **URL:** `http://localhost:5173/admin`  
- **Default Password:** `siri123`

> **Important:** Change the admin password before deploying to a public server.  
> The password is set in `src/pages/AdminDashboard.jsx` — search for `siri123` and change it.

---

## 🌍 Deploying to a Live Server

### Option A: Static Hosting (Recommended — Free)

1. Run `npm run build`
2. Upload the contents of the `dist/` folder to any static hosting service:
   - **Netlify** → <https://netlify.com> (drag & drop the `dist` folder)
   - **Vercel** → <https://vercel.com>
   - **GitHub Pages** → Free with GitHub account

### Option B: VPS / Dedicated Server

1. Run `npm run build` to generate the `dist/` folder.
2. Install a web server like **Nginx** or **Apache**.
3. Point the web server's root to the `dist/` folder.

Example Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/siri-home-foods/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📁 Project Structure

```
siri-home-foods/
├── public/
│   └── images/          # Product images go here
├── src/
│   ├── context/
│   │   └── StoreContext.jsx   # Global state (products, cart, inventory)
│   ├── pages/
│   │   ├── Shop.jsx           # Public storefront
│   │   └── AdminDashboard.jsx # Admin panel (password protected)
│   ├── components/
│   │   └── ProductCard.jsx    # Product card with hover effects
│   ├── App.jsx                # Routing setup
│   ├── index.css              # All styles
│   └── main.jsx               # Entry point
├── package.json               # Project dependencies
└── vite.config.js             # Build configuration
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `react-dom` | DOM rendering |
| `react-router-dom` | Page routing (`/` shop, `/admin` dashboard) |
| `lucide-react` | Icons |
| `vite` | Build tool and dev server |
