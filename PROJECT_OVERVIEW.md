# Project Overview: Specialised Steering Web Application

## Project Description

Specialised Steering Web Application is a Node.js/Express-based web application for **Specialised Steering (Pty) Ltd**, a hydraulic component repair and sourcing business based in Germiston, Gauteng, South Africa. The application serves as a business website showcasing hydraulic repair services, component sourcing, and service exchange programs for mining, agricultural, and automotive industries.

## Technology Stack

### Core Technologies

- **Runtime**: Node.js v20.19.0 (required, enforced via prestart script)
- **Framework**: Express.js 4.17.1
- **Template Engine**: EJS 3.1.6
- **Language**: JavaScript (ES6+)

### Key Dependencies

- **Airtable** (^0.11.1) - Database/CRM integration for storing form submissions and security logs
- **Cloudinary** (^1.27.1) - Image hosting and optimization service
- **Multer** (^1.4.3) - File upload handling middleware
- **Multer Storage Cloudinary** (^4.0.0) - Direct Cloudinary upload support
- **Google APIs** (^169.0.0) - Google OAuth 2.0 and Photos Picker API integration
- **Nodemailer** (^7.0.11) - Email notification system
- **JSON file storage** - File-based storage for gallery metadata and password reset tokens (no dependencies)
- **reCAPTCHA v2** - Server-side form spam protection
- **Compression** (^1.7.4) - Response compression middleware
- **Cookie Parser** (^1.4.6) - Cookie handling
- **Request IP** (^2.1.3) - Client IP address detection
- **Express Rate Limit** (^8.2.1) - Rate limiting middleware
- **Serve Favicon** (^2.5.0) - Favicon serving

## Project Structure

```txt
specialised/
├── app.js                           # Main application entry point
├── package.json                     # Dependencies and metadata
├── .env                             # Environment variables (untracked)
├── .nvmrc                           # Node.js version (v20.19.0)
├── credentials.json                 # Google OAuth credentials (untracked)
│
├── middleware/
│   ├── error-handler.js             # Error handling middleware
│   └── basic-auth.js                # Basic Auth for admin routes
│
├── routes/
│   ├── dynamic.js                   # Main routes (home, our-work, enquiry, contact)
│   ├── default.js                   # Secondary routes (about, gallery, legal pages)
│   ├── admin.js                     # Admin routes (gallery, A/B reports)
│   └── password-reset.js            # Password reset flow
│
├── utils/
│   ├── airtable.js                  # Airtable configuration
│   ├── airtable-monitor.js          # Airtable API monitoring
│   ├── cloudinary.js                # Cloudinary configuration
│   ├── google-photos.js             # Google Photos API utilities
│   ├── multer.js                    # File upload configuration
│   ├── email.js                     # Email notification system
│   ├── spam-detection.js            # Spam detection utilities
│   ├── ab-testing.js                # A/B test registry
│   ├── ab-copy-variants.js          # A/B test copy variants
│   ├── ab-logger.js                 # A/B test logging
│   ├── ab-test-logger.js            # A/B page view logging
│   ├── admin-update-password.js     # Password update utilities
│   └── password-reset-tokens.js     # Token management
│
├── views/                           # EJS templates
│   ├── index.ejs, about.ejs, etc.   # Page templates
│   ├── 404.ejs, 410.ejs, 500.ejs    # Error pages
│   ├── admin/                       # Admin templates
│   │   ├── gallery.ejs
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   └── includes/                    # Reusable components
│       ├── head.ejs, meta.ejs       # HTML head and meta tags
│       ├── header.ejs, nav.ejs      # Header and navigation
│       ├── footer.ejs               # Footer
│       ├── blockjs.ejs              # JavaScript includes
│       ├── analytics.ejs            # GA4 tracking
│       └── forms/                   # Form components
│           ├── contact-form.ejs
│           └── enquiry-form.ejs
│
├── public/                          # Static assets
│   ├── css/                         # Stylesheets
│   ├── js/                          # Client-side JavaScript
│   │   ├── ab-tracking.js           # A/B test GA4 tracking
│   │   └── gallery-scripts.js       # Gallery functionality
│   ├── images/                      # Image assets
│   ├── fonts/                       # Web fonts
│   └── uploads/                     # Temporary file uploads
│
├── data/                            # JSON data storage
│   ├── gallery.json                 # Gallery metadata
│   └── password-reset-tokens.json   # Reset tokens
│
├── logs/                            # Log files
│   └── ab-tests.log                 # A/B test events
│
├── scripts/                         # Utility scripts
│   ├── ab-test-report.js            # A/B reporting CLI
│   ├── set-admin-credentials.js     # Set credentials
│   ├── test-admin-routes.js         # Test admin routes
│   └── setup-google-picker-auth.js  # OAuth setup
│
├── docs/                            # Documentation
│   ├── README-AB-TESTING.md         # A/B testing guide
│   ├── PROJECT-OVERVIEW.md          # A/B technical overview
│   └── *.md                         # Additional docs
│
├── deploy-staging.sh                # Staging deployment
├── deploy-production.sh             # Production deployment
├── README.md                        # Project README
└── PROJECT_OVERVIEW.md              # This file
```

## Key Features

### 1. Homepage (`/`)

- Displays featured repair work from Airtable
- Shows repair images optimized via Cloudinary
- Dynamic content pulled from Airtable `repairsWork` table
- Features professional hydraulic engineering services
- Links to parts enquiry and repair work sections
- **A/B Testing**: Meta descriptions vary based on assigned variant

### 2. Our Work Section (`/our-work`)

- Overview page showcasing service exchange and OEM repair services
- Individual repair detail pages (`/our-work/:id`)
- Displays repair images, descriptions, and component information
- Images are processed through Cloudinary with WebP format and quality optimization
- **A/B Testing**: Meta descriptions vary based on assigned variant

### 3. Contact Form (`/contact`)

- General contact form for customer inquiries
- Form submissions stored in Airtable `webForms` table
- Includes reCAPTCHA v2 server-side verification
- IP address tracking for submissions
- **Security**: Honeypot field, time-to-submit validation, spam keyword detection
- **Rate Limiting**: 5 submissions per 15 minutes per IP
- **Email Notifications**: Automatic email sent to admin with submission details
- **A/B Testing**: Conversion tracking for form submissions

### 4. Parts Enquiry Form (`/enquiry`)

- Specialized form for hydraulic component sourcing requests
- Supports image uploads via Multer (10MB max, images only)
- Images uploaded to Cloudinary with organized folder structure
- Stores comprehensive part information (brand, type, part number, serial number, etc.)
- Includes customer address and contact details
- **Security**: Same security features as contact form
- **Email Notifications**: Automatic email with part details and image link
- **A/B Testing**: Conversion tracking for enquiry submissions

### 5. Gallery Page (`/gallery`)

- Photo gallery for completed jobs
- Powered by Google Photos Picker API for photo selection
- Images stored in Cloudinary and metadata in JSON file (`data/gallery.json`)
- Admin interface at `/admin/gallery` for managing gallery items
- Supports replace mode (replace all items) or append mode (add to existing)
- **Note**: Google Photos Picker API has 30-second timeout for photo selection

### 6. A/B Testing System

- **Cookie-based Variant Assignment**: 90-day persistence, 50/50 traffic split
- **Server-side Logging**: File-based logging to `logs/ab-tests.log`
- **Client-side Tracking**: GA4 events for exposures and conversions
- **Reporting**: CLI tool (`scripts/ab-test-report.js`) for statistical analysis
- **Admin API**: JSON endpoint at `/admin/ab-report` for integration
- **Current Test**: Near-me meta description test on 4 pages (/, /our-work, /about, /contact)

### 7. Admin Panel

- **Gallery Management** (`/admin/gallery`) - Google Photos integration, Cloudinary upload
- **A/B Test Reporting** (`/admin/ab-report`) - JSON API with exposure/conversion stats
- **Password Reset** (`/auth/forgot-password`) - Token-based reset with email notifications
- **Basic Auth Protection**: All admin routes require authentication
- **Scripts**: `set-admin-credentials.js`, `test-admin-routes.js`

### 8. Additional Pages

- **About** (`/about`) - Company information and services (A/B tested)
- **Sitemap** (`/sitemap`, `/sitemap.xml`) - Site navigation map
- **Privacy Policy** (`/privacy-policy`) - POPIA compliance
- **Terms of Sale** (`/terms-of-sale`) - Sales terms and conditions
- **Disclaimer** (`/disclaimer`) - Legal disclaimer
- **Cookie Policy** (`/cookie-policy`) - Cookie usage policy
- **410 Gone** - WordPress/Elementor artifact blocking

## Data Management

### Airtable Integration

The application uses Airtable as a backend database with three main tables:

1. **`repairsWork`** - Stores repair work information

   - Fields: `repairName`, `repairDescription`, `mainImage`, `componentName`, `componentDescription`, `imagesGallery`, `featured`
   - View: "Featured Repairs" for homepage display

2. **`webForms`** - Stores form submissions
   - Fields: `name`, `email`, `company`, `phone`, `message`, `status`, `form` (contact/enquiry), `ip`, `imageUploads`
   - Additional fields for enquiry form: `brand`, `type`, `partNo`, `partDesc`, `serialNo`, `street`, `town`, `postal`, `region`, `country`
   - Includes timestamp and reference number for tracking

3. **`securityLogs`** - Stores security events
   - Fields: `timestamp`, `eventType`, `ip`, `userAgent`, `formType`, `details`, `referrer`
   - Event types: reCAPTCHA failure, spam attempt, CSP violation, rate limit hit
   - Used for security monitoring and analysis

### JSON File Storage

The application uses JSON file storage for simple data:

1. **Gallery Metadata** (`data/gallery.json`)
   - Array of gallery items with Cloudinary URLs and thumbnails
   - Stores: `source_media_item_id`, `filename`, `cloudinary_url`, `thumbnail_url`, `uploaded_at`, `dimensions`
   - Prevents duplicates via `source_media_item_id` check
   - Ordered by `uploaded_at` DESC for display

2. **Password Reset Tokens** (`data/password-reset-tokens.json`)
   - Array of active password reset tokens
   - Stores: `token`, `createdAt`, `expiresAt` (1-hour expiration)
   - Cleaned up after use or expiration
   - Atomic writes (temp file + rename pattern)

3. **A/B Test Logs** (`logs/ab-tests.log`)
   - Pipe-delimited text format for fast parsing
   - Fields: `timestamp | eventType | testId | variant | routeOrConversion | sessionId | metadata`
   - Event types: exposure, conversion
   - Used for reporting and statistical analysis

**No Traditional Database**: The application intentionally avoids SQLite, PostgreSQL, or MongoDB to minimize dependencies and simplify deployment on shared hosting environments.

### Cloudinary Integration

- Image hosting and optimization
- Automatic WebP format conversion
- Quality optimization (`q_auto:good`)
- Organized folder structure: `Specialised/public/uploads/{customerName}/`
- Remote media proxy for Airtable images

## Security Features

### Form Protection

1. **reCAPTCHA v2** - Server-side verification for all form submissions
2. **Honeypot Fields** - Hidden `website` field to catch bots
3. **Time-to-Submit Validation** - Minimum 3 seconds before form can be submitted
4. **Spam Keyword Detection** - Filters submissions with SEO spam, advertising phrases
5. **Suspicious Email Domain Detection** - Blocks disposable email services
6. **Rate Limiting** - 5 submissions per 15 minutes per IP (Express Rate Limit)

### Security Logging

- All security events logged to Airtable `securityLogs` table
- Event types: reCAPTCHA failures, spam attempts, rate limit hits, CSP violations
- Includes IP address, user agent, referrer, form type
- Used for security monitoring and analysis

### Application Security

1. **Content Security Policy** - Report-only mode with violation reporting to Airtable
2. **File Upload Validation** - Image files only, 10MB max, MIME type validation
3. **Request Size Limits** - 10MB limit on JSON and URL-encoded payloads
4. **WordPress Parameter Blocking** - Returns 410 Gone for WordPress/Elementor artifacts
5. **Trust Proxy** - Enabled for accurate IP detection behind reverse proxies
6. **Cookie Security** - httpOnly, secure (production), sameSite: lax

### Admin Security

1. **Basic Auth** - All `/admin/*` routes require authentication
2. **Password Reset Flow** - Token-based reset with 1-hour expiration
3. **Token Storage** - Secure JSON file storage with atomic writes
4. **Email Notifications** - Admin notified of password reset requests
5. **Automatic Server Restart** - Passenger restart triggered after password change

## Third-Party Integrations

### Google Services

- **Google Analytics 4** (G-V4W8VP4GL8) - Website analytics and A/B testing event tracking
  - Custom events: `ab_exposure`, `ab_conversion`
  - Event parameters: `test_id`, `variant`, `conversion_type`, `page_path`
- **reCAPTCHA v2** - Server-side form spam protection
- **Google Photos Picker API** - Photo selection for gallery (replaces deprecated Library API)
- **Google OAuth 2.0** - Authentication for Google Photos Picker API
  - OAuth Scope: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`
  - Token storage: `token.json` with automatic refresh on expiration

### Cloudinary

- Image hosting and optimization
- Automatic WebP conversion
- Quality optimization (`q_auto:good`)
- Folder structure: `Specialised/public/uploads/{customerName}/`
- Gallery folder: `gallery/google-photos/`
- Streaming uploads from URLs (for Google Photos)

### Email Services (Nodemailer)

- **SMTP Support**: Gmail, Microsoft 365, SendGrid, any SMTP server
- **Email Types**: Contact form, enquiry form, password reset, health checks
- **Features**: HTML/text formats, timezone-aware timestamps (Africa/Johannesburg)
- **Configuration**: Environment variables with fallback support (EMAIL_* or SMTP_*)

### Cookie Consent

- CookieYes integration for POPIA/GDPR compliance
- Cookie consent banner and management
- Functional cookies for A/B testing (90-day persistence)

## Performance Optimizations

1. **Response Compression** - Gzip compression enabled
2. **Static File Caching** - Long cache headers (31536000000ms) for static assets
3. **Image Optimization** - Cloudinary automatic format conversion and quality optimization
4. **ETag Support** - Enabled for static files
5. **Lazy Loading** - Images use `loading="eager"` or `loading="lazy"` attributes

## Environment Variables

Required environment variables (configured via `.env` file):

**Server Configuration:**
- `PORT` - Server port (default: 3300)
- `NODE_ENV` - Environment (development/production) - affects cookie security

**Airtable Configuration:**
- `AT_ENDPOINT` - Airtable API endpoint (https://api.airtable.com)
- `AT_API_KEY` - Airtable API key
- `BASE` - Airtable base ID

**Cloudinary Configuration:**
- `CLOUD_NAME` - Cloudinary cloud name
- `API_KEY` - Cloudinary API key
- `API_SECRET` - Cloudinary API secret
- `CLOUDINARY_FOLDER` - Optional folder for gallery images (default: gallery/google-photos)

**reCAPTCHA Configuration:**
- `reCAPTCHA_v2_SECRET_KEY` - reCAPTCHA v2 secret key
- `reCAPTCHA_v2_SITE_KEY` - reCAPTCHA v2 site key

**Email Configuration (Nodemailer):**
- `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (e.g., 587)
- `EMAIL_SECURE` - Use TLS (true/false)
- `EMAIL_USER` - SMTP username/email
- `EMAIL_PASSWORD` - SMTP password/app password
- `NOTIFICATION_EMAIL` - Recipient for form notifications
- `ADMIN_EMAIL` - Admin email for password reset (optional)
- `HEALTHCHECK_EMAIL` - Email for health check notifications (optional)

**Google OAuth Configuration:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI

**Admin Configuration:**
- `ADMIN_USERNAME` - Admin panel username
- `ADMIN_PASSWORD` - Admin panel password

**Gallery Configuration:**
- `GALLERY_REPLACE_MODE` - Replace (true) or append (false) gallery items

**Legacy Support:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Fallback email variables

## Error Handling

- Custom 404 error page (`views/404.ejs`)
- Custom 500 error page (`views/500.ejs`)
- Error handler middleware (currently commented out in `app.js`)
- Try-catch blocks in route handlers for graceful error handling

## Development Notes

1. **Error Handler Middleware**: Currently disabled in `app.js` (lines 59-60). Basic error handling is implemented inline.

2. **File Uploads**: Temporary files are stored in `./public/uploads` before being uploaded to Cloudinary.

3. **Image Processing**: Airtable images are proxied through Cloudinary with URL manipulation to optimize delivery.

## Running the Application

### Local Development

```bash
# Ensure Node.js v20.19.0 is installed
nvm use 20.19.0  # or nvm use

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start

# Server runs on http://localhost:3300 (or PORT from .env)
```

The `prestart` script will verify Node.js version before starting the server.

### Testing

```bash
# Test admin routes
node scripts/test-admin-routes.js

# Generate A/B test report
node scripts/ab-test-report.js

# Set admin credentials
node scripts/set-admin-credentials.js

# Setup Google Photos OAuth
node scripts/setup-google-picker-auth.js
```

## Deployment

### Staging Deployment

```bash
# Deploy to staging server
./deploy-staging.sh

# Script handles:
# - Git pull from feature branch
# - npm install
# - File permissions
# - Environment variable verification
```

### Production Deployment

```bash
# Deploy to production server
./deploy-production.sh

# Script handles:
# - Git pull from main branch
# - npm install (production dependencies only)
# - File permissions
# - Passenger restart (touch tmp/restart.txt)
# - Backup verification
```

### Environment-Specific Configuration

**Staging:**
- Uses `.env` file or `.htaccess` environment variables
- NODE_ENV should be set to "production" for cookie security
- Test email notifications before production

**Production:**
- Environment variables via `.htaccess` or server config
- NODE_ENV=production (required for secure cookies)
- Ensure all email, reCAPTCHA, and API credentials are configured
- Monitor logs after deployment

### Post-Deployment Checklist

1. ✅ Verify server is running (check HTTP response)
2. ✅ Test form submissions (contact and enquiry)
3. ✅ Check email notifications are being sent
4. ✅ Verify A/B testing cookies are set
5. ✅ Test admin panel access
6. ✅ Check GA4 events are firing
7. ✅ Review error logs for issues
8. ✅ Test gallery management (if modified)

## Maintenance & Support

- **Maintainers**: Sue Holder, Design Develop Host
- **Version**: 1.0.1
- **License**: ISC
- **Node.js Version**: v20.19.0 (required)
- **Last Major Update**: February 2026 (A/B Testing System, Security Enhancements)

### Regular Maintenance Tasks

**Weekly:**
- Review A/B test performance (`node scripts/ab-test-report.js`)
- Check security logs in Airtable
- Monitor form submissions

**Monthly:**
- Archive A/B test logs (`mv logs/ab-tests.log logs/archive/`)
- Review GA4 analytics
- Update dependencies if needed
- Check email deliverability

**As Needed:**
- Update admin credentials (`node scripts/set-admin-credentials.js`)
- Refresh Google OAuth tokens (automatic, but monitor)
- Review and update A/B test variants
- Deploy code updates to staging → production

## Recent Enhancements (2026)

1. ✅ **A/B Testing System** (January 2026)
   - Cookie-based variant assignment with 90-day persistence
   - Server-side logging to file (`logs/ab-tests.log`)
   - Client-side GA4 event tracking
   - Reporting CLI tool and JSON API endpoint
   - Comprehensive documentation suite

2. ✅ **Security Logging** (January 2026)
   - Airtable `securityLogs` table for all security events
   - CSP violation reporting
   - reCAPTCHA failure tracking
   - Spam attempt logging

3. ✅ **Password Reset System** (January 2026)
   - Token-based password reset flow
   - Email notifications with reset links
   - 1-hour token expiration
   - Automatic Passenger restart trigger

4. ✅ **Google Photos Picker API Migration** (December 2025)
   - Replaced deprecated Library API
   - JSON file storage (removed SQLite dependency)
   - Replace/append modes

5. ✅ **Email Notification System** (December 2025)
   - Multi-provider SMTP support
   - HTML/text formats
   - Timezone-aware timestamps

6. ✅ **Enhanced Security** (December 2025)
   - Rate limiting (5 submissions per 15 minutes)
   - Spam keyword detection
   - Suspicious email domain filtering
   - WordPress parameter blocking

## Future Enhancements

1. Implement admin dashboard for managing Airtable records
2. Enhance IP blacklist with database storage
3. Multi-armed bandit for A/B testing (automatic traffic adjustment)
4. Real-time A/B testing dashboard with live stats and charts
5. Implement proper error handler middleware (currently inline)
6. User segmentation for A/B tests (mobile vs. desktop, new vs. returning)
7. Enforce CSP (currently report-only mode)
8. Comprehensive application logging system (structured logs)
9. API endpoints for external integrations (RESTful API)
10. Database migration for A/B test logs (currently file-based)
