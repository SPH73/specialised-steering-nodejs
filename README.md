# Specialised Steering Web Application

A Node.js/Express web application for **Specialised Steering (Pty) Ltd**, a hydraulic component repair and sourcing business based in Germiston, Gauteng, South Africa. The application showcases hydraulic repair services, component sourcing, and service exchange programs for mining, agricultural, and automotive industries.

## Features

- 🏠 **Dynamic Homepage** - Featured repair work displayed from Airtable database
- 🔧 **Our Work Gallery** - Showcase of service exchange and OEM repair services
- 📧 **Contact Form** - Customer inquiry form with spam protection
- 🔍 **Parts Enquiry** - Specialised form for hydraulic component sourcing with image uploads
- 📸 **Photo Gallery** - Display of completed jobs powered by Google Photos Picker API and Cloudinary
- 🖼️ **Image Optimization** - Automatic WebP conversion and quality optimization via Cloudinary
- 📬 **Email Notifications** - Automatic email alerts for all form submissions with full details (✅ Production ready)
- 🛡️ **Security** - reCAPTCHA v2, rate limiting, honeypot fields, IP blacklist, CSP headers, and file upload validation
- 🚀 **Performance** - Response compression, static file caching, and optimized image delivery

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.3
- **Template Engine**: EJS 3.1.9
- **Database**: Airtable
- **Image Hosting**: Cloudinary
- **Authentication**: Passport.js with Google OAuth 2.0
- **Security**: reCAPTCHA v2, Content Security Policy, Rate Limiting

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

2.**Install dependencies**

```bash
npm install
```

3.**Configure environment variables**

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
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

**Note**: See `EMAIL_SETUP.md` for detailed email configuration instructions.

**Additional environment variables for Google Photos Picker API and admin gallery:**

```env
# Google Photos Picker API OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://www.specialisedsteering.com/oauth2callback

# Admin Authentication (for gallery management)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Gallery Configuration
GALLERY_REPLACE_MODE=false  # Set to true to replace all items, false to append
CLOUDINARY_FOLDER=gallery/google-photos  # Optional: Cloudinary folder for gallery images
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

This project requires **Node.js v20.19.0** for compatibility with native dependencies (specifically `better-sqlite3`).

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
   npm rebuild better-sqlite3
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

3. **Rebuild native dependencies:**

   ```bash
   cd /path/to/application
   npm rebuild better-sqlite3
   # Or if you want a clean rebuild:
   rm -rf node_modules
   npm ci  # Uses package-lock.json for reproducible builds
   ```

4. **Verify the installation:**

   ```bash
   node --version  # Should match the new version
   node -e "require('better-sqlite3'); console.log('✅ better-sqlite3 loads correctly');"
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
   npm rebuild better-sqlite3
   # Restart application
   ```

### Why Version Management Matters

The `better-sqlite3` package compiles native bindings that are **specific to the Node.js version**. If you run the server with a different Node.js version than the one used to compile the module, you'll get errors like:

```bash
Error: The module was compiled against a different Node.js version
NODE_MODULE_VERSION 115. This version of Node.js requires NODE_MODULE_VERSION 141
```

This is why the `prestart` script validates the version before starting the server.

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
6. Native dependencies are rebuilt after Node.js installation: `npm rebuild` or `npm install`

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

### `repairsWork` Table

Stores repair work information for display on the website.

- `repairName` (Text) - Name of the repair work
- `repairDescription` (Long Text) - Detailed description
- `mainImage` (Attachment) - Primary image
- `componentName` (Text) - Name of the component
- `componentDescription` (Long Text) - Component details
- `imagesGallery` (Attachment) - Additional images
- `featured` (Checkbox) - Display on homepage

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

## API Integrations

### Cloudinary

Images are automatically optimized and served via Cloudinary CDN with:

- WebP format conversion
- Quality optimization (`q_auto:good`)
- Organized folder structure: `Specialised/public/uploads/{customerName}/`

### Google Services

- **Google Analytics** - Website traffic analytics (G-V4W8VP4GL8)
- **reCAPTCHA v2** - Spam protection on forms
- **Google Photos Picker API** - Photo selection for gallery (replaces deprecated Library API)
- **Google OAuth 2.0** - Authentication for Google Photos Picker API

### Email Services

- **Nodemailer** - Email notification system for form submissions
- **Supports multiple providers** - Gmail, Microsoft 365, SendGrid, or any SMTP server
- **See EMAIL_SETUP.md** for configuration instructions

## Admin Gallery Management

The gallery is managed through an admin interface:

1. **Access Admin UI:** Navigate to `/admin/gallery` (requires basic auth)
2. **Update Gallery:**
   - Click "Update Gallery from Google Photos"
   - Select photos in the Google Photos Picker (search for album name)
   - Choose replace mode (replace all) or append mode (add to existing)
   - Photos are automatically uploaded to Cloudinary and stored in SQLite database

**Note:** The Google Photos Picker API has a 30-second timeout. You must complete photo selection within this time limit (this is a Google API limitation, not an application limitation).

### Setting Admin Credentials

Use the provided script to set admin credentials:

```bash
node scripts/set-admin-credentials.js
```

Or set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables manually.

## Security Features

- **Content Security Policy** - Report-only mode configured
- **reCAPTCHA v2** - Spam protection on all forms
- **Rate Limiting** - 5 form submissions per 15 minutes per IP
- **Honeypot Fields** - Hidden form fields to catch bots
- **Time-to-Submit Validation** - Minimum 3 seconds before form can be submitted
- **IP Blacklist** - Basic IP filtering capability
- **File Upload Validation** - Restricted to image files only (10MB max)
- **Request Size Limits** - 10MB maximum payload
- **Trust Proxy** - Accurate IP detection behind reverse proxies

## Contributing

This is a private client project. For any issues or enhancement requests, please contact the maintainers.

## Maintenance & Support

- **Maintainers**: Sue Holder, Design Develop Host
- **Version**: 1.0.1
- **License**: ISC

## Future Enhancements

- [x] Complete Google Photos gallery integration
- [ ] Implement admin dashboard for managing Airtable records
- [x] Add email notifications for form submissions
- [x] Add rate limiting for form submissions
- [ ] Enhance IP blacklist with database storage
- [ ] Implement comprehensive logging system
- [ ] Enforce CSP (currently report-only mode)

## License

ISC License - Copyright (c) Design Develop Host

---

For more detailed technical information, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
