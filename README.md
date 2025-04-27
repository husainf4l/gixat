# 🚗 GIXAT - AI Powered Garage Management System

GIXAT is a **mobile-first**, **WhatsApp-native**, **voice-enabled** garage management platform.  
It empowers car workshops to manage customers, cars, inspections, quotations, and jobcards seamlessly —  
built with **Next.js 15.3**, **PostgreSQL**, **Prisma ORM**, and **OpenAI AI assistance**.

---

## 📱 Mobile-First Design

- Designed for **mobile use first**, not desktop.
- Big buttons, touch-friendly screens.
- Chat-style session logs (similar to WhatsApp).
- Easy camera upload (inspection photos).
- Voice notes supported (speech-to-text automatic processing).
- Works perfectly from phone or tablet browsers.

---

## 🧠 AI Integration (Optional)

- AI rewrites voice notes and text notes into **professional service entries** automatically.
- Optional OpenAI Vision integration to **extract car info** from VIN or license plate photos.
- AI service suggestions (future optional module).

---

## 🛠️ Core Features

| Feature                    | Description                                                                           |
| :------------------------- | :------------------------------------------------------------------------------------ |
| Garage Management          | Each garage has branding, its own users, and its own OpenAI/QuickBooks keys           |
| User Login                 | JWT Authentication (Phone/Password)                                                   |
| Customer Management        | Create and manage customers (phone number required, other fields optional)            |
| Car Management             | Link multiple cars to customers                                                       |
| Session Management         | Full visit case file: inspections, photos, notes, quotations                          |
| Chat-like Session Timeline | Capture all activity (notes, photos, quotations, approvals) in a conversational style |
| Quotation System           | Generate quotation PDFs, send via WhatsApp                                            |
| Jobcard Management         | Start official work after customer approval                                           |
| WhatsApp Communication     | No emails — everything sent via WhatsApp                                              |
| Voice Note Support         | Staff can talk instead of type — GIXAT transcribes automatically                      |
| Pagination Everywhere      | Only latest 10 items loaded at once for fast performance                              |

---

## 🧩 Tech Stack

| Area           | Technology                                                     |
| :------------- | :------------------------------------------------------------- |
| Frontend       | Next.js 15.3 (App Router, TypeScript, TailwindCSS)             |
| Backend        | Prisma ORM + PostgreSQL                                        |
| AI             | OpenAI GPT-4o + Whisper API (optional)                         |
| Storage        | S3 (for photo uploads) or local storage                        |
| Authentication | JWT tokens + bcrypt password hashing                           |
| Communication  | WhatsApp Deep Linking / WhatsApp Business API (optional later) |

---

## 🗂 Folder Structure Overview

/ ├── app/ │ ├── login/ │ ├── dashboard/ │ ├── customers/ │ ├── cars/ │ ├── sessions/ │ ├── settings/ ├── components/ │ ├── BottomNav.tsx │ ├── SessionChat.tsx │ ├── VoiceRecorder.tsx ├── api/ │ ├── auth/ │ ├── customer/ │ ├── session/ │ ├── quotation/ ├── lib/ │ ├── prisma.ts │ ├── auth.ts │ ├── openai.ts │ ├── whatsapp.ts ├── prisma/ │ ├── schema.prisma ├── types/ │ ├── customer.ts │ ├── car.ts │ ├── session.ts │ ├── quotation.ts ├── public/ │ ├── uploads/ ├── README.md ├── .env ├── package.json ├── tailwind.config.ts ├── next.config.ts

yaml
Copy
Edit

---

## 🔑 Important Concepts

- **Minimal Data Entry**: Phone number mandatory, everything else optional.
- **Fast Session Creation**: Photos, notes, voice instantly saved.
- **Save Original + Cleaned Notes**: Original speech/text saved, AI-cleaned version shown.
- **Offline-first (optional future)**: PWA upgrade possible later.

---

## ⚡ Local Development Setup

```bash
git clone https://github.com/your-username/gixat.git
cd gixat
npm install
cp .env.example .env
# Add your PostgreSQL DATABASE_URL inside .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
