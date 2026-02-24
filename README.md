# Specialised Steering Web Application

A Node.js/Express web application for **Specialised Steering (Pty) Ltd**, a hydraulic component repair and sourcing business based in Germiston, Gauteng, South Africa. The application showcases hydraulic repair services, component sourcing, and service exchange programs for mining, agricultural, and automotive industries.

## Features

- 🏠 **Dynamic Homepage** - Professional hydraulic engineering services showcase with integrated contact form
- 🔧 **Our Work Page** - Detailed information about service exchange and OEM repair services, with links to photo gallery and social media (Instagram, LinkedIn)
- 📧 **Contact Form** - Customer inquiry form with spam protection and email notifications
- 🔍 **Parts Enquiry** - Specialised form for hydraulic component sourcing with image uploads
- 📸 **Photo Gallery** - Display of completed repair jobs powered by Google Photos Picker API and Cloudinary
- 🖼️ **Image Optimisation** - Automatic WebP conversion and quality optimisation via Cloudinary
- 📬 **Email Notifications** - Automatic email alerts for all form submissions with full details (✅ Production ready)
- 🧪 **A/B Testing System** - Cookie-based variant assignment with server-side and GA4 tracking
- 🔐 **Admin Panel** - Gallery management, A/B test reporting, and password reset functionality
- 🛡️ **Security** - reCAPTCHA v2, rate limiting, honeypot fields, spam detection, CSP headers, and comprehensive security logging
- 🚀 **Performance** - Response compression, static file caching, and optimised image delivery
- 🔗 **Social Media Integration** - Links to Instagram and LinkedIn for recent work updates

## Technology Stack

- **Runtime**: Node.js v20.19.0 (required)
- **Framework**: Express.js 4.18.3
- **Template Engine**: EJS 3.1.9
- **Database**: Airtable (form submissions, security logs)
- **Data Storage**: JSON files (gallery metadata, password reset tokens)
- **Image Hosting**: Cloudinary
- **Email**: Nodemailer (supports Gmail, Microsoft 365, SendGrid, any SMTP)
- **Authentication**: Google OAuth 2.0 (Google Photos Picker API), Basic Auth (admin panel)
- **Security**: reCAPTCHA v2, Content Security Policy, Rate Limiting, Spam Detection
- **Analytics**: Google Analytics 4 (GA4) with custom A/B testing events

## Prerequisites

- **Node.js v20.19.0** (required - see [Node.js Version Management](#nodejs-version-management))
- npm or yarn
- Airtable account and API key
- Cloudinary account
- Google reCAPTCHA v2 site key and secret
- (Optional) Google Cloud Platform credentials for Photos Picker API (for gallery feature)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd specialised
```

2. **Install dependencies**

```bash
npm install
```

(On servers where npm is not in PATH, use cPanel Node.js Setup → Run NPM Install, or run `npm install` in an environment where Node is available.)

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3300

# Airtable Configuration
AT_ENDPOINT=https://api.airtable.com
AT_API_KEY=your_airtable_api_key
BASE=your_airtable_base_id

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# reCAPTCHA Configuration (v2 for forms)
reCAPTCHA_v2_SECRET_KEY=your_recaptcha_v2_secret_key
reCAPTCHA_v2_SITE_KEY=your_recaptcha_v2_site_key

# Email Configuration (for form notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
NOTIFICATION_EMAIL=email@example.com
```

**Note**: Email configuration supports both modern (`EMAIL_*`) and legacy (`SMTP_*`) variable names for backward compatibility.

**Additional environment variables for Google Photos Picker API and admin features:**

```env
# Google Photos Picker API OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://www.specialisedsteering.com/oauth2callback

# Admin Authentication (for gallery management and A/B reports)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@example.com  # For password reset emails

# Gallery Configuration
GALLERY_REPLACE_MODE=false  # Set to true to replace all items, false to append
CLOUDINARY_FOLDER=gallery/google-photos  # Optional: Cloudinary folder for gallery images

# Health Check Configuration (Optional)
HEALTHCHECK_EMAIL=email@example.com  # For system health notifications

# Environment
NODE_ENV=production  # Set to "production" for production deployments (affects cookie security)

# Google Analytics: optional comma-separated IPs to exclude (company/home); no gtag loaded for these
# ANALYTICS_EXCLUDE_IPS=1.2.3.4,5.6.7.8
```

Alternatively, you can copy `.env.example` to `.env` and fill in your values.

4.**Google Photos Picker API Setup (Optional)**

If you want to enable the Google Photos gallery integration:

1. Create a project in Google Cloud Platform
2. Enable the **Google Photos Picker API** (not the Library API)
3. Create OAuth 2.0 credentials (Desktop app type)
4. Download credentials as `credentials.json` and place in root directory
5. Run the OAuth setup: `node setup-google-picker-auth.js`
6. Configure environment variables (see Environment Variables section)
7. Access admin UI at `/admin/gallery` (protected by basic auth)

**Note:** The Photos Picker API uses a different OAuth scope than the deprecated Library API:

- Scope: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`

## Node.js Version Management

This project requires **Node.js v20.19.0** (the server is configured for this version).

### Local Development Setup

The project includes a `prestart` script that automatically validates the Node.js version before starting the server.

**For nvm users (recommended):**

1. Install Node.js v20.19.0:

   ```bash
   nvm install 20.19.0
   nvm use 20.19.0
   ```

2. The `.nvmrc` file will automatically use the correct version when you `cd` into the project (if auto-switch is enabled)

3. Verify version:

   ```bash
   node --version
   # Should output: v20.19.0
   ```

4. Start the server:

   ```bash
   npm start
   ```

If you see an error about Node.js version mismatch:

```bash
❌ Error: Node.js v20.19.0 required, but found vX.X.X
   Run: nvm use 20
```

Run `nvm use 20` or `nvm use 20.19.0` to switch to the correct version.

**For other version managers:**

- **fnm**: `fnm use` (reads `.nvmrc`)
- **asdf**: `asdf install nodejs 20.19.0 && asdf local nodejs 20.19.0`
- **n**: `n 20.19.0`

### Cursor IDE and agent rules

This project is developed using **Cursor IDE**. Agent rules are defined in `.cursor/rules/` (`.mdc` files) and provide consistent guidance for AI-assisted editing—for example, checking the git reflog before merging into a parent branch, keeping client communications in the git-ignored `MD/` folder, and updating the completed list in `TODO.md` for invoicing and reporting. These rules apply when working in Cursor and help keep contributions aligned with project conventions.

### Upgrading Node.js Version (Local Development)

If you need to upgrade Node.js for local development:

1. **Update version files:**

   - Update `.nvmrc` with the new version (e.g., `21.0.0`)
   - Update `.node-version` with the major version (e.g., `21`)
   - Update `package.json` `prestart` script to check for the new version

2. **Install the new version:**

   ```bash
   nvm install 21.0.0
   nvm use 21.0.0
   ```

3. **Rebuild native dependencies:**

   ```bash
   npm install
   # Or reinstall all dependencies:
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Test the application:**

   ```bash
   npm start
   node scripts/test-admin-routes.js
   ```

5. **Commit the changes:**

   ```bash
   git add .nvmrc .node-version package.json package-lock.json
   git commit -m "chore: upgrade Node.js to v21.0.0"
   ```

### Upgrading Node.js Version (Production/Staging Servers)

**⚠️ Important:** Always test upgrades in staging before production.

1. **Backup the current setup:**

   - Document current Node.js version: `node --version`
   - Backup database files and configuration

2. **On the server, install the new Node.js version:**

   **For servers using nvm:**

   ```bash
   ssh user@server
   cd /path/to/application
   nvm install 21.0.0
   nvm use 21.0.0
   ```

   **For servers using system Node.js (via package manager):**

   - Update system Node.js using your server's package manager
   - Or install nvm on the server for better version management

3. **Reinstall dependencies (if needed):**

   ```bash
   cd /path/to/application
   # Or if you want a clean rebuild:
   rm -rf node_modules
   npm ci  # Uses package-lock.json for reproducible builds
   ```

4. **Verify the installation:**

   ```bash
   node --version  # Should match the new version
   ```

5. **Restart the application:**

   - For Passenger: `touch tmp/restart.txt`
   - For PM2: `pm2 restart app`
   - For systemd: `systemctl restart your-service`
   - Or restart your process manager

6. **Monitor for errors:**

   - Check application logs
   - Verify database operations work correctly
   - Test critical functionality

7. **Rollback plan (if needed):**

   ```bash
   # Switch back to previous version
   nvm use 20.19.0
   npm install
   # Restart application
   ```

### Why Version Management Matters

The server is configured for Node.js v20.19.0. The `prestart` script validates the version before starting to ensure consistency between development and production environments.

For more details, see [NODE_VERSION.md](./NODE_VERSION.md).

## Usage

### Development

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3300` (or your configured PORT).

**Note:** The server will automatically check that you're using Node.js v20.19.0 before starting. If you get a version error, see [Node.js Version Management](#nodejs-version-management) below.

### Production

For production deployment, ensure:

1. **Node.js v20.19.0 is installed** on the server (see [Node.js Version Management](#nodejs-version-management))
2. All environment variables are properly configured
3. Static assets are served with proper caching headers
4. Trust proxy is enabled if behind a reverse proxy
5. SSL/TLS is configured at the web server level
6. Dependencies are installed: `npm install` or `npm ci`

## Project Structure

```txt
specialised/
├── app.js                    # Main application entry point
├── googleapi.js              # Google OAuth utilities
├── package.json              # Dependencies and metadata
├── middleware/
│   └── error-handler.js      # Error handling middleware
├── routes/
│   ├── default.js            # Main routes (home, contact, enquiry)
│   └── dynamic.js            # Dynamic pages (about, gallery, sitemap)
├── utils/
│   ├── airtable.js           # Airtable configuration
│   ├── cloudinary.js         # Cloudinary configuration
│   ├── google-photos.js      # Google Photos API utilities
│   └── multer.js             # File upload configuration
├── views/                    # EJS templates
│   ├── *.ejs                 # Page templates
│   └── includes/             # Reusable components
├── public/                   # Static assets
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side JavaScript
│   ├── images/               # Image assets
│   ├── fonts/                # Web fonts
│   └── uploads/              # Temporary file uploads
└── images/                   # Source images
```

## Airtable Schema

The application uses two main Airtable tables:

### `webForms` Table

Stores form submissions from contact and enquiry forms.

- `name`, `email`, `company`, `phone`, `message` - Basic contact info
- `status` (Single Select) - Processing status
- `form` (Single Select) - Form type (contact/enquiry)
- `ip` (Text) - Submitter IP address
- `imageUploads` (Attachment) - Uploaded images
- `brand`, `type`, `partNo`, `partDesc`, `serialNo` - Part information (enquiry form)
- `street`, `town`, `postal`, `region`, `country` - Address (enquiry form)

**Automatic Email Notifications**: When a form is submitted, an email notification is automatically sent to the configured email address with all submission details.

### `securityLogs` Table

Stores security events for monitoring and analysis.

- `timestamp` (Date/Time) - When the event occurred
- `eventType` (Single Select) - Type of security event (reCAPTCHA failure, spam attempt, CSP violation, rate limit)
- `ip` (Text) - IP address of the request
- `userAgent` (Long Text) - Browser user agent
- `formType` (Single Select) - Form type if applicable (contact/enquiry)
- `details` (Long Text) - Additional event details
- `referrer` (Text) - HTTP referrer

## API Integrations

### Cloudinary

Images are automatically optimised and served via Cloudinary CDN with:

- WebP format conversion
- Quality optimisation (`q_auto:good`)
- Organised folder structure: `Specialised/public/uploads/{customerName}/`
- Gallery images: `gallery/google-photos/`
- Streaming uploads from URLs (for Google Photos integration)

### Google Services

- **Google Analytics 4** (G-V4W8VP4GL8) - Website traffic analytics and A/B testing event tracking
- **reCAPTCHA v2** - Server-side spam protection on forms
- **Google Photos Picker API** - Photo selection for gallery (replaces deprecated Library API)
- **Google OAuth 2.0** - Authentication for Google Photos Picker API
  - Scope: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`
  - Token stored in `token.json` with automatic refresh

### Email Services (Nodemailer)

- **SMTP Support** - Works with Gmail, Microsoft 365, SendGrid, or any SMTP server
- **Email Types:**
  - Contact form notifications
  - Parts enquiry notifications
  - Password reset emails
  - System health check notifications
- **Features:**
  - HTML and plain text formats
  - Timezone-aware timestamps (Africa/Johannesburg)
  - Non-blocking async operation (form submissions succeed even if email fails)
  - TLS configuration support
  - Custom TLS servername for certificate mismatches
- **Configuration:** See environment variables section below

## A/B Testing System

The application includes a comprehensive A/B testing system for optimising meta descriptions and content:

### Features

- **Cookie-based Variant Assignment** - 90-day persistence for consistent user experience
- **Server-Side Logging** - File-based logging to `logs/ab-tests.log` for detailed analysis
- **GA4 Event Tracking** - Client-side tracking of exposures and conversions
- **Reporting Tools** - CLI tool for generating statistical reports
- **Multiple Test Support** - Configurable test registry with traffic split control

### Current Active Tests

- **Near-me Meta Description Test** (`near_me_meta`)
  - Routes: `/`, `/our-work`, `/about`, `/contact`
  - Variants: A (control), B (near-me optimised)
  - Traffic Split: 50/50
  - Start Date: January 26, 2026

### Usage

**View A/B Test Report:**
```bash
# All tests, last 7 days
node scripts/ab-test-report.js

# Specific test, last 30 days
node scripts/ab-test-report.js near_me_meta 30
```

**Access A/B Report API:**
- Navigate to `/admin/ab-report` (requires basic auth)
- Returns JSON with exposure and conversion stats

**For detailed documentation, see:**
- [A/B Testing Master Guide](./docs/README-AB-TESTING.md)
- [A/B Testing Overview](./docs/ab-testing-overview.md)
- [Deployment Guide](./docs/ab-testing-deployment-guide.md)
- [Technical Project Overview](./docs/PROJECT-OVERVIEW.md)

## Admin Panel

The admin panel provides management tools for gallery and testing:

### Gallery Management (`/admin/gallery`)

1. **Access Admin UI:** Navigate to `/admin/gallery` (requires basic auth)
2. **Update Gallery:**
   - Click "Update Gallery from Google Photos"
   - Select photos in the Google Photos Picker (search for album name)
   - Choose replace mode (replace all) or append mode (add to existing)
   - Photos are automatically uploaded to Cloudinary and stored in JSON file (`data/gallery.json`)

**Note:** The Google Photos Picker API has a 30-second timeout. You must complete photo selection within this time limit (this is a Google API limitation, not an application limitation).

### A/B Test Reporting (`/admin/ab-report`)

- View exposure and conversion statistics
- JSON API endpoint for integration with dashboards
- Configurable time range (default: last 30 days)

### Password Reset (`/auth/forgot-password`)

- Token-based password reset system
- Email notifications with reset links
- 1-hour token expiration
- Automatic server restart after password change (Passenger)

### Setting Admin Credentials

Use the provided script to set admin credentials:

```bash
node scripts/set-admin-credentials.js
```

Or set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables manually.

**Password Reset:**
- Navigate to `/auth/forgot-password` to request a password reset
- Email will be sent with a reset link valid for 1 hour
- No basic auth required for password reset flow

## Security Features

- **Content Security Policy** - Report-only mode with violation reporting to Airtable
- **reCAPTCHA v2** - Server-side verification for all form submissions
- **Rate Limiting** - 5 form submissions per 15 minutes per IP
- **Honeypot Fields** - Hidden form fields to catch bots
- **Time-to-Submit Validation** - Minimum 3 seconds before form can be submitted
- **Spam Detection** - Keyword filtering, suspicious email domain detection
- **Security Logging** - All security events logged to Airtable (reCAPTCHA failures, spam attempts, CSP violations)
- **File Upload Validation** - Restricted to image files only (10MB max) with MIME type validation
- **Request Size Limits** - 10MB maximum payload
- **WordPress Parameter Blocking** - Returns 410 Gone for WordPress/Elementor artifacts
- **Trust Proxy** - Accurate IP detection behind reverse proxies
- **Cookie Security** - httpOnly, secure (production), sameSite: lax
- **Admin Security** - Basic Auth for admin routes, token-based password reset

## Contributing

This is a private client project. For any issues or enhancement requests, please contact the maintainers.

## Maintenance & Support

- **Maintainers**: Sue Holder, Design Develop Host
- **Version**: 1.0.1
- **License**: ISC

## Recent Enhancements (2026)

- [x] **A/B Testing System** - Complete infrastructure with server-side and GA4 tracking (January 2026)
- [x] **Security Logging** - Comprehensive security event logging to Airtable (January 2026)
- [x] **Password Reset System** - Token-based admin password reset with email notifications (January 2026)
- [x] **Google Photos Picker API** - Migration from deprecated Library API to Photos Picker API (December 2025)
- [x] **Email Notifications** - Multi-provider SMTP support with HTML/text formats (December 2025)
- [x] **Rate Limiting** - Form submission rate limiting per IP (December 2025)
- [x] **Spam Detection** - Enhanced spam detection with keyword and email domain filtering (December 2025)

## Future Enhancements

- [ ] Implement admin dashboard for managing Airtable records
- [ ] Enhance IP blacklist with database storage
- [ ] Multi-armed bandit for A/B testing (automatic traffic adjustment to winning variant)
- [ ] Real-time A/B testing dashboard with live stats
- [ ] Enforce CSP (currently report-only mode)
- [ ] Implement comprehensive application logging system
- [ ] Add user segmentation for A/B tests (mobile vs. desktop, new vs. returning)

## License

ISC License - Copyright (c) Design Develop Host

---

For more detailed technical information, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
