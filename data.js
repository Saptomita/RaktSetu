// ═══════════════════ MOCK DATA ═══════════════════
const HOSPITALS_DATA = [
    {
        id: 1, name: "AIIMS Hospital & Blood Bank", type: "government", category: "hospital",
        city: "Delhi", address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
        phone: "+91 11-2658 8500", email: "info@aiims.edu", hours: "24/7",
        lat: 28.5672, lng: 77.2100,
        blood: { "A+": 45, "A-": 12, "B+": 38, "B-": 8, "AB+": 15, "AB-": 5, "O+": 52, "O-": 9 },
        services: ["Blood Bank", "ICU", "Emergency", "Surgery", "Trauma Center"]
    },
    {
        id: 2, name: "Red Cross Blood Bank", type: "government", category: "blood-bank",
        city: "Mumbai", address: "Dr. Babasaheb Ambedkar Rd, Parel, Mumbai 400012",
        phone: "+91 22-2413 6677", email: "redcross.mumbai@gmail.com", hours: "8 AM - 8 PM",
        lat: 19.0048, lng: 72.8423,
        blood: { "A+": 30, "A-": 7, "B+": 25, "B-": 4, "AB+": 10, "AB-": 3, "O+": 40, "O-": 6 },
        services: ["Blood Bank", "Blood Component Separation", "Testing Lab"]
    },
    {
        id: 3, name: "Apollo Hospital Blood Bank", type: "private", category: "hospital",
        city: "Chennai", address: "21 Greams Lane, Off Greams Rd, Chennai 600006",
        phone: "+91 44-2829 3333", email: "info@apollohospitals.com", hours: "24/7",
        lat: 13.0604, lng: 80.2524,
        blood: { "A+": 55, "A-": 18, "B+": 42, "B-": 11, "AB+": 20, "AB-": 7, "O+": 60, "O-": 14 },
        services: ["Blood Bank", "Multi-Specialty", "Emergency", "ICU", "Dialysis"]
    },
    {
        id: 4, name: "Rotary Blood Bank", type: "private", category: "blood-bank",
        city: "Delhi", address: "56-57, Tughlakabad Institutional Area, New Delhi 110062",
        phone: "+91 11-2996 2929", email: "rotarybloodbank@gmail.com", hours: "24/7",
        lat: 28.5143, lng: 77.2573,
        blood: { "A+": 60, "A-": 22, "B+": 50, "B-": 15, "AB+": 25, "AB-": 8, "O+": 70, "O-": 18 },
        services: ["Blood Bank", "Platelet Apheresis", "Blood Component Separation"]
    },
    {
        id: 5, name: "Fortis Hospital & Blood Centre", type: "private", category: "hospital",
        city: "Bangalore", address: "154/9 Bannerghatta Rd, Bangalore 560076",
        phone: "+91 80-6621 4444", email: "fortis.blr@fortishealthcare.com", hours: "24/7",
        lat: 12.8892, lng: 77.5972,
        blood: { "A+": 35, "A-": 10, "B+": 28, "B-": 6, "AB+": 12, "AB-": 4, "O+": 45, "O-": 8 },
        services: ["Blood Bank", "Cardiology", "Emergency", "Oncology", "ICU"]
    },
    {
        id: 6, name: "Safdarjung Hospital Blood Bank", type: "government", category: "hospital",
        city: "Delhi", address: "Ansari Nagar West, New Delhi 110029",
        phone: "+91 11-2673 0000", email: "info@safdarjunghospital.nic.in", hours: "24/7",
        lat: 28.5685, lng: 77.2065,
        blood: { "A+": 40, "A-": 14, "B+": 33, "B-": 9, "AB+": 18, "AB-": 6, "O+": 48, "O-": 11 },
        services: ["Blood Bank", "Emergency", "Surgery", "ICU", "Trauma Center"]
    },
    {
        id: 7, name: "Nizam's Institute Blood Bank", type: "government", category: "blood-bank",
        city: "Hyderabad", address: "Punjagutta, Hyderabad 500082",
        phone: "+91 40-2348 5000", email: "nims@ap.nic.in", hours: "24/7",
        lat: 17.4156, lng: 78.4347,
        blood: { "A+": 28, "A-": 8, "B+": 32, "B-": 7, "AB+": 14, "AB-": 4, "O+": 38, "O-": 10 },
        services: ["Blood Bank", "Blood Testing", "Component Separation"]
    },
    {
        id: 8, name: "Medanta Blood Bank", type: "private", category: "hospital",
        city: "Delhi", address: "CH Baktawar Singh Rd, Sector 38, Gurugram 122001",
        phone: "+91 124-4141 414", email: "info@medanta.org", hours: "24/7",
        lat: 28.4395, lng: 77.0422,
        blood: { "A+": 50, "A-": 16, "B+": 44, "B-": 12, "AB+": 22, "AB-": 8, "O+": 55, "O-": 15 },
        services: ["Blood Bank", "Heart Institute", "Neurosciences", "Emergency"]
    },
    {
        id: 9, name: "KEM Hospital Blood Centre", type: "government", category: "hospital",
        city: "Mumbai", address: "Acharya Dhonde Marg, Parel, Mumbai 400012",
        phone: "+91 22-2410 7000", email: "kem@mcgm.gov.in", hours: "24/7",
        lat: 19.0035, lng: 72.8410,
        blood: { "A+": 38, "A-": 11, "B+": 30, "B-": 8, "AB+": 16, "AB-": 5, "O+": 42, "O-": 12 },
        services: ["Blood Bank", "Trauma", "Burns Unit", "ICU", "Emergency"]
    },
    {
        id: 10, name: "Manipal Hospital Blood Bank", type: "private", category: "hospital",
        city: "Bangalore", address: "98 HAL Airport Rd, Bangalore 560017",
        phone: "+91 80-2502 4444", email: "info@manipalhospitals.com", hours: "24/7",
        lat: 12.9591, lng: 77.6476,
        blood: { "A+": 42, "A-": 15, "B+": 36, "B-": 10, "AB+": 18, "AB-": 6, "O+": 50, "O-": 13 },
        services: ["Blood Bank", "Multi-Specialty", "Organ Transplant", "Emergency"]
    },
    {
        id: 11, name: "CMC Blood Bank", type: "private", category: "blood-bank",
        city: "Chennai", address: "Ida Scudder Rd, Vellore 632004",
        phone: "+91 416-228 1000", email: "cmc@cmch-vellore.edu", hours: "8 AM - 10 PM",
        lat: 12.9249, lng: 79.1325,
        blood: { "A+": 32, "A-": 9, "B+": 28, "B-": 5, "AB+": 11, "AB-": 3, "O+": 38, "O-": 7 },
        services: ["Blood Bank", "Platelet Donation", "Blood Testing"]
    },
    {
        id: 12, name: "Ruby Hall Clinic Blood Bank", type: "private", category: "hospital",
        city: "Pune", address: "40 Sassoon Rd, Pune 411001",
        phone: "+91 20-2616 3391", email: "info@rubyhall.com", hours: "24/7",
        lat: 18.5314, lng: 73.8774,
        blood: { "A+": 25, "A-": 8, "B+": 22, "B-": 6, "AB+": 10, "AB-": 3, "O+": 30, "O-": 8 },
        services: ["Blood Bank", "Cardiology", "Emergency", "ICU"]
    },
    {
        id: 13, name: "SSKM Hospital Blood Bank", type: "government", category: "hospital",
        city: "Kolkata", address: "244 AJC Bose Rd, Kolkata 700020",
        phone: "+91 33-2223 4567", email: "sskm@wbhealth.gov.in", hours: "24/7",
        lat: 22.5377, lng: 88.3476,
        blood: { "A+": 30, "A-": 10, "B+": 35, "B-": 8, "AB+": 12, "AB-": 4, "O+": 40, "O-": 9 },
        services: ["Blood Bank", "Emergency", "Surgery", "ICU"]
    },
    {
        id: 14, name: "Civil Hospital Blood Bank", type: "government", category: "blood-bank",
        city: "Ahmedabad", address: "Asarwa, Ahmedabad 380016",
        phone: "+91 79-2268 3721", email: "civilbb@gujarat.gov.in", hours: "9 AM - 7 PM",
        lat: 23.0548, lng: 72.6065,
        blood: { "A+": 20, "A-": 5, "B+": 18, "B-": 4, "AB+": 8, "AB-": 2, "O+": 28, "O-": 5 },
        services: ["Blood Bank", "Testing Lab"]
    },
    {
        id: 15, name: "Max Super Speciality Hospital", type: "private", category: "hospital",
        city: "Delhi", address: "1, 2 Press Enclave Rd, Saket, New Delhi 110017",
        phone: "+91 11-2651 5050", email: "info@maxhealthcare.com", hours: "24/7",
        lat: 28.5289, lng: 77.2117,
        blood: { "A+": 48, "A-": 14, "B+": 40, "B-": 10, "AB+": 20, "AB-": 7, "O+": 55, "O-": 12 },
        services: ["Blood Bank", "Multi-Specialty", "Emergency", "ICU", "Robotic Surgery"]
    }
];

// ═══════════════════ GEMMA AI RESPONSES ═══════════════════
const AI_RESPONSES = {
    greeting: [
        "Hello! 👋 I'm Gemma AI, your AI healthcare assistant. How can I help you today?",
        "Hi there! 🩺 Welcome to RaktSetu. I'm here to help you find blood, locate hospitals, or answer any healthcare questions.",
        "Namaste! 🙏 I'm Gemma AI. Whether you need blood urgently or have a health query, I'm here to assist."
    ],
    blood_search: {
        default: "I can help you find blood! Please tell me:\n\n🩸 **What blood group** do you need? (A+, A-, B+, B-, AB+, AB-, O+, O-)\n📍 **Your location** or city\n\nYou can also use the **Search Blood** section above for a detailed search with filters.",
        found: (group, results) => `Great news! 🎉 I found **${results.length} location(s)** with **${group}** blood available near you:\n\n${results.map((r, i) => `${i + 1}. **${r.name}** — ${r.blood[group]} units available\n   📍 ${r.city} | 📞 ${r.phone}`).join('\n\n')}\n\nWould you like directions to any of these?`,
        not_found: (group) => `I'm sorry, I couldn't find **${group}** blood in our database right now. 😔\n\nHere's what I suggest:\n1. 📞 Call the **Blood Helpline: 1098**\n2. 🏥 Try nearby government hospitals\n3. 🔄 Check back as inventory updates frequently\n\nWould you like me to show emergency contacts?`
    },
    hospital_info: "Here are some top registered hospitals near major cities:\n\n🏥 **AIIMS** — Delhi (Govt, 24/7)\n🏥 **Apollo Hospital** — Chennai (Private, 24/7)\n🏥 **Fortis Hospital** — Bangalore (Private, 24/7)\n🏥 **KEM Hospital** — Mumbai (Govt, 24/7)\n🏥 **Medanta** — Gurugram (Private, 24/7)\n\nUse the **Hospitals** section to browse and filter all registered facilities.",
    donation_eligibility: "Great question! Here are the **blood donation eligibility criteria**: ✅\n\n✅ **Age**: 18-65 years\n✅ **Weight**: At least 45 kg (100 lbs)\n✅ **Hemoglobin**: Minimum 12.5 g/dL\n✅ **Health**: Generally healthy, no active infections\n✅ **Gap**: At least 56 days between whole blood donations\n\n❌ **Cannot donate if**:\n- Pregnant or recently gave birth\n- Had surgery in last 6 months\n- Have HIV, Hepatitis B/C\n- Currently on antibiotics\n- Had recent tattoo/piercing (wait 6 months)\n\nWant to know more about the donation process?",
    donation_process: "Here's the **step-by-step blood donation process**: 🩸\n\n1️⃣ **Registration** — Fill out a donor form with basic details\n2️⃣ **Mini Physical** — Quick check of temperature, pulse, BP, and hemoglobin\n3️⃣ **Donation** — The actual donation takes only **8-10 minutes**\n4️⃣ **Refreshments** — Rest and enjoy snacks/drinks for 10-15 minutes\n5️⃣ **Certificate** — Receive your donor card and certificate\n\n💡 **Total time**: About 30-45 minutes\n💡 **One donation can save up to 3 lives!**\n\nWould you like to find a blood bank near you?",
    emergency: "🚨 **EMERGENCY ASSISTANCE** 🚨\n\nIf someone is in immediate danger, call these numbers **NOW**:\n\n📞 **102** — Ambulance\n📞 **108** — Emergency Medical Service\n📞 **112** — National Emergency Number\n📞 **1098** — Blood Bank Helpline\n\n**Emergency steps**:\n1. Keep the patient calm and comfortable\n2. Apply pressure to any bleeding wounds\n3. Note the blood group if known\n4. Call the nearest hospital from our directory\n5. Use RaktSetu to find blood availability\n\nStay calm. Help is on the way! 💪",
    multilingual: "🌐 I support multiple languages! While my primary interface is in English, I can understand and respond in:\n\n🇮🇳 **Hindi** — हिंदी\n🇮🇳 **Tamil** — தமிழ்\n🇮🇳 **Telugu** — తెలుగు\n🇮🇳 **Bengali** — বাংলা\n🇮🇳 **Marathi** — मराठी\n\nFeel free to ask me anything in your preferred language!",
    fallback: [
        "I'm not sure I understand that completely. Could you rephrase? 🤔\n\nI can help with:\n• 🩸 Finding blood availability\n• 🏥 Locating nearby hospitals\n• ❓ Blood donation FAQs\n• 🚨 Emergency assistance",
        "That's an interesting question! While I specialize in healthcare and blood bank services, let me try to help. Could you be more specific? 💬",
        "I want to make sure I give you the right information. Could you tell me more about what you're looking for? I'm best at:\n\n• Blood search & availability\n• Hospital information\n• Donation guidance\n• Emergency help"
    ]
};

// City coordinates for search
const CITY_COORDS = {
    "delhi": { lat: 28.6139, lng: 77.2090 },
    "new delhi": { lat: 28.6139, lng: 77.2090 },
    "mumbai": { lat: 19.0760, lng: 72.8777 },
    "bangalore": { lat: 12.9716, lng: 77.5946 },
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "chennai": { lat: 13.0827, lng: 80.2707 },
    "kolkata": { lat: 22.5726, lng: 88.3639 },
    "hyderabad": { lat: 17.3850, lng: 78.4867 },
    "pune": { lat: 18.5204, lng: 73.8567 },
    "ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "gurugram": { lat: 28.4595, lng: 77.0266 },
    "gurgaon": { lat: 28.4595, lng: 77.0266 },
    "vellore": { lat: 12.9165, lng: 79.1325 }
};
