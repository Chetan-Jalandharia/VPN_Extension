# VPN Proxy Extension

A basic VPN-like browser extension that masks IP addresses using proxy servers for educational purposes.

## Features

- 🔒 **IP Masking**: Hide your real IP address using proxy servers
- 🌍 **Multiple Proxy Servers**: Choose from various proxy servers worldwide
- 📍 **Location Display**: See your current IP address and location
- 🔄 **Easy Toggle**: Simple connect/disconnect functionality
- 🎨 **Clean UI**: Modern React.js interface

## Technical Stack

- **Frontend**: React.js with modern CSS styling
- **Extension**: Chrome Extension Manifest V3
- **APIs**: Free proxy list APIs and IP detection services
- **Build**: Webpack for bundling and development

## Project Structure

```
vpn-proxy-extension/
├── manifest.json              # Extension manifest
├── package.json              # Node.js dependencies
├── webpack.config.js         # Webpack configuration
├── src/
│   ├── popup/               # Extension popup (React app)
│   │   ├── index.js        # Entry point
│   │   ├── App.js          # Main React component
│   │   ├── popup.html      # HTML template
│   │   └── popup.css       # Styles
│   ├── components/         # React components
│   │   ├── StatusDisplay.js # IP/connection status
│   │   └── ProxyList.js    # Proxy server list
│   ├── services/           # API services
│   │   ├── proxyService.js # Proxy management
│   │   └── ipService.js    # IP detection
│   ├── background/         # Background script
│   │   └── background.js   # Extension background tasks
│   └── content/            # Content script
│       └── content.js      # Page interaction
├── icons/                  # Extension icons
└── dist/                   # Built extension (generated)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Chrome/Chromium browser

### Development Setup

1. **Clone/Download the project**
   ```bash
   cd vpn-proxy-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `dist` folder

### Development Commands

- `npm run dev` - Build in development mode with watch
- `npm run build` - Build for production
- `npm start` - Start webpack dev server (for component testing)

## Usage

1. **Install Extension**: Follow the installation steps above
2. **Open Popup**: Click the extension icon in Chrome toolbar
3. **View Status**: See your current IP address and connection status
4. **Select Proxy**: Choose a proxy server from the available list
5. **Connect**: Click on a proxy to connect through it
6. **Verify**: Check that your IP address has changed
7. **Disconnect**: Click "Disconnect" to return to normal browsing

## API Integration

### Proxy Sources
- **Primary**: proxy-list.download API for live proxy servers
- **Fallback**: Curated static proxy list for reliability

### IP Detection
- **Primary**: ipify.org API for IP detection
- **Secondary**: ip-api.com for IP and location info
- **Fallback**: httpbin.org for basic IP detection

## Educational Purpose

This extension is designed for educational purposes to demonstrate:
- Browser extension development with React.js
- Proxy server integration
- IP masking concepts
- Chrome Extension APIs usage
- Modern web development practices

**Important**: This is a basic implementation for learning purposes. For production use, consider security, reliability, and performance optimizations.

## Browser Permissions

The extension requests the following permissions:
- `proxy`: To configure browser proxy settings
- `storage`: To save user preferences and proxy state
- `tabs`: To monitor tab updates
- `activeTab`: To interact with current page
- `scripting`: For content script injection
- `<all_urls>`: To work with all websites

## Security Notes

- Proxy servers are third-party and may log traffic
- Use only for educational and testing purposes
- Be aware of data privacy when using public proxies
- Consider using verified and trusted proxy services for sensitive browsing

## Troubleshooting

### Common Issues

1. **Extension doesn't load**
   - Check console for build errors
   - Ensure all dependencies are installed
   - Verify manifest.json syntax

2. **Proxy connection fails**
   - Try a different proxy server
   - Check if proxy server is still active
   - Verify network connectivity

3. **IP doesn't change**
   - Wait a few seconds after connecting
   - Refresh the page you're testing on
   - Try disconnecting and reconnecting

### Development Issues

1. **Build fails**
   ```bash
   rm -rf node_modules
   npm install
   npm run build
   ```

2. **React components not updating**
   - Use `npm run dev` for watch mode
   - Check browser console for errors
   - Reload extension in chrome://extensions/

## Contributing

This is an educational project. Feel free to:
- Report issues or bugs
- Suggest improvements
- Add new features
- Improve documentation

## License

This project is for educational purposes. Please respect all applicable laws and terms of service when using proxy servers.

## Disclaimer

This extension is for educational purposes only. The developers are not responsible for any misuse or legal issues arising from the use of this software. Always comply with local laws and website terms of service.
