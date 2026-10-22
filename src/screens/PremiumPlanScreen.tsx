import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const RADAR = Math.min(width - 72, 300);

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ------------------------------------------------------------------ */
/* 🎨 Colors - sirf yahan change karo, poori screen update ho jayegi.   */
/* Coral + Teal chahiye to: primary '#F2665A', accent '#25B3A3'         */
/* ------------------------------------------------------------------ */
const COLORS = {
  primary: '#FF6B00', // CTA, price, active toggle
  primarySoft: '#472A1E',
  accent: '#208AEF', // headings tag, icons, links
  accentSoft: '#EAF4FE',
  navy: '#111B2D', // dark hero
  navyCard: '#1E293B',
  bg: '#F0FDF9',
  text: '#111827',
  body: '#333333',
  muted: '#6B7280',
  border: '#E2E8F0',
  star: '#FF9800',
  success: '#16A34A',
};

// TODO: apne real numbers daalo
const CARE_PHONE = '+910000000000';
const CARE_WHATSAPP = '910000000000';

// Agar tumhare app me already bottom tabs (expo-router/react-navigation) hain to false hi rakho
const SHOW_TAB_BAR = false;

const features: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'videocam-outline', title: '2 Doctor Consults / mo', desc: 'Video or audio anytime with MBBS/MD specialists.' },
  { icon: 'nutrition-outline', title: 'Diet & Nutrition Plan', desc: 'Tailored to Indian cuisine and regional staples.' },
  { icon: 'document-text-outline', title: 'Digital Rx & Vitals', desc: 'Instant digital prescriptions and lab booking.' },
  { icon: 'barbell-outline', title: 'Mobility & Workouts', desc: 'Physio-approved home exercises.' },
  { icon: 'medkit-outline', title: 'Vitamin Guidance', desc: 'Evidence-backed daily micronutrient protocols.' },
  { icon: 'trending-up-outline', title: 'AI Biomarker Trends', desc: 'Visual tracking for HbA1c, lipid panel, BP.' },
];

const doctors = [
  { name: 'Dr. Sonal Gupta', title: 'MBBS, MS, DGO', spec: 'Gynaecologist', exp: '12+ yrs', rating: '4.9', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Dr. Rajesh Sharma', title: 'MBBS, MD', spec: 'Preventive Health', exp: '15+ yrs', rating: '4.8', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
];

const programs: Record<'women' | 'men', { icon: IconName; label: string }[]> = {
  women: [
    { icon: 'flower-outline', label: 'PCOS & Hormones' },
    { icon: 'pulse-outline', label: 'Thyroid & Metabolism' },
    { icon: 'water-outline', label: 'Iron & Anaemia' },
    { icon: 'body-outline', label: 'Bone Density & Osteopenia' },
    { icon: 'heart-outline', label: 'Pregnancy Readiness' },
    { icon: 'shield-checkmark-outline', label: 'Cervical & Breast Screening' },
  ],
  men: [
    { icon: 'water-outline', label: 'Diabetes & Sugar' },
    { icon: 'heart-outline', label: 'BP & Heart Health' },
    { icon: 'flask-outline', label: 'Cholesterol & Lipids' },
    { icon: 'nutrition-outline', label: 'Fatty Liver' },
    { icon: 'shield-checkmark-outline', label: 'Prostate Screening' },
    { icon: 'moon-outline', label: 'Stress & Sleep' },
  ],
};

const steps = [
  { title: 'Choose Your Plan', desc: 'Activate your free first month in under a minute. Cancel anytime with 1 tap.' },
  { title: 'Share Your Health Details', desc: 'Quick 3-minute lifestyle form, upload old lab reports or book a home lab test.' },
  { title: 'Consult Your Doctor', desc: 'Connect on a 1-on-1 video or audio call and get your plan on WhatsApp.' },
];

const comparison = [
  { feature: 'Doctor Consults', free: '1 test only', pro: '2 Calls/mo' },
  { feature: 'Custom Diet Plan', free: '✕', pro: 'Weekly Diet' },
  { feature: 'Lab Report Review', free: '✕', pro: 'Same-day MD' },
  { feature: 'Rx & Delivery', free: 'Standard', pro: '15% Meds OFF' },
  { feature: 'Health Coach', free: '✕', pro: 'WhatsApp Mgr' },
  { feature: 'Family Add-on', free: '✕', pro: '₹199/member' },
];

// ⚠️ Ye sample reviews hain. Launch se pehle apne real users ke reviews se replace karo.
const reviews = [
  { text: 'My PCOS symptoms are finally under control. Dr. Sonal guided my diet and cycle tracking so patiently. Best ₹499 ever spent.', name: 'Pooja Iyer, Bengaluru', tag: 'Verified Patient' },
  { text: 'Brought my HbA1c from 7.8 down to 6.4 in 4 months with Dr. Rajesh’s preventive plan. No hospital queues, super convenient.', name: 'Vikram Mehta, Pune', tag: 'Verified Patient' },
  { text: 'We got the plan for our parents. The monthly check-in call gives our entire family huge peace of mind.', name: 'Sunita & Ramesh Sharma, Delhi', tag: 'Verified Family Plan' },
];

const faqs = [
  { q: 'Can I cancel anytime without hidden fees?', a: 'Yes. You can cancel with one tap from your profile. There is no lock-in and no cancellation fee.' },
  { q: 'What if I miss my monthly doctor consultation?', a: 'You can reschedule your consultation within the same month from the Doctors tab. Add your own rule here for unused consults.' },
  { q: 'What is your refund policy?', a: 'Write your refund policy here (for example: full refund within 7 days of the first paid month if no consultation is used).' },
  { q: 'Is my payment and health data safe?', a: 'Payments are processed securely by Razorpay. Your health data is encrypted and is never shared without your consent.' },
];

const trust: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'lock-closed-outline', title: 'Secure payment via Razorpay', desc: 'UPI, RuPay, Visa, Mastercard, NetBanking' },
  { icon: 'shield-checkmark-outline', title: '100% Private Health Data', desc: 'Your records stay encrypted and only visible to you and your doctor.' },
  { icon: 'refresh-outline', title: 'Cancel anytime in 1 tap', desc: 'Zero lock-in contract.' },
];

export default function PremiumPlanScreen() {
  const [activeGender, setActiveGender] = useState<'women' | 'men'>('women');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const onBuy = () => {
    // TODO: yahan Razorpay checkout / subscription flow connect karo
  };

  return (
    <View style={styles.mainContainer}>
      {/* 🔝 TOP APP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <View>
            <Text style={styles.topBrand}>NirogSetu</Text>
            <Text style={styles.topSub}>Preventive Care</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <View style={styles.nmcBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.accent} />
            <Text style={styles.nmcBadgeText}>NMC Certified</Text>
          </View>
          <View>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            <View style={styles.bellDot} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 🌌 DARK HERO */}
        <View style={styles.darkHeader}>
          <View style={styles.heroTopRow}>
            <View style={styles.circleBtn}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </View>
            <Text style={styles.brandPro}>
              nirogsetu <Text style={styles.proTag}> PRO </Text>
            </Text>
            <View style={styles.circleBtn}>
              <Ionicons name="settings-outline" size={16} color="#fff" />
            </View>
          </View>

          <Text style={styles.mainHeadline}>Know your body</Text>
          <View style={styles.thenRow}>
            <Text style={styles.mainHeadline}>Then </Text>
            <Text style={styles.highlightText}>change</Text>
            <Text style={styles.mainHeadline}> it</Text>
          </View>
          <Text style={styles.tagline}>Preventive Risk Mapping tailored to your biology</Text>

          {/* Radar graphic */}
          <View style={[styles.radar, { width: RADAR, height: RADAR }]}>
            {[RADAR, RADAR * 0.72, RADAR * 0.44].map((s, i) => (
              <View
                key={i}
                style={[
                  styles.ring,
                  { width: s, height: s, borderRadius: s / 2, left: (RADAR - s) / 2, top: (RADAR - s) / 2, opacity: 0.35 + i * 0.2 },
                ]}
              />
            ))}
            <View style={styles.radarCenter}>
              <Ionicons name="heart" size={22} color="#fff" />
            </View>

            <View style={[styles.radarLabel, { top: 8, left: 0 }]}>
              <Text style={styles.radarTitle}>CardioAge Risk</Text>
              <Text style={styles.radarSub}>ApoB & BP markers</Text>
            </View>
            <View style={[styles.radarLabel, { top: 8, right: 0, alignItems: 'flex-end' }]}>
              <Text style={styles.radarTitle}>Hormonal Vitality</Text>
              <Text style={styles.radarSub}>PCOS & Thyroid profile</Text>
            </View>
            <View style={[styles.radarLabel, { bottom: 8, left: 0 }]}>
              <Text style={styles.radarTitle}>Metabolic Index</Text>
              <Text style={styles.radarSub}>HbA1c & HOMA-IR</Text>
            </View>
            <View style={[styles.radarLabel, { bottom: 8, right: 0, alignItems: 'flex-end' }]}>
              <Text style={styles.radarTitle}>Vascular & Liver</Text>
              <Text style={styles.radarSub}>Early stage screening</Text>
            </View>
          </View>

          <View style={styles.mappedPill}>
            <Ionicons name="analytics-outline" size={14} color={COLORS.primary} />
            <Text style={styles.mappedText}>Biological Age & Risk Profile Mapped</Text>
          </View>
          <Text style={styles.heroDesc}>
            Preventive screening helps spot risk patterns early, before chronic disease sets in. Specialised protocols for
            women’s hormonal balance and men’s heart and metabolic health.
          </Text>

          {/* Pricing */}
          <View style={styles.pricingBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceBig}>₹499</Text>
              <Text style={styles.priceSmall}>
                {' '}/month <Text style={styles.strike}>₹999</Text>
              </Text>
              <Text style={styles.freeMonthTag}>1ST MONTH FREE</Text>
            </View>
            <View style={styles.ctaRow}>
              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${CARE_PHONE}`)}>
                <Ionicons name="call-outline" size={16} color="#fff" />
                <Text style={styles.btnText}> Call Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.waBtn}
                onPress={() => Linking.openURL(`https://wa.me/${CARE_WHATSAPP}`)}>
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                <Text style={styles.btnText}> WhatsApp Care</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.guaranteeText}>100% Risk Free • Cancel anytime with 1 tap • Zero lock-in</Text>
          </View>
        </View>

        {/* 🧩 WHAT YOUR PLAN INCLUDES */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>COMPLETE COVERAGE</Text>
          <Text style={styles.sectionTitle}>What Your Plan Includes</Text>
          <View style={styles.featuresGrid}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <Ionicons name={f.icon} size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.featureItemTitle}>{f.title}</Text>
                <Text style={styles.featureItemDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 👨‍⚕️ DOCTORS */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>NMC & ABDM VERIFIED</Text>
          <Text style={styles.sectionTitle}>Top 1% Verified Indian Specialists</Text>
          <Text style={styles.sectionNote}>Consult with leading healthcare experts at your fingertips</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {doctors.map((doc, i) => (
              <View key={i} style={styles.doctorCard}>
                <Image source={{ uri: doc.img }} style={styles.docImage} />
                <View style={styles.docTick}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docSpec}>
                  {doc.spec} • {doc.exp}
                </Text>
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingText}>★ {doc.rating} Rating</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 🎯 TAILORED PROGRAMS */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>TAILORED PROGRAMS</Text>
          <Text style={styles.sectionTitle}>Preventive Care for Everyone</Text>

          <View style={styles.segment}>
            {(['women', 'men'] as const).map((g) => {
              const active = activeGender === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setActiveGender(g)}>
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {g === 'women' ? '♀ For Women' : '♂ For Men'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.chipGrid}>
            {programs[activeGender].map((p, i) => (
              <View key={i} style={styles.chip}>
                <Ionicons name={p.icon} size={16} color={COLORS.primary} />
                <Text style={styles.chipText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 🔢 HOW IT WORKS */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>SIMPLE PROCESS</Text>
          <Text style={styles.sectionTitle}>How NirogSetu Works</Text>
          <View style={{ marginTop: 15 }}>
            {steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ⚖️ COMPARISON */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>UNBEATABLE VALUE</Text>
          <Text style={styles.sectionTitle}>Free Basic vs. Premium Shield</Text>
          <View style={styles.tableContainer}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 1.6, textAlign: 'left', fontWeight: 'bold', color: COLORS.body }]}>Feature</Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold', color: COLORS.muted }]}>Free</Text>
              <View style={{ flex: 1.2, alignItems: 'center' }}>
                <Text style={styles.proCellHeader}>★ Premium</Text>
              </View>
            </View>
            {comparison.map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.6, textAlign: 'left', color: COLORS.body, fontWeight: '500' }]}>{row.feature}</Text>
                <Text style={[styles.tableCell, { color: COLORS.muted }]}>{row.free}</Text>
                <Text style={[styles.tableCell, styles.proCellText, { flex: 1.2 }]}>{row.pro} ✓</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 💬 PATIENT STORIES */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>PATIENT STORIES</Text>
          <Text style={styles.sectionTitle}>Real Health Transformations</Text>
          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={{ color: COLORS.star }}>★★★★★</Text>
                <Text style={styles.verified}>✓ {r.tag}</Text>
              </View>
              <Text style={styles.reviewText}>“{r.text}”</Text>
              <Text style={styles.reviewerName}>{r.name}</Text>
            </View>
          ))}
        </View>

        {/* ❓ FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>GOT QUESTIONS?</Text>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={{ marginTop: 15 }}>
            {faqs.map((faq, i) => {
              const open = expandedFaq === i;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  style={styles.faqBox}
                  onPress={() => setExpandedFaq(open ? null : i)}>
                  <View style={styles.faqHead}>
                    <Text style={styles.faqText}>{faq.q}</Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.accent} />
                  </View>
                  {open && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 🛡️ TRUST STRIP */}
        <View style={styles.section}>
          <View style={styles.trustBox}>
            {trust.map((t, i) => (
              <View key={i} style={[styles.trustRow, i > 0 && styles.trustDivider]}>
                <View style={styles.trustIcon}>
                  <Ionicons name={t.icon} size={18} color={COLORS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trustTitle}>{t.title}</Text>
                  <Text style={styles.trustDesc}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              <Text style={{ fontWeight: 'bold' }}>Notice: </Text>
              NirogSetu is designed for preventive and chronic health management. Not for acute medical emergencies. In an
              emergency, please dial 112 or visit the nearest hospital.
            </Text>
          </View>
          <Text style={styles.footerText}>NirogSetu Digital Health Care Private Limited • All rights reserved</Text>
        </View>

        <View style={{ height: SHOW_TAB_BAR ? 150 : 100 }} />
      </ScrollView>

      {/* 🚀 STICKY BOTTOM CTA */}
      <View style={[styles.stickyBottom, SHOW_TAB_BAR && { bottom: 62 }]}>
        <View>
          <Text style={styles.stickyPrice}>
            ₹499 <Text style={styles.stickyPer}>/month</Text>
          </Text>
          <Text style={styles.stickyFree}>1st Month 100% Free</Text>
        </View>
        <TouchableOpacity style={styles.stickyBtn} onPress={onBuy}>
          <Text style={styles.stickyBtnText}>Start Free →</Text>
        </TouchableOpacity>
      </View>

      {/* 🧭 OPTIONAL TAB BAR */}
      {SHOW_TAB_BAR && (
        <View style={styles.tabBar}>
          {([
            ['home', 'Home'],
            ['people-outline', 'Doctors'],
            ['flask-outline', 'Labs'],
            ['folder-open-outline', 'Records'],
            ['person-outline', 'Profile'],
          ] as [IconName, string][]).map(([icon, label], i) => (
            <View key={label} style={styles.tabItem}>
              <Ionicons name={icon} size={20} color={i === 0 ? COLORS.accent : COLORS.muted} />
              <Text style={[styles.tabLabel, i === 0 && { color: COLORS.accent }]}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 20 },

  // Top bar
  topBar: {
    paddingTop: 48,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoLetter: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  topBrand: { fontWeight: 'bold', fontSize: 15, color: COLORS.text },
  topSub: { fontSize: 11, color: COLORS.muted },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  nmcBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 14 },
  nmcBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  bellDot: { position: 'absolute', top: 0, right: 1, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },

  // Hero
  darkHeader: {
    backgroundColor: COLORS.navy,
    marginHorizontal: 12,
    marginTop: 12,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: 18 },
  circleBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  brandPro: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  proTag: { backgroundColor: COLORS.accent, fontSize: 11, overflow: 'hidden', color: '#fff' },
  mainHeadline: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  thenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  highlightText: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: 'bold',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 22,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  tagline: { color: '#A0AABF', textAlign: 'center', fontSize: 13, marginBottom: 20 },

  // Radar
  radar: { alignSelf: 'center', marginBottom: 16 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: COLORS.accent },
  radarCenter: {
    position: 'absolute',
    top: RADAR / 2 - 26,
    left: RADAR / 2 - 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  radarLabel: { position: 'absolute', width: RADAR * 0.44, backgroundColor: 'rgba(17,27,45,0.85)', padding: 6, borderRadius: 10 },
  radarTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  radarSub: { color: '#94A3B8', fontSize: 9, marginTop: 1 },

  mappedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,0,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  mappedText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
  heroDesc: { color: '#A0AABF', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 16 },

  // Pricing
  pricingBox: { alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  priceBig: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  priceSmall: { color: '#A0AABF', fontSize: 13, marginBottom: 6 },
  strike: { textDecorationLine: 'line-through' },
  freeMonthTag: {
    backgroundColor: COLORS.primarySoft,
    color: COLORS.star,
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 'auto',
    marginBottom: 8,
    overflow: 'hidden',
  },
  ctaRow: { flexDirection: 'row', marginBottom: 12 },
  callBtn: { flex: 1, backgroundColor: COLORS.navyCard, paddingVertical: 14, borderRadius: 10, marginRight: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  waBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, marginLeft: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  guaranteeText: { color: '#64748B', fontSize: 10, textAlign: 'center' },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 30 },
  sectionSubtitle: { color: COLORS.accent, fontSize: 11, fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5 },
  sectionTitle: { color: COLORS.text, fontSize: 21, fontWeight: 'bold' },
  sectionNote: { color: COLORS.muted, fontSize: 12, marginTop: 4 },

  // Features
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 18 },
  featureCard: { width: '48%', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  featureIconBox: { backgroundColor: COLORS.accentSoft, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  featureItemTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.body, marginBottom: 4 },
  featureItemDesc: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },

  // Doctors
  doctorCard: { backgroundColor: '#fff', width: 170, padding: 14, borderRadius: 16, marginRight: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  docImage: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  docTick: { position: 'absolute', top: 66, right: 52, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  docName: { fontWeight: 'bold', color: COLORS.body, fontSize: 14, textAlign: 'center' },
  docTitle: { color: COLORS.accent, fontSize: 11, textAlign: 'center', marginVertical: 3 },
  docSpec: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginBottom: 10 },
  ratingBox: { backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: COLORS.star, fontSize: 11, fontWeight: 'bold' },

  // Programs
  segment: { flexDirection: 'row', backgroundColor: '#E5F0EE', borderRadius: 24, padding: 4, marginTop: 16 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  segmentText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  segmentTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 },
  chip: { width: '48.5%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  chipText: { flex: 1, marginLeft: 8, fontSize: 12, fontWeight: '500', color: COLORS.body },

  // Steps
  stepRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumber: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  stepContent: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  stepTitle: { fontWeight: 'bold', fontSize: 15, color: COLORS.body, marginBottom: 4 },
  stepDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },

  // Comparison
  tableContainer: { backgroundColor: '#fff', borderRadius: 14, marginTop: 15, elevation: 2, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableHeader: { backgroundColor: '#F8FAFC' },
  tableCell: { flex: 1, fontSize: 12, textAlign: 'center' },
  proCellHeader: { backgroundColor: COLORS.primary, color: '#fff', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, overflow: 'hidden', fontWeight: 'bold', fontSize: 12 },
  proCellText: { color: COLORS.accent, fontWeight: 'bold' },

  // Reviews
  reviewCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginTop: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verified: { color: COLORS.accent, fontSize: 11 },
  reviewText: { fontStyle: 'italic', color: '#4B5563', fontSize: 13, lineHeight: 20, marginVertical: 10 },
  reviewerName: { fontWeight: 'bold', color: COLORS.text, fontSize: 12 },

  // FAQ
  faqBox: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  faqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqText: { fontSize: 13, color: COLORS.body, flex: 1, paddingRight: 10, fontWeight: '500' },
  faqAnswer: { marginTop: 10, color: COLORS.muted, fontSize: 12, lineHeight: 18 },

  // Trust
  trustBox: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  trustRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  trustDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  trustIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accentSoft, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trustTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.body },
  trustDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  noticeBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 14 },
  noticeText: { color: '#B91C1C', fontSize: 11, lineHeight: 16 },
  footerText: { textAlign: 'center', color: COLORS.muted, fontSize: 10, marginTop: 14 },

  // Sticky CTA
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
  },
  stickyPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  stickyPer: { fontSize: 12, color: COLORS.muted, fontWeight: 'normal' },
  stickyFree: { fontSize: 12, color: COLORS.accent, fontWeight: 'bold' },
  stickyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 26, paddingVertical: 12, borderRadius: 25 },
  stickyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Optional tab bar
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 62, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, elevation: 12 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
});