// Demo data for the school management system
export const schoolInfo = {
  name: "Prestige Academy International",
  motto: "Excellence Through Knowledge",
  address: "No. 14 Liberation Road, East Legon, Accra",
  phone: "+233 30 278 5432",
  whatsapp: "+233 24 567 8901",
  email: "info@prestigeacademy.edu.gh",
  website: "www.prestigeacademy.edu.gh",
  poBox: "P.O. Box CT 1234, Cantonments, Accra",
  founded: 2005,
  region: "Greater Accra",
  digitalAddress: "GA-456-7890",
};

export const stats = {
  totalStudents: 847,
  totalTeachers: 62,
  totalClasses: 28,
  admissionRate: 94,
  passRate: 99,
  newAdmissions: 43,
  totalRevenue: 2456000,
  outstandingFees: 345000,
  attendanceRate: 96,
};

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  class: string;
  stream?: string;
  admissionDate: string;
  studentId: string;
  guardian: string;
  guardianPhone: string;
  status: "Active" | "Graduated" | "Transferred" | "Archived";
  feeBalance: number;
  photo?: string;
}

export const students: Student[] = [
  { id: "1", firstName: "Kwame", lastName: "Asante", gender: "Male", dateOfBirth: "2012-03-15", class: "JHS 2", stream: "A", admissionDate: "2018-09-01", studentId: "PA-2018-001", guardian: "Mr. Kofi Asante", guardianPhone: "+233 24 123 4567", status: "Active", feeBalance: 0 },
  { id: "2", firstName: "Ama", lastName: "Mensah", gender: "Female", dateOfBirth: "2013-07-22", class: "Primary 6", stream: "B", admissionDate: "2019-09-01", studentId: "PA-2019-015", guardian: "Mrs. Akua Mensah", guardianPhone: "+233 20 987 6543", status: "Active", feeBalance: 450 },
  { id: "3", firstName: "Yaw", lastName: "Boateng", gender: "Male", dateOfBirth: "2011-01-10", class: "JHS 3", admissionDate: "2017-09-01", studentId: "PA-2017-008", guardian: "Mr. Kwesi Boateng", guardianPhone: "+233 27 555 1234", status: "Active", feeBalance: 1200 },
  { id: "4", firstName: "Abena", lastName: "Osei", gender: "Female", dateOfBirth: "2014-11-05", class: "Primary 4", stream: "A", admissionDate: "2020-09-01", studentId: "PA-2020-032", guardian: "Dr. Nana Osei", guardianPhone: "+233 24 777 8888", status: "Active", feeBalance: 0 },
  { id: "5", firstName: "Kofi", lastName: "Adjei", gender: "Male", dateOfBirth: "2015-05-18", class: "Primary 3", admissionDate: "2021-09-01", studentId: "PA-2021-011", guardian: "Mrs. Esi Adjei", guardianPhone: "+233 20 333 4444", status: "Active", feeBalance: 800 },
  { id: "6", firstName: "Efua", lastName: "Darko", gender: "Female", dateOfBirth: "2016-09-30", class: "KG 2", admissionDate: "2022-09-01", studentId: "PA-2022-045", guardian: "Mr. James Darko", guardianPhone: "+233 55 111 2222", status: "Active", feeBalance: 0 },
  { id: "7", firstName: "Nana", lastName: "Agyeman", gender: "Male", dateOfBirth: "2010-02-14", class: "SHS 1", admissionDate: "2016-09-01", studentId: "PA-2016-003", guardian: "Chief Agyeman", guardianPhone: "+233 24 999 0000", status: "Active", feeBalance: 2500 },
  { id: "8", firstName: "Akosua", lastName: "Frimpong", gender: "Female", dateOfBirth: "2013-12-25", class: "Primary 5", stream: "A", admissionDate: "2019-09-01", studentId: "PA-2019-028", guardian: "Mrs. Grace Frimpong", guardianPhone: "+233 20 666 7777", status: "Active", feeBalance: 350 },
];

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  phone: string;
  email: string;
  qualification: string;
}

export const teachers: Teacher[] = [
  { id: "1", name: "Mr. Emmanuel Tetteh", subject: "Mathematics", classes: ["JHS 1", "JHS 2", "JHS 3"], phone: "+233 24 111 2222", email: "e.tetteh@prestigeacademy.edu.gh", qualification: "B.Ed Mathematics" },
  { id: "2", name: "Mrs. Felicia Owusu", subject: "English Language", classes: ["Primary 5", "Primary 6"], phone: "+233 20 333 4444", email: "f.owusu@prestigeacademy.edu.gh", qualification: "M.A. English" },
  { id: "3", name: "Mr. Isaac Appiah", subject: "Integrated Science", classes: ["JHS 1", "JHS 2"], phone: "+233 27 555 6666", email: "i.appiah@prestigeacademy.edu.gh", qualification: "B.Sc. Biology" },
  { id: "4", name: "Mrs. Patience Adomako", subject: "Social Studies", classes: ["JHS 2", "JHS 3"], phone: "+233 55 777 8888", email: "p.adomako@prestigeacademy.edu.gh", qualification: "B.Ed Social Studies" },
  { id: "5", name: "Mr. Daniel Mensah", subject: "ICT", classes: ["Primary 4", "Primary 5", "Primary 6", "JHS 1"], phone: "+233 24 999 0000", email: "d.mensah@prestigeacademy.edu.gh", qualification: "B.Sc. Computer Science" },
];

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  feeType: string;
  amount: number;
  paid: number;
  balance: number;
  status: "Paid" | "Partial" | "Unpaid";
  term: string;
  dueDate: string;
  lastPaymentDate?: string;
  paymentMethod?: string;
  momoRef?: string;
}

export const feeRecords: FeeRecord[] = [
  { id: "1", studentId: "1", studentName: "Kwame Asante", class: "JHS 2", feeType: "Tuition", amount: 2500, paid: 2500, balance: 0, status: "Paid", term: "Term 1, 2024/2025", dueDate: "2024-09-15", lastPaymentDate: "2024-09-10", paymentMethod: "Mobile Money", momoRef: "MOMO-2024-001" },
  { id: "2", studentId: "2", studentName: "Ama Mensah", class: "Primary 6", feeType: "Tuition", amount: 2000, paid: 1550, balance: 450, status: "Partial", term: "Term 1, 2024/2025", dueDate: "2024-09-15", lastPaymentDate: "2024-10-05", paymentMethod: "Bank Transfer" },
  { id: "3", studentId: "3", studentName: "Yaw Boateng", class: "JHS 3", feeType: "Tuition", amount: 2800, paid: 1600, balance: 1200, status: "Partial", term: "Term 1, 2024/2025", dueDate: "2024-09-15" },
  { id: "4", studentId: "7", studentName: "Nana Agyeman", class: "SHS 1", feeType: "Tuition + Boarding", amount: 5000, paid: 2500, balance: 2500, status: "Partial", term: "Term 1, 2024/2025", dueDate: "2024-09-15" },
  { id: "5", studentId: "5", studentName: "Kofi Adjei", class: "Primary 3", feeType: "Tuition + Feeding", amount: 1800, paid: 1000, balance: 800, status: "Partial", term: "Term 1, 2024/2025", dueDate: "2024-09-15", lastPaymentDate: "2024-09-20", paymentMethod: "Cash" },
];

export const announcements = [
  { id: "1", title: "Term 1 Examinations Schedule", date: "2024-11-15", content: "The end of term examinations will begin on Monday, 25th November 2024. All students are expected to be well prepared.", audience: "All" },
  { id: "2", title: "PTA Meeting Notice", date: "2024-11-10", content: "A general PTA meeting will be held on Saturday, 16th November 2024 at the school auditorium at 9:00 AM.", audience: "Parents" },
  { id: "3", title: "Annual Speech and Prize Giving Day", date: "2024-11-08", content: "This year's Speech and Prize Giving Day will be held on Saturday, 7th December 2024. All parents and guardians are cordially invited.", audience: "All" },
  { id: "4", title: "Staff Training Workshop", date: "2024-11-05", content: "All teaching staff are required to attend a professional development workshop on Friday, 22nd November 2024.", audience: "Teachers" },
];

export const events = [
  { id: "1", title: "Inter-School Science Quiz", date: "2024-11-20", time: "10:00 AM", venue: "School Auditorium", description: "Our JHS students will participate in the regional science quiz competition." },
  { id: "2", title: "Sports Day", date: "2024-12-01", time: "8:00 AM", venue: "School Field", description: "Annual inter-house sports competition featuring track events, field events, and team sports." },
  { id: "3", title: "Christmas Carol Concert", date: "2024-12-15", time: "4:00 PM", venue: "School Chapel", description: "Join us for an evening of beautiful Christmas carols performed by our school choir." },
  { id: "4", title: "Vacation Classes Begin", date: "2025-01-06", time: "8:00 AM", venue: "Various Classrooms", description: "Remedial and enrichment classes for interested students during the Christmas break." },
];

export const newsArticles = [
  { id: "1", title: "Prestige Academy Wins Regional Mathematics Competition", date: "2024-11-01", excerpt: "Our JHS 3 students emerged as champions at the 2024 Greater Accra Regional Mathematics Quiz, beating 24 other schools.", image: "" },
  { id: "2", title: "New ICT Laboratory Commissioned", date: "2024-10-15", excerpt: "The school has commissioned a state-of-the-art ICT laboratory equipped with 40 modern computers and high-speed internet.", image: "" },
  { id: "3", title: "Outstanding BECE Results for 2024", date: "2024-09-20", excerpt: "We are proud to announce that 99% of our JHS 3 candidates passed the 2024 BECE with distinction, with 15 students scoring aggregate 6.", image: "" },
];

export const programmes = [
  { id: "1", name: "Early Years (Crèche & Nursery)", description: "A nurturing environment for children aged 1-3 years with play-based learning activities that develop cognitive, social, and motor skills.", ageRange: "1 - 3 years" },
  { id: "2", name: "Kindergarten (KG 1 & KG 2)", description: "Structured early childhood programme following the Ghana Education Service curriculum with emphasis on phonics, numeracy, and creative arts.", ageRange: "4 - 5 years" },
  { id: "3", name: "Primary School (Class 1-6)", description: "Comprehensive primary education covering all core subjects with enrichment in French, ICT, and Physical Education.", ageRange: "6 - 11 years" },
  { id: "4", name: "Junior High School (JHS 1-3)", description: "Rigorous academic programme preparing students for the BECE examination with strong emphasis on Mathematics, English, and Science.", ageRange: "12 - 14 years" },
  { id: "5", name: "Senior High School (SHS 1-3)", description: "Advanced academic tracks including General Science, General Arts, and Business offering WASSCE preparation.", ageRange: "15 - 17 years" },
];

export const testimonials = [
  { id: "1", name: "Mrs. Abigail Mensah", role: "Parent", text: "Prestige Academy has been the best decision for my children's education. The teachers are dedicated and the facilities are excellent. My son's BECE results exceeded our expectations." },
  { id: "2", name: "Mr. Samuel Owusu-Ansah", role: "Parent", text: "The school's approach to holistic education is remarkable. My daughter has excelled not only academically but also in sports and leadership. I highly recommend this school." },
  { id: "3", name: "Nana Ama Boateng", role: "Alumni, Class of 2022", text: "Prestige Academy prepared me well for senior high school. The discipline, values, and strong academic foundation I received have been invaluable in my journey." },
];

export const classStructure = [
  { level: "Early Years", classes: ["Crèche", "Nursery 1", "Nursery 2"] },
  { level: "Kindergarten", classes: ["KG 1", "KG 2"] },
  { level: "Primary", classes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"] },
  { level: "JHS", classes: ["JHS 1", "JHS 2", "JHS 3"] },
  { level: "SHS", classes: ["SHS 1", "SHS 2", "SHS 3"] },
];

export const admissionApplications = [
  { id: "1", childName: "Kweku Appiah", parentName: "Mr. Joseph Appiah", parentPhone: "+233 24 555 1234", classApplied: "Primary 1", dateApplied: "2024-11-10", status: "Pending" as string, previousSchool: "Little Stars Preparatory" },
  { id: "2", childName: "Adwoa Sarpong", parentName: "Mrs. Rita Sarpong", parentPhone: "+233 20 888 9999", classApplied: "KG 1", dateApplied: "2024-11-08", status: "Approved" as string, previousSchool: "N/A" },
  { id: "3", childName: "Yaw Mensah", parentName: "Dr. Frank Mensah", parentPhone: "+233 55 222 3333", classApplied: "JHS 1", dateApplied: "2024-11-05", status: "Under Review" as string, previousSchool: "Bright Future Academy" },
];

export const faqItems = [
  { question: "What is the admission process?", answer: "The admission process involves completing an online application form, submitting required documents, attending an entrance assessment, and meeting with the admissions team. Applications are reviewed on a rolling basis." },
  { question: "What are the school fees?", answer: "School fees vary by level. Early Years fees start from GHS 3,000 per term, Primary from GHS 2,000, JHS from GHS 2,500, and SHS from GHS 4,000. Fees include tuition, books, and basic stationery. Feeding and transport are available at additional cost." },
  { question: "What curriculum does the school follow?", answer: "We follow the Ghana Education Service (GES) approved curriculum enriched with supplementary materials. Our programme includes French, ICT, and extensive co-curricular activities." },
  { question: "What are the school hours?", answer: "School hours are Monday to Friday. Early Years: 8:00 AM to 12:30 PM. Primary and JHS: 7:30 AM to 3:00 PM. SHS: 7:30 AM to 4:00 PM." },
  { question: "Does the school offer boarding facilities?", answer: "Yes, boarding facilities are available for JHS and SHS students. Our boarding house is supervised by experienced house parents and includes meals, laundry, and supervised prep time." },
  { question: "What co-curricular activities are available?", answer: "We offer a wide range of activities including football, basketball, athletics, swimming, debate, drama, music, coding club, STEM club, French club, and scouting." },
];
