# Camera capture demo

This repository now contains `camera.html`, a small page that demonstrates two ways to take or upload a photo:

- A hidden file input with `capture="environment"` (commonly used on mobile to open the camera).
- A live camera preview using `getUserMedia` with a capture button (works on desktop and mobile browsers that support it).

How to open locally (Windows PowerShell):

1. Open the project folder in PowerShell, e.g.:

```powershell
cd D:\CODES\PROJECTS\TRACE-THE-PATH
```

2a. Quick open in your default browser (may work directly):

```powershell
Start-Process .\camera.html
```

2b. Serve over a local HTTP server (recommended, and required for some camera permissions):

```powershell
# If you have Python installed
python -m http.server 8000
# Then open http://localhost:8000/camera.html in your browser
```

Mobile notes:
- On mobile browsers, the file input with `capture="environment"` will usually open the camera app.
- For the getUserMedia live preview, the browser may require the page to be served over HTTPS (or localhost) to grant camera permission.

Browser notes:
- Chrome, Edge, and Safari on iOS/Android support camera capture differently. If the live camera doesn't start, use the Upload button.
- If you see permission errors, make sure the page is served from `http://localhost` or `https://`.

Next steps (ideas):
- Add a small upload form that sends the captured image to a backend.
- Add cropping/resize before upload.

If you want, I can wire this into `addPlace.html` or make a smaller version that just returns a File/Blob to JavaScript for upload.