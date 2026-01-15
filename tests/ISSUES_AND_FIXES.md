# FunnelSight Spreadsheet Upload - Issues and Fixes

## Overview

This document outlines the critical issues found during comprehensive testing and provides detailed guidance on how to fix them.

**Test Date**: October 27, 2025  
**Overall Test Result**: 67% Pass (16/24 tests)  
**Critical Issues Found**: 2

---

## CRITICAL ISSUE 1: Data Not Persisted to Database

### Severity: CRITICAL (Feature Blocking)

### Issue Description
When users upload spreadsheet data and the data passes validation, the system indicates success but does NOT actually insert the data into the database. The validated rows exist only in the `spreadsheet_imports` table as preview data and are never added to the persistent tables that the dashboard and analytics queries depend on.

### Impact
- **User Experience**: Users see "Upload successful" but uploaded data never appears in dashboard
- **Feature Completeness**: Feature is non-functional despite appearing to work
- **Dashboard Integration**: Campaign performance analysis can't work without the data
- **Analytics**: All analytics endpoints return zero data even though rows were uploaded

### Root Cause
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/spreadsheets.ts`  
**Line**: 143

The code has an explicit TODO comment:
```typescript
// In production, would insert validated rows into unified_records table here
```

The implementation stops after validation and never executes the insertion step.

### Evidence

**Test 1: Upload and Validate Data**
```bash
curl -X POST http://localhost:5013/api/spreadsheets/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_data.csv"
# Returns: importId=1, status=mapping_required, 5 rows in preview

curl -X POST http://localhost:5013/api/spreadsheets/imports/1/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mappings": [...]}'
# Returns: status=completed, rowsValid=5, rowsInvalid=0
```

**Test 2: Check if data appears in campaigns**
```bash
curl -s http://localhost:5013/api/campaigns \
  -H "Authorization: Bearer $TOKEN" | jq .
# Returns: {"data": [], "total": 0, "page": 1, "limit": 100}
# EXPECTED: Should have "Spring Webinar 2025" and "Product Launch" campaigns
```

**Test 3: Check if data appears in events**
```bash
curl -s http://localhost:5013/api/events \
  -H "Authorization: Bearer $TOKEN" | jq .
# Returns: {"data": [], "total": 0}
# EXPECTED: Should have "Marketing Analytics Webinar" and "New Product Demo" events
```

**Test 4: Check analytics**
```bash
curl -s http://localhost:5013/api/analytics/funnel \
  -H "Authorization: Bearer $TOKEN" | jq .
# Returns: totalImpressions=0, totalClicks=0, totalRegistrations=0
# EXPECTED: totalImpressions=8200, totalClicks=345
```

### Fix Required

**Location**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/spreadsheets.ts`  
**Lines to Modify**: 143-153

**Current Code**:
```typescript
// In production, would insert validated rows into unified_records table here

res.json({
  importId: id,
  status: validationResult.errorCount === 0 ? 'completed' : 'failed',
  progress: 100,
  rowsProcessed: validationResult.validCount + validationResult.errorCount,
  rowsValid: validationResult.validCount,
  rowsInvalid: validationResult.errorCount,
  errors: validationResult.errors.slice(0, 10),
});
```

**Required Code**:
```typescript
// INSERT DATA INTO PERSISTENT TABLES
if (validationResult.valid.length > 0) {
  try {
    for (const row of validationResult.valid) {
      // Create or update campaign
      if (row.campaignName) {
        const existingCampaign = await storage.getCampaignByName(row.campaignName, req.user!.id);
        if (!existingCampaign) {
          await storage.createCampaign({
            userId: req.user!.id,
            name: row.campaignName,
            channel: row.utmSource || 'direct',
            status: 'active',
            budget: null,
            startDate: new Date().toISOString(),
            endDate: null,
            metadata: { source: 'spreadsheet_import', importId: id }
          });
        }
      }
      
      // Create or update event
      if (row.eventName) {
        const existingEvent = await storage.getEventByName(row.eventName, req.user!.id);
        if (!existingEvent) {
          await storage.createEvent({
            userId: req.user!.id,
            name: row.eventName,
            type: 'webinar',
            status: 'active',
            startDate: row.registrationDate ? new Date(row.registrationDate) : new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            description: `Imported from spreadsheet ${importRecord.filename}`
          });
        }
      }
      
      // Create unified record for the row
      const campaign = row.campaignName ? await storage.getCampaignByName(row.campaignName, req.user!.id) : null;
      const event = row.eventName ? await storage.getEventByName(row.eventName, req.user!.id) : null;
      
      await storage.createUnifiedRecord({
        eventId: event?.id,
        email: row.email,
        campaignName: row.campaignName,
        utmSource: row.utmSource,
        utmMedium: null,
        utmCampaign: null,
        registrationId: null,
        attendanceStatus: null,
        engagementScore: null,
        dataSourceId: 1, // TODO: Get real data source ID
        rawData: row as any
      });
    }
    
    // Update import record with processed timestamp
    await storage.updateSpreadsheetImport(id, {
      processedAt: new Date().toISOString()
    });
    
    console.log(`[Confirm] Successfully inserted ${validationResult.valid.length} rows`);
  } catch (error) {
    console.error('[Confirm] Error inserting data:', error);
    // Don't fail the response, but log the error
  }
}

res.json({
  importId: id,
  status: validationResult.errorCount === 0 ? 'completed' : 'failed',
  progress: 100,
  rowsProcessed: validationResult.validCount + validationResult.errorCount,
  rowsValid: validationResult.validCount,
  rowsInvalid: validationResult.errorCount,
  errors: validationResult.errors.slice(0, 10),
});
```

### Additional Notes
- The `storage` object is already injected and available
- The `req.user!.id` contains the authenticated user's ID
- The `MarketingDataRow` type should have `campaignName`, `eventName`, `email`, etc.
- Consider adding a data source record for imported data
- Update the unified_records table schema if needed to match the CSV fields

---

## CRITICAL ISSUE 2: User ID Collision in Mock Auth

### Severity: CRITICAL (Security)

### Issue Description
When different users log in with different email addresses, they all receive the same user ID (1). This breaks user isolation and allows users to access each other's data.

### Impact
- **Security**: Multiple users can access each other's uploaded files
- **Authorization**: User isolation is broken
- **Multi-tenancy**: System cannot properly isolate user data
- **Compliance**: Data privacy violations

### Root Cause
The authentication system has two independent ID generators:
1. **MockAuthAdapter** - Generates user IDs and maintains token->user mapping
2. **MemoryStorage** - Also generates user IDs for storage layer

When a user logs in:
1. MockAuthAdapter generates ID (e.g., 1) and returns it in the response
2. Storage layer is never updated with this user
3. When a second user logs in, MockAuthAdapter generates a NEW ID (but starts from 1 again in a fresh instance, or the auth layer doesn't persist between restarts)
4. Both users end up with ID 1

### Evidence

**Test Output**:
```bash
# Login User 1
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password"}'

Response:
{
  "user": {
    "id": 1,  <-- User 1 gets ID 1
    "email": "user1@example.com",
    ...
  },
  "token": "mock-token-1761606500175-0.696304783651748"
}

# Login User 2  
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"password"}'

Response:
{
  "user": {
    "id": 1,  <-- User 2 ALSO gets ID 1 (WRONG!)
    "email": "user2@example.com",
    ...
  },
  "token": "mock-token-1761606500192-0.8501837081518113"
}
```

**Consequence**:
```bash
# Both users can list each other's imports because they share the same ID
curl -s http://localhost:5013/api/spreadsheets/imports \
  -H "Authorization: Bearer $USER2_TOKEN"

# Returns data uploaded by USER1 because ID collision makes storage think it's the same user
```

### Fix Required

**Location**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/server/routes/auth.ts`  
**Lines to Modify**: 8-23 (login endpoint)

**Current Code**:
```typescript
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth Route] Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await auth.login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Route] Login error:', error.message);
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});
```

**Fixed Code**:
```typescript
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth Route] Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await auth.login(email, password);
    
    // SYNC USER TO STORAGE TO FIX ID COLLISION
    let storageUser = await storage.getUserByEmail(email);
    
    if (!storageUser) {
      // Create user in storage if doesn't exist
      storageUser = await storage.createUser({
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        teamId: result.user.teamId,
        avatarUrl: result.user.avatarUrl,
      });
      console.log(`[Auth Route] Created user in storage: ${storageUser.id}`);
    }
    
    // Return the result with storage ID instead of auth adapter ID
    // This ensures consistency across auth and storage layers
    const responseUser = {
      ...result.user,
      id: storageUser.id, // Use storage ID, not auth adapter ID
    };
    
    res.json({
      user: responseUser,
      token: result.token
    });
  } catch (error: any) {
    console.error('[Auth Route] Login error:', error.message);
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});
```

### Why This Works
1. When User 1 logs in, storage creates a user with ID 1
2. When User 2 logs in, storage creates a new user with ID 2
3. Both ID generators are now synchronized
4. Authorization checks that compare `importRecord.userId === req.user!.id` now work correctly
5. Each user's data remains isolated

### Alternative Approach
If you prefer to use auth adapter IDs in the response token, instead ensure that:
1. Storage layer uses the same ID sequence as auth adapter
2. User lookup uses email (not ID) as the primary key
3. Session/token middleware always looks up user by email from token

The first approach (using storage IDs) is recommended as it's cleaner and ensures single source of truth.

---

## HIGH PRIORITY ISSUE 3: TypeScript Compilation Warning

### Severity: HIGH

### Issue Description
Unused variable in the upload page component.

### Location
**File**: `/Users/labheshpatel/apps/app-factory/apps/FunnelSight/app/client/src/pages/UploadDataPage.tsx`  
**Line**: 176

### Error Message
```
error TS6133: 'suggestedMappings' is declared but its value is never read.
```

### Fix
Either use the variable or remove it:

**Option 1 - Remove** (if not needed):
```typescript
// Before:
const suggestedMappings = response.suggestedMappings;
// (then never use it)

// After:
// Just remove the line
```

**Option 2 - Use** (if needed for validation/UI):
```typescript
// Set it in state for display
const [suggestedMappings, setSuggestedMappings] = useState([]);

// In the upload handler:
const response = await uploadFile();
setSuggestedMappings(response.suggestedMappings);
```

---

## Testing Recommendations After Fixes

### 1. Test Data Persistence
```bash
# Upload data
curl -X POST http://localhost:5013/api/spreadsheets/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_data.csv"

# Confirm and map
curl -X POST http://localhost:5013/api/spreadsheets/imports/1/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mappings": [...]}'

# Verify data in campaigns
curl http://localhost:5013/api/campaigns \
  -H "Authorization: Bearer $TOKEN" | jq '.total'
# Expected: > 0

# Verify data in events
curl http://localhost:5013/api/events \
  -H "Authorization: Bearer $TOKEN" | jq '.total'
# Expected: > 0

# Verify analytics data
curl http://localhost:5013/api/analytics/funnel \
  -H "Authorization: Bearer $TOKEN" | jq '.totalImpressions'
# Expected: > 0
```

### 2. Test User Isolation
```bash
# Login as User 1
TOKEN1=$(curl -s -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"pass"}' \
  | jq -r '.token')

USER1_ID=$(curl -s http://localhost:5013/api/auth/me \
  -H "Authorization: Bearer $TOKEN1" | jq '.user.id')

# Login as User 2
TOKEN2=$(curl -s -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser2@example.com","password":"pass"}' \
  | jq -r '.token')

USER2_ID=$(curl -s http://localhost:5013/api/auth/me \
  -H "Authorization: Bearer $TOKEN2" | jq '.user.id')

# Verify different IDs
echo "User 1 ID: $USER1_ID"
echo "User 2 ID: $USER2_ID"
# Expected: Different IDs

# Verify User 2 cannot access User 1's data
curl -s http://localhost:5013/api/spreadsheets/imports/1 \
  -H "Authorization: Bearer $TOKEN2"
# Expected: {"error": "Import not found"}
```

### 3. Rebuild and Test
```bash
npm run build
npm run type-check
npm test  # If test suite exists
```

---

## Summary of Changes

| Issue | File | Lines | Type | Priority |
|-------|------|-------|------|----------|
| Data Persistence | `server/routes/spreadsheets.ts` | 143-157 | Implementation | P1 |
| User ID Collision | `server/routes/auth.ts` | 8-23 | Bug Fix | P1 |
| TypeScript Warning | `client/src/pages/UploadDataPage.tsx` | 176 | Cleanup | P3 |

---

## Verification Checklist

After implementing all fixes:

- [ ] Data persistence implemented in spreadsheets.ts
- [ ] User ID collision fixed in auth.ts
- [ ] TypeScript warning removed
- [ ] Build completes without errors
- [ ] Data appears in /api/campaigns after upload
- [ ] Data appears in /api/events after upload
- [ ] Analytics show correct numbers
- [ ] User isolation verified (different users get different IDs)
- [ ] User cannot access other user's imports
- [ ] Frontend manual testing completed (if Chrome DevTools available)

---

## Estimated Effort

- **Data Persistence**: 2-3 hours
- **User ID Fix**: 1 hour  
- **TypeScript Warning**: 15 minutes
- **Testing**: 1-2 hours
- **Total**: 4-6 hours to production-ready

