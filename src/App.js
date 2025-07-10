import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig'; // Import from your config file
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Sun, Wind, Droplets, Leaf, Sparkles, User } from 'lucide-react';
import FormField from './components/FormField';
import UserIdDisplay from './components/UserIdDisplay';

// --- FORM SCHEMA DEFINITION ---
const FORM_SCHEMA = {
  "sections": [
    {
      "title": "The ʻOhana & Vision",
      "icon": User,
      "fields": [
        { "id": "visitDate", "label": "Visit Date", "type": "date", "guidance": "Let's record the date of our visit to remember when we started this journey together." },
        { "id": "familyName", "label": "Family Name", "type": "text", "guidance": "What is the name of the ʻohana we are working with today?" },
        { "id": "primaryContactName", "label": "Primary Contact Name", "type": "text", "guidance": "Who is the main person we can connect with about the garden?" },
        { "id": "contactPhone", "label": "Contact Phone", "type": "tel", "guidance": "A phone number helps us stay in touch for important updates, like scheduling the planting day." },
        { "id": "contactEmail", "label": "Contact Email", "type": "email", "guidance": "An email address is great for sharing resources, links, and the final planting plan." },
        { "id": "siteAddressStreet", "label": "Site Address - Street", "type": "text", "guidance": "Where is the garden located? Let's get the street address." },
        { "id": "siteAddressCity", "label": "Site Address - City", "type": "text", "guidance": "Which city is the site in?" },
        { "id": "siteAddressState", "label": "Site Address - State", "type": "text", "guidance": "And the state?" },
        { "id": "siteAddressZip", "label": "Site Address - ZIP Code", "type": "text", "guidance": "The ZIP code helps us understand the general climate zone." },
        { "id": "taxMapKey", "label": "Tax Map Key (TMK)", "type": "text", "guidance": "The TMK is the parcel ID for the property. It's used for property records in Hawaiʻi and can help us understand the land's history, size, and boundaries. It's okay if you don't have it right now." },
        { "id": "visionAndGoals", "label": "Vision & Goals", "type": "textarea", "placeholder": "What does a thriving garden look like to you in one year? In five years?", "guidance": "Let's dream a little! What does this garden look like when it's flourishing? What feelings does it bring? This vision will be our guide." },
        { "id": "favoriteFoods", "label": "Favorite Foods", "type": "textarea", "placeholder": "What are your favorite foods to eat? What do you want to learn to cook?", "guidance": "Food is at the heart of this project. Let's list the foods your ʻohana loves to eat. This helps us choose plants that you'll be excited to harvest and cook." },
        { "id": "gardenCaretakers", "label": "Garden Caretakers", "type": "checkbox", "options": ["Keiki (children)", "Mākua (adults)", "Kūpuna (elders)", "Community friends", "Other"], "hasOtherOption": true, "guidance": "A garden needs many hands. Who in the ʻohana or community will be the kahu, the caretakers, for this special place?" },
        { "id": "communityConnection", "label": "Community Connection", "type": "textarea", "placeholder": "How do you hope this garden will connect your family and community?", "guidance": "How can this garden be a bridge? Think about sharing harvests, knowledge, or simply time with neighbors and friends. How will it strengthen your bonds?" }
      ]
    },
    {
      "title": "Site Analysis",
      "icon": Sun,
      "fields": [
        { "id": "plantingZoneDescription", "label": "Proposed Location Description", "type": "text", "guidance": "Let's walk the ʻāina. Describe the spot you have in mind for the garden. What's it near? What does it feel like?" },
        { "id": "plantingZoneDimensions", "label": "Planting Zone Dimensions", "type": "dimensions", "guidance": "Let's measure the space. Knowing the length and width helps us plan how many plants can fit comfortably." },
        { "id": "plantingZonePhotos", "label": "Photos of Planting Zone", "type": "text", "placeholder": "Enter photo URLs or notes", "guidance": "A picture is worth a thousand words. Let's take some photos from different angles. You can add links to them here or just make a note of the photos taken." },
        { "id": "sunlight", "label": "Sunlight Exposure", "type": "radio", "options": ["Full Sun (6+ hours)", "Partial Sun (4-6 hours)", "Dappled Shade", "Full Shade"], "guidance": "Let's look up! How much direct sun does this spot get during the day? The sun is the main source of energy for our plants, so this is a crucial observation." },
        { "id": "waterSource", "label": "Primary Water Source", "type": "radio", "options": ["Municipal Tap", "Rainwater Catchment", "Well", "Stream/Natural Source", "Other"], "hasOtherOption": true, "guidance": "Water is life. Where will the water for our garden come from? This helps us plan for irrigation and understand our resources." },
        { "id": "groundcover", "label": "Current Groundcover", "type": "checkbox", "options": ["Grass/Lawn", "Weeds", "Bare Dirt", "Mulch/Woodchips", "Concrete/Paving", "Other"], "hasOtherOption": true, "guidance": "What's currently covering the ground? This tells us how much work will be needed to prepare the soil for planting." },
        { "id": "slope", "label": "Slope of Planting Area", "type": "radio", "options": ["Mostly Flat", "Gentle Slope", "Steep Slope"], "guidance": "How does the land lie? Understanding the slope helps us think about water flow, erosion, and how to design the garden beds." },
        { "id": "obstacles", "label": "Potential Obstacles", "type": "checkbox", "options": ["Overhead power lines", "Underground pipes (water/septic)", "Large rocks", "Tree roots", "Other"], "hasOtherOption": true, "guidance": "Let's look around, up, and think about what's underground. Are there any challenges we need to design around?" },
        { "id": "windConditions", "label": "Wind Conditions", "type": "radio", "options": ["North", "East", "South", "West", "Variable/Unsure"], "guidance": "Which way does the makani, the wind, blow the strongest? This can affect which plants will thrive and whether we need to create a windbreak." },
        { "id": "soilVisual", "label": "Soil - Visual Description", "type": "radio", "options": ["Rich and dark", "Sandy/Light-colored", "Heavy clay", "Rocky", "Compacted/Hard"], "guidance": "Let's look closely at the soil. What color is it? Does it look fluffy or hard? The visual cues tell us a lot about its health." },
        { "id": "soilTexture", "label": "Soil - Texture Test", "type": "radio", "options": ["Gritty (sandy)", "Smooth/Powdery (silty)", "Sticky/Forms a ribbon (clay)", "A good mix of all three (loam)"], "guidance": "Let's get our hands dirty! Take a small amount of soil, wet it, and rub it between your fingers. How does it feel? This tells us about the soil's ability to hold water and nutrients." },
        { "id": "soilDrainage", "label": "Soil - Drainage Test", "type": "radio", "options": ["Drains very quickly", "Drains well (puddle gone in minutes)", "Drains slowly (puddle stays for hours)", "Waterlogs / Doesn't drain"], "guidance": "If we pour some water here, what happens? Good drainage is key for healthy roots. We want to avoid 'wet feet' for most plants." },
        { "id": "soilPH", "label": "Soil - pH Level", "type": "number", "placeholder": "e.g., 7.0", "guidance": "Do you happen to know the soil pH? You can use a simple test kit. Most plants like a neutral pH (around 6.5-7.0), but some have special preferences. It's okay if we don't know this yet." },
        { "id": "soilObservations", "label": "Soil - General Observations", "type": "textarea", "placeholder": "Any other soil observations, like worms, roots, or compaction?", "guidance": "Are there any other clues in the soil? Seeing lots of earthworms is a great sign! Are there lots of old roots? Let's note anything else we see." }
      ]
    },
    {
      "title": "Planting Plan",
      "icon": Leaf,
      "fields": [
        { "id": "desiredKeyTrees", "label": "Desired Key Trees", "type": "checkbox", "options": ["ʻUlu (Breadfruit)", "Niu (Coconut)", "Maia (Banana)"], "guidance": "These are important canoe plants, the cornerstones of a Polynesian food forest. Which of these foundational trees are you most excited to grow?" },
        { "id": "optionalLargeTrees", "label": "Optional Large Fruit Trees", "type": "textarea", "placeholder": "List other large trees here...", "guidance": "Beyond the key trees, are there other large fruit trees you dream of having? Maybe mango, avocado, or citrus?" },
        { "id": "hedgeAndVinePreference", "label": "Hedge & Vine Preference", "type": "checkbox", "options": ["Lilikoi (Passionfruit)", "Bele", "Chaya", "Moringa", "Kalo (Taro) for border", "Other"], "hasOtherOption": true, "guidance": "Hedges and vines are great for creating living fences, privacy, and producing lots of food in small spaces. What interests you?" },
        { "id": "medicinalCulinaryGarden", "label": "Medicinal/Culinary Garden", "type": "radio", "options": ["Yes, a dedicated bed", "Yes, integrated among other plants", "Not at this time"], "guidance": "Do you want a special space for laʻau lapaʻau (healing plants) or culinary herbs? We can make a dedicated bed or weave them throughout the garden." }
      ]
    },
    {
      "title": "Action Plan & Kuleana",
      "icon": Sparkles,
      "fields": [
        { "id": "ohanaKuleana", "label": "ʻOhana Kuleana (Responsibilities)", "type": "checklist", "options": ["Clear existing vegetation", "Prepare the soil (weeding/amending)", "Ensure water access is ready", "Gather cardboard/mulch", "Commit to watering schedule"], "guidance": "This is the family's kuleana, your shared responsibility and privilege. These are the steps you'll take to prepare the space and care for the garden." },
        { "id": "wfoKuleana", "label": "Well Fed ʻOhana Kuleana (Responsibilities)", "type": "checklist", "options": ["Source all required plants", "Develop final planting sketch", "Schedule community planting day", "Bring necessary tools & amendments", "Provide guidance on planting day"], "guidance": "This is our kuleana to you. We'll take care of these tasks to support your vision and ensure we have a successful planting day together." }
      ]
    }
  ]
};

// NOTE: The __app_id and __initial_auth_token variables are for the NSS Atlas environment.
// In a real-world deployment, you would handle authentication differently (e.g., standard Firebase UI).
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

function App() {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [formId, setFormId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    
    const sections = FORM_SCHEMA.sections;
    const CurrentIcon = sections[currentSectionIndex].icon;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    if (token) {
                        await signInWithCustomToken(auth, token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) { console.error("Firebase Auth Error:", error); }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId || formId) return;
        const createNewForm = async () => {
            try {
                const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/siteAnalyses`);
                const newDocRef = await addDoc(collectionRef, { createdAt: serverTimestamp(), status: 'in-progress', formData: {} });
                setFormId(newDocRef.id);
            } catch (error) { console.error("Error creating new form document:", error); }
        };
        createNewForm();
    }, [isAuthReady, userId, formId]);
    
    useEffect(() => {
        if (!formId || !userId) return;
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/siteAnalyses/${formId}`);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setFormData(docSnap.data().formData || {});
            }
        }, (error) => { console.error("Error listening to form data:", error); });
        return () => unsubscribe();
    }, [formId, userId]);

    const handleFormChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async (showNotification = false) => {
        if (!formId || !userId) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, `artifacts/${appId}/users/${userId}/siteAnalyses/${formId}`);
            await setDoc(docRef, { formData, updatedAt: serverTimestamp(), status: 'saved' }, { merge: true });
            if (showNotification) { console.log("Form saved successfully!"); }
        } catch (error) { console.error("Error saving form:", error); }
        finally { setIsSaving(false); }
    };

    const generateSummary = async () => {
        setIsGenerating(true); setAiSummary(''); setShowSummaryModal(true);
        const prompt = `You are a permaculture design assistant for 'Well Fed ʻOhana', a non-profit in Hawaiʻi focused on food sovereignty. Based on the following site analysis data, provide a warm, encouraging, and actionable summary for the family. The summary should: 1. Start with a positive and welcoming message, acknowledging the ʻohana's vision. 2. Briefly summarize the key findings from the site analysis (sun, water, soil). 3. Provide 3-5 clear, actionable recommendations for creating a thriving garden based on their choices and site conditions. 4. Maintain a collaborative and culturally sensitive tone, using Hawaiian terms like ʻohana (family), ʻāina (land), and kuleana (responsibility) where appropriate. 5. Format the output in Markdown for readability. Here is the data: ${JSON.stringify(formData, null, 2)}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Iin the live app use a Cloud Function to hide this key.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }
            const result = await response.json();
            const summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            setAiSummary(summaryText || "Could not generate a summary. The response from the AI was empty.");
        } catch (error) {
            setAiSummary(`An error occurred while generating the summary: ${error.message}. Please try again later.`);
        } finally { setIsGenerating(false); }
    };

    const prevSection = () => { handleSave(); setCurrentSectionIndex(prev => Math.max(0, prev - 1)); };
    const nextSection = () => { handleSave(); setCurrentSectionIndex(prev => Math.min(sections.length - 1, prev + 1)); };
    
    if (!isAuthReady || !formId) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Leaf className="mx-auto h-12 w-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-lg text-gray-700">Initializing your garden plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50/50 font-sans text-gray-900">
            <UserIdDisplay userId={userId} />
            <div className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800">Well Fed ʻOhana</h1>
                    <p className="text-lg text-gray-600 mt-2">On-Site Initiation & Site Analysis</p>
                </header>

                <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-green-200 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full"><CurrentIcon className="w-8 h-8 text-green-700" /></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Section {currentSectionIndex + 1} of {sections.length}</p>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{sections[currentSectionIndex].title}</h2>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            {sections.map((_, index) => ( <button key={index} onClick={() => setCurrentSectionIndex(index)} className={`h-2 w-8 rounded-full transition-all ${currentSectionIndex === index ? 'bg-green-600 w-12' : 'bg-gray-300 hover:bg-gray-400'}`}></button> ))}
                        </div>
                    </div>

                    <div> {sections[currentSectionIndex].fields.map(field => <FormField key={field.id} field={field} value={formData[field.id]} onChange={handleFormChange} />)} </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        {/* Mobile Navigation */}
                        <div className="flex flex-col gap-4 md:hidden">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={prevSection} disabled={currentSectionIndex === 0} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 transition">
                                    <ArrowLeft size={18} />
                                    <span className="hidden sm:inline">Previous</span>
                                </button>
                                <button onClick={nextSection} disabled={currentSectionIndex === sections.length - 1} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition">
                                    <span className="hidden sm:inline">Next</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <button onClick={() => handleSave(true)} disabled={isSaving} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition">
                                {isSaving ? 'Saving...' : 'Save Progress'}
                            </button>
                            {currentSectionIndex === sections.length - 1 && (
                                <button onClick={generateSummary} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-purple-400 transition">
                                    <Sparkles size={18} /> {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                                </button>
                            )}
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center justify-between">
                            <button onClick={prevSection} disabled={currentSectionIndex === 0} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                <ArrowLeft size={18} /> Previous
                            </button>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleSave(true)} disabled={isSaving} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition">
                                    {isSaving ? 'Saving...' : 'Save Progress'}
                                </button>
                                {currentSectionIndex === sections.length - 1 && (
                                    <button onClick={generateSummary} disabled={isGenerating} className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-purple-400 transition">
                                        <Sparkles size={18} /> {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                                    </button>
                                )}
                            </div>
                            <button onClick={nextSection} disabled={currentSectionIndex === sections.length - 1} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {showSummaryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity" onClick={() => setShowSummaryModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            <h3 className="text-2xl font-bold text-gray-800">AI-Powered Summary & Recommendations</h3>
                        </div>
                        {isGenerating && (
                           <div className="flex flex-col items-center justify-center h-64">
                               <Leaf className="h-12 w-12 text-green-500 animate-spin" />
                               <p className="mt-4 text-gray-600">Analyzing your ʻāina... please wait.</p>
                           </div>
                        )}
                        {aiSummary && (
                            <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }}></div>
                        )}
                         <button onClick={() => setShowSummaryModal(false)} className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"> Close </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
