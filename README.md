# Prospera - Personal Finance Manager 💰

A comprehensive React Native mobile application for managing personal finances, tracking expenses, income, and savings goals.

## Features ✨

- **Income Tracking**: Monitor salary, freelance, and investment income
- **Expense Management**: Track and categorize daily expenses
- **Savings Goals**: Set and track progress on savings goals with interest calculator
- **Budget Planning**: Set monthly budget targets and monitor spending
- **Multi-Currency Support**: Choose from 40+ currencies
- **Theme Switching**: Light and dark mode support
- **Statistics & Analytics**: View spending patterns with weekly/monthly/yearly breakdowns
- **User Profile**: Customize settings including notifications, language, and haptic feedback

## Tech Stack 🛠️

### Frontend

- **React Native** 0.81.4
- **Expo** ~54.0.1
- **Expo Router** ~6.0.0 (File-based routing)
- **Redux Toolkit** 2.9.2 (State management)
- **TypeScript**

### Backend

- **Express** 5.1.0
- **MongoDB** with Mongoose 8.18.1
- **RESTful API**

## Prerequisites 📋

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo CLI
- Expo Go app (for testing on physical device)

## Installation 🚀

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Prospera-v2
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set up environment variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_URL=http://your-backend-url:5001/api
```

Create a `.env` file in the `backend` directory:

```
MONGODB_URI=mongodb://localhost:27017/prospera
PORT=5001
```

### 5. Start MongoDB

Make sure your MongoDB instance is running.

### 6. Start the backend server

```bash
cd backend
npm start
```

### 7. Start the Expo app

In a new terminal, from the root directory:

```bash
npx expo start
```

## Testing the App 📱

### Option 1: Expo Go (Recommended for Quick Testing)

1. Install Expo Go on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code from the terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option 2: Android Emulator

```bash
npx expo start --android
```

### Option 3: iOS Simulator (Mac only)

```bash
npx expo start --ios
```

## Project Structure 📁

```
Prospera-v2/
├── app/                          # Screen components (Expo Router)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx             # Home screen
│   │   ├── transactions.tsx      # Statistics screen
│   │   └── profile.tsx           # Profile settings
│   └── investments/              # Investments screen
├── components/                   # Reusable components
├── backend/                      # Express API
│   ├── models/                   # MongoDB schemas
│   └── routes/                   # API endpoints
├── store/                        # Redux store
│   ├── slices/                   # Redux slices
│   └── selectors/                # Redux selectors
├── hooks/                        # Custom React hooks
├── constants/                    # App constants & theme
└── utils/                        # Utility functions
```

## Publishing for Testing 🚀

### Expo EAS Build (Recommended)

1. **Install EAS CLI**

```bash
npm install -g eas-cli
```

2. **Login to Expo**

```bash
eas login
```

3. **Configure EAS**

```bash
eas build:configure
```

4. **Build for Android (APK)**

```bash
eas build --platform android --profile preview
```

5. **Build for iOS (TestFlight)**

```bash
eas build --platform ios --profile preview
```

The build will be available on your Expo dashboard, and you can share the download link with testers.

### Alternative: Expo Publish (Expo Go Required)

```bash
npx expo publish
```

Share the published link with testers who have Expo Go installed.

## API Endpoints 🔌

- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile/:userId` - Get user profile
- `PUT /api/user/profile/:userId` - Update profile
- `GET /api/expenses/:userId` - Get expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/income/:userId` - Get income
- `POST /api/income` - Create/update income
- `GET /api/savings/:userId` - Get savings goals
- `POST /api/savings` - Create savings goal
- `PUT /api/savings/:id` - Update savings goal
- `DELETE /api/savings/:id` - Delete savings goal

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Contact 📧

For questions or support, please open an issue on GitHub.
