/**
 * One-shot: inject title_i18n / subtitle_i18n after each journey subtitle line.
 * Run from france-assistant: node scripts/inject-journey-i18n.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'constants', 'journeys.ts');

const I18N = {
  arrived: {
    title_i18n: {
      en: 'Just arrived in France',
      ka: 'ახლახან ჩამოსული საფრანგეთში',
      fr: 'Je viens d’arriver en France',
      es: 'Acabo de llegar a Francia',
      ru: 'Только что прибыл во Францию',
      ar: 'وصلت للتو إلى فرنسا',
      zh: '刚到法国',
      hi: 'अभी फ्रांस पहुँचे हैं',
      bn: 'এইমাত্র ফ্রান্সে এসেছেন',
      pt: 'Acabei de chegar a França',
    },
    subtitle_i18n: {
      en: 'The essential first steps after you land',
      ka: 'ჩამოსვლის შემდეგ აუცილებელი პირველი ნაბიჯები',
      fr: 'Les premières démarches essentielles après l’arrivée',
      es: 'Los primeros pasos esenciales tras llegar',
      ru: 'Важнейшие первые шаги после прибытия',
      ar: 'الخطوات الأولى الأساسية بعد الوصول',
      zh: '落地后的必要第一步',
      hi: 'पहुँचने के बाद आवश्यक पहले कदम',
      bn: 'পৌঁছানোর পর প্রয়োজনীয় প্রথম ধাপ',
      pt: 'Os primeiros passos essenciais após a chegada',
    },
  },
  residence: {
    title_i18n: {
      en: 'Residence permit (titre de séjour)',
      ka: 'ბინადრობის ნებართვა (titre de séjour)',
      fr: 'Titre de séjour',
      es: 'Permiso de residencia (titre de séjour)',
      ru: 'Вид на жительство (titre de séjour)',
      ar: 'تصريح الإقامة (titre de séjour)',
      zh: '居留许可 (titre de séjour)',
      hi: 'निवास परमिट (titre de séjour)',
      bn: 'বসবাসের অনুমতি (titre de séjour)',
      pt: 'Autorização de residência (titre de séjour)',
    },
    subtitle_i18n: {
      en: 'Apply for or renew your titre de séjour',
      ka: 'მოითხოვეთ ან განაახლეთ titre de séjour',
      fr: 'Demander ou renouveler votre titre de séjour',
      es: 'Solicita o renueva tu titre de séjour',
      ru: 'Подайте или продлите titre de séjour',
      ar: 'اطلب أو جدّد titre de séjour',
      zh: '申请或续签 titre de séjour',
      hi: 'titre de séjour के लिए आवेदन या नवीनीकरण',
      bn: 'titre de séjour আবেদন বা নবায়ন করুন',
      pt: 'Peça ou renove o seu titre de séjour',
    },
  },
  student: {
    title_i18n: {
      en: 'International student',
      ka: 'საერთაშორისო სტუდენტი',
      fr: 'Étudiant international',
      es: 'Estudiante internacional',
      ru: 'Иностранный студент',
      ar: 'طالب دولي',
      zh: '国际学生',
      hi: 'अंतरराष्ट्रीय छात्र',
      bn: 'আন্তর্জাতিক শিক্ষার্থী',
      pt: 'Estudante internacional',
    },
    subtitle_i18n: {
      en: 'Study, residence and student life setup',
      ka: 'სწავლა, ბინადრობა და სტუდენტური ცხოვრების მოწყობა',
      fr: 'Études, séjour et installation de la vie étudiante',
      es: 'Estudios, residencia y organización de la vida estudiantil',
      ru: 'Учёба, проживание и обустройство студенческой жизни',
      ar: 'الدراسة والإقامة وتنظيم الحياة الطلابية',
      zh: '学业、居留与学生生活安排',
      hi: 'पढ़ाई, निवास और छात्र जीवन की व्यवस्था',
      bn: 'পড়াশোনা, বসবাস ও ছাত্রজীবনের ব্যবস্থা',
      pt: 'Estudos, residência e organização da vida estudantil',
    },
  },
  caf: {
    title_i18n: {
      en: 'CAF benefits',
      ka: 'CAF შეღავათები',
      fr: 'Prestations CAF',
      es: 'Prestaciones CAF',
      ru: 'Пособия CAF',
      ar: 'إعانات CAF',
      zh: 'CAF 福利',
      hi: 'CAF लाभ',
      bn: 'CAF সুবিধা',
      pt: 'Prestações CAF',
    },
    subtitle_i18n: {
      en: 'Housing aid (APL, ALF, ALS), family and activity benefits',
      ka: 'საცხოვრებლის დახმარება (APL, ALF, ALS), ოჯახური და აქტივობის შეღავათები',
      fr: 'Aide au logement (APL, ALF, ALS), prestations familiales et d’activité',
      es: 'Ayuda a la vivienda (APL, ALF, ALS), prestaciones familiares y de actividad',
      ru: 'Жилищная помощь (APL, ALF, ALS), семейные и трудовые пособия',
      ar: 'مساعدة السكن (APL، ALF، ALS) والمساعدات العائلية والنشاط',
      zh: '住房补助 (APL、ALF、ALS)、家庭与活动津贴',
      hi: 'आवास सहायता (APL, ALF, ALS), पारिवारिक और गतिविधि लाभ',
      bn: 'বাসস্থান সহায়তা (APL, ALF, ALS), পারিবারিক ও কার্যকলাপ সুবিধা',
      pt: 'Apoio à habitação (APL, ALF, ALS), prestações familiares e de atividade',
    },
  },
  health: {
    title_i18n: {
      en: 'Health insurance (Assurance Maladie)',
      ka: 'ჯანმრთელობის დაზღვევა (Assurance Maladie)',
      fr: 'Assurance Maladie',
      es: 'Seguro de salud (Assurance Maladie)',
      ru: 'Медицинская страховка (Assurance Maladie)',
      ar: 'التأمين الصحي (Assurance Maladie)',
      zh: '医疗保险 (Assurance Maladie)',
      hi: 'स्वास्थ्य बीमा (Assurance Maladie)',
      bn: 'স্বাস্থ্য বীমা (Assurance Maladie)',
      pt: 'Seguro de saúde (Assurance Maladie)',
    },
    subtitle_i18n: {
      en: 'Get covered with Assurance Maladie',
      ka: 'დაფარეთ თავი Assurance Maladie-ით',
      fr: 'Soyez couvert par l’Assurance Maladie',
      es: 'Cúbrete con Assurance Maladie',
      ru: 'Получите покрытие Assurance Maladie',
      ar: 'احصل على التغطية عبر Assurance Maladie',
      zh: '通过 Assurance Maladie 获得保障',
      hi: 'Assurance Maladie से कवरेज प्राप्त करें',
      bn: 'Assurance Maladie দিয়ে কভারেজ নিন',
      pt: 'Fique coberto com Assurance Maladie',
    },
  },
  work: {
    title_i18n: {
      en: 'Looking for work',
      ka: 'სამუშაოს ძიება',
      fr: 'Recherche d’emploi',
      es: 'Buscando trabajo',
      ru: 'Поиск работы',
      ar: 'البحث عن عمل',
      zh: '求职',
      hi: 'नौकरी की तलाश',
      bn: 'কাজ খুঁজছেন',
      pt: 'À procura de emprego',
    },
    subtitle_i18n: {
      en: 'Right to work, registration and job search',
      ka: 'მუშაობის უფლება, რეგისტრაცია და სამუშაოს ძიება',
      fr: 'Droit au travail, inscription et recherche d’emploi (France Travail)',
      es: 'Derecho a trabajar, inscripción y búsqueda de empleo (France Travail)',
      ru: 'Право на работу, регистрация и поиск работы (France Travail)',
      ar: 'حق العمل والتسجيل والبحث عن وظيفة (France Travail)',
      zh: '工作权、登记与求职 (France Travail)',
      hi: 'काम का अधिकार, पंजीकरण और नौकरी खोज (France Travail)',
      bn: 'কাজের অধিকার, নিবন্ধন ও চাকরি খোঁজা (France Travail)',
      pt: 'Direito ao trabalho, inscrição e procura de emprego (France Travail)',
    },
  },
  asylum: {
    title_i18n: {
      en: 'Asylum seeker',
      ka: 'თავშესაფრის მაძიებელი',
      fr: 'Demandeur d’asile',
      es: 'Solicitante de asilo',
      ru: 'Проситель убежища',
      ar: 'طالب لجوء',
      zh: '寻求庇护者',
      hi: 'शरणार्थी आवेदक',
      bn: 'আশ্রয়প্রার্থী',
      pt: 'Requerente de asilo',
    },
    subtitle_i18n: {
      en: 'Request international protection in France',
      ka: 'მოითხოვეთ საერთაშორისო დაცვა საფრანგეთში (OFPRA)',
      fr: 'Demander une protection internationale en France (OFPRA)',
      es: 'Solicita protección internacional en Francia (OFPRA)',
      ru: 'Запросите международную защиту во Франции (OFPRA)',
      ar: 'اطلب الحماية الدولية في فرنسا (OFPRA)',
      zh: '在法国申请国际保护 (OFPRA)',
      hi: 'फ्रांस में अंतरराष्ट्रीय संरक्षण का अनुरोध (OFPRA)',
      bn: 'ফ্রান্সে আন্তর্জাতিক সুরক্ষা চান (OFPRA)',
      pt: 'Peça proteção internacional em França (OFPRA)',
    },
  },
  nationality: {
    title_i18n: {
      en: 'French nationality',
      ka: 'ფრანგული მოქალაქეობა',
      fr: 'Nationalité française',
      es: 'Nacionalidad francesa',
      ru: 'Французское гражданство',
      ar: 'الجنسية الفرنسية',
      zh: '法国国籍',
      hi: 'फ्रांसीसी नागरिकता',
      bn: 'ফরাসি জাতীয়তা',
      pt: 'Nacionalidade francesa',
    },
    subtitle_i18n: {
      en: 'Apply for naturalisation',
      ka: 'მოითხოვეთ naturalisation',
      fr: 'Demander la naturalisation',
      es: 'Solicita la naturalización (naturalisation)',
      ru: 'Подайте на naturalisation',
      ar: 'قدّم طلب التجنّس (naturalisation)',
      zh: '申请归化入籍 (naturalisation)',
      hi: 'naturalisation के लिए आवेदन करें',
      bn: 'naturalisation-এর জন্য আবেদন করুন',
      pt: 'Peça a naturalização (naturalisation)',
    },
  },
  other: {
    title_i18n: {
      en: 'Something else',
      ka: 'სხვა რამ',
      fr: 'Autre chose',
      es: 'Otra cosa',
      ru: 'Что-то другое',
      ar: 'شيء آخر',
      zh: '其他',
      hi: 'कुछ और',
      bn: 'অন্য কিছু',
      pt: 'Outra coisa',
    },
    subtitle_i18n: {
      en: 'A general checklist for any procedure',
      ka: 'ზოგადი ჩეკლისტი ნებისმიერი პროცედურისთვის',
      fr: 'Une checklist générale pour toute démarche',
      es: 'Una lista general para cualquier trámite',
      ru: 'Общий чек-лист для любой процедуры',
      ar: 'قائمة عامة لأي إجراء',
      zh: '适用于任何手续的通用清单',
      hi: 'किसी भी प्रक्रिया के लिए सामान्य चेकलिस्ट',
      bn: 'যেকোনো প্রক্রিয়ার জন্য সাধারণ চেকলিস্ট',
      pt: 'Uma checklist geral para qualquer procedimento',
    },
  },
};

function fmtObj(obj, indent) {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + 2);
  const lines = Object.entries(obj).map(([k, v]) => `${pad2}${k}: ${JSON.stringify(v)},`);
  return `{\n${lines.join('\n')}\n${pad}}`;
}

let src = fs.readFileSync(FILE, 'utf8');

for (const [id, block] of Object.entries(I18N)) {
  const re = new RegExp(
    `(id: '${id}',\\s*\\n\\s*title: '[^']*',\\s*\\n\\s*subtitle: '[^']*',)(\\s*\\n)`,
    'm'
  );
  if (!re.test(src)) {
    console.error('No match for', id);
    process.exit(1);
  }
  if (src.includes(`id: '${id}'`) && src.match(new RegExp(`id: '${id}'[\\s\\S]{0,200}title_i18n:`))) {
    console.log('skip already has title_i18n', id);
    continue;
  }
  const injection =
    `$1\n` +
    `    title_i18n: ${fmtObj(block.title_i18n, 4)},\n` +
    `    subtitle_i18n: ${fmtObj(block.subtitle_i18n, 4)},$2`;
  src = src.replace(re, injection);
  console.log('injected', id);
}

fs.writeFileSync(FILE, src);
console.log('done');
