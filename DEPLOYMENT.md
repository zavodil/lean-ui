# 🚀 Deployment Instructions

## Quick Deploy to GitHub Pages

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Lean Editor Iframe"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lean-ui.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Done! Your site will deploy automatically

### 3. Access Your Iframe

After ~2 minutes, your iframe will be live at:
```
https://YOUR_USERNAME.github.io/lean-ui/
```

## Manual Deployment (Any Static Host)

### Build

```bash
npm install
npm run build
```

### Deploy `dist/` folder to:

- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: `vercel --prod`
- **Cloudflare Pages**: Connect repo
- **AWS S3**: `aws s3 sync dist/ s3://your-bucket`
- **Any static host**: Upload `dist/` contents

## Environment Variables

No environment variables needed! This is a pure frontend application.

## Custom Domain

### GitHub Pages

1. Add `CNAME` file to `/public` directory with your domain
2. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```

### Other Hosts

Follow your hosting provider's custom domain instructions.

## Testing After Deployment

1. Open `https://YOUR_USERNAME.github.io/lean-ui/` in browser
2. You should see the Lean editor with toolbar
3. Type `\a` and it should convert to `α`
4. Press Cmd/Ctrl+S to test save functionality

## Embedding in Your Site

```html
<iframe 
    src="https://YOUR_USERNAME.github.io/lean-ui/"
    width="100%" 
    height="600px"
    style="border: none;">
</iframe>
```

## Troubleshooting

### 404 Error

- Wait 2-5 minutes for GitHub Pages to deploy
- Check GitHub Actions tab for build status
- Ensure Pages source is set to "GitHub Actions"

### Symbols Not Converting

- Clear browser cache
- Check browser console for errors
- Verify you're typing `\a` not `/a`

### PostMessage Not Working

- Check if iframe loaded successfully
- Open browser DevTools → Console
- Look for CORS or origin errors

## Updating

```bash
# Make changes
git add .
git commit -m "Update: ..."
git push

# GitHub Actions will auto-deploy
```

## Production Checklist

- [ ] Enable HTTPS (GitHub Pages does this automatically)
- [ ] Add origin validation in `src/main.ts`
- [ ] Replace `*` with specific origins in postMessage calls
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Monitor GitHub Actions for build failures

## Support

See [test.html](test.html) for working example.
Check [TESTING.md](TESTING.md) for comprehensive guide.
