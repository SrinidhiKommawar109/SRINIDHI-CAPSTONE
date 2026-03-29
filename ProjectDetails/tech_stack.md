# Technology Stack & Toolset

This document provides a comprehensive list of the technologies, libraries, and tools used in the Property Insurance System.

---

## 🏗️ Core Tech Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Frontend** | Angular | 21.2.x |
| **Backend** | .NET Web API | 8.0 |
| **Database** | SQL Server | (EF Core 8) |
| **Styling** | Tailwind CSS | 4.x |
| **Language** | TypeScript / C# | Latest |

---

## 🛠️ Backend Libraries (NuGet Packages)

### Core Framework & ORM
*   **Entity Framework Core**: Object-Relational Mapper (ORM) for SQL Server.
*   **ASP.NET Core Identity**: Secure user management and authentication.
*   **JWT Bearer Authentication**: Token-based security for API endpoints.

### Utility & Logic
*   **AutoMapper**: Automates mapping between Domain Entities and DTOs.
*   **FluentValidation**: Strong, fluent-style validation rules for incoming requests.
*   **BCrypt.Net-Next**: Industry-standard password hashing.

### External Integrations
*   **SendGrid**: Professional email delivery service for policy approvals and alerts.
*   **Google.Cloud.AIPlatform (Vertex AI)**: Backend integration for advanced AI capabilities (Gemini).

---

## 🎨 Frontend Libraries (NPM Packages)

### Data Visualization & Charts
*   **Chart.js**: Core charting library.
*   **ng2-charts**: Angular wrapper for Chart.js, used for dashboard analytics and risk score visualization.

### Intelligence & Document Processing
*   **@google/generative-ai**: Direct integration with Gemini for the Policy Assistant Chatbot.
*   **Tesseract.js**: Browser-based OCR for extracting text from uploaded property documents.
*   **PDF.js**: High-performance PDF parsing and rendering.

### Document Generation & Maps
*   **jsPDF & jsPDF-autotable**: Generates dynamic PDF invoices and policy documents.
*   **Leaflet.js**: Interactive maps for property location visualization.

### Utility & State
*   **RxJS**: Reactive programming using Observables for data streams.
*   **Tailwind CSS**: Utility-first CSS framework for high-premium design.

---

## 📢 Specific Tools & Systems

### 1. Notifications System
*   **Implementation**: Custom `NotificationService` and `NotificationRepository`.
*   **Features**: Real-time feedback in the UI for plan approvals, agent assignments, and status updates.

### 2. Email Integration
*   **Tool**: **SendGrid API**.
*   **Use Cases**: Sending policy confirmation, password resets, and official approval notifications.

### 3. AI & Chatbot
*   **Models**: Gemini 1.5 Flash / Gemini 2.0 Flash (via Vertex AI).
*   **Features**: Intelligent policy assistance, risk analysis, and document data extraction validation.

### 4. Development & DevOps
*   **API Documentation**: **Swagger/OpenAPI** (Swashbuckle) for interactive API testing.
*   **Unit Testing**: **Vitest** (Frontend) and likely **xUnit/NUnit** (Backend).

---

## 📋 Summary Table of Key Tools

| Category | Primary Tool |
| :--- | :--- |
| **Charts** | Chart.js / ng2-charts |
| **Email** | SendGrid |
| **Maps** | Leaflet |
| **PDF** | jsPDF |
| **OCR** | Tesseract.js |
| **AI** | Vertex AI (Gemini) |
| **Identity** | Microsoft Identity |
| **Mappers** | AutoMapper |
