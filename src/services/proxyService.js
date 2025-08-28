/**
 * ProxyService - Handles proxy server management and API integration
 * Uses free proxy APIs to fetch available proxy servers
 */
export class ProxyService {
    
    /**
     * Fetch proxy list from free proxy APIs
     * Using background script to avoid CORS issues
     */
    static async fetchProxyList() {
        try {
            // Use background script to fetch proxies to avoid CORS
            return new Promise((resolve, reject) => {
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.sendMessage(
                        { action: 'fetchProxies' },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Runtime error:', chrome.runtime.lastError);
                                resolve(this.getFallbackProxyList());
                            } else if (response && response.success) {
                                resolve(response.proxies.length > 0 ? response.proxies : this.getFallbackProxyList());
                            } else {
                                resolve(this.getFallbackProxyList());
                            }
                        }
                    );
                } else {
                    // Fallback if chrome APIs not available
                    resolve(this.getFallbackProxyList());
                }
            });
            
        } catch (error) {
            console.error('Error fetching proxy list:', error);
            return this.getFallbackProxyList();
        }
    }

    /**
     * Fetch proxies from proxy-list.download API
     */
    static async fetchFromProxyListAPI() {
        try {
            // Note: This is a demonstration. In a real implementation, you would need
            // to handle CORS issues, possibly using a background script
            const response = await fetch('https://www.proxy-list.download/api/v1/get?type=http&anon=elite&country=US,GB,CA,AU,DE,FR,NL,SE,CH,JP');
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const proxyText = await response.text();
            const proxyLines = proxyText.split('\n').filter(line => line.trim());
            
            return proxyLines.slice(0, 10).map((line, index) => {
                const [ip, port] = line.split(':');
                return {
                    id: `api-${index}`,
                    ip: ip,
                    port: parseInt(port),
                    country: this.getRandomCountry(),
                    protocol: 'http',
                    anonymity: 'elite'
                };
            });
            
        } catch (error) {
            console.error('Proxy API fetch failed:', error);
            return [];
        }
    }

    /**
     * Get fallback proxy list (static list for educational purposes)
     */
    static getFallbackProxyList() {
        return [
            {
                id: 'fallback-1',
                ip: '142.93.207.210',
                port: 3128,
                country: 'United States',
                protocol: 'http',
                anonymity: 'elite'
            },
            {
                id: 'fallback-2',
                ip: '167.99.92.12',
                port: 8080,
                country: 'United Kingdom',
                protocol: 'http',
                anonymity: 'anonymous'
            },
            {
                id: 'fallback-3',
                ip: '159.89.230.23',
                port: 3128,
                country: 'Canada',
                protocol: 'http',
                anonymity: 'elite'
            },
            {
                id: 'fallback-4',
                ip: '178.62.92.63',
                port: 8080,
                country: 'Germany',
                protocol: 'http',
                anonymity: 'anonymous'
            },
            {
                id: 'fallback-5',
                ip: '146.190.173.158',
                port: 3128,
                country: 'France',
                protocol: 'http',
                anonymity: 'elite'
            }
        ];
    }

    /**
     * Set proxy configuration using Chrome Extension Proxy API
     */
    static async setProxy(proxy) {
        return new Promise((resolve, reject) => {
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                reject(new Error('Chrome extension APIs not available'));
                return;
            }

            // Use background script to set proxy
            chrome.runtime.sendMessage(
                { action: 'setProxy', proxy: proxy },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve();
                    } else {
                        reject(new Error(response?.error || 'Failed to set proxy'));
                    }
                }
            );
        });
    }

    /**
     * Clear proxy configuration
     */
    static async clearProxy() {
        return new Promise((resolve, reject) => {
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                reject(new Error('Chrome extension APIs not available'));
                return;
            }

            // Use background script to clear proxy
            chrome.runtime.sendMessage(
                { action: 'clearProxy' },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve();
                    } else {
                        reject(new Error(response?.error || 'Failed to clear proxy'));
                    }
                }
            );
        });
    }

    /**
     * Get current proxy status
     */
    static async getCurrentProxyStatus() {
        return new Promise((resolve) => {
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                resolve({ isActive: false, activeProxy: null });
                return;
            }

            // Use background script to get status
            chrome.runtime.sendMessage(
                { action: 'getProxyStatus' },
                (response) => {
                    if (chrome.runtime.lastError || !response) {
                        resolve({ isActive: false, activeProxy: null });
                    } else {
                        resolve({
                            isActive: response.isActive || false,
                            activeProxy: response.activeProxy || null
                        });
                    }
                }
            );
        });
    }

    /**
     * Helper function to get random country for demo purposes
     */
    static getRandomCountry() {
        const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Japan'];
        return countries[Math.floor(Math.random() * countries.length)];
    }
}
