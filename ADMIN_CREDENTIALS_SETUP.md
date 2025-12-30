# Admin Credentials Setup

This document explains how to set and manage admin credentials for the gallery management admin routes.

## Current Configuration

The admin routes (`/admin/*`) are protected with Basic Authentication using:
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password

These are configured via environment variables (from `.env` file in development).

## Setting Credentials

### Option 1: Using the Helper Script (Recommended)

The easiest way to set or update credentials:

```bash
# Interactive mode (prompts for username, generates random password)
node scripts/set-admin-credentials.js

# Set username and password directly
node scripts/set-admin-credentials.js admin my_secure_password

# Set username only (generates random password)
node scripts/set-admin-credentials.js admin
```

The script will:
- Add or update credentials in your `.env` file
- Optionally generate a secure random password
- Preserve all other environment variables

### Option 2: Manual .env Edit

Edit `.env` file directly and add:

```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

### Option 3: Environment Variables (Temporary)

Set directly when running the server (temporary, not persisted):

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=password npm start
```

### Option 4: Production (.htaccess)

For production servers, credentials are set via `.htaccess` `SetEnv` directives:

```apache
SetEnv ADMIN_USERNAME your_username
SetEnv ADMIN_PASSWORD your_password
```

**Note**: Never commit `.htaccess` with real credentials - use deployment scripts or server-specific configuration.

## Forgot Credentials?

If you forget the credentials, you can reset them using the helper script:

```bash
# Reset to new credentials (interactive)
node scripts/set-admin-credentials.js

# Reset with specific values
node scripts/set-admin-credentials.js admin new_password
```

The script will overwrite any existing `ADMIN_USERNAME` and `ADMIN_PASSWORD` entries in `.env`.

## Current Dummy Credentials

For development, dummy credentials are currently set:
- **Username**: `admin`
- **Password**: `temp_admin_password_123`

⚠️ **Important**: These are temporary dummy credentials. Update them before deploying to production or sharing with the client.

## Testing Credentials

After setting credentials, restart your server and test with:

```bash
# Test authentication (should return 401 without credentials)
curl http://localhost:3300/admin/google/photos/sessions -X POST

# Test with credentials (should return session ID or error, but not 401)
curl http://localhost:3300/admin/google/photos/sessions \
  -X POST \
  -u "admin:temp_admin_password_123"
```

## Security Notes

1. **Development**: Dummy credentials are fine for local development
2. **Production**: Use strong, unique credentials
3. **Password Generation**: The helper script can generate cryptographically secure random passwords
4. **Storage**: Credentials are stored in `.env` (development) or `.htaccess` (production)
5. **Git**: `.env` and `.htaccess` are in `.gitignore` - never commit real credentials

## Updating Client Credentials

When the client provides their preferred credentials:

```bash
node scripts/set-admin-credentials.js client_username client_password
```

Or update manually in `.env`:
```env
ADMIN_USERNAME=client_username
ADMIN_PASSWORD=client_password
```

Then restart the server for changes to take effect.

