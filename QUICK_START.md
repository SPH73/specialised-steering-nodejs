# Quick Start Guide - Email Notifications Setup

This guide will get your email notifications working in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

This will install `nodemailer` and all other required packages.

## Step 2: Configure Email (Choose One Option)

### Option A: Gmail (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account:

   - Go to [https://myaccount.google.com/security]
   - Turn on 2-Step Verification

2. **Create App Password**:

   - Go to [https://myaccount.google.com/apppasswords]
   - Select "Mail" and your device
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Add to `.env` file**:

   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   NOTIFICATION_EMAIL=admin@ssteering.co.za
   ```

### Option B: Microsoft 365 / Outlook

Add to `.env` file:

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

### Option C: Your Hosting Provider's SMTP

Contact your hosting provider for SMTP settings, then add to `.env`:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@ssteering.co.za
EMAIL_PASSWORD=your-email-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

## Step 3: Test It

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Submit a test form** on your website:

   - Go to [http://localhost:3300/contact]
   - Fill out and submit the form

3. **Check your email** at the `NOTIFICATION_EMAIL` address

4. **Check server logs** for confirmation:

   ```txt
   ✅ Success: "Contact form notification email sent: <message-id>"
   ❌ Error: "Error sending contact form notification email: [details]"
   ```

## Troubleshooting

### "Email not configured" warning

- Make sure all `EMAIL_*` variables are in your `.env` file
- Restart the server after adding variables

### "Authentication failed"

- **Gmail**: Make sure you're using an app-specific password, not your regular password
- **All providers**: Double-check email and password are correct
- Try logging in to your email provider's webmail to verify credentials

### Email not received

- Check spam folder
- Verify `NOTIFICATION_EMAIL` is correct
- Check server logs for error messages

### Still not working?

See `EMAIL_SETUP.md` for detailed troubleshooting steps.

## What You'll Receive

### Contact Form Emails

- Customer details (name, company, email, phone, country)
- Their message
- IP address
- Link to Airtable record

### Parts Enquiry Emails

- All contact form info PLUS:
- Part details (brand, type, part number, serial number)
- Delivery address
- Image preview (if uploaded)
- Link to Airtable record

## Important Notes

- ✅ Form submissions will **always** save to Airtable, even if email fails
- ✅ Email sending is **non-blocking** - won't slow down form submissions
- ✅ All email attempts are **logged** for debugging
- ✅ You can **disable email** by removing the `EMAIL_*` variables from `.env`

## Production Deployment

When deploying to production:

1. Add the same `EMAIL_*` variables to your production `.env` file
2. Use a professional email address (e.g., `admin@ssteering.co.za`)
3. Consider using SendGrid for better deliverability (see `EMAIL_SETUP.md`)
4. Monitor logs after deployment to confirm emails are sending

---

**Need more help?** See `EMAIL_SETUP.md` for comprehensive documentation.
