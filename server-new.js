const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { INDIA_STATES, UP_DISTRICTS } = require('./geo-data.js');
const { classifyNewsLocation } = require('./news-classifier.js');

const app = express();
const parser = new Parser({
    timeout: 10000,
    headers: {'User-Agent': 'Mozilla/5.0'}
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Data storage
let eventsData = [];
let lastUpdateTime = null;

// News sources - 14 sources (English + Hindi)
const NEWS_SOURCES = [
    // English sources
    { name: 'TOI UP', url: 'https://timesofindia.indiatimes.com/rssfeeds/4118215.cms' },
    { name: 'Hindu UP', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss' },
    { name: 'Indian Express UP', url: 'https://indianexpress.com/section/cities/lucknow/feed/' },
    { name: 'NDTV India', url: 'https://feeds.feedburner.com/ndtv/Tzjl' },
    { name: 'ANI', url: 'https://www.aninews.in/feed/' },
    { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
    { name: 'TOI India', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
    { name: 'NDTV Top', url: 'https://feeds.feedburner.com/NDTV-LatestNews' },
    { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' },
    { name: 'The Wire', url: 'https://thewire.in/feed' },
    
    // Hindi sources
    { name: 'Dainik Jagran', url: 'https://www.jagran.com/rss/uttar-pradesh.xml' },
    { name: 'Amar Ujala', url: 'https://www.amarujala.com/rss/uttar-pradesh.xml' },
    { name: 'Hindustan Hindi', url: 'https://www.livehindustan.com/rss/uttar-pradesh/rss.xml' },
    { name: 'NavBharat Times', url: 'https://navbharattimes.indiatimes.com/rssfeeds/-2128936835.cms' }
];

// Keywords for categorization
const KEYWORDS = {
    protest: ['protest', 'demonstration', 'dharna', 'andolan', 'strike', 'clash', 'violence', 'controversy', 'विरोध', 'प्रदर्शन', 'धरना', 'आंदोलन'],
    rally: ['rally', 'public meeting', 'roadshow', 'sabha', 'sammelan', 'campaign', 'रैली', 'सभा', 'सम्मेलन', 'जनसभा'],
    scheme: ['scheme', 'inaugurate', 'launch', 'development', 'project', 'infrastructure', 'योजना', 'शुरुआत', 'विकास', 'परियोजना'],
    election: ['election', 'bypoll', 'nomination', 'candidate', 'voting', 'poll', 'चुनाव', 'उपचुनाव', 'मतदान', 'उम्मीदवार']
};

// Categorize event
function categorizeEvent(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }
    
    return 'rally'; // default
}

// Determine layer
function determineLayer(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('pm ') || text.includes('prime minister') || text.includes('parliament') || 
        text.includes('प्रधानमंत्री') || text.includes('संसद')) {
        return 'national-news';
    }
    
    if (text.includes('cm ') || text.includes('chief minister') || text.includes('state government') ||
        text.includes('मुख्यमंत्री') || text.includes('सीएम') || text.includes('राज्य सरकार')) {
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
    console.log('='.repeat(60));
    console.log('Starting comprehensive news scraping...');
    console.log('='.repeat(60));
    
    const allItems = [];
    
    // Fetch from all RSS feeds
    for (const source of NEWS_SOURCES) {
        console.log(`📰 Fetching from ${source.name}...`);
        const items = await fetchRSSFeed(source.url);
        console.log(`   → Got ${items.length} items`);
        allItems.push(...items.map(item => ({ ...item, sourceName: source.name })));
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Total items fetched: ${allItems.length}`);
    console.log('-'.repeat(60));
    
    // Process and classify each news item
    const classifiedEvents = [];
    let national = 0, state = 0, district = 0, skipped = 0;
    
    for (const item of allItems) {
        const title = item.title || '';
        const description = item.contentSnippet || item.description || '';
        
        // Classify location
        const location = classifyNewsLocation(title, description);
        
        if (!location) {
            skipped++;
            continue; // Skip irrelevant news
        }
        
        // Count by level
        if (location.level === 'national') national++;
        else if (location.level === 'state') state++;
        else if (location.level === 'district') district++;
        
        // Create event
        const category = categorizeEvent(title, description);
        const layer = determineLayer(title, description);
        
        classifiedEvents.push({
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: title.substring(0, 150),
            description: description.substring(0, 300),
            category,
            layer,
            level: location.level,
            location: location.location,
            state: location.state || location.location,
            lat: location.lat,
            lng: location.lng,
            date: item.pubDate || new Date().toISOString(),
            source: item.link || 'https://example.com',
            sourceName: item.sourceName
        });
    }
    
    eventsData = classifiedEvents;
    lastUpdateTime = new Date().toISOString();
    
    console.log('\n📊 CLASSIFICATION RESULTS:');
    console.log(`   🌏 National (Delhi): ${national} events`);
    console.log(`   🗺️  State level: ${state} events`);
    console.log(`   📍 District level (UP): ${district} events`);
    console.log(`   ❌ Skipped (irrelevant): ${skipped} events`);
    console.log(`   ✅ Total classified: ${classifiedEvents.length} events`);
    console.log('='.repeat(60));
    
    // Save to file
    await saveDataToFile();
    
    return classifiedEvents;
}

// Save data to file
async function saveDataToFile() {
    const data = {
        events: eventsData,
        lastUpdate: lastUpdateTime,
        stats: {
            total: eventsData.length,
            national: eventsData.filter(e => e.level === 'national').length,
            state: eventsData.filter(e => e.level === 'state').length,
            district: eventsData.filter(e => e.level === 'district').length
        }
    };
    
    try {
        await fs.writeFile(
            path.join(__dirname, 'data.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('💾 Data saved to file');
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
        lastUpdateTime = data.lastUpdate;
        
        console.log(`📂 Loaded ${eventsData.length} events from file`);
        return true;
    } catch (error) {
        console.log('📂 No existing data file found');
        return false;
    }
}

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
    res.json(eventsData);
});

// Get events by level
app.get('/api/events/national', (req, res) => {
    const national = eventsData.filter(e => e.level === 'national');
    res.json(national);
});

app.get('/api/events/state/:stateName', (req, res) => {
    const stateName = req.params.stateName;
    const stateEvents = eventsData.filter(e => 
        e.level === 'state' && e.location === stateName
    );
    res.json(stateEvents);
});

app.get('/api/events/district/:districtName', (req, res) => {
    const districtName = req.params.districtName;
    const districtEvents = eventsData.filter(e => 
        e.level === 'district' && e.location === districtName
    );
    res.json(districtEvents);
});

// Get aggregated data for map markers
app.get('/api/markers', (req, res) => {
    const markers = {};
    
    // Group events by location
    eventsData.forEach(event => {
        const key = `${event.lat},${event.lng}`;
        if (!markers[key]) {
            markers[key] = {
                location: event.location,
                lat: event.lat,
                lng: event.lng,
                level: event.level,
                state: event.state,
                count: 0,
                events: []
            };
        }
        markers[key].count++;
        markers[key].events.push(event);
    });
    
    res.json(Object.values(markers));
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        total: eventsData.length,
        byLevel: {
            national: eventsData.filter(e => e.level === 'national').length,
            state: eventsData.filter(e => e.level === 'state').length,
            district: eventsData.filter(e => e.level === 'district').length
        },
        byCategory: {
            protest: eventsData.filter(e => e.category === 'protest').length,
            rally: eventsData.filter(e => e.category === 'rally').length,
            scheme: eventsData.filter(e => e.category === 'scheme').length,
            election: eventsData.filter(e => e.category === 'election').length
        },
        byLocation: {},
        lastUpdate: lastUpdateTime
    };
    
    // Count by location
    eventsData.forEach(event => {
        if (!stats.byLocation[event.location]) {
            stats.byLocation[event.location] = 0;
        }
        stats.byLocation[event.location]++;
    });
    
    res.json(stats);
});

// Manual refresh
app.post('/api/refresh', async (req, res) => {
    try {
        console.log('🔄 Manual refresh triggered');
        await scrapeNews();
        res.json({ 
            success: true, 
            message: 'Data refreshed successfully', 
            count: eventsData.length 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        lastUpdate: lastUpdateTime,
        eventCount: eventsData.length,
        sources: NEWS_SOURCES.length
    });
});

// Get geo data
app.get('/api/geo/states', (req, res) => {
    res.json(INDIA_STATES);
});

app.get('/api/geo/districts', (req, res) => {
    res.json(UP_DISTRICTS);
});

// Initialize server
async function initialize() {
    console.log('\n🚀 Initializing UP Politics Monitor Backend...\n');
    
    // Try to load existing data
    const dataLoaded = await loadDataFromFile();
    
    // If no data, scrape immediately
    if (!dataLoaded || eventsData.length === 0) {
        console.log('🔄 No existing data. Starting initial scrape...\n');
        await scrapeNews();
    }
    
    // Schedule scraping every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('\n⏰ Scheduled scraping started...\n');
        await scrapeNews();
    });
    
    // Also scrape daily at 6 AM
    cron.schedule('0 6 * * *', async () => {
        console.log('\n☀️ Daily morning scrape started...\n');
        await scrapeNews();
    });
    
    console.log('✅ Backend initialized successfully\n');
    console.log(`📊 Current stats:`);
    console.log(`   - Total events: ${eventsData.length}`);
    console.log(`   - News sources: ${NEWS_SOURCES.length}`);
    console.log(`   - Last update: ${lastUpdateTime || 'Never'}\n`);
}

// Start server
app.listen(PORT, async () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🗺️  UP POLITICS MONITOR - Multi-Level Map System`);
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`${'='.repeat(60)}\n`);
    
    await initialize();
});

module.exports = app;
