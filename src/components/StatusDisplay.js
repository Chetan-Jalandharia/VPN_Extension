import React from 'react';

/**
 * StatusDisplay Component
 * Shows current connection status, IP address, and location
 */
const StatusDisplay = ({ isConnected, currentIP, currentLocation, selectedProxy }) => {
    return (
        <div className="status-section">
            <div className="status-indicator">
                <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="current-ip">
                Your IP: <span className="ip-address">{currentIP}</span>
            </div>
            
            <div className="location">
                Location: {currentLocation}
            </div>

            {isConnected && selectedProxy && (
                <div style={{ marginTop: '10px', fontSize: '12px', opacity: '0.8' }}>
                    Connected via: {selectedProxy.country} ({selectedProxy.ip}:{selectedProxy.port})
                </div>
            )}
        </div>
    );
};

export default StatusDisplay;
