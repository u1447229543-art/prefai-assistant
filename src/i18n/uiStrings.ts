/**
 * Extra UI copy for AI screens, preview, and free-tier paywall.
 * Merged into TRANSLATIONS in translations.ts — all 10 locales.
 */

export const UI_I18N = {
  en: {
    previewMissingDocument: 'Document unavailable',
    previewMissingDocumentMsg: 'This document could not be loaded. Go back and try again.',
    previewNoFile:
      'This document has no stored file to preview. Re-upload it to view its contents.',
    journeyMissingParams: 'This journey step could not be loaded. Go back and try again.',
    replyAnyLangHint:
      'Write in any language — Georgian, العربية, 中文, Русский, हिन्दी… we detect it automatically.',
    replySituationPlaceholder: 'Describe your situation…',
    replyDrafting: 'Drafting your official reply…',
    replyOfficialLetter: 'Official letter (French)',
    replyWhatItSays: 'What it says in {language}',
    replyTranslationHint:
      'A full translation so you understand the letter — send the French version above.',
    replyTranslationUnavailable: 'Translation unavailable — please try again.',
    errSessionExpired: 'Session expired. Please log in again to use AI features.',
    errAiUnavailable:
      'AI Reply is not available on the server yet. Please try again after the backend is updated.',
    errInvalidServerKey:
      'The server OpenAI API key is invalid. Update OPENAI_API_KEY on Railway.',
    explainTapAnother: 'Tap to choose another file',
    explainDropHint: 'PDF, image or text · CAF, CPAM, Préfecture…',
    explainOrPaste: '— or paste the text —',
    deadlineTitleSuffix: 'deadline',
    pdfRecipientPlaceholder: 'e.g. CAF de Paris',
    pdfPurposePlaceholder: 'e.g. Contest a decision, request a document, explain a delay…',
    pdfShareTitle: 'PrefAI letter',
    formPlaceholder: 'e.g. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'Free plan allows 3 AI requests per day after your trial. Upgrade for unlimited access.',
    upgradeDocLimitMsg: 'Free plan allows up to 5 documents. Upgrade to add more.',
    upgradeJourneyLimitMsg: 'Free plan allows access to 2 journeys. Upgrade to unlock all journeys.',
    trialDaysLeft: '{days} days left in your free trial',
    aiRequestsRemaining: '{count} AI requests left today',
    documentsRemaining: '{count} documents remaining',
  },
  fr: {
    previewMissingDocument: 'Document indisponible',
    previewMissingDocumentMsg: 'Ce document n’a pas pu être chargé. Revenez en arrière et réessayez.',
    previewNoFile:
      'Ce document n’a pas de fichier stocké à prévisualiser. Réimportez-le pour voir son contenu.',
    journeyMissingParams: 'Cette étape du parcours n’a pas pu être chargée. Revenez en arrière et réessayez.',
    replyAnyLangHint:
      'Écrivez dans n’importe quelle langue — géorgien, العربية, 中文, russe, हिन्दी… nous la détectons automatiquement.',
    replySituationPlaceholder: 'Décrivez votre situation…',
    replyDrafting: 'Rédaction de votre réponse officielle…',
    replyOfficialLetter: 'Lettre officielle (français)',
    replyWhatItSays: 'Ce que cela dit en {language}',
    replyTranslationHint:
      'Une traduction complète pour comprendre la lettre — envoyez la version française ci-dessus.',
    replyTranslationUnavailable: 'Traduction indisponible — veuillez réessayer.',
    errSessionExpired: 'Session expirée. Reconnectez-vous pour utiliser les fonctions IA.',
    errAiUnavailable:
      'La réponse IA n’est pas encore disponible sur le serveur. Réessayez après la mise à jour du backend.',
    errInvalidServerKey:
      'La clé API OpenAI du serveur est invalide. Mettez à jour OPENAI_API_KEY sur Railway.',
    explainTapAnother: 'Appuyez pour choisir un autre fichier',
    explainDropHint: 'PDF, image ou texte · CAF, CPAM, Préfecture…',
    explainOrPaste: '— ou collez le texte —',
    deadlineTitleSuffix: 'échéance',
    pdfRecipientPlaceholder: 'ex. CAF de Paris',
    pdfPurposePlaceholder: 'ex. Contester une décision, demander un document, expliquer un retard…',
    pdfShareTitle: 'Lettre PrefAI',
    formPlaceholder: 'ex. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'Le plan gratuit autorise 3 requêtes IA par jour après l’essai. Passez à un plan supérieur pour un accès illimité.',
    upgradeDocLimitMsg: 'Le plan gratuit autorise jusqu’à 5 documents. Passez à un plan supérieur pour en ajouter.',
    upgradeJourneyLimitMsg:
      'Le plan gratuit donne accès à 2 parcours. Passez à un plan supérieur pour tous les débloquer.',
    trialDaysLeft: '{days} jours restants dans votre essai gratuit',
    aiRequestsRemaining: '{count} requêtes IA restantes aujourd’hui',
    documentsRemaining: '{count} documents restants',
  },
  es: {
    previewMissingDocument: 'Documento no disponible',
    previewMissingDocumentMsg: 'No se pudo cargar este documento. Vuelve atrás e inténtalo de nuevo.',
    previewNoFile:
      'Este documento no tiene un archivo guardado para previsualizar. Vuelve a subirlo para ver su contenido.',
    journeyMissingParams: 'No se pudo cargar este paso del recorrido. Vuelve atrás e inténtalo de nuevo.',
    replyAnyLangHint:
      'Escribe en cualquier idioma — georgiano, العربية, 中文, ruso, हिन्दी… lo detectamos automáticamente.',
    replySituationPlaceholder: 'Describe tu situación…',
    replyDrafting: 'Redactando tu respuesta oficial…',
    replyOfficialLetter: 'Carta oficial (francés)',
    replyWhatItSays: 'Lo que dice en {language}',
    replyTranslationHint:
      'Una traducción completa para que entiendas la carta — envía la versión en francés de arriba.',
    replyTranslationUnavailable: 'Traducción no disponible — inténtalo de nuevo.',
    errSessionExpired: 'Sesión caducada. Inicia sesión de nuevo para usar las funciones de IA.',
    errAiUnavailable:
      'La respuesta IA aún no está disponible en el servidor. Inténtalo de nuevo tras actualizar el backend.',
    errInvalidServerKey:
      'La clave API de OpenAI del servidor no es válida. Actualiza OPENAI_API_KEY en Railway.',
    explainTapAnother: 'Toca para elegir otro archivo',
    explainDropHint: 'PDF, imagen o texto · CAF, CPAM, Préfecture…',
    explainOrPaste: '— o pega el texto —',
    deadlineTitleSuffix: 'plazo',
    pdfRecipientPlaceholder: 'p. ej. CAF de Paris',
    pdfPurposePlaceholder: 'p. ej. Contestar una decisión, solicitar un documento, explicar un retraso…',
    pdfShareTitle: 'Carta PrefAI',
    formPlaceholder: 'p. ej. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'El plan gratuito permite 3 solicitudes de IA al día tras la prueba. Mejora tu plan para acceso ilimitado.',
    upgradeDocLimitMsg: 'El plan gratuito permite hasta 5 documentos. Mejora tu plan para añadir más.',
    upgradeJourneyLimitMsg:
      'El plan gratuito permite acceso a 2 recorridos. Mejora tu plan para desbloquearlos todos.',
    trialDaysLeft: '{days} días restantes de tu prueba gratuita',
    aiRequestsRemaining: '{count} solicitudes de IA restantes hoy',
    documentsRemaining: '{count} documentos restantes',
  },
  ru: {
    previewMissingDocument: 'Документ недоступен',
    previewMissingDocumentMsg: 'Не удалось загрузить этот документ. Вернитесь назад и попробуйте снова.',
    previewNoFile:
      'У этого документа нет сохранённого файла для просмотра. Загрузите его снова, чтобы увидеть содержимое.',
    journeyMissingParams: 'Не удалось загрузить этот шаг маршрута. Вернитесь назад и попробуйте снова.',
    replyAnyLangHint:
      'Пишите на любом языке — грузинский, العربية, 中文, русский, हिन्दी… мы определим его автоматически.',
    replySituationPlaceholder: 'Опишите вашу ситуацию…',
    replyDrafting: 'Составляем официальный ответ…',
    replyOfficialLetter: 'Официальное письмо (французский)',
    replyWhatItSays: 'Что это значит на {language}',
    replyTranslationHint:
      'Полный перевод, чтобы вы поняли письмо — отправляйте французскую версию выше.',
    replyTranslationUnavailable: 'Перевод недоступен — попробуйте снова.',
    errSessionExpired: 'Сессия истекла. Войдите снова, чтобы использовать функции ИИ.',
    errAiUnavailable:
      'ИИ-ответ пока недоступен на сервере. Попробуйте снова после обновления бэкенда.',
    errInvalidServerKey:
      'Ключ OpenAI API на сервере недействителен. Обновите OPENAI_API_KEY на Railway.',
    explainTapAnother: 'Нажмите, чтобы выбрать другой файл',
    explainDropHint: 'PDF, изображение или текст · CAF, CPAM, Préfecture…',
    explainOrPaste: '— или вставьте текст —',
    deadlineTitleSuffix: 'срок',
    pdfRecipientPlaceholder: 'напр. CAF de Paris',
    pdfPurposePlaceholder: 'напр. Оспорить решение, запросить документ, объяснить задержку…',
    pdfShareTitle: 'Письмо PrefAI',
    formPlaceholder: 'напр. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'Бесплатный план: 3 запроса к ИИ в день после пробного периода. Улучшите план для безлимита.',
    upgradeDocLimitMsg: 'Бесплатный план: до 5 документов. Улучшите план, чтобы добавить больше.',
    upgradeJourneyLimitMsg:
      'Бесплатный план: доступ к 2 маршрутам. Улучшите план, чтобы открыть все.',
    trialDaysLeft: 'Осталось {days} дн. бесплатного пробного периода',
    aiRequestsRemaining: 'Осталось {count} запросов к ИИ сегодня',
    documentsRemaining: 'Осталось {count} документов',
  },
  ar: {
    previewMissingDocument: 'المستند غير متاح',
    previewMissingDocumentMsg: 'تعذر تحميل هذا المستند. ارجع وحاول مرة أخرى.',
    previewNoFile:
      'لا يوجد ملف مخزّن لمعاينة هذا المستند. أعد رفعه لعرض محتواه.',
    journeyMissingParams: 'تعذر تحميل خطوة المسار هذه. ارجع وحاول مرة أخرى.',
    replyAnyLangHint:
      'اكتب بأي لغة — الجورجية، العربية، 中文، الروسية، हिन्दी… نكتشفها تلقائيًا.',
    replySituationPlaceholder: 'صف وضعك…',
    replyDrafting: 'جارٍ صياغة ردك الرسمي…',
    replyOfficialLetter: 'رسالة رسمية (فرنسية)',
    replyWhatItSays: 'ما تقوله باللغة {language}',
    replyTranslationHint:
      'ترجمة كاملة لفهم الرسالة — أرسل النسخة الفرنسية أعلاه.',
    replyTranslationUnavailable: 'الترجمة غير متاحة — يرجى المحاولة مرة أخرى.',
    errSessionExpired: 'انتهت الجلسة. سجّل الدخول مجددًا لاستخدام ميزات الذكاء الاصطناعي.',
    errAiUnavailable:
      'رد الذكاء الاصطناعي غير متاح على الخادم بعد. حاول مرة أخرى بعد تحديث الخادم.',
    errInvalidServerKey:
      'مفتاح OpenAI API على الخادم غير صالح. حدّث OPENAI_API_KEY على Railway.',
    explainTapAnother: 'انقر لاختيار ملف آخر',
    explainDropHint: 'PDF أو صورة أو نص · CAF، CPAM، Préfecture…',
    explainOrPaste: '— أو الصق النص —',
    deadlineTitleSuffix: 'موعد نهائي',
    pdfRecipientPlaceholder: 'مثل CAF de Paris',
    pdfPurposePlaceholder: 'مثل الطعن في قرار، طلب مستند، شرح تأخير…',
    pdfShareTitle: 'رسالة PrefAI',
    formPlaceholder: 'مثل Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'الخطة المجانية تسمح بـ 3 طلبات ذكاء اصطناعي يوميًا بعد الفترة التجريبية. ترقَّ للوصول غير المحدود.',
    upgradeDocLimitMsg: 'الخطة المجانية تسمح بما يصل إلى 5 مستندات. ترقَّ لإضافة المزيد.',
    upgradeJourneyLimitMsg:
      'الخطة المجانية تتيح مسارين. ترقَّ لفتح جميع المسارات.',
    trialDaysLeft: 'تبقى {days} أيام من الفترة التجريبية المجانية',
    aiRequestsRemaining: 'يتبقى {count} طلبات ذكاء اصطناعي اليوم',
    documentsRemaining: 'يتبقى {count} مستندات',
  },
  ka: {
    previewMissingDocument: 'დოკუმენტი მიუწვდომელია',
    previewMissingDocumentMsg: 'ამ დოკუმენტის ჩატვირთვა ვერ მოხერხდა. დაბრუნდით და სცადეთ თავიდან.',
    previewNoFile:
      'ამ დოკუმენტს არ აქვს შენახული ფაილი გადასახედად. ხელახლა ატვირთეთ შიგთავსის სანახავად.',
    journeyMissingParams: 'ამ მარშრუტის ნაბიჯის ჩატვირთვა ვერ მოხერხდა. დაბრუნდით და სცადეთ თავიდან.',
    replyAnyLangHint:
      'დაწერეთ ნებისმიერ ენაზე — ქართული, العربية, 中文, Русский, हिन्दी… ავტომატურად ვამოცნობთ.',
    replySituationPlaceholder: 'აღწერეთ თქვენი სიტუაცია…',
    replyDrafting: 'ოფიციალური პასუხის შედგენა…',
    replyOfficialLetter: 'ოფიციალური წერილი (ფრანგული)',
    replyWhatItSays: 'რას ნიშნავს {language}-ზე',
    replyTranslationHint:
      'სრული თარგმანი წერილის გასაგებად — გაგზავნეთ ზემოთ ფრანგული ვერსია.',
    replyTranslationUnavailable: 'თარგმანი მიუწვდომელია — სცადეთ თავიდან.',
    errSessionExpired: 'სესია ამოიწურა. ხელახლა შეხვიდეთ AI ფუნქციებისთვის.',
    errAiUnavailable:
      'AI პასუხი სერვერზე ჯერ მიუწვდომელია. სცადეთ backend-ის განახლების შემდეგ.',
    errInvalidServerKey:
      'სერვერის OpenAI API გასაღები არასწორია. განაახლეთ OPENAI_API_KEY Railway-ზე.',
    explainTapAnother: 'შეეხეთ სხვა ფაილის ასარჩევად',
    explainDropHint: 'PDF, სურათი ან ტექსტი · CAF, CPAM, Préfecture…',
    explainOrPaste: '— ან ჩასვით ტექსტი —',
    deadlineTitleSuffix: 'ვადა',
    pdfRecipientPlaceholder: 'მაგ. CAF de Paris',
    pdfPurposePlaceholder: 'მაგ. გადაწყვეტილების გასაჩივრება, დოკუმენტის მოთხოვნა, დაგვიანების ახსნა…',
    pdfShareTitle: 'PrefAI წერილი',
    formPlaceholder: 'მაგ. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'უფასო გეგმა: 3 AI მოთხოვნა დღეში საცდელი პერიოდის შემდეგ. გააუმჯობესეთ ულიმიტო წვდომისთვის.',
    upgradeDocLimitMsg: 'უფასო გეგმა: მაქსიმუმ 5 დოკუმენტი. გააუმჯობესეთ მეტის დასამატებლად.',
    upgradeJourneyLimitMsg:
      'უფასო გეგმა: 2 მარშრუტი. გააუმჯობესეთ ყველას გასახსნელად.',
    trialDaysLeft: 'უფასო საცდელი პერიოდიდან დარჩა {days} დღე',
    aiRequestsRemaining: 'დღეს დარჩა {count} AI მოთხოვნა',
    documentsRemaining: 'დარჩა {count} დოკუმენტი',
  },
  zh: {
    previewMissingDocument: '文件不可用',
    previewMissingDocumentMsg: '无法加载此文件。请返回重试。',
    previewNoFile: '此文件没有可预览的存储内容。请重新上传以查看。',
    journeyMissingParams: '无法加载此流程步骤。请返回重试。',
    replyAnyLangHint: '可用任何语言书写 — 格鲁吉亚语、العربية、中文、俄语、हिन्दी…我们会自动检测。',
    replySituationPlaceholder: '描述您的情况…',
    replyDrafting: '正在起草正式回复…',
    replyOfficialLetter: '正式信函（法语）',
    replyWhatItSays: '{language} 含义',
    replyTranslationHint: '完整翻译便于理解 — 请发送上方的法文版本。',
    replyTranslationUnavailable: '翻译不可用 — 请重试。',
    errSessionExpired: '会话已过期。请重新登录以使用 AI 功能。',
    errAiUnavailable: '服务器尚不支持 AI 回复。请在后端更新后再试。',
    errInvalidServerKey: '服务器 OpenAI API 密钥无效。请在 Railway 更新 OPENAI_API_KEY。',
    explainTapAnother: '点击选择其他文件',
    explainDropHint: 'PDF、图片或文本 · CAF、CPAM、Préfecture…',
    explainOrPaste: '— 或粘贴文本 —',
    deadlineTitleSuffix: '截止日期',
    pdfRecipientPlaceholder: '例如 CAF de Paris',
    pdfPurposePlaceholder: '例如 质疑决定、申请文件、解释延迟…',
    pdfShareTitle: 'PrefAI 信函',
    formPlaceholder: '例如 Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg: '免费版试用结束后每天限 3 次 AI 请求。升级可无限使用。',
    upgradeDocLimitMsg: '免费版最多 5 份文件。升级以添加更多。',
    upgradeJourneyLimitMsg: '免费版可访问 2 条流程。升级以解锁全部。',
    trialDaysLeft: '免费试用还剩 {days} 天',
    aiRequestsRemaining: '今日还剩 {count} 次 AI 请求',
    documentsRemaining: '还剩 {count} 份文件',
  },
  hi: {
    previewMissingDocument: 'दस्तावेज़ उपलब्ध नहीं',
    previewMissingDocumentMsg: 'यह दस्तावेज़ लोड नहीं हो सका। वापस जाकर फिर कोशिश करें।',
    previewNoFile:
      'इस दस्तावेज़ का प्रीव्यू के लिए कोई संग्रहीत फ़ाइल नहीं है। सामग्री देखने के लिए फिर अपलोड करें।',
    journeyMissingParams: 'यह यात्रा चरण लोड नहीं हो सका। वापस जाकर फिर कोशिश करें।',
    replyAnyLangHint:
      'किसी भी भाषा में लिखें — जॉर्जियाई, العربية, 中文, रूसी, हिन्दी… हम स्वतः पहचानते हैं।',
    replySituationPlaceholder: 'अपनी स्थिति बताएं…',
    replyDrafting: 'आपका आधिकारिक उत्तर तैयार हो रहा है…',
    replyOfficialLetter: 'आधिकारिक पत्र (फ़्रेंच)',
    replyWhatItSays: '{language} में इसका अर्थ',
    replyTranslationHint:
      'पत्र समझने के लिए पूरा अनुवाद — ऊपर वाला फ़्रेंच संस्करण भेजें।',
    replyTranslationUnavailable: 'अनुवाद उपलब्ध नहीं — कृपया फिर कोशिश करें।',
    errSessionExpired: 'सत्र समाप्त। AI सुविधाओं के लिए फिर लॉग इन करें।',
    errAiUnavailable:
      'AI उत्तर अभी सर्वर पर उपलब्ध नहीं। बैकएंड अपडेट के बाद फिर कोशिश करें।',
    errInvalidServerKey:
      'सर्वर का OpenAI API कुंजी अमान्य है। Railway पर OPENAI_API_KEY अपडेट करें।',
    explainTapAnother: 'दूसरी फ़ाइल चुनने के लिए टैप करें',
    explainDropHint: 'PDF, छवि या पाठ · CAF, CPAM, Préfecture…',
    explainOrPaste: '— या पाठ पेस्ट करें —',
    deadlineTitleSuffix: 'समय सीमा',
    pdfRecipientPlaceholder: 'जैसे CAF de Paris',
    pdfPurposePlaceholder: 'जैसे निर्णय का विरोध, दस्तावेज़ मांगना, देरी समझाना…',
    pdfShareTitle: 'PrefAI पत्र',
    formPlaceholder: 'जैसे Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'मुफ़्त योजना: ट्रायल के बाद दिन में 3 AI अनुरोध। असीमित के लिए अपग्रेड करें।',
    upgradeDocLimitMsg: 'मुफ़्त योजना: अधिकतम 5 दस्तावेज़। और जोड़ने के लिए अपग्रेड करें।',
    upgradeJourneyLimitMsg:
      'मुफ़्त योजना: 2 यात्राएँ। सभी खोलने के लिए अपग्रेड करें।',
    trialDaysLeft: 'मुफ़्त ट्रायल में {days} दिन शेष',
    aiRequestsRemaining: 'आज {count} AI अनुरोध शेष',
    documentsRemaining: '{count} दस्तावेज़ शेष',
  },
  bn: {
    previewMissingDocument: 'নথি পাওয়া যায়নি',
    previewMissingDocumentMsg: 'এই নথি লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।',
    previewNoFile:
      'এই নথির প্রিভিউর জন্য সংরক্ষিত ফাইল নেই। বিষয়বস্তু দেখতে আবার আপলোড করুন।',
    journeyMissingParams: 'এই যাত্রার ধাপ লোড করা যায়নি। ফিরে গিয়ে আবার চেষ্টা করুন।',
    replyAnyLangHint:
      'যেকোনো ভাষায় লিখুন — জর্জীয়, العربية, 中文, রুশ, হিন্দি… আমরা স্বয়ংক্রিয়ভাবে শনাক্ত করি।',
    replySituationPlaceholder: 'আপনার পরিস্থিতি বর্ণনা করুন…',
    replyDrafting: 'আপনার অফিসিয়াল উত্তর তৈরি হচ্ছে…',
    replyOfficialLetter: 'অফিসিয়াল চিঠি (ফরাসি)',
    replyWhatItSays: '{language}-এ এর অর্থ',
    replyTranslationHint:
      'চিঠি বোঝার জন্য পূর্ণ অনুবাদ — উপরের ফরাসি সংস্করণ পাঠান।',
    replyTranslationUnavailable: 'অনুবাদ পাওয়া যায়নি — আবার চেষ্টা করুন।',
    errSessionExpired: 'সেশন শেষ। AI বৈশিষ্ট্য ব্যবহার করতে আবার লগ ইন করুন।',
    errAiUnavailable:
      'AI উত্তর এখনো সার্ভারে নেই। ব্যাকএন্ড আপডেটের পর আবার চেষ্টা করুন।',
    errInvalidServerKey:
      'সার্ভারের OpenAI API কী অবৈধ। Railway-এ OPENAI_API_KEY আপডেট করুন।',
    explainTapAnother: 'অন্য ফাইল বেছে নিতে ট্যাপ করুন',
    explainDropHint: 'PDF, ছবি বা লেখা · CAF, CPAM, Préfecture…',
    explainOrPaste: '— অথবা লেখা পেস্ট করুন —',
    deadlineTitleSuffix: 'সময়সীমা',
    pdfRecipientPlaceholder: 'যেমন CAF de Paris',
    pdfPurposePlaceholder: 'যেমন সিদ্ধান্তের বিরুদ্ধে আপিল, নথি চাওয়া, বিলম্ব ব্যাখ্যা…',
    pdfShareTitle: 'PrefAI চিঠি',
    formPlaceholder: 'যেমন Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'ফ্রি প্ল্যান: ট্রায়ালের পর দিনে ৩টি AI অনুরোধ। সীমাহীন অ্যাক্সেসের জন্য আপগ্রেড করুন।',
    upgradeDocLimitMsg: 'ফ্রি প্ল্যান: সর্বোচ্চ ৫টি নথি। আরও যোগ করতে আপগ্রেড করুন।',
    upgradeJourneyLimitMsg:
      'ফ্রি প্ল্যান: ২টি যাত্রা। সব আনলক করতে আপগ্রেড করুন।',
    trialDaysLeft: 'ফ্রি ট্রায়ালে {days} দিন বাকি',
    aiRequestsRemaining: 'আজ {count}টি AI অনুরোধ বাকি',
    documentsRemaining: '{count}টি নথি বাকি',
  },
  pt: {
    previewMissingDocument: 'Documento indisponível',
    previewMissingDocumentMsg: 'Não foi possível carregar este documento. Volte e tente novamente.',
    previewNoFile:
      'Este documento não tem um arquivo armazenado para pré-visualizar. Reenvie-o para ver o conteúdo.',
    journeyMissingParams: 'Não foi possível carregar esta etapa da jornada. Volte e tente novamente.',
    replyAnyLangHint:
      'Escreva em qualquer idioma — georgiano, العربية, 中文, russo, हिन्दी… detectamos automaticamente.',
    replySituationPlaceholder: 'Descreva a sua situação…',
    replyDrafting: 'A redigir a sua resposta oficial…',
    replyOfficialLetter: 'Carta oficial (francês)',
    replyWhatItSays: 'O que diz em {language}',
    replyTranslationHint:
      'Uma tradução completa para compreender a carta — envie a versão em francês acima.',
    replyTranslationUnavailable: 'Tradução indisponível — tente novamente.',
    errSessionExpired: 'Sessão expirada. Inicie sessão novamente para usar as funções de IA.',
    errAiUnavailable:
      'A resposta de IA ainda não está disponível no servidor. Tente após atualizar o backend.',
    errInvalidServerKey:
      'A chave da API OpenAI do servidor é inválida. Atualize OPENAI_API_KEY no Railway.',
    explainTapAnother: 'Toque para escolher outro ficheiro',
    explainDropHint: 'PDF, imagem ou texto · CAF, CPAM, Préfecture…',
    explainOrPaste: '— ou cole o texto —',
    deadlineTitleSuffix: 'prazo',
    pdfRecipientPlaceholder: 'ex. CAF de Paris',
    pdfPurposePlaceholder: 'ex. Contestar uma decisão, pedir um documento, explicar um atraso…',
    pdfShareTitle: 'Carta PrefAI',
    formPlaceholder: 'ex. Demande APL CAF, CERFA 13360…',
    upgradeAiDailyMsg:
      'O plano gratuito permite 3 pedidos de IA por dia após o período de teste. Faça upgrade para acesso ilimitado.',
    upgradeDocLimitMsg: 'O plano gratuito permite até 5 documentos. Faça upgrade para adicionar mais.',
    upgradeJourneyLimitMsg:
      'O plano gratuito permite acesso a 2 jornadas. Faça upgrade para desbloquear todas.',
    trialDaysLeft: '{days} dias restantes no seu período de teste gratuito',
    aiRequestsRemaining: '{count} pedidos de IA restantes hoje',
    documentsRemaining: '{count} documentos restantes',
  },
} as const;

export type UiTranslationKey = keyof typeof UI_I18N.en;
