/**
 * Content Script for VPN Proxy Extension
 * Runs on web pages to provide additional functionality if needed
 */

// Content script to detect and report IP changes or proxy status
(function() {
    'use strict';
    
    console.log('VPN Proxy Extension content script loaded');
    
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case 'checkPageLoad':
                handlePageLoadCheck(sendResponse);
                return true;
                
            case 'getPageInfo':
                handleGetPageInfo(sendResponse);
                return true;
                
            default:
                sendResponse({ error: 'Unknown action in content script' });
        }
    });
    
    /**
     * Check if page loaded successfully (indicates proxy is working)
     */
    function handlePageLoadCheck(sendResponse) {
        const pageInfo = {
            url: window.location.href,
            title: document.title,
            loadTime: performance.now(),
            timestamp: new Date().toISOString()
        };
        
        sendResponse({ success: true, pageInfo });
    }
    
    /**
     * Get current page information
     */
    function handleGetPageInfo(sendResponse) {
        const pageInfo = {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        sendResponse({ success: true, pageInfo });
    }
    
    // Optional: Detect and report any proxy-related errors or issues
    window.addEventListener('error', (event) => {
        // Report network errors that might be proxy-related
        if (event.error && event.error.name === 'NetworkError') {
            chrome.runtime.sendMessage({
                action: 'reportNetworkError',
                error: {
                    message: event.error.message,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                }
            });
        }
    });
    
    // Optional: Monitor for IP detection attempts on the page
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // Detect IP checking services
        if (typeof url === 'string' && 
            (url.includes('ipify') || 
             url.includes('ip-api') || 
             url.includes('httpbin') ||
             url.includes('whatismyip'))) {
            
            console.log('IP detection request detected:', url);
            
            // Notify background script of IP check
            chrome.runtime.sendMessage({
                action: 'ipCheckDetected',
                url: url,
                timestamp: new Date().toISOString()
            });
        }
        
        return originalFetch.apply(this, args);
    };
    
})();
