# Project Update TODO

This document lists obsolete and unused code sections identified during the project review (Dec 18, 2025).

## High Priority Actions

### 1. ✅ Fix Missing View File - COMPLETED

- [x] **Action**: Create `views/our-work.ejs` template file
- **Location**: `views/our-work.ejs`
- **Status**: ✅ **FIXED** - File created with comprehensive content about service exchange and OEM repairs
- **Impact**: Critical 500 error resolved - `/our-work` endpoint now works correctly

### 2. ✅ Email Notifications for Form Submissions - COMPLETED

- [x] **Action**: Implement email notifications for contact and enquiry forms
- **Status**: ✅ **IMPLEMENTED**
- **What was added**:
  - New `utils/email.js` module with Nodemailer integration
  - Email notifications for contact form submissions
  - Email notifications for parts enquiry submissions (includes images)
  - Beautiful HTML email templates with all form details
  - Non-blocking email sending (won't fail form submission if email fails)
  - Support for multiple SMTP providers (Gmail, Microsoft 365, SendGrid, etc.)
- **Configuration**: See `EMAIL_SETUP.md` for setup instructions
- **Environment Variables Required**:

  ```env
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_SECURE=false
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password
  NOTIFICATION_EMAIL=admin@ssteering.co.za
  ```

- **Next Steps**:
  1. Run `npm install` to install nodemailer
  2. Configure email settings in `.env` file
  3. Test by submitting a form

### 3. Remove Unused npm Dependencies

- [ ] **Action**: Uninstall the following packages:

  ```bash
  npm uninstall passport passport-google-oauth express-session multer-storage-cloudinary
  ```

- **Packages to Remove**:
  - `passport` (^0.7.0) - Authentication middleware, not used
  - `passport-google-oauth` (^2.0.0) - Google OAuth strategy, not used
  - `express-session` (^1.18.0) - Session management, not used
  - `multer-storage-cloudinary` (^4.0.0) - Multer Cloudinary storage, not used
- **Impact**: Will save ~5MB in node_modules
- **Note**: Google Photos integration uses `googleapis` package directly, not Passport

## Medium Priority Actions

### 4. Remove Obsolete Files

- [ ] **Action**: Delete `views/confirm-error.ejs`

  - **Location**: `views/confirm-error.ejs`
  - **Issue**: View file is never rendered by any route
  - **Impact**: Dead code taking up space

- [ ] **Action**: Delete or archive `googleapi.js` (root level)

  - **Location**: `googleapi.js`
  - **Issue**: Contains standalone test script with `main()` function
  - **Note**: Actual Google Photos integration is in `utils/google-photos.js`
  - **Alternative**: Move to a `scripts/` folder if needed for OAuth setup

- [ ] **Action**: Delete or enable `middleware/error-handler.js`
  - **Location**: `middleware/error-handler.js`
  - **Issue**: File exists but is commented out in `app.js` (lines 59-60)
  - **Alternative**: Enable the middleware by uncommenting in `app.js` if error handling is needed
  - **If Removing**: Also remove the require statement at line 9 of `app.js`

### 5. Clean Up Debug Code

- [ ] **Action**: Remove debug console.log statements

  - **Location 1**: `routes/dynamic.js:45` - `console.log('featured repairs', featuredRepairs)`
  - **Location 2**: `routes/dynamic.js:157` - `console.log('Our work detail Cookies: ', req.cookies)`

- [ ] **Action**: Remove commented example URLs
  - **Location**: `routes/dynamic.js:92-96` - Commented Airtable image URL examples

### 6. Fix Dead Code

- [ ] **Action**: Remove unused IP detection line
  - **Location**: `routes/dynamic.js:195`
  - **Code**: `req.headers['x-forwarded-for'] || req.socket.remoteAddress;`
  - **Issue**: Result is not assigned to any variable (dead code)
  - **Note**: The enquiry route should use `const clientIp = ...` like the contact route does

## Low Priority Actions

### 7. Enhance or Remove CSP Report Endpoint

- [ ] **Action**: Review CSP report endpoint functionality
  - **Location**: `routes/dynamic.js:71-73`
  - **Current**: Only logs violations to console
  - **Options**:
    - Add proper error tracking/logging service
    - Store violations in Airtable
    - Remove if not actively monitoring CSP violations

### 8. Code Cleanup - Error Handler Decision

- [ ] **Action**: Decide on error handling approach
  - **Option A**: Use inline error handlers (current: lines 62-67 in `app.js`)
  - **Option B**: Enable middleware error handlers (currently commented out)
  - **Note**: If choosing Option A, remove `middleware/error-handler.js` and its import

## Recommendations

### Additional Considerations

- [ ] Review if Google Photos integration is actively used

  - If not used, consider removing `utils/google-photos.js` and related dependencies
  - If used, complete the OAuth setup and test thoroughly

- [ ] Consider adding proper logging

  - Replace console.log statements with a proper logging library (e.g., Winston, Pino)
  - Set up log levels (debug, info, warn, error)

- [ ] Environment variable documentation
  - Add `GOOGLE_PHOTOS_ALBUM_ID` to README.md if gallery feature is active

## Summary Statistics

- **Unused Dependencies**: 4 packages (~5MB)
- **Obsolete Files**: 3 files (confirm-error.ejs, googleapi.js, error-handler.js\*)
- **Debug Code Lines**: ~5 lines
- **Missing Files**: 1 file (our-work.ejs)

\*Depends on decision to use middleware or inline error handling

---

**Last Updated**: December 18, 2025
**Reviewed By**: Cursor AI Assistant
