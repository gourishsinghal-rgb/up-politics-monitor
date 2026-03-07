const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (index.html, CSS, JS)
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Data storage
let eventsData = [];
let acBoundariesData = [];
let lastUpdateTime = null;

// UP Assembly Constituencies (simplified - top 50 with coordinates)
const UP_ACS = [
    { name: 'Lucknow Central', district: 'Lucknow', party: 'BJP', lat: 26.8467, lng: 80.9462 },
    { name: 'Lucknow West', district: 'Lucknow', party: 'BJP', lat: 26.8300, lng: 80.9200 },
    { name: 'Lucknow East', district: 'Lucknow', party: 'BJP', lat: 26.8600, lng: 80.9700 },
    { name: 'Lucknow North', district: 'Lucknow', party: 'SP', lat: 26.8800, lng: 80.9500 },
    { name: 'Lucknow Cantonment', district: 'Lucknow', party: 'BJP', lat: 26.8200, lng: 80.9400 },
    { name: 'Gorakhpur Urban', district: 'Gorakhpur', party: 'BJP', lat: 26.7606, lng: 83.3732 },
    { name: 'Gorakhpur Rural', district: 'Gorakhpur', party: 'BJP', lat: 26.7850, lng: 83.4000 },
    { name: 'Varanasi North', district: 'Varanasi', party: 'BJP', lat: 25.3176, lng: 82.9739 },
    { name: 'Varanasi South', district: 'Varanasi', party: 'BJP', lat: 25.2900, lng: 82.9850 },
    { name: 'Varanasi Cantonment', district: 'Varanasi', party: 'BJP', lat: 25.3100, lng: 83.0100 },
    { name: 'Agra Cantonment', district: 'Agra', party: 'BJP', lat: 27.1767, lng: 78.0081 },
    { name: 'Agra North', district: 'Agra', party: 'SP', lat: 27.1950, lng: 78.0200 },
    { name: 'Agra South', district: 'Agra', party: 'BJP', lat: 27.1600, lng: 78.0000 },
    { name: 'Meerut', district: 'Meerut', party: 'BJP', lat: 28.9845, lng: 77.7064 },
    { name: 'Meerut Cantonment', district: 'Meerut', party: 'SP', lat: 29.0000, lng: 77.7200 },
    { name: 'Kanpur Cantonment', district: 'Kanpur Nagar', party: 'BJP', lat: 26.4499, lng: 80.3319 },
    { name: 'Kanpur', district: 'Kanpur Nagar', party: 'SP', lat: 26.4670, lng: 80.3500 },
    { name: 'Allahabad South', district: 'Prayagraj', party: 'BJP', lat: 25.4358, lng: 81.8463 },
    { name: 'Allahabad North', district: 'Prayagraj', party: 'SP', lat: 25.4550, lng: 81.8500 },
    { name: 'Bareilly', district: 'Bareilly', party: 'BJP', lat: 28.3670, lng: 79.4304 },
    { name: 'Bareilly Cantonment', district: 'Bareilly', party: 'SP', lat: 28.3800, lng: 79.4500 },
    { name: 'Moradabad', district: 'Moradabad', party: 'SP', lat: 28.8389, lng: 78.7763 },
    { name: 'Aligarh', district: 'Aligarh', party: 'BJP', lat: 27.8974, lng: 78.0880 },
    { name: 'Ghaziabad', district: 'Ghaziabad', party: 'BJP', lat: 28.6692, lng: 77.4538 },
    { name: 'Noida', district: 'Gautam Buddha Nagar', party: 'BJP', lat: 28.5355, lng: 77.3910 },
    { name: 'Greater Noida', district: 'Gautam Buddha Nagar', party: 'BJP', lat: 28.4744, lng: 77.5040 },
    { name: 'Mathura', district: 'Mathura', party: 'BJP', lat: 27.4924, lng: 77.6737 },
    { name: 'Vrindavan', district: 'Mathura', party: 'SP', lat: 27.5820, lng: 77.6980 },
    { name: 'Saharanpur', district: 'Saharanpur', party: 'SP', lat: 29.9680, lng: 77.5460 },
    { name: 'Muzaffarnagar', district: 'Muzaffarnagar', party: 'BJP', lat: 29.4727, lng: 77.7085 },
    { name: 'Shamli', district: 'Shamli', party: 'BJP', lat: 29.4500, lng: 77.3100 },
    { name: 'Bulandshahr', district: 'Bulandshahr', party: 'BJP', lat: 28.4067, lng: 77.8500 },
    { name: 'Hapur', district: 'Hapur', party: 'BJP', lat: 28.7306, lng: 77.7760 },
    { name: 'Faizabad', district: 'Ayodhya', party: 'BJP', lat: 26.7751, lng: 82.1486 },
    { name: 'Ayodhya', district: 'Ayodhya', party: 'BJP', lat: 26.7922, lng: 82.1998 },
    { name: 'Sultanpur', district: 'Sultanpur', party: 'BJP', lat: 26.2647, lng: 82.0711 },
    { name: 'Amethi', district: 'Amethi', party: 'BJP', lat: 26.1595, lng: 81.8129 },
    { name: 'Raebareli', district: 'Raebareli', party: 'SP', lat: 26.2124, lng: 81.2371 },
    { name: 'Azamgarh', district: 'Azamgarh', party: 'SP', lat: 26.0688, lng: 83.1840 },
    { name: 'Jaunpur', district: 'Jaunpur', party: 'SP', lat: 25.7465, lng: 82.6838 },
    { name: 'Ballia', district: 'Ballia', party: 'BJP', lat: 25.7672, lng: 84.1491 },
    { name: 'Ghazipur', district: 'Ghazipur', party: 'BJP', lat: 25.5881, lng: 83.5782 },
    { name: 'Basti', district: 'Basti', party: 'BJP', lat: 26.8126, lng: 82.7392 },
    { name: 'Deoria', district: 'Deoria', party: 'BJP', lat: 26.5024, lng: 83.7791 },
    { name: 'Kushinagar', district: 'Kushinagar', party: 'BJP', lat: 26.7420, lng: 83.8920 },
    { name: 'Maharajganj', district: 'Maharajganj', party: 'BJP', lat: 27.1434, lng: 83.5619 },
    { name: 'Siddharthnagar', district: 'Siddharthnagar', party: 'SP', lat: 27.2548, lng: 83.0800 },
    { name: 'Jhansi', district: 'Jhansi', party: 'BJP', lat: 25.4484, lng: 78.5685 },
    { name: 'Lalitpur', district: 'Lalitpur', party: 'BJP', lat: 24.6914, lng: 78.4131 },
    { name: 'Hamirpur', district: 'Hamirpur', party: 'BJP', lat: 25.9565, lng: 80.1533 }
];

// News sources configuration
const NEWS_SOURCES = [
    { name: 'TOI UP', url: 'https://timesofindia.indiatimes.com/rssfeeds/4118215.cms' },
    { name: 'Hindu UP', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss' },
    { name: 'Indian Express UP', url: 'https://indianexpress.com/section/cities/lucknow/feed/' },
    { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtv/Tzjl' },
    { name: 'ANI', url: 'https://www.aninews.in/feed/' },
    // Additional sources for more coverage
    { name: 'Hindustan Times India', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
    { name: 'TOI India', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
    { name: 'NDTV Top Stories', url: 'https://feeds.feedburner.com/NDTV-LatestNews' },
    { name: 'Indian Express India', url: 'https://indianexpress.com/section/india/feed/' },
    { name: 'The Wire', url: 'https://thewire.in/feed' }
];

// Keywords for categorization
const KEYWORDS = {
    protest: ['protest', 'demonstration', 'dharna', 'andolan', 'strike', 'clash', 'violence', 'controversy', 'opposition'],
    rally: ['rally', 'public meeting', 'roadshow', 'sabha', 'jan sabha', 'sammelan', 'campaign', 'visit'],
    scheme: ['scheme', 'inaugurate', 'launch', 'development', 'project', 'infrastructure', 'welfare', 'yojana'],
    election: ['election', 'bypoll', 'nomination', 'candidate', 'voting', 'poll', 'assembly', 'result']
};

// Initialize AC Boundaries GeoJSON
function initializeACBoundaries() {
    acBoundariesData = {
        type: 'FeatureCollection',
        features: UP_ACS.map(ac => ({
            type: 'Feature',
            properties: {
                name: ac.name,
                district: ac.district,
                party: ac.party
            },
            geometry: {
                type: 'Point',
                coordinates: [ac.lng, ac.lat]
            }
        }))
    };
}

// Categorize event based on keywords
function categorizeEvent(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }
    
    return 'rally'; // default category
}

// Match event to AC based on location keywords
function matchToAC(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    for (const ac of UP_ACS) {
        const acName = ac.name.toLowerCase();
        const district = ac.district.toLowerCase();
        
        if (text.includes(acName) || text.includes(district)) {
            return ac;
        }
    }
    
    // Return random AC if no match (for diversity)
    return UP_ACS[Math.floor(Math.random() * UP_ACS.length)];
}

// Determine layer based on content
function determineLayer(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('pm ') || text.includes('prime minister') || text.includes('parliament')) {
        return 'national-news';
    }
    
    if (text.includes('cm ') || text.includes('chief minister') || text.includes('state government')) {
        return 'state-news';
    }
    
    return 'ac-politics';
}

// Fetch RSS Feed
async function fetchRSSFeed(url) {
    try {
        const feed = await parser.parseURL(url);
        return feed.items || [];
    } catch (error) {
        console.error(`Error fetching RSS feed ${url}:`, error.message);
        return [];
    }
}

// Scrape news from all sources
async function scrapeNews() {
    console.log('Starting news scraping...');
    const allItems = [];
    
    // Fetch from RSS feeds
    for (const source of NEWS_SOURCES) {
        console.log(`Fetching from ${source.name}...`);
        const items = await fetchRSSFeed(source.url);
        allItems.push(...items.map(item => ({ ...item, source: source.name })));
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Fetched ${allItems.length} items from RSS feeds`);
    
    // Filter for UP-related news with broader keywords
    const upNews = allItems.filter(item => {
        const text = ((item.title || '') + ' ' + (item.contentSnippet || item.description || '')).toLowerCase();
        return text.includes('uttar pradesh') || 
               text.includes(' up ') || 
               text.includes('lucknow') || 
               text.includes('yogi') ||
               text.includes('yogi adityanath') ||
               text.includes('akhilesh') ||
               text.includes('akhilesh yadav') ||
               text.includes('mayawati') ||
               text.includes('samajwadi party') ||
               text.includes(' bjp ') ||
               text.includes(' bsp ') ||
               text.includes(' sp ') ||
               text.includes('varanasi') ||
               text.includes('prayagraj') ||
               text.includes('allahabad') ||
               text.includes('noida') ||
               text.includes('agra') ||
               text.includes('kanpur') ||
               text.includes('meerut') ||
               text.includes('ghaziabad') ||
               text.includes('gorakhpur') ||
               text.includes('bareilly') ||
               text.includes('ayodhya') ||
               UP_ACS.some(ac => text.includes(ac.district.toLowerCase()));
    });
    
    console.log(`Filtered to ${upNews.length} UP-related items`);
    
    // Convert to event format
    const events = upNews.map(item => {
        const title = item.title || 'Political Event';
        const description = item.contentSnippet || item.description || '';
        const category = categorizeEvent(title, description);
        const ac = matchToAC(title, description);
        const layer = determineLayer(title, description);
        
        return {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: title.substring(0, 150),
            description: description.substring(0, 300),
            category,
            layer,
            ac: ac.name,
            location: ac.district,
            lat: ac.lat + (Math.random() - 0.5) * 0.05, // Add slight randomness
            lng: ac.lng + (Math.random() - 0.5) * 0.05,
            date: item.pubDate || new Date().toISOString(),
            source: item.link || 'https://example.com'
        };
    });
    
    // Store only real events from RSS feeds (no mock data)
    eventsData = events;
    lastUpdateTime = new Date().toISOString();
    
    console.log(`Total REAL events stored: ${eventsData.length}`);
    
    // Save to file
    await saveDataToFile();
    
    return events;
}

// Save data to file
async function saveDataToFile() {
    const data = {
        events: eventsData,
        boundaries: acBoundariesData,
        lastUpdate: lastUpdateTime
    };
    
    try {
        await fs.writeFile(
            path.join(__dirname, 'data.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('Data saved to file');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Load data from file
async function loadDataFromFile() {
    try {
        const fileContent = await fs.readFile(path.join(__dirname, 'data.json'), 'utf-8');
        const data = JSON.parse(fileContent);
        
        eventsData = data.events || [];
        acBoundariesData = data.boundaries || [];
        lastUpdateTime = data.lastUpdate;
        
        console.log(`Loaded ${eventsData.length} events from file`);
        return true;
    } catch (error) {
        console.log('No existing data file found');
        return false;
    }
}

// API Routes
app.get('/api/events', (req, res) => {
    res.json(eventsData);
});

app.get('/api/boundaries', (req, res) => {
    res.json(acBoundariesData);
});

app.get('/api/stats', (req, res) => {
    const stats = {
        totalEvents: eventsData.length,
        byCategory: {
            protest: eventsData.filter(e => e.category === 'protest').length,
            rally: eventsData.filter(e => e.category === 'rally').length,
            scheme: eventsData.filter(e => e.category === 'scheme').length,
            election: eventsData.filter(e => e.category === 'election').length
        },
        byLayer: {
            'ac-politics': eventsData.filter(e => e.layer === 'ac-politics').length,
            'state-news': eventsData.filter(e => e.layer === 'state-news').length,
            'national-news': eventsData.filter(e => e.layer === 'national-news').length
        },
        lastUpdate: lastUpdateTime
    };
    
    res.json(stats);
});

app.post('/api/refresh', async (req, res) => {
    try {
        await scrapeNews();
        res.json({ success: true, message: 'Data refreshed successfully', count: eventsData.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', lastUpdate: lastUpdateTime, eventCount: eventsData.length });
});

// Initialize server
async function initialize() {
    console.log('Initializing UP Politics Monitor Backend...');
    
    // Initialize AC boundaries
    initializeACBoundaries();
    
    // Try to load existing data
    const dataLoaded = await loadDataFromFile();
    
    // If no data exists, scrape immediately
    if (!dataLoaded || eventsData.length === 0) {
        console.log('No existing data found. Starting initial scrape...');
        await scrapeNews();
    }
    
    // Schedule daily scraping at 6 AM
    cron.schedule('0 6 * * *', async () => {
        console.log('Running scheduled news scraping...');
        await scrapeNews();
    });
    
    // Also scrape every 6 hours for more frequent updates
    cron.schedule('0 */6 * * *', async () => {
        console.log('Running periodic news scraping...');
        await scrapeNews();
    });
    
    console.log('Backend initialized successfully');
}

// Start server
app.listen(PORT, async () => {
    console.log(`UP Politics Monitor Backend running on http://localhost:${PORT}`);
    await initialize();
});

module.exports = app;
