# Cherry Captures

A multi-page photography studio website with a separate admin portal, built with plain HTML, CSS and JavaScript plus a small Node.js server. It uses only Node.js built-in modules.

## Run locally

1. Install Node.js 20 or newer.
2. In PowerShell, set an admin password and start the server:

   $env:ADMIN_PASSWORD = "choose-a-long-private-password"
   npm start

3. Open http://127.0.0.1:3000 for the website or http://127.0.0.1:3000/admin.html for the admin portal.

The server creates data/site-data.json the first time it starts. Booking enquiries are saved there. The admin portal lets you review each enquiry, update its status, and change the studio phone, WhatsApp, email and Instagram details. The admin password is read from the ADMIN_PASSWORD environment variable and is never stored in the website files.

## Contact setup

The studio phone and WhatsApp number are prefilled as +91 97041 63008 and 919704163008. Change either from Admin → Studio settings. Enquiries sent through the contact form are stored in the admin inbox; the page also has direct call and WhatsApp buttons.

## Visual assets and publishing

The hero still was generated for Cherry Captures and has a slow cinematic camera drift. The AI video service rejected generation because this account requires a higher plan, so there is no generated MP4 in this project. To use an actual video later, place an optimized, silent MP4 in public and switch the hero artwork to a muted, autoplaying, looping video with the current image as its poster.

Other portfolio and service photos currently use Unsplash sample images. Replace those with Cherry Captures’ own work before publishing.

The admin session lives in server memory and expires after eight hours. For production hosting, use HTTPS and persistent server storage or a managed database, and set a strong private ADMIN_PASSWORD in the host environment.
