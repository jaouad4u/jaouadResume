INSTALLATION
1. Replace your existing resume index.html with the included index.html.
2. Put certificates.html, certificates.js, and certificates-list.js beside index.html in the published folder of your GitHub project.
3. Keep your current profile image and other existing assets where they are.
4. Edit certificates-list.js. Add the exact paths of your existing JPEG/PDF files, for example:

window.CERTIFICATES = [
  { title: "Master’s diploma", file: "certificates/masters.pdf", category: "Diploma" },
  { title: "Security+", file: "certificates/security-plus.jpg", category: "Certificate" }
];

These are examples, not your actual filenames. Replace them with real paths.
If your files are in the project root, use file: "actual-name.pdf".
Paths and capitalization must match. A folder is not automatically scanned.
Use paths on your published site, not github.com/.../blob/... links.
Files must be included in the deployed website, not just stored elsewhere in the repository.
If your homepage has another filename, update the Back to résumé link in certificates.html.
5. Commit your changes and wait for your existing hosting deployment to finish.
6. Open your website, select My certificates, then View document.

VIEWING
JPEG/JPG/PNG images and multipage PDFs are supported. PDFs use Mozilla PDF.js,
loaded from jsDelivr when needed. The viewer provides previous/next page buttons
and no download, print, editing, or raw-file links. Internet access to jsDelivr is
required for PDFs. Test via your hosted website or a local HTTP server, not file://.
The existing Download PDF button still exports your résumé.

LIMITS
This discourages casual saving; it cannot prevent downloading, screenshots,
browser developer tools, or access to files in a public GitHub repository.
A browser must receive a document to display it. Certificate-page print styles
hide the documents but do not provide security. PDF pages render as images;
there is no searchable/selectable text layer or full screen-reader transcription.
Password-protected PDFs are not supported. Publish redacted copies if needed.

Source: Mozilla PDF.js examples and documentation
https://mozilla.github.io/pdf.js/examples/
https://mozilla.github.io/pdf.js/getting_started/
