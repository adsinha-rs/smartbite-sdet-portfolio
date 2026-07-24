# 🥗 SmartBite: Intelligent Meal & Macro Tracker

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/smartbite-sdet-portfolio/actions/workflows/sdet-pipeline.yml/badge.svg)](https://github.com/YOUR_USERNAME/smartbite-sdet-portfolio/actions)
[![Playwright](https://img.shields.io/badge/Tested_with-Playwright-2EAD33?logo=playwright)](https://playwright.dev/)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?logo=react)](https://reactjs.org/)

SmartBite is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to automate meal planning, dynamically generate smart grocery lists, and track nutritional macros using live data. 

## ✨ Key Features
* **Live USDA API Integration:** Automatically fetches and calculates precise macro-nutrients (Calories, Protein, Carbs, Fats) for ingredients using the public USDA FoodData Central internet database.
* **Smart Grocery Engine:** Aggregates weekly meal plans into a consolidated shopping list with unified measurements.
* **Modern Aesthetic UI:** Built with React, featuring a clean, responsive, SaaS-style dashboard.

---

## 🧪 SDET & QA Architecture
This repository is engineered with a heavy focus on quality assurance, test automation, and continuous integration.

* **E2E UI Automation:** Comprehensive Playwright test suites validating user flows and DOM interactions.
* **Network Interception & Mocking:** Tests utilize Playwright's `page.route()` to mock backend API responses. This completely isolates the frontend UI, eliminating database flakiness and ensuring tests run at lightning speed.
* **Automated CI/CD Pipeline:** Fully configured GitHub Actions workflow. On every push or pull request, a fresh Ubuntu cloud runner installs dependencies, bypasses local linters, and executes the Playwright test suite in a headless browser to prevent regressions.

---

## 🚀 Local Setup Instructions

### 1. Start the Backend
Navigate to the backend directory and start the Express server:
```bash
cd backend
npm install
node server.js