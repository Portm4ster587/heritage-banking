# Heritage International Holdings Bank - Deployment Guide

## cPanel Deployment Instructions

### Prerequisites
- Node.js 18+ installed on your server
- cPanel access with Node.js selector or SSH access
- Domain configured and SSL certificate installed

### Build for Production

1. Clone or upload the repository to your cPanel file manager
2. Navigate to the project directory via SSH or Terminal

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Deploy to cPanel

#### Option 1: Static Site Deployment (Recommended)

1. After building, the `dist/` folder contains all static files
2. Upload contents of `dist/` to your `public_html` directory
3. Create/update `.htaccess` for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

#### Option 2: Node.js Application (For SSR/API needs)

1. In cPanel, go to "Setup Node.js App"
2. Create new application:
   - Node.js version: 18.x or higher
   - Application root: your project directory
   - Application URL: your domain
   - Application startup file: Leave empty (static site)

### Environment Configuration

The application uses Supabase for backend services. Ensure these are configured:

1. **Supabase Project Settings**
   - Authentication URL Configuration in Supabase Dashboard
   - Add your production domain to Redirect URLs

2. **Edge Functions**
   - Edge functions are automatically deployed via Lovable
   - Secrets are managed in Supabase Dashboard > Edge Functions > Secrets

### Post-Deployment Checklist

- [ ] Verify SSL certificate is active
- [ ] Test user authentication flow
- [ ] Confirm real-time notifications work
- [ ] Test file uploads (profile pictures)
- [ ] Verify PDF statement downloads
- [ ] Test support chat functionality
- [ ] Check admin panel access
- [ ] Verify crypto wallet operations
- [ ] Test wire/ACH transfer flows

### Troubleshooting

**White screen on routes:**
- Ensure `.htaccess` is properly configured for SPA routing

**Authentication not working:**
- Add production URL to Supabase Auth > URL Configuration > Redirect URLs

**Real-time features not working:**
- Check Supabase Realtime is enabled for tables
- Verify RLS policies allow subscriptions

**CORS errors:**
- Ensure Supabase URL is correctly configured
- Check Edge Function CORS headers

### Performance Optimization

The build is already optimized with:
- Code splitting
- Tree shaking
- Asset minification
- Image optimization

For additional optimization:
- Enable CDN for static assets
- Use Cloudflare for caching
- Enable HTTP/2 on server

### Backup & Recovery

- Database: Supabase handles automatic backups
- Files: Regular backups of uploaded files recommended
- Code: Version controlled via Git

### Security Notes

- Never expose service role keys in client code
- All API keys are stored as environment secrets
- RLS policies protect all user data
- Session tokens are securely managed by Supabase Auth
