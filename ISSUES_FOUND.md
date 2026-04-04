# WellNest Issues & Missing Features - Quick Reference

## 🔴 CRITICAL ISSUES (Block Testing)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Reports screen not implemented | Cannot upload/process medical reports | Implement `/reports` route |
| 2 | Appointments screen incomplete | Visit prep & post-visit may not save | Verify store & API integration |
| 3 | Family screen empty | No family circle features | Implement `/family` route |
| 4 | Doctor screen empty | Doctors can't access patient data | Implement `/doctor` route |

---

## 🟠 HIGH PRIORITY ISSUES

### Missing Screens (Not in App.tsx routing)
- [ ] **Progress Screen** (`/progress`) - Analytics/trends not visible
- [ ] **Imaging Screen** (`/imaging`) - v2.1 imaging report handling
- [ ] **Conditions Screen** (`/conditions`) - Condition connection visualization
- [ ] **Diet Screen** (`/diet`) - Food/diet logging

### Features In Code But Not Wired
- [ ] **Symptom Progression** - Component exists, not in any screen
- [ ] **Injection Courses** - Components exist, unclear how to access
- [ ] **Side Effect Monitor** - Component exists, not prominent in medications
- [ ] **Critical Value Alerts** - Component exists, no alert system active
- [ ] **Whole Spine Map** - Component exists, no reports screen to show it

---

## 🟡 MEDIUM PRIORITY ISSUES

### Incomplete Appointments Screen
- [ ] Verify visit preparation generates correctly
- [ ] Verify post-visit logs save to database
- [ ] Confirm form validation works
- [ ] Test appointment completion flow

### Suspected Data Flow Issues
- [ ] Injection course logging may not persist
- [ ] Environmental trigger capture (AC/non-AC) integration unclear
- [ ] Urine color correlation analysis not implemented
- [ ] Symptom backdating integration with database

---

## ✅ WHAT'S WORKING

- ✅ Dashboard with health score
- ✅ Medication logging
- ✅ Water intake tracking
- ✅ Symptom logging (basic)
- ✅ Exercise tracking with restrictions
- ✅ Posture timer & sleep position logging
- ✅ Login/Authentication
- ✅ Responsive design

---

## 📋 QUICK TEST CHECKLIST

Run these to validate before next phase:

```bash
# Start app
npm run dev

# At http://localhost:5173/:
```

- [ ] Splash screen loads
- [ ] Can log in with OTP
- [ ] Dashboard shows health score
- [ ] Can add medication & log doses
- [ ] Can log water intake
- [ ] Can log symptoms with severity
- [ ] Can add exercise activities
- [ ] Posture timer starts/stops
- [ ] Can log sleep position
- [ ] Can add appointments
- [ ] `/reports` shows "Coming in Phase 2"
- [ ] `/family` redirects to home or 404
- [ ] `/doctor` redirects to home or 404
- [ ] Responsive on mobile (375px width)

---

## 🔧 ROUTES STATUS

```
✅ /                    → Splash Screen
✅ /login              → Login Screen
✅ /onboarding         → Onboarding Screen
✅ /dashboard          → Dashboard (Health Score)
✅ /medications        → Medication Management
✅ /water              → Water Intake Tracking
✅ /symptoms           → Symptom Logging
✅ /exercise           → Exercise Tracking
✅ /posture            → Posture Timer & Sleep
✅ /appointments       → Appointment Management (Partial - v2.2)
🚫 /reports            → Placeholder Only (Phase 2)
🚫 /progress           → Placeholder Only
❓ /imaging            → Not in routing
❓ /conditions         → Not in routing
❓ /diet               → Not in routing
❓ /family             → Not in routing
❓ /doctor             → Not in routing
```

---

## 🐛 COMPONENTS PRESENT BUT NOT USED

These components exist in the codebase but aren't integrated into screens:

| Component | Location | Should Be In | Status |
|-----------|----------|--------------|--------|
| SymptomProgression | `features/symptoms/` | Progress screen | ❌ Not wired |
| InjectionCourse | `features/medications/` | Medications screen | ❌ Hidden |
| InjectionCourseLog | `features/medications/` | Medications screen | ❌ Hidden |
| SideEffectMonitor | `features/medications/` | Medications screen | ❌ Hidden |
| ReportTypeDetector | `features/reports/` | Reports screen | ❌ Missing |
| ReportUpload | `features/reports/` | Reports screen | ❌ Missing |
| LabReportView | `features/reports/` | Reports screen | ❌ Missing |
| ImagingReportView | `features/reports/` | Reports screen | ❌ Missing |
| CriticalValueAlert | `features/reports/` | Reports screen | ❌ Missing |
| WholeSpineMap | `features/reports/` | Reports screen | ❌ Missing |
| SpineMap | `components/ui/` | Reports/Conditions screens | ❌ Missing |
| BackdateSelector | `features/symptoms/` | Symptoms screen | ✅ Present |
| EnvironmentCapture | `features/symptoms/` | Symptoms screen | ✅ Present |
| UrineColorLogger | `features/symptoms/` | Symptoms screen | ✅ Present |
| SleepPositionLogger | `features/posture/` | Posture screen | ✅ Present |
| VisitPreparation | `features/appointments/` | Appointments screen | ✅ Present |
| PostVisitLogger | `features/appointments/` | Appointments screen | ✅ Present |
| FamilyCircle | `features/family/` | Family screen | ❌ Missing |
| FamilyDashboard | `features/family/` | Family screen | ❌ Missing |
| FamilyImpact | `features/family/` | Family screen | ❌ Missing |
| ConditionWeb | `features/conditions/` | Conditions screen | ❌ Missing |
| ConditionCard | `features/conditions/` | Conditions screen | ❌ Missing |
| DoctorPortal | `features/doctor/` | Doctor screen | ❌ Missing |
| NephrologyView | `features/doctor/` | Doctor screen | ❌ Missing |
| UrologyView | `features/doctor/` | Doctor screen | ❌ Missing |
| NeurologyView | `features/doctor/` | Doctor screen | ❌ Missing |
| CardiologyView | `features/doctor/` | Doctor screen | ❌ Missing |

---

## 📊 IMPLEMENTATION STATISTICS

- **Total Routes:** 18 (planned)
- **Implemented Routes:** 10 (56%)
- **Placeholder Routes:** 2 (11%)
- **Missing Routes:** 6 (33%)

- **Total Components:** 50+ created
- **Fully Used:** 30+
- **Partially Used:** 5
- **Unused:** 15+

---

## 🎯 NEXT PHASE RECOMMENDATIONS

### Immediate (Before Testing)
1. Connect missing routes to App.tsx
2. Verify Appointments data flow
3. Run type-check: `npm run type-check`
4. Run linter: `npm run lint`

### Phase 1 Completion
5. Implement missing screens: Diet, Family, Doctor, Progress, Imaging, Conditions
6. Wire up unused components
7. Verify all store integrations

### Testing
8. Write E2E tests with Playwright
9. Write unit tests with Vitest
10. Manual QA on all screens

---

**Generated:** 2026-04-04
**Branch:** claude/review-v2.2-changes-EQx4n
