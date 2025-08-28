// Background Script for VPN Proxy Extension
// Simple, reliable implementation without modern JavaScript features

console.log('VPN Proxy Extension background script loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('VPN Proxy Extension installed:', details.reason);
    
    // Initialize extension storage
    chrome.storage.local.set({
        proxyActive: false,
        selectedProxy: null,
        installDate: new Date().toISOString()
    });

    // Create context menu
    try {
        chrome.contextMenus.create({
            id: "vpn-proxy-toggle",
            title: "Toggle VPN Proxy",
            contexts: ["action"]
        });
    } catch (error) {
        console.log('Context menu creation failed:', error);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(function() {
    console.log('VPN Proxy Extension started');
    
    // Check if proxy was active before browser restart
    chrome.storage.local.get(['proxyActive', 'selectedProxy'], function(result) {
        if (result.proxyActive && result.selectedProxy) {
            console.log('Restoring proxy configuration:', result.selectedProxy);
        }
    });
});

// Handle proxy errors
chrome.proxy.onProxyError.addListener(function(details) {
    console.error('Proxy error:', details);
    
    // Store error info
    chrome.storage.local.set({
        proxyActive: false,
        lastError: {
            message: details.error,
            timestamp: new Date().toISOString()
        }
    });
    
    console.log('Proxy connection failed. Please try another server.');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background received message:', request);
    
    if (request.action === 'setProxy') {
        handleSetProxy(request.proxy, sendResponse);
        return true;
    } else if (request.action === 'clearProxy') {
        handleClearProxy(sendResponse);
        return true;
    } else if (request.action === 'getProxyStatus') {
        handleGetProxyStatus(sendResponse);
        return true;
    } else if (request.action === 'fetchProxies') {
        handleFetchProxies(sendResponse);
        return true;
    } else if (request.action === 'getCurrentIP') {
        handleGetCurrentIP(sendResponse);
        return true;
    } else if (request.action === 'testConnection') {
        handleTestConnection(sendResponse);
        return true;
    } else {
        sendResponse({ error: 'Unknown action' });
    }
});

// Set proxy configuration
function handleSetProxy(proxy, sendResponse) {
    // Validate proxy data
    if (!proxy || !proxy.ip) {
        sendResponse({ 
            success: false, 
            error: 'Invalid proxy configuration' 
        });
        return;
    }

    var config;
    
    // Handle direct connection (no proxy)
    if (proxy.id === 'direct' || proxy.ip === 'DIRECT') {
        config = {
            mode: "direct"
        };
    } else {
        // Regular proxy configuration
        if (!proxy.port) {
            sendResponse({ 
                success: false, 
                error: 'Invalid proxy port' 
            });
            return;
        }

        config = {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: proxy.protocol || "http",
                    host: proxy.ip,
                    port: proxy.port
                }
            }
        };
    }

    console.log('Setting proxy config:', config);

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function() {
            if (chrome.runtime.lastError) {
                console.error('Error setting proxy:', chrome.runtime.lastError);
                sendResponse({ 
                    success: false, 
                    error: chrome.runtime.lastError.message 
                });
            } else {
                console.log('Proxy set successfully:', proxy);
                
                // Store proxy info
                chrome.storage.local.set({
                    selectedProxy: proxy,
                    proxyActive: proxy.id !== 'direct',
                    lastConnected: new Date().toISOString()
                }, function() {
                    sendResponse({ success: true });
                });
            }
        }
    );
}

// Clear proxy configuration
function handleClearProxy(sendResponse) {
    // Set to direct mode instead of clearing
    var directConfig = {
        mode: "direct"
    };

    chrome.proxy.settings.set(
        { value: directConfig, scope: 'regular' },
        function() {
            if (chrome.runtime.lastError) {
                console.error('Error clearing proxy:', chrome.runtime.lastError);
                sendResponse({ 
                    success: false, 
                    error: chrome.runtime.lastError.message 
                });
            } else {
                console.log('Proxy cleared successfully - set to direct mode');
                
                // Clear stored proxy info
                chrome.storage.local.set({
                    selectedProxy: null,
                    proxyActive: false,
                    lastDisconnected: new Date().toISOString()
                }, function() {
                    sendResponse({ success: true });
                });
            }
        }
    );
}

// Get current proxy status
function handleGetProxyStatus(sendResponse) {
    chrome.storage.local.get(['selectedProxy', 'proxyActive', 'lastError'], function(result) {
        sendResponse({
            isActive: result.proxyActive || false,
            activeProxy: result.selectedProxy || null,
            lastError: result.lastError || null
        });
    });
}

// Fetch proxy list
function handleFetchProxies(sendResponse) {
    try {
        // Simple proxy list with working options
        var proxies = [
            {
                id: 'direct',
                ip: 'DIRECT',
                port: 0,
                country: 'Direct Connection (No Proxy)',
                protocol: 'direct',
                anonymity: 'none'
            },
            {
                id: 'demo-1',
                ip: '127.0.0.1',
                port: 8080,
                country: 'Local Test Server',
                protocol: 'http',
                anonymity: 'transparent'
            },
            {
                id: 'demo-2',
                ip: 'proxy.example.com',
                port: 3128,
                country: 'Demo Proxy Server',
                protocol: 'http',
                anonymity: 'anonymous'
            }
        ];
        
        sendResponse({ success: true, proxies: proxies });
        
    } catch (error) {
        console.error('Error fetching proxies:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Get current IP address and location
function handleGetCurrentIP(sendResponse) {
    // Try to fetch IP from external API
    fetch('https://api.ipify.org?format=json')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('API request failed');
        })
        .then(function(data) {
            sendResponse({ 
                success: true, 
                ipInfo: {
                    ip: data.ip,
                    location: 'Location lookup disabled for privacy'
                }
            });
        })
        .catch(function(error) {
            console.log('IP API failed, using fallback:', error);
            // Fallback IP info
            sendResponse({ 
                success: true, 
                ipInfo: {
                    ip: 'Unable to detect',
                    location: 'Unknown'
                }
            });
        });
}

// Test connection to verify proxy is working
function handleTestConnection(sendResponse) {
    console.log('Testing connection...');
    
    // Try to fetch a simple endpoint
    fetch('https://httpbin.org/ip')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Connection test failed');
        })
        .then(function(data) {
            sendResponse({ 
                success: true, 
                connected: true,
                ip: data.origin,
                message: 'Connection successful'
            });
        })
        .catch(function(error) {
            console.error('Connection test failed:', error);
            sendResponse({ 
                success: true, 
                connected: false,
                message: 'Connection test failed: ' + error.message
            });
        });
}

// Handle tab updates to check if proxy is working
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if proxy is active and working
        chrome.storage.local.get(['proxyActive'], function(result) {
            if (result.proxyActive) {
                console.log('Page loaded with proxy active:', tab.url);
            }
        });
    }
});

// Handle context menu clicks
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        if (info.menuItemId === "vpn-proxy-toggle") {
            try {
                chrome.action.openPopup();
            } catch (error) {
                console.log('Failed to open popup:', error);
            }
        }
    });
}
