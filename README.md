# ZyroShield

AI-powered parametric insurance platform that protects gig delivery workers from income loss caused by environmental disruptions like heavy rain, extreme heat, or pollution.

---

## Problem Statement

Delivery partners working for platforms like Swiggy, Zomato, Amazon, and Zepto rely on daily deliveries for their income. However, external disruptions such as extreme weather, pollution, or city restrictions can stop deliveries completely.

When these disruptions occur, workers lose a significant portion of their daily earnings and currently have no income protection mechanism.

ZyroShield aims to solve this problem by providing an AI-powered parametric insurance system that automatically compensates workers for lost income.

---

## Target Persona

Food Delivery Workers

Platforms:
- Swiggy
- Zomato

Example Persona:

Name: Ravi  
City: Chennai  
Daily Income: ₹800

Scenario:
Heavy rain stops deliveries for several hours. Ravi cannot work and loses part of his income.

ZyroShield detects the disruption and automatically triggers a payout.

---

## Solution Overview

ZyroShield is an AI-driven parametric insurance platform designed for gig workers.

The system continuously monitors environmental and social disruptions such as weather and pollution levels. If disruption thresholds are exceeded, the system automatically triggers a payout to the insured worker.

This eliminates manual claim filing and ensures faster financial protection.

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
Automatic claim approval  
↓  
Instant payout to worker

---

## Weekly Insurance Model

Workers subscribe to affordable weekly plans.

| Plan | Weekly Premium | Coverage |
|-----|-----|-----|
Basic | ₹20 | ₹200 payout |
Standard | ₹40 | ₹500 payout |
Pro | ₹60 | ₹1000 payout |

Weekly pricing aligns with gig workers' weekly earning cycle.

---

## Parametric Triggers

Insurance payouts are triggered automatically based on predefined disruption conditions.

Examples:

Rainfall > 50 mm  
Temperature > 42°C  
Air Quality Index > 350  
Flood alerts or severe waterlogging  
Government curfews or zone closures

---

## AI Integration

Artificial Intelligence is used in the following components:

### Risk Prediction
AI predicts disruption risk levels based on historical weather and environmental data.

### Dynamic Premium Pricing
Insurance premiums can adjust based on risk level of delivery zones.

### Fraud Detection
AI detects abnormal claim behavior such as GPS spoofing or duplicate claims.

---

## Tech Stack

Frontend  
React.js / Next.js

Backend  
Node.js / Express or FastAPI

AI / Machine Learning  
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
Backend Server  
↓  
AI Risk Engine  
↓  
External APIs (Weather / Pollution)  
↓  
Parametric Trigger Engine  
↓  
Claims Processing  
↓  
Payment Gateway

---

## Future Scope

Integration with delivery platforms  
Advanced AI risk prediction models  
Mobile application for workers  
Real-time disruption alerts  
Expanded coverage for multiple gig economy sectors

---

## Project Status

Currently in Phase 1: Ideation & Foundation  
Next phase will involve development of core automation and AI modules.
