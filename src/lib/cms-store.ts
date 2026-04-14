// Simple client-side CMS store using React state + localStorage
// In production, this would be backed by a database via Lovable Cloud

import { useState, useCallback, useEffect } from "react";

type CMSData = Record<string, any>;

const STORAGE_KEY = "prestige_cms_data";

const defaultCMSData: CMSData = {
  homepage: {
    heroHeading: "Building Future Leaders Through Excellence",
    heroSubtitle: "A premier private school in Accra offering quality education from Crèche to SHS. We nurture young minds to become confident, responsible, and globally competitive citizens.",
    heroCTA1: "Apply for Admission",
    heroCTA2: "Learn More",
    whyChooseTitle: "Why Choose Prestige Academy?",
    whyChooseText: "At Prestige Academy, we believe every child has the potential to achieve greatness. Our holistic approach to education combines rigorous academics with character development, sports, arts, and technology to produce well-rounded graduates ready to lead in the 21st century.",
    whyChoosePoints: [
      "Experienced and dedicated teaching staff",
      "Modern ICT and science laboratories",
      "Small class sizes for personalised attention",
      "Strong BECE and WASSCE track record",
      "Safe and nurturing learning environment",
      "Co-curricular activities and leadership programmes",
    ],
    ctaHeading: "Ready to Give Your Child the Best Education?",
    ctaText: "Admissions are currently open for the 2025/2026 academic year. Secure your child's place today.",
    ctaButton: "Start Application",
  },
  about: {
    history: "Prestige Academy International was established with a singular vision: to create a world-class educational institution that nurtures the intellectual, moral, and physical development of every child. From humble beginnings with just 35 pupils, we have grown into one of the most respected private schools in Accra.",
    historyPara2: "Our school community is built on the values of integrity, discipline, hard work, and respect. We believe that education is the most powerful tool for transforming lives and building prosperous communities.",
    historyPara3: "Today, we serve over 800 students from Crèche to Senior High School, guided by more than 60 dedicated teachers and support staff. Our graduates consistently excel in national examinations and go on to attend top secondary schools and universities.",
    mission: "To provide quality, holistic education that develops confident, responsible, and innovative young people who are prepared to contribute meaningfully to their communities and the world.",
    vision: "To be the leading private school in Ghana, recognised for academic excellence, character development, and the production of future leaders who make a positive impact in society.",
    values: [
      { title: "Integrity", desc: "We uphold honesty and strong moral principles in all we do." },
      { title: "Excellence", desc: "We strive for the highest standards in academics and character." },
      { title: "Community", desc: "We foster a sense of belonging, respect, and teamwork." },
      { title: "Innovation", desc: "We embrace modern teaching methods and technology." },
    ],
  },
  contact: {
    officeHours: "Mon - Fri: 7:30 AM - 4:00 PM",
  },
  footer: {
    copyright: "© 2025 Prestige Academy International. All rights reserved.",
    tagline: "Excellence Through Knowledge",
  },
};

function loadCMSData(): CMSData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultCMSData, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultCMSData;
}

function saveCMSData(data: CMSData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useCMS() {
  const [data, setData] = useState<CMSData>(loadCMSData);

  useEffect(() => {
    saveCMSData(data);
  }, [data]);

  const updateSection = useCallback((section: string, updates: Record<string, any>) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  const getSection = useCallback((section: string) => {
    return data[section] || {};
  }, [data]);

  return { data, updateSection, getSection };
}

export { defaultCMSData };
