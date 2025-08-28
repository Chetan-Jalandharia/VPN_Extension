/**
 * IPService - Handles IP address detection and geolocation
 * Uses free IP detection APIs to show current IP and location
 */
export class IPService {
    
    /**
     * Get current IP address and location information
     */
    static async getCurrentIP() {
        try {
            // Use background script to fetch IP info to avoid CORS
            return new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.sendMessage(
                        { action: 'getCurrentIP' },
                        (response) => {
                            if (chrome.runtime.lastError || !response || !response.success) {
                                console.error('IP fetch error:', chrome.runtime.lastError);
                                resolve({
                                    ip: 'Unable to detect',
                                    location: 'Unknown'
                                });
                            } else {
                                resolve(response.ipInfo);
                            }
                        }
                    );
                } else {
                    // Fallback if chrome APIs not available
                    resolve({
                        ip: 'Chrome APIs unavailable',
                        location: 'Unknown'
                    });
                }
            });
            
        } catch (error) {
            console.error('Error fetching IP information:', error);
            return {
                ip: 'Error fetching IP',
                location: 'Unknown'
            };
        }
    }

    /**
     * Fetch IP from ipify.org API (simple IP only)
     */
    static async fetchFromIpify() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) throw new Error('Ipify API failed');
            
            const data = await response.json();
            
            // Get location info separately
            const locationInfo = await this.fetchLocationFromIpApi(data.ip);
            
            return {
                ip: data.ip,
                location: locationInfo
            };
            
        } catch (error) {
            console.error('Ipify API error:', error);
            return { ip: null, location: 'Unknown' };
        }
    }

    /**
     * Fetch IP and location from ip-api.com
     */
    static async fetchFromIpApi() {
        try {
            const response = await fetch('http://ip-api.com/json/');
            if (!response.ok) throw new Error('IP-API failed');
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    ip: data.query,
                    location: `${data.city}, ${data.regionName}, ${data.country}`
                };
            }
            
            return { ip: null, location: 'Unknown' };
            
        } catch (error) {
            console.error('IP-API error:', error);
            return { ip: null, location: 'Unknown' };
        }
    }

    /**
     * Fetch location info for a specific IP
     */
    static async fetchLocationFromIpApi(ip) {
        try {
            const response = await fetch(`http://ip-api.com/json/${ip}`);
            if (!response.ok) throw new Error('Location API failed');
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return `${data.city}, ${data.regionName}, ${data.country}`;
            }
            
            return 'Unknown Location';
            
        } catch (error) {
            console.error('Location fetch error:', error);
            return 'Unknown Location';
        }
    }

    /**
     * Fetch IP from httpbin.org (fallback)
     */
    static async fetchFromHttpBin() {
        try {
            const response = await fetch('https://httpbin.org/ip');
            if (!response.ok) throw new Error('HttpBin API failed');
            
            const data = await response.json();
            
            return {
                ip: data.origin,
                location: 'Location lookup unavailable'
            };
            
        } catch (error) {
            console.error('HttpBin API error:', error);
            return { ip: null, location: 'Unknown' };
        }
    }

    /**
     * Check if IP has changed (useful for detecting proxy changes)
     */
    static async hasIPChanged(previousIP) {
        const currentInfo = await this.getCurrentIP();
        return currentInfo.ip !== previousIP;
    }

    /**
     * Get detailed IP information (ISP, timezone, etc.) if available
     */
    static async getDetailedIPInfo(ip = null) {
        try {
            const url = ip ? `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query` 
                           : 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query';
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Detailed IP API failed');
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    ip: data.query,
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city,
                    timezone: data.timezone,
                    isp: data.isp,
                    organization: data.org,
                    coordinates: {
                        lat: data.lat,
                        lon: data.lon
                    }
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Detailed IP info error:', error);
            return null;
        }
    }
}
