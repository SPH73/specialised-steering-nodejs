# Email Notification Setup Guide

This guide explains how to configure email notifications for form submissions on the Specialised Steering website.

## Overview

When users submit contact or parts enquiry forms, the system will:

1. Save the submission to Airtable (as it always has)
2. Send an email notification to your designated email address
3. The email contains all form details and a link to view the record in Airtable

## Email Provider Options

You can use any SMTP email provider. Common options include:

### Option 1: Gmail (Recommended for Small Businesses)

**Pros:**

- Free for basic use
- Reliable
- Easy to set up

**Cons:**

- Daily sending limits (500 emails/day for free accounts)
- Requires app-specific password

**Setup Steps:**

1. **Enable 2-Factor Authentication on your Gmail account**

   - Go to [https://myaccount.google.com/security]
   - Enable 2-Step Verification

2. **Generate an App-Specific Password**

   - Go to [https://myaccount.google.com/apppasswords]
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to your `.env` file:**

   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   NOTIFICATION_EMAIL=admin@ssteering.co.za
   ```

### Option 2: Microsoft 365 / Outlook

**Setup:**

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

### Option 3: SendGrid (Recommended for High Volume)

**Pros:**

- Free tier: 100 emails/day
- Better deliverability
- Detailed analytics

**Setup:**

1. Sign up at [https://sendgrid.com]
2. Create an API key
3. Add to `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

### Option 4: Your Domain's SMTP (via hosting provider)

Contact your hosting provider for SMTP settings. Example:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@ssteering.co.za
EMAIL_PASSWORD=your-email-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

## Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# SMTP Server Settings
EMAIL_HOST=smtp.gmail.com          # Your SMTP server
EMAIL_PORT=587                     # Usually 587 for TLS or 465 for SSL
EMAIL_SECURE=false                 # true for port 465, false for other ports
EMAIL_USER=your-email@gmail.com    # Your email address
EMAIL_PASSWORD=your-password       # Your email password or app-specific password

# Notification recipient
NOTIFICATION_EMAIL=admin@ssteering.co.za  # Where to send notifications
```

### Port Settings

- **Port 587**: Use with `EMAIL_SECURE=false` (STARTTLS)
- **Port 465**: Use with `EMAIL_SECURE=true` (SSL/TLS)
- **Port 25**: Usually blocked by ISPs, avoid

## Testing Email Configuration

After setting up your `.env` file, you can test the email configuration:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Submit a test form through your website
# Check the server logs for email status
```

**Look for these log messages:**

✅ Success:

```txt
Contact form notification email sent: <message-id>
```

❌ Error:

```txt
Error sending contact form notification email: [error details]
```

## Email Features

### Contact Form Notifications

Includes:

- Customer name, company, email, phone, country
- Message content
- IP address
- Submission timestamp
- Direct link to Airtable record

### Parts Enquiry Notifications

Includes:

- Part information (brand, type, part number, serial number, description)
- Customer details (name, company, email, phone)
- Delivery address
- Uploaded image (if provided)
- IP address
- Submission timestamp
- Direct link to Airtable record

## Troubleshooting

### Email not sending

1. **Check server logs** for error messages
2. **Verify credentials** in `.env` file
3. **Test SMTP connection:**

   ```bash
   # You can use telnet to test
   telnet smtp.gmail.com 587
   ```

4. **Common issues:**
   - Gmail: Make sure 2FA is enabled and you're using an app password
   - Firewall: Ensure outbound SMTP ports are not blocked
   - Credentials: Double-check email and password

### Email goes to spam

1. **Use a professional email address** (e.g., [admin@ssteering.co.za] instead of gmail)
2. **Set up SPF/DKIM records** for your domain
3. **Use a dedicated email service** like SendGrid for better deliverability

### Rate limiting

If you receive many form submissions:

1. **Gmail**: 500 emails/day limit
2. **Consider upgrading** to SendGrid or another service
3. **Solution**: The code won't fail if email fails - submissions still save to Airtable

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use app-specific passwords** instead of your main password
3. **Rotate passwords regularly**
4. **Use environment-specific configurations** (different emails for dev/production)

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your SMTP provider's documentation
3. Test with a simple email client first to confirm credentials work
4. Consider using SendGrid for more reliable email delivery

## Disabling Email Notifications

If you want to temporarily disable email notifications without removing the code:

1. **Option A**: Remove email environment variables from `.env`

   - System will log a warning but continue to work

2. **Option B**: Set empty values:

   ```env
   EMAIL_HOST=
   EMAIL_USER=
   ```

The application will continue to save form submissions to Airtable even if email is not configured.
