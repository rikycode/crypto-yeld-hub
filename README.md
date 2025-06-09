# CryptoYeldHub

**CryptoYeldHub** is a modern cryptocurrency portfolio tracker and yield optimizer. It allows users to connect multiple wallets, analyze their holdings across different blockchains, and explore yield farming opportunities using real-time analytics and AI-powered suggestions.

---

## 🔧 Installation Guide

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or newer): https://nodejs.org
- **Angular CLI**: Run the following command:
  ```bash
  npm install -g @angular/cli
  ```
- **Firebase CLI** (for deployment & testing):
  ```bash
  npm install -g firebase-tools
  ```

---

### 2. Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/cryptoyeldhub.git
   cd cryptoyeldhub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Angular app locally**:
   ```bash
   ng serve
   ```

4. Navigate to `http://localhost:4200/` to use the app locally.

---

## 🔐 Authentication & Backend

The project uses **Firebase** for:
- User Authentication (Google or Email/Password)
- Firestore Database for storing and syncing user data

> Configure your Firebase credentials in `src/environments/environment.ts`

---

## 🌐 API Service (via Render)

All pricing and analytics data are served through a REST API hosted on **Render**:

- **Base URL**: `https://crypto-price-api-h8vd.onrender.com`

All available endpoints are documented here:
👉 [Postman Public API Docs](https://www.postman.com/riccardovazzoler-1524191/cryptoyeldhub/collection/63effq3/cryptoyeldhub-api-test?action=share&creator=45713837)

---

## 🧠 Project Overview

**CryptoYeldHub** is designed to help investors optimize their crypto portfolio by combining:

- **Live token prices** from CoinMarketCap via proxy API
- **Portfolio aggregation** across multiple blockchains (EVM & Bitcoin supported)
- **Performance metrics** and historical returns
- **AI-generated suggestions** for farming and staking
- **Telegram & Email Alerts** (coming soon)

---

## 🖼️ Application Architecture

### Frontend: Angular

- Modular structure with core services (`WalletVerifierService`, `TokenService`, `PriceFetcherService`, etc.)
- Components include:
  - `wallet-overview`
  - `portfolio`
  - `performance-chart`
  - `suggestions`
- Integration with Chart.js, Inter font, Tailwind-inspired styling

### Backend: Firebase + Render

- **Firebase**: handles user data, login, and Firestore storage
- **Render**: hosts a Node.js proxy API for CoinMarketCap (price and token data) to bypass CORS limitations

---

## 🏗️ Core Functionality

- ✅ Multi-wallet support (EVM & Bitcoin)
- ✅ Live fiat conversion (USD / EUR)
- ✅ Clean and intuitive dashboard
- ✅ Real-time analytics
- 🔜 Alerts and notifications
- 🔜 Social/trending insights

---

## 🧑‍💼 About the Project

Built and maintained by **Adventica**, a digital innovation company focused on financial software and AI-driven platforms.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

## 📫 Contact

For questions, contributions, or feature requests:

- Email: info@adventica.io
- GitHub Issues: [Open a ticket](https://github.com/YOUR-USERNAME/cryptoyeldhub/issues)