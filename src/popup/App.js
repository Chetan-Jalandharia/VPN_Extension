import React, { useState, useEffect } from 'react';
import ProxyList from '../components/ProxyList';
import StatusDisplay from '../components/StatusDisplay';
import { ProxyService } from '../services/proxyService';
import { IPService } from '../services/ipService';

const App = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [currentIP, setCurrentIP] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [proxies, setProxies] = useState([]);
    const [selectedProxy, setSelectedProxy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        initializeExtension();
    }, []);

    /**
     * Initialize the extension by loading current state and fetching proxy list
     */
    const initializeExtension = async () => {
        try {
            setLoading(true);
            setError('');

            // Check if chrome APIs are available
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                setError('Extension APIs not available. Please reload the extension.');
                setLoading(false);
                return;
            }

            // Get current IP and location
            await updateCurrentIP();

            // Load proxy list
            await loadProxyList();

            // Check if proxy is currently active
            const proxyStatus = await ProxyService.getCurrentProxyStatus();
            setIsConnected(proxyStatus.isActive);
            if (proxyStatus.activeProxy) {
                setSelectedProxy(proxyStatus.activeProxy);
            }

        } catch (err) {
            console.error('Initialization error:', err);
            setError('Failed to initialize extension. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch and update current IP address and location
     */
    const updateCurrentIP = async () => {
        try {
            const ipInfo = await IPService.getCurrentIP();
            setCurrentIP(ipInfo.ip || 'Unable to fetch');
            setCurrentLocation(ipInfo.location || 'Unknown');
        } catch (err) {
            console.error('Error fetching IP:', err);
            setCurrentIP('Unable to fetch');
            setCurrentLocation('Unknown');
        }
    };

    /**
     * Load available proxy servers from API
     */
    const loadProxyList = async () => {
        try {
            const proxyList = await ProxyService.fetchProxyList();
            setProxies(proxyList || []);
        } catch (err) {
            console.error('Error loading proxies:', err);
            setError('Failed to load proxy servers. Using fallback list.');
            // Set a basic fallback list
            setProxies([
                {
                    id: 'fallback-1',
                    ip: '8.8.8.8',
                    port: 3128,
                    country: 'Demo Server',
                    protocol: 'http',
                    anonymity: 'anonymous'
                }
            ]);
        }
    };

    /**
     * Connect to selected proxy server
     */
    const connectToProxy = async (proxy) => {
        try {
            setLoading(true);
            setError('');

            await ProxyService.setProxy(proxy);
            setSelectedProxy(proxy);
            
            // Provide appropriate feedback based on proxy type
            if (proxy.id === 'direct') {
                setIsConnected(false);
                setError('✅ Direct connection active - browsing normally without proxy');
            } else if (proxy.id === 'system') {
                setIsConnected(true);
                setError('⚙️ Using system proxy settings - check your OS network configuration');
            } else if (proxy.id === 'pac-demo') {
                setIsConnected(true);
                setError('📜 PAC script demo active - demonstrates proxy auto-configuration');
            } else {
                setIsConnected(true);
                setError('🔗 Proxy server connected - IP should be masked');
            }

            // Update IP after connecting
            setTimeout(async () => {
                await updateCurrentIP();
                setLoading(false);
            }, 1500); // Shorter delay for better UX

        } catch (err) {
            console.error('Connection error:', err);
            setError(`❌ Connection failed: ${err.message}. Try "Direct Connection" for normal browsing.`);
            setLoading(false);
        }
    };

    /**
     * Disconnect from current proxy
     */
    const disconnectProxy = async () => {
        try {
            setLoading(true);
            setError('');

            await ProxyService.clearProxy();
            setSelectedProxy(null);
            setIsConnected(false);

            // Update IP after disconnecting
            setTimeout(async () => {
                await updateCurrentIP();
                setLoading(false);
            }, 2000);

        } catch (err) {
            console.error('Disconnection error:', err);
            setError('Failed to disconnect from proxy.');
            setLoading(false);
        }
    };

    /**
     * Test proxy connection
     */
    const testProxyConnection = async () => {
        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { action: 'testConnection' },
                    (response) => resolve(response)
                );
            });

            if (response && !response.connected) {
                setError(`Proxy connection test failed: ${response.message}. Pages may not load properly.`);
            }
        } catch (err) {
            console.error('Connection test error:', err);
        }
    };

    /**
     * Refresh proxy list and current status
     */
    const refreshData = async () => {
        await initializeExtension();
    };

    if (loading && proxies.length === 0) {
        return (
            <div className="vpn-container">
                <div className="header">
                    <h1>VPN Proxy</h1>
                    <p>Educational IP Masking Tool</p>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="vpn-container">
            <div className="header">
                <h1>VPN Proxy</h1>
                <p>Educational IP Masking Tool</p>
            </div>

            {error && (
                <div className="error">
                    {error}
                    <button className="refresh-btn" onClick={refreshData}>
                        Refresh
                    </button>
                </div>
            )}

            {/* Educational Notice */}
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '10px', 
                borderRadius: '5px', 
                fontSize: '12px', 
                marginBottom: '15px',
                opacity: '0.9'
            }}>
                📚 <strong>Educational Extension:</strong> This demonstrates proxy concepts. 
                Real IP masking requires working proxy servers. Use "Direct Connection" for normal browsing.
            </div>

            <StatusDisplay
                isConnected={isConnected}
                currentIP={currentIP}
                currentLocation={currentLocation}
                selectedProxy={selectedProxy}
            />

            <ProxyList
                proxies={proxies}
                selectedProxy={selectedProxy}
                onProxySelect={connectToProxy}
                loading={loading}
            />

            <div className="controls">
                {isConnected ? (
                    <button
                        className="btn danger"
                        onClick={disconnectProxy}
                        disabled={loading}
                    >
                        {loading ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                ) : (
                    <button
                        className="btn"
                        onClick={refreshData}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Proxies'}
                    </button>
                )}
            </div>

            {/* Usage Instructions */}
            <div style={{ 
                fontSize: '11px', 
                opacity: '0.7', 
                marginTop: '15px', 
                lineHeight: '1.4' 
            }}>
                💡 <strong>How to use:</strong><br/>
                • Select "Direct Connection" for normal browsing<br/>
                • "System Proxy" uses your OS proxy settings<br/>
                • "PAC Script Demo" shows proxy configuration concepts<br/>
                • Check browser console for technical details
            </div>
        </div>
    );
};

export default App;
