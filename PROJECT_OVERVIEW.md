# Project Overview: Specialised Steering Web Application

## Project Description

Specialised Steering Web Application is a Node.js/Express-based web application for **Specialised Steering CC**, a hydraulic component repair and sourcing business based in Germiston, Gauteng, South Africa. The application serves as a business website showcasing hydraulic repair services, component sourcing, and service exchange programs for mining, agricultural, and automotive industries.

## Technology Stack

### Core Technologies

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.3
- **Template Engine**: EJS 3.1.9
- **Language**: JavaScript

### Key Dependencies

- **Airtable** (^0.11.1) - Database/CRM integration for storing repair work and form submissions
- **Cloudinary** (^1.27.1) - Image hosting and optimization service
- **Multer** (^1.4.3) - File upload handling middleware
- **Google APIs** (^134.0.0) - Google OAuth and Photos Picker API integration
- **JSON file storage** - File-based storage for gallery items metadata (no dependencies)
- **Passport** (^0.7.0) - Authentication middleware (Google OAuth)
- **reCAPTCHA v3** - Form spam protection
- **Compression** (^1.7.4) - Response compression middleware
- **Cookie Parser** (^1.4.6) - Cookie handling
- **Express Session** (^1.18.0) - Session management
- **Request IP** (^2.1.3) - Client IP address detection

## Project Structure

```txt
specialised/
├── app.js                 # Main application entry point
├── googleapi.js           # Google API authentication utilities
├── package.json           # Project dependencies and metadata
├── credentials.json       # Google OAuth credentials (untracked)
├── middleware/
│   └── error-handler.js   # Error handling middleware
├── routes/
│   ├── default.js         # Default routes (home, our-work, contact, enquiry)
│   └── dynamic.js         # Dynamic routes (about, gallery, sitemap, etc.)
├── utils/
│   ├── airtable.js        # Airtable configuration and client
│   ├── cloudinary.js      # Cloudinary configuration
│   └── multer.js          # Multer file upload configuration
├── views/                 # EJS templates
│   ├── index.ejs          # Homepage
│   ├── about.ejs          # About page
│   ├── contact.ejs        # Contact page
│   ├── enquiry.ejs        # Parts enquiry page
│   ├── gallery.ejs        # Photo gallery page
│   ├── our-work-detail.ejs # Individual repair work detail page
│   ├── confirm.ejs       # Form submission confirmation
│   ├── confirm-error.ejs  # Error confirmation page
│   ├── 404.ejs           # 404 error page
│   ├── 500.ejs           # 500 error page
│   └── includes/         # Reusable template components
│       ├── head.ejs      # HTML head section
│       ├── meta.ejs      # Meta tags
│       ├── header.ejs    # Site header
│       ├── nav.ejs       # Navigation menu
│       ├── footer.ejs    # Site footer
│       ├── schema.ejs    # Structured data (JSON-LD)
│       └── forms/        # Form components
│           ├── contact-form.ejs
│           └── enquiry-form.ejs
└── public/               # Static assets
    ├── css/              # Stylesheets
    ├── js/               # Client-side JavaScript
    ├── images/           # Image assets
    ├── fonts/            # Web fonts (Montserrat)
    └── uploads/          # Temporary file uploads
```

## Key Features

### 1. Homepage (`/`)

- Displays featured repair work from Airtable
- Shows repair images optimized via Cloudinary
- Dynamic content pulled from Airtable `repairsWork` table
- Features professional hydraulic engineering services
- Links to parts enquiry and repair work sections

### 2. Our Work Section (`/our-work`)

- Overview page showcasing service exchange and OEM repair services
- Individual repair detail pages (`/our-work/:id`)
- Displays repair images, descriptions, and component information
- Images are processed through Cloudinary with WebP format and quality optimization

### 3. Contact Form (`/contact`)

- General contact form for customer inquiries
- Form submissions stored in Airtable `webForms` table
- Includes reCAPTCHA v3 spam protection
- IP address tracking for submissions
- Basic IP blacklist functionality

### 4. Parts Enquiry Form (`/enquiry`)

- Specialized form for hydraulic component sourcing requests
- Supports image uploads via Multer
- Images uploaded to Cloudinary with organized folder structure
- Stores comprehensive part information (brand, type, part number, serial number, etc.)
- Includes customer address and contact details

### 5. Gallery Page (`/gallery`)

- Photo gallery for completed jobs
- Powered by Google Photos Picker API for photo selection
- Images stored in Cloudinary and metadata in JSON file (data/gallery.json)
- Admin interface at `/admin/gallery` for managing gallery items
- Supports replace mode (replace all items) or append mode (add to existing)

### 6. Additional Pages

- **About** (`/about`) - Company information and services
- **Sitemap** (`/sitemap`) - Site navigation map
- **Disclaimer** (`/disclaimer`) - Legal disclaimer
- **Cookie Policy** (`/cookie-policy`) - Cookie usage policy

## Data Management

### Airtable Integration

The application uses Airtable as a backend database with two main tables:

1. **`repairsWork`** - Stores repair work information

   - Fields: `repairName`, `repairDescription`, `mainImage`, `componentName`, `componentDescription`, `imagesGallery`, `featured`
   - View: "Featured Repairs" for homepage display

2. **`webForms`** - Stores form submissions
   - Fields: `name`, `email`, `company`, `phone`, `message`, `status`, `form` (contact/enquiry), `ip`, `imageUploads`
   - Additional fields for enquiry form: `brand`, `type`, `partNo`, `partDesc`, `serialNo`, `street`, `town`, `postal`, `region`, `country`

### JSON File Storage (Gallery)

The application uses JSON file storage for gallery item metadata:

- **Storage file**: `data/gallery.json`
- **Data structure**: Array of gallery items
  - Stores: Cloudinary URLs, thumbnails, metadata (filename, dimensions, etc.)
  - Prevents duplicates via `source_media_item_id` check
  - Ordered by `uploaded_at` DESC for display

Gallery images are stored in Cloudinary, with metadata in JSON file. This approach requires no native dependencies and works on all hosting environments.

### Cloudinary Integration

- Image hosting and optimization
- Automatic WebP format conversion
- Quality optimization (`q_auto:good`)
- Organized folder structure: `Specialised/public/uploads/{customerName}/`
- Remote media proxy for Airtable images

## Security Features

1. **Content Security Policy (CSP)** - Report-only mode configured
2. **reCAPTCHA v3** - Spam protection on forms
3. **IP Blacklist** - Basic IP filtering (currently: `46.161.11.208`)
4. **File Upload Validation** - Only image files accepted
5. **Request Size Limits** - 10MB limit on JSON and URL-encoded payloads
6. **Trust Proxy** - Enabled for accurate IP detection behind proxies

## Third-Party Integrations

### Google Services

- **Google Analytics** (G-V4W8VP4GL8) - Website analytics
- **Google reCAPTCHA v3** - Form spam protection
- **Google Photos Picker API** - Photo selection for gallery (replaces deprecated Library API)
- **Google OAuth 2.0** - Authentication for Google Photos Picker API

### Cookie Consent

- CookieYes integration for GDPR compliance
- Cookie consent banner and management

## Performance Optimizations

1. **Response Compression** - Gzip compression enabled
2. **Static File Caching** - Long cache headers (31536000000ms) for static assets
3. **Image Optimization** - Cloudinary automatic format conversion and quality optimization
4. **ETag Support** - Enabled for static files
5. **Lazy Loading** - Images use `loading="eager"` or `loading="lazy"` attributes

## Environment Variables

Required environment variables (configured via `.env` file):

- `PORT` - Server port (default: 3300)
- `AT_ENDPOINT` - Airtable API endpoint
- `AT_API_KEY` - Airtable API key
- `BASE` - Airtable base ID
- `CLOUD_NAME` - Cloudinary cloud name
- `API_KEY` - Cloudinary API key
- `API_SECRET` - Cloudinary API secret
- `reCAPTCHA_v3_SECRET_KEY` - reCAPTCHA secret key

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

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3300 (or PORT from .env)
```

## Maintenance

- **Maintainers**: Sue Holder, Design Develop Host
- **Version**: 1.0.1
- **License**: ISC

## Future Enhancements (Potential)

1. ~~Enable Google Photos gallery integration~~ ✅ COMPLETED
2. Implement proper error handler middleware
3. Add admin dashboard for managing Airtable records
4. Implement user authentication for admin features
5. ~~Add email notifications for form submissions~~ ✅ COMPLETED
6. Enhance IP blacklist with database storage
7. Add rate limiting for form submissions
8. Implement proper logging system
