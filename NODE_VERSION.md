# Node.js Version Management

This project requires **Node.js v20.19.0** for compatibility with native dependencies (specifically `better-sqlite3`).

## Version Files

- `.nvmrc` - Specifies Node.js version for `nvm` users (20.19.0)
- `.node-version` - Specifies Node.js version for other version managers (20)

## Ensuring Correct Version

### For nvm Users (Recommended)

1. **Automatic (if using nvm auto-switch):**
   ```bash
   cd /path/to/specialised
   # nvm will automatically use the version from .nvmrc
   npm start
   ```

2. **Manual:**
   ```bash
   nvm use
   # or explicitly:
   nvm use 20.19.0
   npm start
   ```

3. **Verify version:**
   ```bash
   node --version
   # Should output: v20.19.0
   ```

### If Version Check Fails

If you see an error like:
```
❌ Error: Node.js v20.19.0 required, but found vX.X.X
   Run: nvm use 20
```

1. **Check available versions:**
   ```bash
   nvm list
   ```

2. **Install v20.19.0 if missing:**
   ```bash
   nvm install 20.19.0
   nvm use 20.19.0
   ```

3. **Set as default (optional):**
   ```bash
   nvm alias default 20.19.0
   ```

### For Other Version Managers

- **n**: `n 20.19.0`
- **fnm**: `fnm use`
- **asdf**: `asdf install nodejs 20.19.0 && asdf local nodejs 20.19.0`

## Why This Matters

The `better-sqlite3` package compiles native bindings that are **specific to the Node.js version**. If you run the server with a different Node.js version than the one used to compile the module, you'll get errors like:

```
Error: The module was compiled against a different Node.js version
NODE_MODULE_VERSION 115. This version of Node.js requires NODE_MODULE_VERSION 141
```

## npm start Safety Check

The `prestart` script in `package.json` automatically checks the Node.js version before starting the server. This prevents the server from starting with an incorrect Node.js version.

## Production Deployment

For production servers, ensure:
1. The server environment uses Node.js v20.19.0
2. Dependencies are installed with: `npm ci` or `npm install`
3. Native modules are rebuilt if Node.js version changes: `npm rebuild`

## Troubleshooting

### "Module was compiled against a different Node.js version"

**Solution:** Rebuild native modules for the current Node.js version:
```bash
npm rebuild better-sqlite3
```

### Server starts but crashes on database operations

**Solution:** Check Node.js version matches:
```bash
node --version  # Should be v20.19.0
npm rebuild better-sqlite3
```

### Multiple Node.js versions installed

**Solution:** Use nvm to manage versions and ensure the correct one is active:
```bash
nvm use 20.19.0
which node  # Should point to nvm version, not Homebrew
```

