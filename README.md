# CarePulse — Unified Healthcare Coordination Platform
**Hackathon MVP Build (Solo ~4h Window)**

> **CRITICAL COMPLIANCE NOTICE**: This platform is strictly an **administrative, scheduling, and emergency coordination tool**. It contains **no medical diagnosis, symptom checking, treatment advice, medication suggestions, or clinical decision-making** anywhere in its UI, copy, or logic.

---

## 📌 Problem & Context
Small community clinics and outpatient centers currently struggle with fragmented operations:
- Appointments are tracked across phone calls, physical paper notebooks, WhatsApp threads, and spreadsheets.
- During emergencies, clinic staff and patients struggle to locate nearby ambulance availability, urgent blood bank stock, and emergency facility capacity.

**CarePulse** brings clinic appointment management and emergency response coordination (ambulance dispatch + blood bank inventory search) into a single, unified staff dashboard.

---

## 🚀 Key Features Built

### Phase 1 — Core Patient & Appointment Flow (Must-Have)
1. **Patient Registration**: Capture essential non-clinical fields (Name, Age, Gender, Phone, Blood Group, Address).
2. **Appointment Booking**: Select existing patient (with instant search) or register new inline, date picker, time slot, administrative reason (e.g., "General Checkup", "Consultation", "Follow-up", "Vaccination"), and assigned doctor/staff.
3. **Appointment Status Lifecycle**: Inline status transitions (`Scheduled` ➔ `Completed` ➔ `Cancelled` ➔ `No-show`) with instant updates.
4. **Clinic Dashboard**: Today's appointment schedule, pending vs. completed visits, upcoming visit counts, and immediate follow-up alerts.
5. **Patient Search**: Live search across patients by full name, phone number, address, or blood group, with blood group filtering pills.

### Phase 2 — Emergency Coordination (Must-Have)
6. **Ambulance Requests**: Emergency request intake with patient name, contact phone, pickup location, urgency level (`Critical`, `Moderate`, `Standard`), and lifecycle tracking (`Requested` ➔ `Dispatched` ➔ `Completed`).
7. **Ambulance Fleet Readiness**: Seeded fleet of 6 ambulances (Advanced Life Support, Basic Life Support, Patient Transport) with current station/area, driver names, phone hotlines, and status toggles (`Available`, `On Duty`, `Maintenance`).
8. **Direct Ambulance Dispatch Flow**: Assign an available ambulance to a pending emergency call in 1 click, automatically placing the vehicle `On Duty` and notifying the driver via simulated dispatch SMS toast.
9. **Blood Group Matcher**: 1-click interactive blood group filter (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) matching inventory across regional blood banks.
10. **Blood Bank Information**: Directory of 5 accredited blood banks with address, operating hours, 24/7 hotline, and full stock inventory table with stock adequacy badges (`Critical`, `Low`, `Adequate`, `Surplus`).

### Phase 3 — Extended Capabilities (Fully Delivered)
11. **Nearby Hospital & Clinic Directory**: Seeded directory of 5 regional medical centers with distance (km), specialty tags (Trauma, Cardiology, Pediatrics, Urgent Care), 24/7 trauma hotlines, and live capacity status (`Available`, `Busy`, `Critical Capacity`).
12. **Patient Visit History & Profiles**: Dedicated side drawer showing full appointment history per patient with direct 1-click re-booking.
13. **Follow-up Reminders**: Simple administrative follow-up flag and due dates on appointments, surfaced in a dedicated dashboard alert banner with simulated "Call Patient" action.
14. **1-Click Rapid Emergency Action**: Dedicated high-visibility header button (`🚨 Emergency Action`) opening an instant drawer to dispatch ambulances or locate emergency blood units from anywhere in the app.
15. **Operations & Coordination Analytics**: Real-time visual metrics showing appointment completion rates, ambulance fleet utilization, and aggregated regional blood reserves.
16. **Reset Demo Dataset**: A dedicated `Reset Seed` button in the header allowing judges/evaluators to restore the database to the fresh dummy dataset at any time.

---

## 📦 Data Seeding
The database auto-seeds on first launch with realistic, rich sample data:
- **12 Patients** across varied demographics and all 8 blood groups.
- **16 Appointments** spanning past (completed/no-show), today (scheduled/completed), and future dates with follow-up flags.
- **6 Ambulances** with realistic call signs, ALS/BLS types, assigned drivers, and station locations.
- **4 Active Ambulance Calls** across requested, dispatched, and completed states.
- **5 Accredited Blood Banks** with complete stock matrices across all blood groups.
- **4 Urgent Blood Requests** tracking patient, required units, receiving facility, and status.
- **5 Nearby Hospitals/Clinics** with distance in km, emergency hotlines, and capacity indicators.

---

## 🚫 Explicitly Out of Scope (By Design)
- **No diagnosis, symptom analysis, treatment advice, or medication guidance** (strictly administrative/coordination only).
- **No real payment gateway integration** (unnecessary for MVP demo).
- **No real SMS/cellular gateway** (dispatches are simulated with contextual UI toasts).
- **No multi-tenant auth** (single shared clinic staff view for frictionless hackathon evaluation).

---

## 🛠 Tech Stack & Architecture
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Lucide React icons
- **Persistence**: Zero-setup file-backed atomic JSON store (`data/db.json`) located inside the project, with automatic creation and auto-seeding on first run. Zero native compilation issues or external DB server dependencies.
- **API Layer**: Next.js Route Handlers (`/api/patients`, `/api/appointments`, `/api/ambulances`, `/api/ambulance-requests`, `/api/blood-banks`, `/api/blood-requests`, `/api/facilities`, `/api/stats`, `/api/reset`).

---

## 💻 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open in Browser
Visit **`http://localhost:3000`** in your browser.

The database will automatically initialize and seed itself on first load. You can click **"Reset Seed"** in the top navigation bar at any point to restore the sample data.
