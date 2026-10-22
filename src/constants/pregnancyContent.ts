// ⚠️ Ye aam jaankari hai. Client doctor se verify karwake hi release karo.
// Doctor kuch badalna chahein toh sirf is file mein badlo.

export const DOCTOR = {
  name: "Dr. Sonal Gupta",
  whatsapp: "91XXXXXXXXXX", // country code ke saath, bina + ke (jaise 919876543210)
  phone: "+91XXXXXXXXXX",
};

export type Trimester = 1 | 2 | 3;

export const TRIMESTER_INFO: Record<Trimester, { title: string; baby: string[]; body: string[] }> = {
  1: {
    title: "Pehla trimester (1 se 13 hafte)",
    baby: [
      "Baby ka dil, dimaag aur ang banna shuru hote hain.",
      "Dimaag aur reedh ki haddi isi samay banti hai, isliye folic acid zaroori hai.",
    ],
    body: [
      "Ji michlana, thakan, baar baar peshab aur mood swings aam hain.",
      "Thoda thoda khaana aur aaram karna madad karta hai.",
    ],
  },
  2: {
    title: "Dusra trimester (14 se 27 hafte)",
    baby: [
      "Baby ke baal, nakhun aur haddiyan majboot hoti hain.",
      "Baby ki harkat mehsoos hone lagti hai (aksar 18 se 22 hafte ke beech).",
    ],
    body: [
      "Aksar energy wapas aati hai aur ji michlana kam hota hai.",
      "Pet bahar dikhne lagta hai, kamar mein halka dard ho sakta hai.",
    ],
  },
  3: {
    title: "Teesra trimester (28 hafte se delivery tak)",
    baby: [
      "Baby ka wazan tezi se badhta hai aur phephde taiyaar hote hain.",
      "Baby delivery ke liye position leta hai.",
    ],
    body: [
      "Saans phoolna, neend mein dikkat aur pairon mein halki sujan ho sakti hai.",
      "Halke, bina dard ke pet ke sankuchan (practice contractions) aam hain.",
    ],
  },
};

export const EXERCISE = {
  intro: "Zyadatar healthy pregnancy mein halki exercise faydemand hoti hai. Shuru karne se pehle apne doctor se zaroor poochho.",
  doList: [
    { icon: "🚶‍♀️", title: "Paidal chalna", note: "Roz 20 se 30 minute aaram se. Sabse aasan aur safe." },
    { icon: "🧘‍♀️", title: "Prenatal yoga aur stretching", note: "Sirf pregnancy ke liye bane aasan, trained instructor ke saath." },
    { icon: "🌬️", title: "Gehri saans", note: "Roz 5 se 10 minute. Tanav kam karti hai aur delivery ki taiyaari mein madad karti hai." },
    { icon: "💪", title: "Kegel (pelvic floor)", note: "Peshab rokne jaisi mansapeshiyon ko 5 second kasna, phir dheela karna. Din mein kuch baar." },
    { icon: "🏊‍♀️", title: "Swimming", note: "Jodon pe zor nahi padta. Doctor ki ijazat ke baad." },
  ],
  avoidList: [
    "Bhaari wazan uthana",
    "Peeth ke bal der tak lette rehna (pehle trimester ke baad)",
    "Girne ka khatra wale khel (cycling, skating, ghudsawari)",
    "Contact sports (kabaddi, kushti, football)",
    "Bahut garam jagah par exercise (hot yoga)",
    "Itni exercise ki saans na aaye ya bahut thakan ho jaye",
  ],
  stopSigns: [
    "Khoon aana",
    "Chakkar ya behoshi jaisa lagna",
    "Seene mein dard ya tez dhadkan",
    "Pet mein tez dard ya sankuchan",
    "Paani jaisa dravya behna",
    "Saans phoolna jo aaram se bhi theek na ho",
  ],
};

export const DIET = {
  intro: "Zyada nahi, sahi khaana hai. Din mein 3 meals aur 2 se 3 chhote snacks achhe rehte hain.",
  groups: [
    { icon: "🥣", title: "Protein", items: "Dal, rajma, chana, paneer, dahi, anda (achhe se pakka hua), soya" },
    { icon: "🥬", title: "Iron (khoon ke liye)", items: "Palak, methi, chukandar, anaar, gud-chana, khajoor" },
    { icon: "🥛", title: "Calcium (haddiyon ke liye)", items: "Doodh, dahi, paneer, ragi, til" },
    { icon: "🍎", title: "Phal aur sabziyan", items: "Mausami phal aur rang-birangi sabziyan, achhe se dhoke" },
    { icon: "🌾", title: "Fiber (kabz se bachne ke liye)", items: "Roti (poora anaaj), daliya, oats, phal, salad" },
    { icon: "💧", title: "Paani", items: "Din mein 8 se 10 glass. Nariyal paani, chaas, nimbu paani bhi achhe hain" },
  ],
  avoid: [
    "Kachcha ya adhpaka maans, machhli aur anda",
    "Bina ubaala (unpasteurised) doodh aur uski cheezein",
    "Kachcha papita",
    "Sharab aur tambaku",
    "Chai/coffee zyada na piyein (din mein 1 se 2 cup tak)",
    "Bahar ka khula ya baasi khaana",
  ],
  note: "Folic acid, iron aur calcium ki goli sirf doctor ke bataye hisaab se lein. Apne se na shuru karein, na band karein.",
  trimesterTip: {
    1: "Ji michlana ho toh thoda thoda khayein. Adrak wali chai ya nimbu paani se aaram mil sakta hai.",
    2: "Iron aur calcium ka khayal rakhein, kyunki baby ki haddiyan aur khoon ban raha hai.",
    3: "Seene mein jalan ho toh chhote meals khayein aur sone se 2 ghante pehle khana kha lein.",
  } as Record<Trimester, string>,
};

export const CHECKUPS = [
  { when: "Pregnancy ka pata chalte hi", what: "Doctor ka pehla checkup. Dawai (folic acid) aur zaroori tests shuru hote hain." },
  { when: "6 se 10 hafte", what: "Pehla ultrasound (dilki dhadkan aur due date confirm karne ke liye)." },
  { when: "11 se 14 hafte", what: "Baby ke vikas ka scan aur blood tests." },
  { when: "18 se 22 hafte", what: "Detailed scan (anomaly scan), baby ke ang check hote hain." },
  { when: "24 se 28 hafte", what: "Sugar (gestational diabetes) ka test." },
  { when: "28 hafte ke baad", what: "Checkup zyada baar hota hai. Baby ki harkat par dhyan do." },
  { when: "32 se 36 hafte", what: "Baby ki growth aur position ka scan." },
];

export const CHECKUP_NOTE = "Ye aam schedule hai. Aapke doctor aapki sehat ke hisaab se isse alag bhi bata sakte hain.";

export const DANGER_SIGNS = [
  "Yoni se khoon aana",
  "Paani jaisa dravya behna",
  "Pet mein tez dard",
  "Bahut tez sir dard ya aankhon ke saamne dhundhla dikhna",
  "Chehre ya haathon mein achanak sujan",
  "Tez bukhar",
  "Baby ki harkat kam ho jana ya band ho jana",
  "Lagataar ulti, paani bhi na rukna",
  "Peshab mein jalan ya dard",
  "Seene mein dard ya saans lene mein takleef",
  "Daure (fits) padna ya behoshi",
];

// Aaj kaisa lag raha hai ke liye (aam symptoms)
export const COMMON_SYMPTOMS = [
  "Ji michlana", "Thakan", "Kamar dard", "Kabz", "Seene mein jalan",
  "Pairon mein halki sujan", "Neend na aana", "Mood swings",
];
// ---------- MA'AM KI LIST ----------

// Complaints (ma'am ki list ke 10)
export const COMPLAINTS: { key: string; label: string }[] = [
  { key: "nausea", label: "Ji michlana (Nausea)" },
  { key: "vomiting", label: "Ulti (Vomiting)" },
  { key: "pain_abdomen", label: "Pet mein dard" },
  { key: "backache", label: "Kamar dard" },
  { key: "itching", label: "Khujli (Itching)" },
  { key: "rashes", label: "Rashes / daane" },
  { key: "urine_infection", label: "Peshab mein infection / jalan" },
  { key: "loose_motion", label: "Loose motion" },
  { key: "constipation", label: "Kabz (Constipation)" },
  { key: "blood_in_stool", label: "Potty mein khoon" },
];

// ⚠️ Ma'am se confirm karwao: inme se kaunsi "doctor ko zaroor batayein" wali hain
export const INFORM_DOCTOR_KEYS = ["pain_abdomen", "blood_in_stool"];

// Aur bhi aam baatein
export const OTHER_SYMPTOMS = [
  "Thakan", "Seene mein jalan", "Pairon mein halki sujan", "Neend na aana", "Mood swings",
];

// Investigations (ma'am ki list ke 4)
export const INVESTIGATIONS: { key: string; label: string; about: string }[] = [
  { key: "cbc", label: "CBC", about: "Khoon ki poori jaanch (hemoglobin waghera)" },
  { key: "blood_sugar", label: "Blood sugar", about: "Khoon mein sugar ka level" },
  { key: "serum_tsh", label: "Serum TSH", about: "Thyroid ki jaanch" },
  { key: "viral_markers", label: "Viral markers", about: "Kuch infections ki screening, jo pregnancy mein aam taur pe hoti hai" },
];