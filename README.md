# PWA Alarm App

This is a Progressive Web Application (PWA) built with React and Vite. It is optimized for mobile devices and features a modern look with an image header and a 3x2 button grid.

## Features

- Progressive Web App (PWA) capabilities for offline use and installability.
- Modern UI with a responsive design.
- Image header.
- 3x2 grid of interactive buttons.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed.

### Installation

1. Clone the repository (if applicable) or download the source code.
2. Navigate to the project directory:
   ```bash
   cd alarmapp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

This will open the app in your default browser. Changes to the code will be reflected live.

### Building for Production

To build the app for production:

```bash
npm run build
```

This will create an optimized build in the `dist` folder.

## PWA Setup

- The app includes a `manifest.json` and a service worker (`sw.js`) in the `public` directory for PWA functionality.
- The `index.html` file is configured to register the service worker.

## Customization

- **Image Header**: Replace the placeholder image URL in `src/App.jsx` with your desired image.
- **Buttons**: Modify the button labels and functionality in `src/App.jsx`.
- **Styling**: Adjust styles in `src/App.css` and `src/index.css` to match your branding.

## GitHub Setup

To upload this project to GitHub:

1.  **Initialize a Git repository** (if you haven't already):
    ```bash
    git init -b main
    ```
2.  **Add all files to staging**:
    ```bash
    git add .
    ```
3.  **Commit your changes**:
    ```bash
    git commit -m "Initial commit: PWA Alarm App setup"
    ```
4.  **Create a new repository on GitHub.**
5.  **Link your local repository to the GitHub repository**:
    ```bash
    git remote add origin <YOUR_REPOSITORY_URL>
    ```
    Replace `<YOUR_REPOSITORY_URL>` with the URL of your GitHub repository.
6.  **Push your code to GitHub**:
    ```bash
    git push -u origin main
    ```
