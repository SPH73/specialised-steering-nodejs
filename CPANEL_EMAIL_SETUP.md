# cPanel Email SMTP Setup Guide

**Goal**: Configure email notifications using your hosting's SMTP server

---

## Step 1: Create Email Account in cPanel

1. **Log into cPanel** for specialisedsteering.com
2. Navigate to **"Email Accounts"** (under Email section)
3. Click **"Create"** or **"+ Create"**
4. Fill in:
   - **Email**: `enquiry` (or `noreply`)
   - **Domain**: `specialisedsteering.com`
   - **Password**: Create a strong password (save this!)
   - **Mailbox Quota**: 250MB is fine
5. Click **"Create"**

**Result**: `enquiry@specialisedsteering.com` created ✅

---

## Step 2: Get SMTP Settings

### Method 1: Via "Connect Devices" (Recommended)

1. In **Email Accounts**, find `enquiry@specialisedsteering.com`
2. Click **"Connect Devices"** or **"Configure Email Client"**
3. Look for **"Outgoing Mail Server"** or **"SMTP"** section
4. Note down:

   ```txt
   Server: mail.specialisedsteering.com (or similar)
   Port: 587 or 465
   Encryption: TLS (for 587) or SSL (for 465)
   Authentication: Required
   Username: enquiry@specialisedsteering.com
   Password: (the one you created)
   ```

### Method 2: Via cPanel Email Settings

1. In cPanel, scroll to **"Email"** section
2. Click **"Email Accounts"**
3. Look for **"Configure Mail Client"** link
4. Or click **"More"** → **"Configure Mail Client"**
5. Find the SMTP/Outgoing settings

### Method 3: Common Default Values

If you can't find it, these are typical values for most hosts:

```txt
SMTP Server: mail.specialisedsteering.com
             OR mail.yourhostingprovider.com
             OR smtp.specialisedsteering.com

Port: 587 (most common - TLS)
      OR 465 (SSL)
      OR 25 (usually blocked by ISPs)

Username: enquiry@specialisedsteering.com (full email address)
Password: (the password you created)
```

---

## Step 3: Test SMTP Settings

Before adding to `.env`, verify the settings work:

### Using Telnet (Linux/Mac Terminal)

```bash
# Test if port is accessible
telnet mail.specialisedsteering.com 587

# If it connects, you'll see:
# 220 mail.specialisedsteering.com ESMTP
# (Press Ctrl+C to exit)
```

**If connection refused**: Port 587 might not be open, try port 465 or contact hosting support.

### Using Online SMTP Tester

1. Go to: [https://www.smtper.net/]
2. Enter your SMTP details
3. Send a test email
4. Verify it arrives

---

## Step 4: Add to .env File

Once you have the settings, add to `.env`:

```env
# Email Configuration - cPanel SMTP
EMAIL_HOST=mail.specialisedsteering.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_REJECT_UNAUTHORIZED=true
EMAIL_USER=enquiry@specialisedsteering.com
EMAIL_PASSWORD=your-password-here
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

**Important Notes:**

| Setting          | Value                           | Notes                                       |
| ---------------- | ------------------------------- | ------------------------------------------- |
| `EMAIL_PORT`     | `587` or `465`                  | Use 587 first (TLS), if fails try 465 (SSL) |
| `EMAIL_SECURE`   | `false` for 587, `true` for 465 | Must match port                             |
| `EMAIL_USER`     | Full email address              | Not just "enquiry"                          |
| `EMAIL_PASSWORD` | Exact password                  | No spaces, case-sensitive                   |

---

## Step 5: Update Application & Test

```bash
# Make sure dependencies are installed
npm install

# Start the application
npm start

# Visit the enquiry form
# http://localhost:YOUR_PORT/enquiry

# Submit a test form
# Check terminal for: "Enquiry form notification email sent: ..."
# Check admin@ssteering.co.za inbox
```

---

## 🔧 Troubleshooting Common Issues

### Error: "ECONNREFUSED"

**Problem**: Can't connect to SMTP server

**Solutions**:

1. Verify `EMAIL_HOST` is correct (check cPanel)
2. Try different port: Change `EMAIL_PORT` from 587 to 465
3. If using 465, set `EMAIL_SECURE=true`
4. Check firewall/hosting restrictions
5. Contact hosting support

### Error: "Invalid login"

**Problem**: Authentication failed

**Solutions**:

1. Double-check `EMAIL_USER` is the full email address
2. Verify password (try resetting in cPanel)
3. Make sure email account is active
4. Check for spaces in password
5. Try re-creating the email account

### Error: "Relay access denied"

**Problem**: Server won't send emails

**Solutions**:

1. Ensure you're authenticating (EMAIL_USER and EMAIL_PASSWORD are set)
2. Check if your hosting requires "Allow Relay" for your IP
3. Contact hosting support about relay permissions

### Error: Emails not arriving

**Problem**: Sending works but emails don't arrive

**Solutions**:

1. Check spam/junk folder at [admin@ssteering.co.za]
2. Verify `NOTIFICATION_EMAIL` is correct
3. Check if [admin@ssteering.co.za] inbox is full
4. Look at terminal logs for any error messages
5. Try sending to a different email (your personal email) as a test

### Error: "Certificate verification failed"

**Problem**: SSL/TLS certificate issues

**Solutions**:

1. Set `EMAIL_REJECT_UNAUTHORIZED=false` (less secure, but works)
2. Update Node.js to latest version
3. Contact hosting about SSL certificates

---

## 📞 Questions for Hosting Support

If you need to contact support, ask:

> Hi, I'm setting up SMTP email for my domain specialisedsteering.com. Could you please provide:
>
> 1. **SMTP server hostname** (e.g., mail.specialisedsteering.com)
> 2. **SMTP port** (587 TLS or 465 SSL?)
> 3. **Authentication required?** (yes/no)
> 4. **Any IP restrictions or relay requirements?**
> 5. **SPF/DKIM records** - Are these configured for my domain?
>
> Email account: [enquiry@specialisedsteering.com]
>
> I'm using Nodemailer in a Node.js application.
>
> Thank you!

---

## 🌟 Best Practices

### Email Account Setup

- ✅ Use `enquiry@` or `noreply@` (professional)
- ✅ Strong password (save in password manager)
- ✅ Sufficient mailbox quota (250MB+)
- ✅ Don't use this account for regular correspondence

### Security

- ✅ Keep credentials in `.env` only (never commit to git)
- ✅ Use TLS/SSL encryption
- ✅ Change password periodically
- ✅ Monitor for unusual activity

### Deliverability

- ✅ Set up SPF records (ask hosting support)
- ✅ Set up DKIM (ask hosting support)
- ✅ Use proper "From" name: "Specialised Steering Website"
- ✅ Keep sending volume reasonable

---

## 📋 Checklist

Before you start:

- [ ] Access to cPanel
- [ ] Created email account: `enquiry@specialisedsteering.com`
- [ ] Noted down the password securely
- [ ] Found SMTP server hostname
- [ ] Found SMTP port (587 or 465)
- [ ] Added settings to `.env` file
- [ ] Tested connection (optional but recommended)
- [ ] Submitted test form
- [ ] Received notification email

---

## 🎯 Quick Reference

**For Port 587 (TLS - Most Common):**

```env
EMAIL_HOST=mail.specialisedsteering.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=enquiry@specialisedsteering.com
EMAIL_PASSWORD=your-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

**For Port 465 (SSL - Alternative):**

```env
EMAIL_HOST=mail.specialisedsteering.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=enquiry@specialisedsteering.com
EMAIL_PASSWORD=your-password
NOTIFICATION_EMAIL=admin@ssteering.co.za
```

---

## 📧 Email Flow Diagram

```txt
User submits form on website
         ↓
Data saved to Airtable
         ↓
App connects to mail.specialisedsteering.com (SMTP)
         ↓
Authenticates as enquiry@specialisedsteering.com
         ↓
Sends email FROM: enquiry@specialisedsteering.com
         ↓
Email delivered TO: admin@ssteering.co.za
         ↓
Client receives notification
```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Terminal shows**:

   ```txt
   Enquiry form notification email sent: <abc123@specialisedsteering.com>
   ```

2. **Email arrives** at [admin@ssteering.co.za with]:

   - Subject: "New Parts Enquiry - [Brand] [Type]"
   - From: Specialised Steering Website <enquiry@specialisedsteering.com>
   - Professional HTML template
   - All form data included
   - Link to Airtable record

3. **Airtable record** created with all data

4. **Confirmation page** shown to user with reference number

---

**Need Help?** Refer back to the troubleshooting section or contact hosting support with the questions template above.
