# SmartFlash — AI-Powered Flashcard Generator

A full-stack web application that automatically generates flashcards from study notes using Natural Language Processing (NLP), with spaced repetition scheduling for effective memorization.

**Live Application:** [https://smart-flashcard-jade.vercel.app](https://smart-flashcard-jade.vercel.app)  
**Backend API:** [https://smart-flashcard.onrender.com](https://smart-flashcard.onrender.com)

---

## Option Chosen

**Smart Flashcard Generator** — Users paste their study notes, and the app automatically generates question/answer flashcard pairs using NLP. Cards are reviewed using a spaced repetition algorithm that schedules each card's next review based on how well the user knows it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (via Mongoose) |
| **AI / NLP** | [`compromise`](https://compromisenlp.com/) — lightweight JavaScript NLP library |
| **Authentication** | JWT stored in `httpOnly` cookies |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Render |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Flash_cards.git
cd Flash_cards
```

### 2. Set up the Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
JWT_SECRET=any_long_random_secret_string
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Install dependencies and start:
```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Set up the Frontend
```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Install dependencies and start:
```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## How the AI/ML Part Works

### NLP Flashcard Generation (`backend/src/services/nlp.js`)

The app uses **[compromise](https://compromisenlp.com/)**, a real NLP library that runs entirely in JavaScript with no external API calls.

**Step-by-step pipeline:**

1. **Sentence Segmentation** — `nlp(notes).sentences().out('array')` splits notes into sentences using linguistic rules (not just periods).

2. **Part-of-Speech Tagging** — `sDoc.nouns().out('array')` uses compromise's built-in POS tagger to identify noun phrases in each sentence. This is genuine linguistic analysis using a rule-based tagger trained on English grammar.

3. **Question Generation** — A random noun becomes the "answer". The sentence is transformed into a fill-in-the-blank question by replacing that noun with `______`. Word-boundary regex (`\b`) ensures precise replacement.

4. **Fallback** — If no valid cards can be generated, a general comprehension card is created.

**Example:**
```
Input:  "Mitochondria is the powerhouse of the cell."
Noun:    "Mitochondria"
Question: "______ is the powerhouse of the cell."
Answer:   "Mitochondria"
```

### Spaced Repetition (`backend/src/routes/flashcards.js`)

After each review, the `POST /flashcards/review` endpoint schedules the next review using **exponential backoff**:

- **Known** → `nextReviewDate = now + 2^consecutiveKnown days`
  (1st known = 2 days, 2nd = 4 days, 3rd = 8 days…)
- **Not Known** → `consecutiveKnown` resets to 0, card reappears in **1 minute**

The review page only shows cards where `nextReviewDate <= now`, so only due cards appear each session.

---

## Project Structure

```
Flash_cards/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── middleware/auth.js     # JWT cookie verification
│   │   ├── models/
│   │   │   ├── User.js            # User schema (email + bcrypt hash)
│   │   │   └── Flashcard.js       # Card schema (question, answer, SRS fields)
│   │   ├── routes/
│   │   │   ├── auth.js            # signup, login, logout, me
│   │   │   └── flashcards.js      # create, list, review, delete
│   │   ├── services/nlp.js        # NLP generation logic
│   │   └── index.js               # Express app + CORS config
│   ├── .env.example
│   └── Procfile                   # Render deployment config
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.js            # Login / Signup
    │   │   ├── dashboard/page.js  # View all cards
    │   │   ├── generate/page.js   # Generate cards from notes
    │   │   └── review/page.js     # Spaced repetition session
    │   └── components/
    │       ├── Navbar.js          # Auth-aware navigation
    │       └── AnimatedCard.js    # Fade-in card component
    └── .env.local.example
```

## Security

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plain text
- JWTs stored in **`httpOnly` cookies** — inaccessible to JavaScript, preventing XSS
- Cookies use `SameSite=none; Secure` for cross-origin Vercel ↔ Render support
- All flashcard routes protected by `auth` middleware — every request verified