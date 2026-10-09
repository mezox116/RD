RD — RED DEVILS WEBSITE

FILES
- index.html: website
- script.js: website behavior and owner panel
- assets/red-devils-logo.png: your supplied logo

HOW TO USE
1. Upload the contents of this folder to a static website host (for example, Netlify, GitHub Pages, or your hosting provider). Keep the assets folder and script.js beside index.html.
2. Before publishing, open script.js and change OWNER_PASSWORD from RDowner2026! to your preferred password.
3. Open the site and use Owner Panel to add/remove players, assign/remove captain status, add/remove matches, and record results.
4. Changes are saved in that browser/device. Use Export backup regularly; Import backup can restore it.

IMPORTANT LIMITATION
This is a static website. Data is stored in the browser's localStorage, so it does not automatically sync across visitors/devices and may be cleared with browser data. The owner password is visible in client-side JavaScript and is not secure authentication. For a public production site with shared data and real owner-only permissions, connect a backend/database and server-side authentication.
