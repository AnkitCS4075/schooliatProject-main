# School Admin Dashboard Unauthorized Error - Root Level Fix

## Problem
School admin users were getting "unauthorized" (403 Forbidden) errors when accessing the dashboard page (`/statistics/dashboard`).

## Root Cause Analysis

### Issue: Role Permissions Not Synced with Code
**Root Cause**: 
- The `createDefaultRoles()` function in `role.service.js` only creates roles if they don't exist in the database
- If a role (like SCHOOL_ADMIN) was created before new permissions (like `GET_DASHBOARD_STATS`) were added to the code, the database role won't have those permissions
- When a school admin logs in:
  1. The `authorize` middleware fetches the user's role from the database
  2. The role has the old permissions (without `GET_DASHBOARD_STATS`)
  3. The `withPermission` middleware checks if `GET_DASHBOARD_STATS` is in the permissions array
  4. It's not there, so it returns 403 Forbidden

**Why This Happens**:
- Permissions are defined in `role.service.js` in the `defaultRolePermissionsMap`
- When roles are first created, they get the permissions from this map
- But if permissions are added later to the code, existing roles in the database don't get updated
- The `createDefaultRoles()` function only creates missing roles, it doesn't update existing ones

## Root Level Solution

### Fix 1: Added Role Permission Sync Function
**File**: `Backend/src/services/role.service.js`

**Changes Made**:
1. Moved `defaultRolePermissionsMap` to module level so it can be reused
2. Created `updateRolePermissions()` function that:
   - Fetches all existing roles from the database
   - Compares their permissions with the expected permissions from `defaultRolePermissionsMap`
   - Updates any roles that have outdated permissions
   - Logs which roles were updated

**Code Added**:
```javascript
const updateRolePermissions = async () => {
  const existingRoles = await prisma.role.findMany({
    where: { deletedAt: null },
  });

  const updates = [];
  for (const role of existingRoles) {
    const expectedPermissions = defaultRolePermissionsMap[role.name];
    if (expectedPermissions) {
      // Check if permissions need updating
      const currentPermissions = role.permissions || [];
      const expectedSet = new Set(expectedPermissions);
      const currentSet = new Set(currentPermissions);

      // Check if permissions are different
      const needsUpdate =
        expectedPermissions.length !== currentPermissions.length ||
        expectedPermissions.some((p) => !currentSet.has(p)) ||
        currentPermissions.some((p) => !expectedSet.has(p));

      if (needsUpdate) {
        logger.info(
          {
            roleName: role.name,
            currentPermissions: currentPermissions.length,
            expectedPermissions: expectedPermissions.length,
          },
          "Updating role permissions",
        );
        updates.push(
          prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: expectedPermissions,
              updatedBy: "system",
            },
          }),
        );
      }
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
    logger.info(`Updated permissions for ${updates.length} role(s)`);
  } else {
    logger.info("All roles have up-to-date permissions");
  }
};
```

### Fix 2: Call Permission Sync on Server Startup
**File**: `Backend/src/server.js`

**Changes Made**:
- Added call to `updateRolePermissions()` after `createDefaultRoles()` in the `setupData()` function
- This ensures roles are synced with the latest permissions every time the server starts

**Code Added**:
```javascript
async function setupData() {
  try {
    await roleService.createDefaultRoles();
    // Update existing roles with latest permissions
    await roleService.updateRolePermissions();
    await userService.createSuperAdmin();
    // ...
  }
}
```

## Benefits

1. **Automatic Sync**: Roles are automatically synced with code on every server startup
2. **Future-Proof**: Any new permissions added to roles will automatically be applied to existing roles
3. **No Manual Intervention**: No need to manually update roles or run migration scripts
4. **Root Level Fix**: Addresses the root cause (permission sync) rather than patching individual permissions
5. **Comprehensive**: Updates all roles, not just SCHOOL_ADMIN
6. **Safe**: Only updates roles that need updating, doesn't affect roles that are already up-to-date

## How It Works

1. **Server Startup**: When the server starts, `setupData()` is called
2. **Create Missing Roles**: `createDefaultRoles()` creates any roles that don't exist
3. **Sync Permissions**: `updateRolePermissions()` checks all existing roles and updates their permissions to match the code
4. **User Login**: When a school admin logs in, they get the updated role with all permissions
5. **Dashboard Access**: The `withPermission` middleware finds `GET_DASHBOARD_STATS` in the permissions array and allows access

## Testing

After this fix:
1. Restart the backend server
2. Check server logs for "Updated permissions for X role(s)" message
3. Log in as school admin
4. Access the dashboard - should work without 403 errors

## Files Modified

1. `/root/master-schooliat/Backend/src/services/role.service.js`
   - Moved `defaultRolePermissionsMap` to module level
   - Added `updateRolePermissions()` function
   - Exported `updateRolePermissions` in roleService

2. `/root/master-schooliat/Backend/src/server.js`
   - Added call to `updateRolePermissions()` in `setupData()`

## Prevention

This fix ensures that:
- Roles are always in sync with the code
- New permissions are automatically applied to existing roles
- No manual database updates are needed when permissions change
- The system is self-healing - roles update themselves on server restart

