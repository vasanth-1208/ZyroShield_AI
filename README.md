# ZyroShield

AI-powered parametric insurance platform that protects gig delivery workers from income loss caused by environmental disruptions like heavy rain, extreme heat, or pollution.

---

## Problem Statement

Delivery partners working for platforms like Swiggy, Zomato, Amazon, and Zepto rely on daily deliveries for their income. However, external disruptions such as extreme weather, pollution, or city restrictions can stop deliveries completely.

When these disruptions occur, workers lose a significant portion of their daily earnings and currently have no income protection mechanism.

ZyroShield solves this by providing an AI-powered parametric insurance system that automatically compensates workers for lost income.

---

## Target Persona

**Food Delivery Workers**

Platforms:

* Swiggy
* Zomato

**Example Persona:**

Name: Ravi
City: Chennai
Daily Income: ₹800

**Scenario:**
Heavy rain stops deliveries for several hours. Ravi cannot work and loses income.

ZyroShield detects the disruption and automatically triggers a payout.

---

## Solution Overview

ZyroShield is an AI-driven parametric insurance platform designed for gig workers.

The system continuously monitors environmental disruptions such as weather, pollution, and city restrictions. When predefined thresholds are exceeded, the system automatically triggers payouts.

This ensures:

* Zero manual claims
* Instant payouts
* Reliable income protection

---

## System Workflow

Worker registers on ZyroShield platform
↓
Worker selects weekly insurance plan
↓
AI monitors environmental data (weather, pollution, traffic)
↓
Disruption detected
↓
Parametric trigger activated
↓
Fraud check + validation
↓
Automatic claim approval
↓
Instant payout to worker

---

## Weekly Insurance Model

Workers subscribe to affordable weekly plans.

| Plan     | Weekly Premium | Coverage     |
| -------- | -------------- | ------------ |
| Basic    | ₹20            | ₹200 payout  |
| Standard | ₹40            | ₹500 payout  |
| Pro      | ₹60            | ₹1000 payout |

Weekly pricing aligns with gig workers' earning cycle.

---

## Parametric Triggers

Payouts are triggered automatically based on environmental conditions:

* Rainfall > 50 mm
* Temperature > 42°C
* AQI > 350
* Flood / waterlogging alerts
* Government curfews

---

## AI Integration

### 1. Risk Prediction

AI predicts disruption probability using:

* historical weather data
* location-based risk patterns
* seasonal trends

### 2. Dynamic Premium Pricing

Premium adjusts based on zone risk:

* low-risk zone → lower premium
* high-risk zone → higher premium

### 3. Fraud Detection

AI detects:

* abnormal claim patterns
* fake location data
* coordinated fraud attempts

---

## 🚨 Adversarial Defense & Anti-Spoofing Strategy (Market Crash)

To defend against large-scale GPS spoofing attacks, ZyroShield uses a **multi-layer fraud detection system**.

---

### 1. Differentiation: Real vs Fake Worker

Instead of trusting GPS alone, ZyroShield uses **behavioral + contextual validation**:

* Delivery activity history
* Movement patterns (speed, route consistency)
* Time spent in active delivery zones
* App interaction patterns

**Logic:**
A real worker shows natural movement and delivery behavior, while a spoofed user shows static or unrealistic patterns.

---

### 2. Multi-Source Data Validation

ZyroShield cross-verifies multiple data points:

* GPS location vs network triangulation
* Weather API vs actual user density in that zone
* Traffic API vs movement patterns
* Historical activity vs sudden anomaly

**Example:**
If 500 users suddenly claim the same flood zone but traffic data shows no congestion → flagged.

---

### 3. Fraud Ring Detection

AI identifies coordinated fraud using:

* cluster analysis of multiple claims
* identical location spoof patterns
* synchronized claim timing
* unusual spike in payouts

This helps detect **organized fraud groups**.

---

### 4. Device & Sensor Intelligence

System validates:

* device ID consistency
* accelerometer (movement detection)
* background app usage patterns

Spoofers often fail to simulate real physical movement.

---

### 5. Risk Scoring Engine

Each claim is assigned a **fraud risk score**:

* Low risk → instant payout
* Medium risk → delayed verification
* High risk → flagged for review

---

### 6. UX Balance (Critical Requirement)

ZyroShield ensures genuine users are not penalized:

* If network failure occurs → fallback verification used
* Partial payouts allowed during uncertainty
* Manual override for extreme cases
* Transparent status shown to user

This ensures:

* fairness
* trust
* user retention

---

## Tech Stack

Frontend
React.js / Next.js

Backend
Node.js / Express / FastAPI

AI / ML
Python
Scikit-learn

Database
MongoDB

APIs
OpenWeather API
Google Maps API

Payments
Razorpay Test Mode / UPI Sandbox

---

## System Architecture

Worker App
↓
Frontend
↓
Backend API
↓
AI Risk Engine
↓
External APIs (Weather / Pollution / Traffic)
↓
Fraud Detection Engine
↓
Parametric Trigger Engine
↓
Claims Processing
↓
Payment Gateway

---

## Innovation Highlights

* Fully automated parametric insurance
* AI-based fraud detection system
* Multi-layer anti-spoofing protection
* Predictive disruption alerts
* Zero manual claim process

---

## Future Scope

* Integration with delivery platforms
* Advanced ML models for fraud detection
* Real-time worker safety alerts
* Expansion to other gig sectors

---

## Project Status

Phase 1: Ideation & Foundation ✅
Next Phase: Automation & System Development
