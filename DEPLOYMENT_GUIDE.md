# 🚀 Complete Cloud Deployment Guide: Aiven + Render + Vercel

Is guide ki madad se aap **Bikaner Express** ko 3 free cloud platforms par deploy kar sakte hain:
1. **Aiven** ➜ Managed Cloud MySQL Database (Zero Setup)
2. **Render** ➜ Spring Boot 3.2 Backend (Docker Web Service)
3. **Vercel** ➜ React Vite Frontend (Ultra-Fast Edge CDN)

---

## 🗄️ STEP 1: Aiven Par Cloud MySQL Database Banayein (2 Minutes)

1. **Sign Up / Login:**
   - Jayein [https://aiven.io](https://aiven.io) par aur Free Account banayein (Google login available).
2. **Create MySQL Service:**
   - Click karein **"Create Service"**.
   - Service Type choose karein: **MySQL**.
   - Cloud Provider: **AWS** ya **Google Cloud** (apni pasand ka region jaise *Mumbai* / *Frankfurt* select karein).
   - Plan: **Free** (ya Starter).
   - Service Name: `bikaner-mysql` likhein.
   - Click **"Create Service"**.
3. **Connection Details Copy Karein:**
   Service Dashboard par aapko yeh details milengi:
   - **Host:** e.g. `mysql-xxxxx.aivencloud.com`
   - **Port:** e.g. `15432`
   - **User:** `avnadmin`
   - **Password:** `AVNS_xxxxxxxxxxxx`
   - **Database:** `defaultdb`
4. **JDBC URL Format (Render ke liye tayyar karein):**
   ```
   jdbc:mysql://<HOST>:<PORT>/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   ```

---

## ☕ STEP 2: Render Par Spring Boot Backend Deploy Karein (3 Minutes)

1. **Render Par Jayein:**
   - [https://render.com](https://render.com) par jayein aur GitHub se Login karein.
2. **New Web Service Banayein:**
   - Dashboard me click karein **"New +"** ➜ **"Web Service"**.
   - Apni GitHub repository select karein:  
     `shakyasagar166/Restaurant-QR-Menu-And-Ordering-System`
3. **Service Settings:**
   - **Name:** `bikaner-express-backend`
   - **Region:** Jo Aiven ka region chuna tha (e.g. *Frankfurt* ya *Singapore*)
   - **Environment:** **Docker** (Render automatically `backend/Dockerfile` detect kar lega)
   - **Root Directory:** `backend` (ya blank agar root me build ho)
   - **Instance Type:** **Free**
4. **Environment Variables Add Karein:**
   Neeche **"Environment Variables"** section me click karein aur yeh 5 variables daalein:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8080` | Server Port |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&characterEncoding=UTF-8` | Aiven JDBC URL |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` | Aiven User |
   | `SPRING_DATASOURCE_PASSWORD` | `<AIVEN_PASSWORD>` | Aiven Password |
   | `GROQ_API_KEY` | `<YOUR_GROQ_API_KEY>` | Groq AI Key |

5. **Deploy Karein:**
   - Click karein **"Create Web Service"**.
   - Render automatically Docker image build karega aur Spring Boot run karega.
   - Jab log me `Started BikanerExpressApplication` likhkar aa jaye, aapko Render URL mil jayega, jaise:  
     👉 `https://bikaner-express-backend.onrender.com`

---

## ⚡ STEP 3: Vercel Par React Frontend Deploy Karein (2 Minutes)

1. **Vercel Par Jayein:**
   - [https://vercel.com](https://vercel.com) par jayein aur GitHub se Login karein.
2. **Import Repository:**
   - Click **"Add New..."** ➜ **"Project"**.
   - `shakyasagar166/Restaurant-QR-Menu-And-Ordering-System` repository ke aage **"Import"** dabayein.
3. **Configure Project Settings:**
   - **Root Directory:** Click "Edit" and select `frontend`.
   - **Framework Preset:** `Vite` (automatic).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variable Set Karein (Most Important):**
   - Click **"Environment Variables"**:
     - **Key:** `VITE_API_BASE_URL`
     - **Value:** `<YOUR_RENDER_BACKEND_URL>`  
       *(Example: `https://bikaner-express-backend.onrender.com`)*
5. **Deploy:**
   - Click **"Deploy"**!
   - 1 minute ke andar aapki royal restaurant website live ho jayegi (e.g. `https://restaurant-qr-menu-and-ordering-system.vercel.app`)!

---

## 🎯 Verification Checklist

- [ ] Vercel URL khol kar check karein: Dishes aur Category Cards load ho rahe hain.
- [ ] Koi bhi dish add karke neeche bada **"PLACE ORDER 🔔"** bar dekhein.
- [ ] Cart se order place karein ➜ Admin portal me live sound aur alert dekhein.
- [ ] **Ask Groq AI 🤖** kholkar Hindi ya Hinglish me dish ka rate poochein.
- [ ] Aiven MySQL console me jakar `SELECT * FROM customer_orders;` run karke live cloud data dekhein.
