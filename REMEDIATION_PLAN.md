# WellNest - Feature Implementation Remediation Plan

**Created:** 2026-04-04
**Status:** In Progress
**Priority:** Fix critical blockers before moving to Phase 2

---

## 🔴 CRITICAL BLOCKERS (FIX NOW)

### Issue #1: Reports Screen Not Implemented
**Severity:** 🔴 CRITICAL - Blocks ALL report features
**Current State:** Placeholder redirects to home
**Impact:** Cannot upload/process medical reports, cannot use lab/imaging features, cannot trigger critical alerts

**Fix:**
```tsx
// In src/screens/ReportScreen.tsx - Create new file with:
// 1. ReportUpload component for file selection
// 2. ReportTypeDetector for auto-detection
// 3. LabReportView for lab results display
// 4. ImagingReportView for imaging results display
// 5. CriticalValueAlert display
// 6. WholeSpineMap integration
```

**Time Estimate:** 3-4 hours (scaffold + component integration)

**Blocks:**
- Lab report processing (v2.2)
- Imaging report processing (v2.1)
- Critical value alerts (v2.2)
- Spine visualization (v2.2)
- Condition connection engine (v2.1)

---

### Issue #2: App.tsx Routes Incomplete
**Severity:** 🔴 CRITICAL - Can't navigate to features
**Current State:** Missing 5 screen routes
**Impact:** Cannot test family, doctor, progress, imaging, conditions features

**Fixes Required:**

```tsx
// In src/App.tsx - Add these missing routes:
<Route path="/diet" element={<ProtectedRoute><DietScreen /></ProtectedRoute>} />
<Route path="/family" element={<ProtectedRoute><FamilyScreen /></ProtectedRoute>} />
<Route path="/doctor" element={<ProtectedRoute><DoctorScreen /></ProtectedRoute>} />
<Route path="/progress" element={<ProtectedRoute><ProgressScreen /></ProtectedRoute>} />
<Route path="/imaging" element={<ProtectedRoute><ImagingScreen /></ProtectedRoute>} />
<Route path="/conditions" element={<ProtectedRoute><ConditionsScreen /></ProtectedRoute>} />
```

**Also update imports:**
```tsx
import DietScreen from '@/screens/DietScreen'
import FamilyScreen from '@/screens/FamilyScreen'
import DoctorScreen from '@/screens/DoctorScreen'
import ProgressScreen from '@/screens/ProgressScreen'
import ImagingScreen from '@/screens/ImagingScreen'
import ConditionsScreen from '@/screens/ConditionsScreen'
```

**Time Estimate:** 30 minutes

**Blocks:**
- Family portal (v2.2)
- Doctor portal (v2.2)
- Progress/analytics (v2.2)
- Imaging processing (v2.1)
- Condition connections (v2.1)

---

### Issue #3: Empty Screen Files Need Content
**Severity:** 🟠 HIGH - Screens exist but are empty
**Current State:** DietScreen, FamilyScreen, DoctorScreen, ProgressScreen, ImagingScreen, ConditionsScreen are blank

**What Each Needs:**

#### DietScreen (`/diet`)
```tsx
// Minimal implementation:
import PageWrapper from '@/components/layout/PageWrapper'

export default function DietScreen() {
  return (
    <PageWrapper title="Diet Tracking">
      <div className="p-4 text-center">
        <p className="text-gray-400">Diet tracking coming soon</p>
      </div>
    </PageWrapper>
  )
}
```

#### ProgressScreen (`/progress`)
```tsx
// Should include:
import SymptomProgression from '@/components/features/symptoms/SymptomProgression'

export default function ProgressScreen() {
  return (
    <PageWrapper title="Your Progress">
      {/* Health score trends */}
      {/* Symptom progression chart */}
      {/* Weight/metrics trends */}
      {/* Compliance graphs */}
      <SymptomProgression />
    </PageWrapper>
  )
}
```

#### FamilyScreen (`/family`)
```tsx
// Should include:
import FamilyDashboard from '@/components/features/family/FamilyDashboard'
import FamilyImpact from '@/components/features/family/FamilyImpact'

export default function FamilyScreen() {
  return (
    <PageWrapper title="Family Circle">
      <FamilyDashboard />
      <FamilyImpact />
    </PageWrapper>
  )
}
```

#### DoctorScreen (`/doctor`)
```tsx
// Should include:
import DoctorPortal from '@/components/features/doctor/DoctorPortal'

export default function DoctorScreen() {
  return (
    <PageWrapper title="Doctor Portal">
      <DoctorPortal />
    </PageWrapper>
  )
}
```

#### ImagingScreen (`/imaging`)
```tsx
// Should likely redirect to /reports or be part of unified reports
// OR create imaging-specific view:
import ImagingReportUpload from '@/components/features/reports/ImagingReportUpload'
import ImagingFindingView from '@/components/features/reports/ImagingFindingView'

export default function ImagingScreen() {
  return (
    <PageWrapper title="Imaging Reports">
      <ImagingReportUpload />
      {/* Display imaging findings */}
    </PageWrapper>
  )
}
```

#### ConditionsScreen (`/conditions`)
```tsx
// Should include:
import ConditionWeb from '@/components/features/conditions/ConditionWeb'
import ConditionCard from '@/components/features/conditions/ConditionCard'

export default function ConditionsScreen() {
  return (
    <PageWrapper title="Your Conditions">
      <ConditionWeb />
      {/* Condition cards list */}
    </PageWrapper>
  )
}
```

**Time Estimate:** 2-3 hours (with proper component integration)

**Blocks:** All v2.1 & v2.2 feature testing

---

## 🟠 HIGH PRIORITY FIXES (Next Sprint)

### Fix #4: Appointments Backend Integration
**Current State:** Components exist, backend unclear
**Fix Needed:** Verify data flow in appointmentStore

```tsx
// In src/store/appointmentStore.ts - Ensure these work:
// 1. addAppointment() actually calls Supabase
// 2. fetchPreparation() generates prep correctly
// 3. completeAppointment() saves data
// 4. Post-visit logs save to database
```

**Testing:**
```bash
# Add console.logs to trace:
1. Post appointment creation
2. Visit prep generation call
3. Post-visit logger submission
```

**Time Estimate:** 1-2 hours

---

### Fix #5: Make Injection Courses Accessible
**Current State:** Components exist but hidden in UI
**Fix Needed:** Add UI to Medications screen to show injection courses

```tsx
// In MedicationsScreen.tsx - Add:
// 1. Tab or toggle to show "Injection Courses"
// 2. Display InjectionCourse component
// 3. Show InjectionCourseLog for each course
// 4. Allow adding new injection courses
```

**Time Estimate:** 1-2 hours

---

### Fix #6: Make Side Effect Monitor Visible
**Current State:** Component exists but not shown
**Fix Needed:** Add to Medications screen

```tsx
// In MedicationsScreen.tsx - Add:
// <SideEffectMonitor medicationId={med.id} />
// Or create dedicated side effects section
```

**Time Estimate:** 1 hour

---

## 🟡 MEDIUM PRIORITY (Phase 2)

### Fix #7: Wire Symptom Progression
- Move from hidden component to Progress screen
- Time: 1 hour

### Fix #8: Implement Critical Alert System
- Add notification UI for critical values
- Time: 2-3 hours

### Fix #9: Complete Family Features
- Family dashboard with family members
- Messaging interface
- Engagement tracking
- Time: 4-5 hours

### Fix #10: Complete Doctor Portal
- Multi-specialty views filtering
- Note-taking interface
- Restriction management
- Time: 4-5 hours

---

## 📋 IMPLEMENTATION CHECKLIST

### Sprint 1: Unblock Testing (This Week)

- [ ] **Fix Routes in App.tsx**
  - Add missing route imports
  - Add missing route definitions
  - Test all routes load without 404

- [ ] **Implement Minimal Screen Content**
  - [ ] Create basic DietScreen
  - [ ] Create basic ProgressScreen with SymptomProgression
  - [ ] Create basic FamilyScreen with components
  - [ ] Create basic DoctorScreen with DoctorPortal
  - [ ] Create basic ImagingScreen (or merge with Reports)
  - [ ] Create basic ConditionsScreen with components

- [ ] **Implement Reports Screen** (HIGHEST PRIORITY)
  - [ ] Create ReportsScreen component
  - [ ] Add ReportUpload file input
  - [ ] Add ReportTypeDetector UI
  - [ ] Add LabReportView display
  - [ ] Add ImagingReportView display
  - [ ] Add CriticalValueAlert display
  - [ ] Add WholeSpineMap visualization
  - [ ] Wire to reportStore

- [ ] **Verify Appointments Integration**
  - [ ] Test adding appointment
  - [ ] Test visit prep generation
  - [ ] Test post-visit logging
  - [ ] Verify data saves to DB

- [ ] **Improve Medications Screen**
  - [ ] Add InjectionCourse section
  - [ ] Add SideEffectMonitor visibility

- [ ] **Run Tests**
  - [ ] npm run type-check (0 errors)
  - [ ] npm run lint (0 errors)
  - [ ] Manual QA on all routes

### Sprint 2: Complete Features (Following Week)

- [ ] Wire up remaining services
- [ ] Implement critical alert system
- [ ] Complete family features
- [ ] Complete doctor portal
- [ ] Write E2E tests
- [ ] Write unit tests

---

## 🛠️ DEVELOPMENT ORDER

**Recommended order to minimize blocking:**

1. **Fix App.tsx routes** (30 min) - Unblocks everything
2. **Create empty/stub screens** (1-2 hours) - So routes work
3. **Build Reports screen** (3-4 hours) - Enables all report features
4. **Verify Appointments** (1-2 hours) - Enable v2.2 appointment features
5. **Make Injections/Side Effects visible** (1-2 hours) - Enable v2.2 med features
6. **Complete remaining screens** (4-6 hours) - Full feature parity

**Total Estimated Time:** 11-17 hours

---

## 🧪 VALIDATION AFTER FIXES

Run this checklist after each fix:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Manual testing
npm run dev

# Browser testing at http://localhost:5173:
- [ ] / loads (splash/home)
- [ ] /login works
- [ ] /dashboard displays
- [ ] /medications works
- [ ] /water works
- [ ] /symptoms works
- [ ] /exercise works
- [ ] /posture works
- [ ] /appointments works
- [ ] /reports shows upload interface
- [ ] /diet shows something
- [ ] /family shows dashboard
- [ ] /doctor shows portal
- [ ] /progress shows trends
- [ ] /imaging shows imaging upload
- [ ] /conditions shows connections
- [ ] All responsive on mobile (375px)
- [ ] No console errors
```

---

## 📊 SUCCESS CRITERIA

**All critical blockers resolved when:**

- ✅ All routes in App.tsx
- ✅ All screens render without errors
- ✅ Reports screen accepts file uploads
- ✅ `npm run type-check` passes
- ✅ `npm run lint` passes
- ✅ Manual QA on all screens passes
- ✅ App responsive on mobile/tablet/desktop

**Ready for full v2.2 testing when:**

- ✅ All above + all v2.2 features integrated
- ✅ E2E tests written and passing
- ✅ Unit tests written and passing
- ✅ Data persistence verified on key flows

---

## 📝 NOTES

- **Don't** try to fully implement Report Processing pipeline until screen is built
- **Don't** worry about Edge Functions until UI is ready to call them
- **Do** focus on getting routes and basic screens working first
- **Do** verify Appointments stores data correctly before moving on
- **Do** write simple unit tests as you build screens

---

**Status:** Ready to implement
**Assigned to:** [Developer Name]
**Target Completion:** [Date]

