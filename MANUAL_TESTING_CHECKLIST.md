# Manual Testing Checklist - KLINIK-MAT Launch Verification
**Date:** January 8, 2026  
**Target Launch:** 3 weeks  
**Platform:** Educational platform for Chilean obstetrics students

---

## 🎯 Priority 3 Repository Pattern - Feature Verification

### ✅ Pre-Testing Setup
- [x] Build compiles successfully (`npm run build`)
- [x] Dev server starts without errors (`npm run dev`)
- [ ] Database connection verified
- [ ] Test user account ready (Free tier)
- [ ] Test user account ready (Premium tier)

---

## 📚 1. Case Browsing (CRITICAL - Core Feature)

**Repository Used:** `StaticCaseRepository` (case.repository.ts)  
**Service:** CaseService  
**Endpoint:** `/api/cases`, `/casos/[id]`

### Test Cases:
- [ ] **Homepage loads with case catalog**
  - URL: `http://localhost:3000/casos`
  - Expected: Grid of clinical case cards
  - Verify: 300+ obstetrics cases displayed
  - Check: Title, area, difficulty, summary visible

- [ ] **Filter by obstetrics area**
  - Areas: "Embarazo y control prenatal", "Hemorragia postparto", etc.
  - Expected: Cases filtered correctly
  - Verify: URL updates with `?area=...`

- [ ] **Filter by difficulty**
  - Levels: Baja (1), Media (2), Alta (3)
  - Expected: Only cases of selected difficulty shown

- [ ] **Search functionality**
  - Test: Search "embarazo", "hemorragia", "parto"
  - Expected: Relevant cases appear
  - Verify: Search across title, vignette, summary, questions

- [ ] **Pagination works**
  - Expected: 20 cases per page
  - Verify: Page navigation functional

- [ ] **Individual case opens**
  - Click any case card
  - URL: `/casos/[case-id]`
  - Expected: Full case details load
  - Verify: Clinical vignette, questions, options, images, MINSAL norms

**Database Queries to Monitor:**
```sql
-- Check console for these queries
SELECT * FROM cases WHERE isPublic = true ORDER BY created_at DESC LIMIT 20
SELECT COUNT(*) FROM cases WHERE isPublic = true
```

---

## 📊 2. Student Progress Tracking (CRITICAL)

**Repository Used:** `resultRepository` (result.repository.ts)  
**Service:** ResultService  
**Endpoint:** `/api/results`, `/mi-progreso`

### Test Cases:
- [ ] **Complete a case**
  - Navigate to any case
  - Answer all questions
  - Submit answers
  - Expected: Result saved to database
  - Verify: Score calculated correctly

- [ ] **View progress dashboard**
  - URL: `http://localhost:3000/mi-progreso`
  - Expected: Dashboard loads with stats
  - Verify metrics:
    - Total cases completed
    - Average score (%)
    - Best score
    - Time spent (average)
    - Progress by obstetrics area

- [ ] **Progress by area breakdown**
  - Expected: Chart/table showing performance per area
  - Areas: "Embarazo", "Hemorragia postparto", etc.
  - Verify: Cases completed and avg score per area

- [ ] **Case history**
  - View history for a specific case
  - Expected: All attempts shown
  - Verify: Date, score, time spent for each attempt

- [ ] **Leaderboard**
  - URL: `/estadisticas` or leaderboard section
  - Expected: Top students by total score
  - Verify: Current user's rank shown

**Database Queries to Monitor:**
```sql
-- Progress tracking queries
SELECT COUNT(*) FROM student_results WHERE userId = ?
SELECT AVG(score) FROM student_results WHERE userId = ?
SELECT caseArea, COUNT(*), AVG(score) FROM student_results WHERE userId = ? GROUP BY caseArea
```

---

## 💳 3. Subscription Flow (CRITICAL)

**Repository Used:** `subscriptionRepository`, `subscriptionPlanRepository`  
**Service:** SubscriptionService  
**Endpoint:** `/api/subscription/*`, `/pricing`

### Test Cases:
- [ ] **View pricing page**
  - URL: `http://localhost:3000/pricing`
  - Expected: Free and Premium plans displayed
  - Verify plans:
    - **FREE**: 10-15 cases/month, limited features
    - **PREMIUM**: Unlimited cases, full access

- [ ] **Check access limits (Free tier)**
  - Complete cases until limit reached
  - Expected: "Upgrade to Premium" message
  - Verify: `/api/subscription/check-access` returns correct limit

- [ ] **Usage counter works**
  - Check badge showing "12/15 casos"
  - Complete a case
  - Expected: Counter updates to "13/15"

- [ ] **Initiate subscription payment**
  - Click "Actualizar a Premium"
  - Expected: Mercado Pago checkout opens
  - Verify: Correct amount in CLP (Chilean pesos)
  - Check: Test mode shows sandbox URL

- [ ] **Subscription status updates**
  - After payment simulation
  - Expected: User status changes to PREMIUM
  - Verify: Unlimited access granted

- [ ] **Cancel subscription**
  - Premium user clicks "Cancelar suscripción"
  - Expected: Confirmation dialog
  - Verify: Status changes to "CANCELED" or "ACTIVE" (cancel at period end)

**Database Queries to Monitor:**
```sql
-- Subscription queries
SELECT * FROM subscriptions WHERE userId = ? AND status IN ('ACTIVE', 'TRIALING')
SELECT * FROM subscription_plans WHERE isActive = true
SELECT COUNT(*) FROM usage_records WHERE userId = ? AND recordedAt >= ?
```

---

## 🎮 4. Gamification (Educational Games)

**Repository Used:** `gameRepository` (game.repository.ts)  
**Service:** GameService  
**Endpoint:** `/recursos/juegos/*`

### Test Cases:
- [ ] **Word Search game loads**
  - URL: `http://localhost:3000/recursos/juegos/sopa-de-letras`
  - Expected: Grid with medical terminology
  - Verify: Words related to obstetrics (eclampsia, parto, etc.)

- [ ] **Play Word Search**
  - Find and select words
  - Complete game
  - Expected: Score calculated
  - Verify: Stats updated (games played, score, streak)

- [ ] **Hangman game loads**
  - URL: `http://localhost:3000/recursos/juegos/ahorcado`
  - Expected: Blank word with letter options
  - Verify: Obstetrics medical terms

- [ ] **Play Hangman**
  - Guess letters
  - Win or lose
  - Expected: Current streak updates
  - Verify: Best streak recorded

- [ ] **Game stats page**
  - URL: `/mi-progreso` or game stats section
  - Expected: Stats for both games
  - Verify:
    - Total games played
    - Games won
    - Total score
    - Current streak
    - Best streak

- [ ] **Leaderboard for games**
  - Expected: Top players by game type
  - Verify: Rankings for Word Search and Hangman separate

**Database Queries to Monitor:**
```sql
-- Game stats queries
SELECT * FROM game_stats WHERE userId = ? AND gameType = 'wordsearch'
UPDATE game_stats SET currentStreak = ?, totalScore = ? WHERE userId_gameType = (?, ?)
```

---

## 💰 5. Mercado Pago Integration (Chilean Market)

**Repository Used:** `paymentRepository`, `subscriptionRepository`  
**Service:** SubscriptionService  
**Endpoint:** `/api/subscription/create-payment`

### Test Cases:
- [ ] **Payment preference created**
  - Click "Suscribirse" on Premium plan
  - Expected: Mercado Pago API called
  - Verify console logs:
    - "Looking for user"
    - "Looking for plan"
    - "MP payment preference created"

- [ ] **Redirect to Mercado Pago**
  - Expected: Redirect to `sandbox.mercadopago.cl` (test) or `mercadopago.cl` (prod)
  - Verify: Correct amount in CLP
  - Check: Chilean RUT validation

- [ ] **Webhook receives payment notification**
  - URL: `/api/webhooks/mercadopago`
  - Simulate payment success
  - Expected: Subscription activated
  - Verify logs: "Payment approved", "Subscription activated"

- [ ] **Payment record created**
  - Database table: `payments`
  - Expected: Record with status 'APPROVED'
  - Verify fields:
    - userId
    - amount
    - mpPaymentId
    - status
    - createdAt

- [ ] **Failed payment handling**
  - Simulate payment rejection
  - Expected: User remains on Free tier
  - Verify: Error message shown, no subscription created

**Test Payment Credentials (Mercado Pago Sandbox):**
- Use test credit card numbers from MP documentation
- RUT: Use valid Chilean RUT format (12345678-9)
- Email: `test_user_klinikmat@testuser.com`

---

## 🔍 Additional Verification Points

### Database Connection
- [ ] Check Prisma logs show successful queries
- [ ] Verify read-only replica (prismaRO) used for queries
- [ ] No connection pool errors

### Performance
- [ ] Case browsing loads < 2 seconds
- [ ] Progress dashboard loads < 3 seconds
- [ ] No memory leaks in console

### Error Handling
- [ ] Invalid case ID shows 404
- [ ] Unauthorized access blocked (401)
- [ ] Rate limiting works (429 after many requests)

### Chilean Localization
- [ ] Currency displayed as CLP (Chilean pesos)
- [ ] RUT validation works
- [ ] Obstetrics terminology correct for Chilean medical standards

---

## 📝 Bug Reporting Template

**If issues found, document as:**

```markdown
### Bug: [Short Description]
- **Feature:** Case Browsing / Progress / Subscription / Games / Payment
- **Steps to Reproduce:**
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 
- **Console Errors:** 
- **Database Query Issues:** 
- **Priority:** Critical / High / Medium / Low
```

---

## ✅ Sign-Off Checklist

Before marking Priority 3 as complete:

- [ ] All 5 critical features tested and working
- [ ] No console errors during normal usage
- [ ] Database queries executing correctly (check Prisma logs)
- [ ] Repository pattern working (no direct Prisma calls in services)
- [ ] Chilean market features functional (CLP, RUT, Mercado Pago)
- [ ] Educational content accessible (300+ obstetrics cases)
- [ ] Student analytics accurate (progress, scores, areas)
- [ ] Payment flow tested end-to-end

---

## 🚀 Launch Readiness Score

| Feature | Status | Notes |
|---------|--------|-------|
| Case Browsing | ⏳ Testing | |
| Progress Tracking | ⏳ Testing | |
| Subscriptions | ⏳ Testing | |
| Gamification | ⏳ Testing | |
| Payments | ⏳ Testing | |

**Overall:** ⏳ In Progress

---

## Next Steps After Testing

1. **If all tests pass:** Mark Priority 3 as complete ✅
2. **If bugs found:** Document in bug template above
3. **If critical issues:** Fix immediately before launch
4. **If minor issues:** Add to post-launch backlog
5. **Update test mocks:** For CI/CD reliability (separate task)
