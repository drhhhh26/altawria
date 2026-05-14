# Altawria (التؤوريا) - AI Handover Document

This document provides context and an overview of the Altawria driving theory application to help another AI assistant or developer get up to speed quickly.

## Project Overview
Altawria is an Expo/React Native mobile application designed to help Arabic speakers prepare for their driving theory exams. 
The app supports right-to-left (RTL) layout natively and includes learning modules, practice exams, progress tracking, and an onboarding flow.

## Tech Stack
- **Framework:** React Native with [Expo](https://expo.dev/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language:** TypeScript
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Database:** `expo-sqlite` (Raw SQL queries are predominantly used over an ORM)
- **Styling:** React Native StyleSheet

## Key Architectural Concepts

### 1. Database (`db/database.ts`)
The application relies heavily on a local SQLite database (`altawria.db`) for storing questions, answers, user progress, settings, and exam session history.
- **Seeding:** The DB is seeded automatically on startup if it detects fewer than 1,800 questions. It reads from `assets/questions.json`.
- **Key Tables:** `questions`, `answers`, `question_classes` (for different license types), `user_progress`, `exam_sessions`, and `user_settings`.
- **Note:** Although `drizzle-orm` is in `package.json`, the data layer is currently implemented with raw SQL queries inside `database.ts`.

### 2. State Management (`store/settingsStore.ts`)
Global state for user preferences is managed via Zustand. It syncs with the SQLite `user_settings` table.
- **Variables Tracked:** `licenseClass`, `isPremium`, `onboardingDone`, and `loaded` state.
- **Bootstrapping:** At app launch, `app/_layout.tsx` initializes the DB and calls `loadSettings()`.

### 3. Navigation (`app/` directory)
Expo Router is used for navigation.
- **`app/_layout.tsx`:** The root layout. It forces RTL (`I18nManager.forceRTL(true)`), shows a loading indicator while bootstrapping the DB/settings, and protects routes by redirecting to the onboarding flow if `onboardingDone` is false.
- **`app/(tabs)/`:** Contains the main bottom tab screens (`index.tsx` for Home, `study.tsx`, `exam.tsx`, `progress.tsx`).
- **`app/onboarding/`:** Contains the welcome and license selection quiz screens.
- **`app/study/` & `app/exam/`:** Contain the session logic for studying and taking actual exams.
- **`app/results.tsx`:** Displays the results after an exam.

### 4. RTL Support
Since the app targets Arabic speakers, Right-to-Left alignment is crucial.
- `I18nManager.forceRTL(true)` is explicitly called at the top of the root layout.
- The app configuration in `app.json` includes `"expo-localization"`.

## Project Structure
```
altawria/
├── app/                  # Expo Router pages and layouts
│   ├── (tabs)/           # Main bottom tabs (Home, Study, Exam, Progress)
│   ├── exam/             # Exam session screens
│   ├── onboarding/       # Onboarding flow
│   ├── study/            # Study session screens
│   ├── _layout.tsx       # Root layout & DB initialization
│   └── results.tsx       # Exam results screen
├── assets/               # Images and JSON seed data (questions.json)
├── components/           # Reusable UI components (currently empty or sparsely used)
├── constants/            # Theme tokens, colors, and static configuration
├── db/                   # Local database setup and queries (database.ts)
├── store/                # Zustand global state (settingsStore.ts)
├── app.json              # Expo configuration
└── package.json          # Project dependencies and scripts
```

## How to Proceed
If you are an AI assistant picking up this project, you should:
1. Ensure you understand the routing mechanism provided by **Expo Router**.
2. When making data mutations or querying questions, add or modify functions inside `db/database.ts` using `expo-sqlite`.
3. If new global state is needed, add it to `store/settingsStore.ts` and ensure it persists in the SQLite `user_settings` table if it needs to survive app restarts.
4. Keep in mind that UI updates must respect the RTL layout. Ensure `flexDirection` and paddings/margins (like `paddingStart`/`paddingEnd` instead of `paddingLeft`/`paddingRight`) align correctly for Arabic text.
