// Intelligent News Geo-Classifier
// Maps news to: National (Delhi) → State Centroids → UP Districts

const { INDIA_STATES, UP_DISTRICTS } = require('./geo-data.js');

function classifyNewsLocation(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    // 1. CHECK IF NATIONAL-LEVEL NEWS
    const nationalKeywords = [
        // English
        'parliament', 'lok sabha', 'rajya sabha', 'supreme court', 'election commission',
        'prime minister', 'pm modi', 'narendra modi', 'president', 'union', 'central government',
        'niti aayog', 'pmo', 'cabinet', 'ministry', 'finance minister', 'home minister',
        'defence minister', 'foreign minister', 'central budget', 'gst council',
        
        // Hindi - Government & Politics
        'संसद', 'लोकसभा', 'लोक सभा', 'राज्यसभा', 'राज्य सभा', 
        'सर्वोच्च न्यायालय', 'सुप्रीम कोर्ट', 'निर्वाचन आयोग', 'चुनाव आयोग',
        'प्रधानमंत्री', 'प्रधान मंत्री', 'केंद्र सरकार', 'केन्द्र सरकार',
        'केंद्रीय मंत्रिमंडल', 'केंद्रीय बजट', 'गृह मंत्री', 'वित्त मंत्री',
        'रक्षा मंत्री', 'विदेश मंत्री', 'नीति आयोग', 'जीएसटी परिषद',
        
        // Hindi - National Leaders
        'नरेंद्र मोदी', 'मोदी सरकार', 'अमित शाह', 'राष्ट्रपति',
        'उपराष्ट्रपति', 'भाजपा राष्ट्रीय', 'कांग्रेस राष्ट्रीय',
        
        // Hindi - National Institutions
        'संविधान', 'राजधानी', 'नई दिल्ली', 'राष्ट्रीय राजधानी'
    ];
    
    if (nationalKeywords.some(kw => text.includes(kw))) {
        return {
            level: 'national',
            location: 'Delhi',
            lat: 28.7041,
            lng: 77.1025
        };
    }
    
    // 2. CHECK FOR SPECIFIC STATE MENTIONS (non-UP)
    const stateKeywords = {
        'Bihar': ['bihar', 'बिहार', 'patna', 'पटना', 'nitish kumar', 'नीतीश कुमार', 'tejashwi', 'तेजस्वी'],
        'Jharkhand': ['jharkhand', 'झारखंड', 'ranchi', 'रांची', 'hemant soren', 'हेमंत सोरेन'],
        'Delhi': ['delhi ncr', 'new delhi', 'दिल्ली', 'arvind kejriwal', 'अरविंद केजरीवाल', 'aap government'],
        'Madhya Pradesh': ['madhya pradesh', 'मध्य प्रदेश', 'मप्र', 'bhopal', 'भोपाल', 'shivraj', 'शिवराज'],
        'Maharashtra': ['maharashtra', 'महाराष्ट्र', 'mumbai', 'मुंबई', 'pune', 'पुणे', 'eknath shinde'],
        'Gujarat': ['gujarat', 'गुजरात', 'ahmedabad', 'अहमदाबाद', 'gandhinagar', 'गांधीनगर'],
        'Rajasthan': ['rajasthan', 'राजस्थान', 'jaipur', 'जयपुर', 'ashok gehlot', 'अशोक गहलोत'],
        'Punjab': ['punjab', 'पंजाब', 'chandigarh', 'चंडीगढ़', 'bhagwant mann', 'भगवंत मान'],
        'Haryana': ['haryana', 'हरियाणा', 'manohar lal', 'मनोहर लाल'],
        'West Bengal': ['west bengal', 'bengal', 'पश्चिम बंगाल', 'बंगाल', 'kolkata', 'कोलकाता', 'mamata', 'ममता'],
        'Tamil Nadu': ['tamil nadu', 'तमिलनाडु', 'chennai', 'चेन्नई', 'stalin', 'स्टालिन'],
        'Karnataka': ['karnataka', 'कर्नाटक', 'bengaluru', 'bangalore', 'बेंगलुरु'],
        'Kerala': ['kerala', 'केरल', 'thiruvananthapuram', 'तिरुवनंतपुरम', 'pinarayi', 'पिनाराई'],
        'Telangana': ['telangana', 'तेलंगाना', 'hyderabad', 'हैदराबाद', 'kcr', 'revanth reddy'],
        'Andhra Pradesh': ['andhra pradesh', 'आंध्र प्रदेश', 'amaravati', 'अमरावती', 'jagan', 'जगन'],
        'Odisha': ['odisha', 'ओडिशा', 'bhubaneswar', 'भुवनेश्वर', 'naveen patnaik'],
        'Uttarakhand': ['uttarakhand', 'उत्तराखंड', 'dehradun', 'देहरादून'],
        'Himachal Pradesh': ['himachal', 'हिमाचल', 'shimla', 'शिमला'],
        'Assam': ['assam', 'असम', 'guwahati', 'गुवाहाटी', 'himanta', 'हिमंता'],
        'Chhattisgarh': ['chhattisgarh', 'छत्तीसगढ़', 'raipur', 'रायपुर'],
        'Goa': ['goa', 'गोवा', 'panaji', 'पणजी']
    };
    
    for (const [stateName, keywords] of Object.entries(stateKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            const state = INDIA_STATES.find(s => s.name === stateName);
            if (state) {
                return {
                    level: 'state',
                    location: state.name,
                    lat: state.lat,
                    lng: state.lng
                };
            }
        }
    }
    
    // 3. CHECK FOR UP DISTRICT MENTIONS (with Hindi names)
    const districtKeywords = {
        'Lucknow': ['lucknow', 'लखनऊ'],
        'Kanpur Nagar': ['kanpur', 'कानपुर'],
        'Varanasi': ['varanasi', 'वाराणसी', 'banaras', 'बनारस', 'kashi', 'काशी'],
        'Prayagraj': ['prayagraj', 'प्रयागराज', 'allahabad', 'इलाहाबाद'],
        'Agra': ['agra', 'आगरा'],
        'Meerut': ['meerut', 'मेरठ'],
        'Ghaziabad': ['ghaziabad', 'गाजियाबाद'],
        'Gautam Buddha Nagar': ['noida', 'नोएडा', 'greater noida', 'ग्रेटर नोएडा'],
        'Gorakhpur': ['gorakhpur', 'गोरखपुर'],
        'Ayodhya': ['ayodhya', 'अयोध्या', 'faizabad', 'फैजाबाद'],
        'Mathura': ['mathura', 'मथुरा', 'vrindavan', 'वृंदावन'],
        'Moradabad': ['moradabad', 'मुरादाबाद'],
        'Aligarh': ['aligarh', 'अलीगढ़'],
        'Saharanpur': ['saharanpur', 'सहारनपुर'],
        'Bareilly': ['bareilly', 'बरेली'],
        'Azamgarh': ['azamgarh', 'आजमगढ़'],
        'Jhansi': ['jhansi', 'झांसी'],
        'Firozabad': ['firozabad', 'फिरोजाबाद'],
        'Muzaffarnagar': ['muzaffarnagar', 'मुजफ्फरनगर'],
        'Shahjahanpur': ['shahjahanpur', 'शाहजहांपुर'],
        'Rampur': ['rampur', 'रामपुर'],
        'Hapur': ['hapur', 'हापुड़'],
        'Etawah': ['etawah', 'इटावा'],
        'Sitapur': ['sitapur', 'सीतापुर'],
        'Hardoi': ['hardoi', 'हरदोई'],
        'Raebareli': ['raebareli', 'रायबरेली', 'rae bareli'],
        'Farrukhabad': ['farrukhabad', 'फर्रुखाबाद'],
        'Unnao': ['unnao', 'उन्नाव'],
        'Jaunpur': ['jaunpur', 'जौनपुर'],
        'Mirzapur': ['mirzapur', 'मिर्जापुर'],
        'Bulandshahr': ['bulandshahr', 'बुलंदशहर'],
        'Sambhal': ['sambhal', 'संभल'],
        'Amroha': ['amroha', 'अमरोहा'],
        'Budaun': ['budaun', 'बदायूं'],
        'Bijnor': ['bijnor', 'बिजनौर'],
        'Bahraich': ['bahraich', 'बहराइच'],
        'Sultanpur': ['sultanpur', 'सुल्तानपुर'],
        'Pratapgarh': ['pratapgarh', 'प्रतापगढ़'],
        'Gonda': ['gonda', 'गोंडा'],
        'Basti': ['basti', 'बस्ती'],
        'Deoria': ['deoria', 'देवरिया'],
        'Ballia': ['ballia', 'बलिया'],
        'Ghazipur': ['ghazipur', 'गाजीपुर'],
        'Mau': ['mau', 'मऊ'],
        'Kushinagar': ['kushinagar', 'कुशीनगर'],
        'Maharajganj': ['maharajganj', 'महाराजगंज'],
        'Siddharthnagar': ['siddharthnagar', 'सिद्धार्थनगर'],
        'Balrampur': ['balrampur', 'बलरामपुर'],
        'Shravasti': ['shravasti', 'श्रावस्ती'],
        'Sant Kabir Nagar': ['sant kabir nagar', 'संत कबीर नगर'],
        'Ambedkar Nagar': ['ambedkar nagar', 'अंबेडकर नगर'],
        'Amethi': ['amethi', 'अमेठी'],
        'Barabanki': ['barabanki', 'बाराबंकी'],
        'Lakhimpur Kheri': ['lakhimpur', 'लखीमपुर', 'kheri', 'खीरी'],
        'Pilibhit': ['pilibhit', 'पीलीभीत'],
        'Kasganj': ['kasganj', 'कासगंज'],
        'Etah': ['etah', 'एटा'],
        'Mainpuri': ['mainpuri', 'मैनपुरी'],
        'Auraiya': ['auraiya', 'औरैया'],
        'Kannauj': ['kannauj', 'कन्नौज'],
        'Kanpur Dehat': ['kanpur dehat', 'कानपुर देहात'],
        'Fatehpur': ['fatehpur', 'फतेहपुर'],
        'Kaushambi': ['kaushambi', 'कौशाम्बी'],
        'Chitrakoot': ['chitrakoot', 'चित्रकूट'],
        'Banda': ['banda', 'बांदा'],
        'Mahoba': ['mahoba', 'महोबा'],
        'Hamirpur': ['hamirpur', 'हमीरपुर'],
        'Jalaun': ['jalaun', 'जालौन'],
        'Lalitpur': ['lalitpur', 'ललितपुर'],
        'Sonbhadra': ['sonbhadra', 'सोनभद्र'],
        'Chandauli': ['chandauli', 'चंदौली'],
        'Bhadohi': ['bhadohi', 'भदोही', 'sant ravidas nagar'],
        'Hathras': ['hathras', 'हाथरस'],
        'Baghpat': ['baghpat', 'बागपत'],
        'Shamli': ['shamli', 'शामली']
    };
    
    for (const [districtName, keywords] of Object.entries(districtKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            const district = UP_DISTRICTS.find(d => d.name === districtName);
            if (district) {
                return {
                    level: 'district',
                    location: district.name,
                    state: 'Uttar Pradesh',
                    lat: district.lat,
                    lng: district.lng
                };
            }
        }
    }
    
    // 4. CHECK FOR UP STATE-LEVEL (no specific district)
    const upKeywords = [
        // English
        'uttar pradesh', ' up ', 'u.p.', 'up government', 'up assembly', 
        'up cabinet', 'up bjp', 'up samajwadi', 'up congress',
        'yogi adityanath', 'yogi government', 'cm yogi',
        'akhilesh yadav', 'samajwadi party', 'sp chief',
        'mayawati', 'bsp supremo',
        
        // Hindi - UP State
        'उत्तर प्रदेश', 'यूपी', 'उप्र', 'उत्तरप्रदेश',
        'यूपी सरकार', 'उप्र सरकार', 'उत्तर प्रदेश सरकार',
        'यूपी विधानसभा', 'उत्तर प्रदेश विधानसभा',
        
        // Hindi - UP Leaders
        'योगी आदित्यनाथ', 'योगी सरकार', 'मुख्यमंत्री योगी',
        'सीएम योगी', 'सीएम आदित्यनाथ',
        'अखिलेश यादव', 'समाजवादी पार्टी', 'सपा अध्यक्ष',
        'मायावती', 'बसपा सुप्रीमो', 'बहुजन समाज पार्टी',
        
        // Hindi - UP Politics
        'यूपी भाजपा', 'यूपी कांग्रेस', 'यूपी सपा', 'यूपी बसपा',
        'उत्तर प्रदेश चुनाव', 'यूपी चुनाव', 'विधानसभा चुनाव'
    ];
    
    if (upKeywords.some(kw => text.includes(kw))) {
        // Default to Lucknow for UP state-level news
        return {
            level: 'state',
            location: 'Lucknow',
            state: 'Uttar Pradesh',
            lat: 26.8467,
            lng: 80.9462,
            isUPState: true
        };
    }
    
    // 5. DEFAULT: Skip this news (not relevant)
    return null;
}

module.exports = { classifyNewsLocation };
