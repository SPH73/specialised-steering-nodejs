# Specialised Steering Web Application

A Node.js/Express web application for **Specialised Steering CC**, a hydraulic component repair and sourcing business based in Germiston, Gauteng, South Africa. The application showcases hydraulic repair services, component sourcing, and service exchange programs for mining, agricultural, and automotive industries.

## Features

- 🏠 **Dynamic Homepage** - Featured repair work displayed from Airtable database
- 🔧 **Our Work Gallery** - Showcase of service exchange and OEM repair services
- 📧 **Contact Form** - Customer inquiry form with spam protection
- 🔍 **Parts Enquiry** - Specialised form for hydraulic component sourcing with image uploads
- 📸 **Photo Gallery** - Display of completed jobs (Google Photos integration ready)
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

- Node.js (v12 or higher)
- npm or yarn
- Airtable account and API key
- Cloudinary account
- Google reCAPTCHA v2 site key and secret
- (Optional) Google Cloud Platform credentials for Photos API

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

4.**(Optional) Google Photos API Setup**

If you want to enable the Google Photos gallery integration:

- Create a project in Google Cloud Platform
- Enable the Google Photos Library API
- Download OAuth 2.0 credentials as `credentials.json`
- Place the file in the root directory
- Run the OAuth flow using `googleapi.js`

## Usage

### Development

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3300` (or your configured PORT).

### Production

For production deployment, ensure:

1. All environment variables are properly configured
2. Static assets are served with proper caching headers
3. Trust proxy is enabled if behind a reverse proxy
4. SSL/TLS is configured at the web server level

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
- **Google Photos API** - Gallery integration (in progress)

### Email Services

- **Nodemailer** - Email notification system for form submissions
- **Supports multiple providers** - Gmail, Microsoft 365, SendGrid, or any SMTP server
- **See EMAIL_SETUP.md** for configuration instructions

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

- [ ] Complete Google Photos gallery integration
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
