import React from 'react';

/**
 * ProxyList Component
 * Displays available proxy servers and handles selection
 */
const ProxyList = ({ proxies, selectedProxy, onProxySelect, loading }) => {
    
    /**
     * Handle proxy selection
     */
    const handleProxyClick = (proxy) => {
        if (loading) return;
        onProxySelect(proxy);
    };

    /**
     * Check if a proxy is currently selected
     */
    const isProxySelected = (proxy) => {
        return selectedProxy && 
               selectedProxy.ip === proxy.ip && 
               selectedProxy.port === proxy.port;
    };

    return (
        <div className="proxy-selection">
            <h3>Available Proxy Servers</h3>
            
            {proxies.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: '0.7', fontSize: '14px' }}>
                    No proxy servers available
                </div>
            ) : (
                <div className="proxy-list">
                    {proxies.map((proxy, index) => (
                        <div
                            key={`${proxy.ip}-${proxy.port}-${index}`}
                            className={`proxy-item ${isProxySelected(proxy) ? 'active' : ''}`}
                            onClick={() => handleProxyClick(proxy)}
                            style={{ 
                                cursor: loading ? 'wait' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            <div className="proxy-info">
                                <div className="proxy-details">
                                    <div className="proxy-ip">
                                        {proxy.ip}:{proxy.port}
                                    </div>
                                    <div className="proxy-location">
                                        {proxy.country} - {proxy.protocol?.toUpperCase() || 'HTTP'}
                                    </div>
                                </div>
                                <div className="proxy-status">
                                    {proxy.anonymity || 'Anonymous'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {loading && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                </div>
            )}
        </div>
    );
};

export default ProxyList;
