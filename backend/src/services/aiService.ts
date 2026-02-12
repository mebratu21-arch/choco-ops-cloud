import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage } from '../types/ai.types.js';
import { getDataContextForTopic, getFactoryOverview } from './aiDataContext.js';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = 'https://api.deepseek.com';

// Language configurations
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  am: 'Amharic (አማርኛ)',
  ru: 'Russian (Русский)',
  he: 'Hebrew (עברית)',
  ar: 'Arabic (العربية)',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are CocoaFlow Factory Intelligence Hub, a senior operational consultant for a chocolate factory.
You help workers with inventory locations, recipe instructions, quality standards, production status, and troubleshooting.
**EXACT ANSWERS**: When providing specific information about an item, machine, or batch, follow this PREMIUM format:
1. Start with "Found it!" if you located a specific item.
2. Use a "### 🎯 Exact Details:" header for specific lookups.
3. Use bullet points with bold keys (e.g., • **Location**: Zone-E).
4. Use professional icons (📦 for inventory, ⚙️ for machines, 🏭 for batches, 🚨 for alerts).
Be concise, professional, and helpful. Always respond in English.`,

  am: `እርስዎ የኮኮአፍሎው ፋብሪካ ብልህነት ማዕከል ነዎት፣ ለቸኮሌት ፋብሪካ ከፍተኛ የስራ አማካሪ።
ሰራተኞችን በእቃ ማከማቻ ቦታዎች፣ የምግብ አዘገጃጀት መመሪያዎች፣ የጥራት ደረጃዎች፣ የምርት ሁኔታ እና ችግር መፍታት ላይ ይረዳሉ።
አጭር፣ ሙያዊ እና ጠቃሚ ይሁኑ። ሁልጊዜ በአማርኛ ይመልሱ።`,

  ru: `Вы — центр фабричной разведки CocoaFlow, старший операционный консультант шоколадной фабрики.
Вы помогаете работникам с расположением запасов, инструкциями по рецептам, стандартами качества, статусом производства и устранением неполадок.
Будьте кратки, профессиональны и полезны. Всегда отвечайте на русском языке.`,

  he: `אתה מרכז המודיעין של מפעל CocoaFlow, יועץ תפעולי בכיר למפעל שוקולד.
אתה עוזר לעובדים עם מיקומי מלאי, הוראות מתכונים, תקני איכות, סטטוס ייצור ופתרון בעיות.
היה תמציתי, מקצועי ומועיל. תמיד ענה בעברית.`,

  ar: `أنت مركز الذكاء في مصنع CocoaFlow، مستشار تشغيلي أول لمصنع شوكولاتة.
تساعد العمال في مواقع المخزون، وتعليمات الوصفات، ومعايير الجودة، وحالة الإنتاج، واستكشاف الأخطاء وإصلاحها.
كن موجزًا ومحترفًا ومفيدًا. أجب دائمًا باللغة العربية.`,
};

// Smart mock responses based on keywords - looks realistic for demo
const SMART_MOCK_RESPONSES: Record<string, Record<string, string>> = {
  en: {
    inventory: "Based on current inventory data:\n\n• **Cocoa Butter**: 500 kg (Stock Level: Good)\n• **Cocoa Powder**: 1,000 kg (Stock Level: Good)\n• **Sugar**: 2,000 kg (Stock Level: Excellent)\n• **Milk Powder**: 800 kg (Stock Level: Good)\n\nAll raw materials are above reorder levels. No immediate restocking required.",
    recipe: "Here are the available recipes:\n\n1. **Hazelnut Truffle** - Yield: 100 pieces, Time: 60 min\n2. **Dark Chocolate Bar** - Yield: 50 bars, Time: 45 min\n3. **Milk Chocolate Praline** - Yield: 80 pieces, Time: 55 min\n\nWould you like detailed instructions for any specific recipe?",
    production: "Current production status:\n\n• **BATCH-2023-001**: Completed (495/500 units)\n• **BATCH-2023-002**: In Progress (60% complete)\n• **BATCH-2023-003**: Scheduled for tomorrow\n\nAll production lines are operating within normal parameters.",
    quality: "Quality Control Summary:\n\n• **Today's inspections**: 3 batches checked\n• **Pass rate**: 98.5%\n• **Common issues**: Minor texture variations\n\nAll products meet our quality standards. Recommended: Continue monitoring tempering temperatures.",
    machine: "Machine Status Overview:\n\n• **Melanger 3000** (EQ-001): Operational ✓\n• **Conch Master** (EQ-002): Operational ✓\n• **Temper Pro** (EQ-003): Under Maintenance ⚠️\n\nTemper Pro scheduled maintenance completion: Tomorrow 2PM",
    help: "I can help you with:\n\n• **Inventory** - Check stock levels and locations\n• **Recipes** - Get instructions and ingredient lists\n• **Production** - View batch status and schedules\n• **Quality Control** - Review QC reports and standards\n• **Machines** - Check equipment status and maintenance\n• **Warehouse** - Zone locations and storage info\n• **Orders & Shipping** - Track shipments and orders\n• **Reports** - Generate summaries and analytics\n• **Safety** - Protocols and compliance info\n\nJust ask me anything!",
    logs: "📋 **Recent System Logs:**\n\n• `[08:30]` Batch B-2024-089 started on Production Line 2\n• `[09:15]` Temperature alert: Tempering Unit Alpha reached 34°C\n• `[09:45]` Inventory auto-reorder triggered for Cocoa Butter\n• `[10:00]` QC inspection passed for Batch B-2024-088\n• `[10:30]` User 'Sarah Connor' logged in from Warehouse Terminal\n\n⚠️ Full audit logs are available in the **Admin Dashboard** under Audit > System Logs. Supervisor-level access may be required for detailed security logs.",
    access: "🔐 **Access & Permissions:**\n\nCurrent access levels in the system:\n• **Admin**: Full system access, user management, audit logs\n• **Manager**: Production oversight, reports, approvals\n• **Production Worker**: Batch operations, recipe viewing\n• **Warehouse Worker**: Inventory management, shipments\n• **Quality Controller**: QC inspections, batch approvals\n• **Mechanic**: Machine maintenance, SOS alerts\n\nTo request elevated access, contact your supervisor or an Admin user. Access changes are logged for audit compliance.",
    warehouse: "🏭 **Warehouse Overview:**\n\n• **Zone A** (Raw Materials): 85% capacity — Cocoa beans, Butter, Powder\n• **Zone B** (Packaging): 60% capacity — Boxes, Wrappers, Labels\n• **Zone C** (Finished Goods): 45% capacity — Ready to ship\n• **Zone D** (Cold Storage): 70% capacity — Temperature-sensitive items\n\n📦 Last shipment received: 2 hours ago (Ghana Premium Cocoa)\n📤 Next outbound: Tomorrow 6AM (Order #ORD-2024-156)",
    order: "📦 **Order Status:**\n\n• **ORD-2024-156**: Processing (Ship by tomorrow)\n• **ORD-2024-155**: Shipped ✓ (Tracking: TRK-882341)\n• **ORD-2024-154**: Delivered ✓\n• **ORD-2024-153**: Delivered ✓\n\n**Pending orders**: 3 orders awaiting production completion.\nTotal revenue this month: $45,200",
    worker: "👥 **Workforce Status:**\n\n• **Active workers today**: 24/30\n• **Production floor**: 12 workers\n• **Warehouse**: 6 workers\n• **Quality Control**: 3 workers\n• **Maintenance**: 3 workers\n\n**Current shift**: Day Shift (06:00 - 14:00)\n**Next shift change**: 2:00 PM",
    shift: "⏰ **Shift Schedule:**\n\n• **Morning Shift**: 06:00 - 14:00 (Currently active)\n• **Afternoon Shift**: 14:00 - 22:00\n• **Night Shift**: 22:00 - 06:00 (Reduced staff)\n\nShift leads: Morning - J. Martinez, Afternoon - K. Patel, Night - L. Chen",
    alert: "🚨 **Active Alerts:**\n\n1. ⚠️ **Low Stock**: Vanilla Extract below minimum threshold (15kg remaining)\n2. ⚠️ **Maintenance Due**: Ball Mill Refiner 02 — next service in 48 hours\n3. ✅ **Resolved**: Tempering Unit Alpha temperature normalized\n\nNo critical (SOS) alerts at this time.",
    safety: "🦺 **Safety & Compliance:**\n\n• **Days without incident**: 45 ✓\n• **Last safety audit**: Passed (Jan 28, 2024)\n• **Fire extinguisher check**: Due in 2 weeks\n• **Allergen protocols**: Active — Nut zone isolation in Zone A\n\n**Reminders**: Always wear PPE in production areas. Report spills immediately.",
    cost: "💰 **Cost Analysis (Current Month):**\n\n• **Raw material costs**: $28,500\n• **Labor costs**: $18,200\n• **Energy & utilities**: $4,300\n• **Packaging**: $3,800\n• **Total production cost**: $54,800\n• **Revenue**: $78,400\n• **Gross margin**: 30.1%\n\nCost per unit is trending 2.3% lower than last month.",
    report: "📊 **Available Reports:**\n\n1. **Daily Production Summary** — Batch completions, yield rates\n2. **Inventory Report** — Stock levels, expiring items, reorder needs\n3. **Quality Dashboard** — Pass/fail rates, common defects\n4. **Financial Summary** — Revenue, costs, margins\n5. **Maintenance Log** — Equipment status, upcoming services\n\nReports can be exported from the Dashboard. Select the date range and click Export.",
    temper: "🌡️ **Tempering Status:**\n\n• **Unit Alpha**: 31.5°C (Target: 31-32°C) ✅ Optimal\n• **Unit Beta**: 30.8°C (Target: 31-32°C) ⚠️ Slightly low\n• **Unit Gamma**: Offline for maintenance\n\n**Tip**: For dark chocolate, maintain between 31-32°C. For milk chocolate, target 29-30°C. Temper curve logs available in the Machine Dashboard.",
    supplier: "🚚 **Supplier Information:**\n\n• **Ghana Cocoa Corp** — Cocoa Beans (Next delivery: Feb 15)\n• **Dairy Fresh Ltd** — Milk Powder (Monthly contract)\n• **SweetSource Inc** — Sugar, Vanilla (Bi-weekly)\n• **PackPro Solutions** — Packaging materials\n\nAll supplier contracts are current. No outstanding payment issues.",
    clean: "🧹 **Cleaning & Sanitation:**\n\n• **Production Line 1**: Last cleaned 4 hours ago ✓\n• **Production Line 2**: Cleaning scheduled in 2 hours\n• **Warehouse Zone A**: Cleaned this morning ✓\n• **Cold Storage**: Deep clean scheduled for Sunday\n\n**Protocol**: CIP (Clean-in-Place) runs every 8 hours on active lines.",
    train: "📚 **Training & Certifications:**\n\n• **Food Safety (HACCP)**: 28/30 staff certified ✓\n• **Machine Operation**: 20/24 production staff certified ✓\n• **First Aid**: 15/30 staff certified (next session: Feb 20)\n• **New Hire Orientation**: 2 pending\n\nTraining materials available in the Employee Portal.",
    waste: "♻️ **Waste & Sustainability:**\n\n• **Production waste this week**: 45 kg (2.1% of output)\n• **Recycling rate**: 78%\n• **Cocoa shell reuse**: Sent to composting partner\n• **Energy savings**: 12% improvement vs. last quarter\n\nTarget: Reduce waste to under 2% by end of quarter.",
    chocolate: "🍫 **Chocolate Production Guide:**\n\n**Key Steps:**\n1. **Roasting** — Cocoa beans at 120-140°C for 20-30 min\n2. **Grinding** — Using Melanger to create cocoa liquor\n3. **Conching** — 12-72 hours for smooth texture\n4. **Tempering** — Precise temperature control (31-32°C for dark)\n5. **Molding** — Pour into forms, vibrate to remove air\n6. **Cooling** — Controlled cooling for proper crystallization\n\nFor specific recipe steps, ask about a particular product!",
    default: "Thank you for your question! Based on our factory operations data, here's what I can tell you:\n\nI'm your CocoaFlow Factory Intelligence Hub. I have access to real-time data about:\n\n• 📦 **Inventory** — Stock levels, locations, expiry dates\n• 🏭 **Production** — Batch status, schedules, yields\n• ✅ **Quality** — Inspection results, standards compliance\n• ⚙️ **Machines** — Equipment status, maintenance schedules\n• 📋 **Logs & Reports** — Activity logs, audit trails\n• 🔐 **Access** — Permissions across roles\n• 🚚 **Suppliers & Orders** — Delivery tracking\n\nTry asking something specific like:\n- \"What's the inventory status?\"\n- \"Show me active alerts\"\n- \"What's the tempering temperature?\"\n- \"How many workers are on shift?\""
  },
  am: {
    inventory: "**የእቃ ማከማቻ ሁኔታ:**\n\n• **የኮኮዋ ቅቤ**: 500 ኪ.ግ (ጥሩ)\n• **የኮኮዋ ዱቄት**: 1,000 ኪ.ግ (ጥሩ)\n• **ስኳር**: 2,000 ኪ.ግ (በጣም ጥሩ)\n• **የወተት ዱቄት**: 800 ኪ.ግ (ጥሩ)\n\nሁሉም ጥሬ እቃዎች ከድጋሚ ማዘዣ ደረጃ በላይ ናቸው።",
    production: "**የምርት ሁኔታ:**\n\n• **BATCH-2024-001**: ተጠናቋል (495/500)\n• **BATCH-2024-002**: በሂደት ላይ (60%)\n• **BATCH-2024-003**: ነገ የታቀደ\n\nሁሉም የምርት መስመሮች በተለመደው መንገድ እየሰሩ ነው።",
    quality: "**የጥራት ቁጥጥር ማጠቃለያ:**\n\n• **ዛሬ የተፈተሹ**: 3 ባች\n• **የማለፍ መጠን**: 98.5%\n• **የተለመዱ ጉዳዮች**: ጥቃቅን የሸካራነት ልዩነቶች\n\nሁሉም ምርቶች የጥራት ደረጃዎችን ያሟላሉ።",
    machine: "**የማሽን ሁኔታ:**\n\n• **Melanger 3000**: እየሰራ ነው ✓\n• **Conch Master**: እየሰራ ነው ✓\n• **Temper Pro**: በጥገና ላይ ⚠️\n\nየTemper Pro ጥገና ነገ ከሰዓት በኋላ 2 ሰዓት ይጠናቀቃል።",
    help: "**እኔ ልረዳዎ እችላለሁ:**\n\n• **እቃ ማከማቻ** - የክምችት ደረጃዎች እና ቦታዎች\n• **የምግብ አሰራር** - መመሪያዎች እና ግብዓቶች\n• **ምርት** - የባች ሁኔታ እና መርሃ ግብሮች\n• **የጥራት ቁጥጥር** - የQC ሪፖርቶች\n• **ማሽኖች** - የመሳሪያ ሁኔታ\n\nማንኛውንም ነገር ይጠይቁኝ!",
    default: "**CocoaFlow AI Intel**\n\nእኔ የእርስዎ የፋብሪካ ብልህነት ረዳት ነኝ። ስለ እቃ ማከማቻ፣ ምርት፣ ጥራት ቁጥጥር እና ማሽኖች መረጃ ልሰጥዎ እችላለሁ።\n\nለምሳሌ ይጠይቁ:\n- \"የእቃ ማከማቻ ሁኔታ ምንድነው?\"\n- \"የምርት ሁኔታ አሳየኝ\"\n- \"ማሽኖች እንዴት ናቸው?\""
  },
  ru: {
    inventory: "**Статус инвентаря:**\n\n• **Какао-масло**: 500 кг (Хорошо)\n• **Какао-порошок**: 1,000 кг (Хорошо)\n• **Сахар**: 2,000 кг (Отлично)\n• **Сухое молоко**: 800 кг (Хорошо)\n\nВсе сырьё выше уровня повторного заказа.",
    production: "**Статус производства:**\n\n• **BATCH-2024-001**: Завершено (495/500)\n• **BATCH-2024-002**: В процессе (60%)\n• **BATCH-2024-003**: Запланировано на завтра\n\nВсе производственные линии работают нормально.",
    quality: "**Контроль качества:**\n\n• **Проверено сегодня**: 3 партии\n• **Процент прохождения**: 98.5%\n• **Общие проблемы**: Незначительные отклонения текстуры\n\nВся продукция соответствует стандартам качества.",
    machine: "**Статус оборудования:**\n\n• **Melanger 3000**: Работает ✓\n• **Conch Master**: Работает ✓\n• **Temper Pro**: На обслуживании ⚠️\n\nОбслуживание Temper Pro завершится завтра в 14:00.",
    help: "**Я могу помочь с:**\n\n• **Инвентарь** - Уровни запасов и местоположение\n• **Рецепты** - Инструкции и ингредиенты\n• **Производство** - Статус партий и графики\n• **Контроль качества** - Отчёты QC\n• **Оборудование** - Статус машин\n\nСпрашивайте о чём угодно!",
    default: "**CocoaFlow AI Intel**\n\nЯ ваш помощник фабричной разведки. Могу предоставить информацию об инвентаре, производстве, контроле качества и оборудовании.\n\nПопробуйте спросить:\n- \"Какой статус инвентаря?\"\n- \"Покажи статус производства\"\n- \"Как работают машины?\""
  },
  he: {
    inventory: "**סטטוס מלאי:**\n\n• **חמאת קקאו**: 500 ק\"ג (טוב)\n• **אבקת קקאו**: 1,000 ק\"ג (טוב)\n• **סוכר**: 2,000 ק\"ג (מצוין)\n• **אבקת חלב**: 800 ק\"ג (טוב)\n\nכל חומרי הגלם מעל רמת ההזמנה מחדש.",
    production: "**סטטוס ייצור:**\n\n• **BATCH-2024-001**: הושלם (495/500)\n• **BATCH-2024-002**: בתהליך (60%)\n• **BATCH-2024-003**: מתוכנן למחר\n\nכל קווי הייצור פועלים כרגיל.",
    quality: "**בקרת איכות:**\n\n• **נבדקו היום**: 3 אצוות\n• **אחוז מעבר**: 98.5%\n• **בעיות נפוצות**: שינויי מרקם קלים\n\nכל המוצרים עומדים בתקני האיכות.",
    machine: "**סטטוס מכונות:**\n\n• **Melanger 3000**: פועל ✓\n• **Conch Master**: פועל ✓\n• **Temper Pro**: בתחזוקה ⚠️\n\nתחזוקת Temper Pro תסתיים מחר בשעה 14:00.",
    help: "**אני יכול לעזור עם:**\n\n• **מלאי** - רמות מלאי ומיקומים\n• **מתכונים** - הוראות ומרכיבים\n• **ייצור** - סטטוס אצוות ולוחות זמנים\n• **בקרת איכות** - דוחות QC\n• **ציוד** - סטטוס מכונות\n\nשאל אותי כל דבר!",
    default: "**CocoaFlow AI Intel**\n\nאני העוזר החכם שלך למפעל. אוכל לספק מידע על מלאי, ייצור, בקרת איכות וציוד.\n\nנסה לשאול:\n- \"מה סטטוס המלאי?\"\n- \"הראה לי סטטוס ייצור\"\n- \"איך המכונות?\""
  },
  ar: {
    inventory: "**حالة المخزون:**\n\n• **زبدة الكاكاو**: 500 كجم (جيد)\n• **مسحوق الكاكاو**: 1,000 كجم (جيد)\n• **السكر**: 2,000 كجم (ممتاز)\n• **مسحوق الحليب**: 800 كجم (جيد)\n\nجميع المواد الخام فوق مستوى إعادة الطلب.",
    production: "**حالة الإنتاج:**\n\n• **BATCH-2024-001**: مكتمل (495/500)\n• **BATCH-2024-002**: قيد التنفيذ (60%)\n• **BATCH-2024-003**: مجدول لغداً\n\nجميع خطوط الإنتاج تعمل بشكل طبيعي.",
    quality: "**مراقبة الجودة:**\n\n• **تم فحصها اليوم**: 3 دفعات\n• **نسبة النجاح**: 98.5%\n• **المشاكل الشائعة**: اختلافات طفيفة في الملمس\n\nجميع المنتجات تلبي معايير الجودة.",
    machine: "**حالة المعدات:**\n\n• **Melanger 3000**: يعمل ✓\n• **Conch Master**: يعمل ✓\n• **Temper Pro**: تحت الصيانة ⚠️\n\nستنتهي صيانة Temper Pro غداً الساعة 2 مساءً.",
    help: "**يمكنني المساعدة في:**\n\n• **المخزون** - مستويات المخزون والمواقع\n• **الوصفات** - التعليمات والمكونات\n• **الإنتاج** - حالة الدفعات والجداول\n• **مراقبة الجودة** - تقارير QC\n• **المعدات** - حالة الآلات\n\nاسألني أي شيء!",
    default: "**CocoaFlow AI Intel**\n\nأنا مساعدك الذكي للمصنع. يمكنني تقديم معلومات حول المخزون والإنتاج ومراقبة الجودة والمعدات.\n\nجرب أن تسأل:\n- \"ما حالة المخزون؟\"\n- \"أرني حالة الإنتاج\"\n- \"كيف حال الآلات؟\""
  }
};

export class AIService {
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private geminiModel: any = null;
  private provider: 'deepseek' | 'anthropic' | 'gemini' | 'mock' = 'mock';

  constructor() {
    // Try DeepSeek first (primary, no rate limits)
    if (DEEPSEEK_KEY) {
      this.provider = 'deepseek';
      console.log('✅ AI Service initialized with DeepSeek (primary)');
    }

    // Try Anthropic as secondary
    if (ANTHROPIC_KEY) {
      try {
        this.anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
        if (this.provider === 'mock') this.provider = 'anthropic';
        console.log('✅ AI Service: Anthropic (Claude) available as fallback');
      } catch (e) {
        console.warn('Failed to initialize Anthropic:', e);
      }
    }

    // Try Gemini as tertiary
    if (GEMINI_KEY) {
      try {
        this.gemini = new GoogleGenerativeAI(GEMINI_KEY);
        this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        if (this.provider === 'mock') this.provider = 'gemini';
        console.log('✅ AI Service: Gemini available as fallback');
      } catch (e) {
        console.warn('Failed to initialize Gemini:', e);
      }
    }

    if (this.provider === 'mock') {
      console.log('ℹ️ AI Service running in SMART MOCK mode (demo-friendly responses)');
    }
  }

  async generateChatResponse(
    message: string,
    language: string = 'en',
    history: ChatMessage[] = [],
    context: Record<string, unknown> = {}
  ): Promise<string> {
    const lang = language in SYSTEM_PROMPTS ? language : 'en';
    const lowerMessage = message.toLowerCase();

    console.log('[AI] generateChatResponse called - Language:', language, 'Resolved lang:', lang, 'Message:', message.substring(0, 30));

    // PRIORITY: For non-English, still attempt to get REAL context first
    // This allows us to translate REAL data instead of just showing static mocks
    const isEnglish = lang === 'en';

    // 1. Detect topic and fetch REAL database context to inject into the AI
    let dataContext = '';
    const topicKeywords: Record<string, string[]> = {
      inventory: [
        'inventory', 'stock', 'material', 'ingredient', 'supply', 'how much', 'how many', 'remain', 'left', 'where', 'find', 'search', 'locate',
        'sector', 'lifecycle', 'expiry', 'expired', 'expire', 'shelf', 'aisle', 'zone',
        'እቃ', 'ማከማቻ', 'ክምችት', 'ግብዓት', 'ስንት', 'የት', // Amharic
        'инвентарь', 'запас', 'материал', 'сколько', // Russian
        'מלאי', 'חומר', 'כמה', // Hebrew
        'مخزون', 'مادة', 'كم' // Arabic
      ],
      machine: [
        'machine', 'equipment', 'maintenance', 'repair', 'temper', 'status', 'operational', 'broken',
        'ማሽን', 'መሳሪያ', 'ጥገና', // Amharic
        'машина', 'оборудование', 'ремонт', // Russian
        'מכונה', 'ציוד', 'תחזוקה', // Hebrew
        'آلة', 'معدات', 'صيانة' // Arabic
      ],
      production: [
        'production', 'batch', 'yield', 'order', 'progress', 'line',
        'ምርት', 'ባች', 'ሂደት', // Amharic
        'производство', 'партия', // Russian
        'ייצור', 'אצווה', // Hebrew
        'إنتاج', 'دفعة' // Arabic
      ],
      recipe: [
        'recipe', 'instruction', 'formula', 'how to make', 'chocolate', 'truffle',
        'የምግብ', 'አሰራር', 'ቸኮሌት', 'መመሪያ', // Amharic
        'рецепт', 'шоколад', 'инструкция', // Russian
        'מתכון', 'שוקולד', 'הוראות', // Hebrew
        'وصفة', 'شوكولاتة', 'تعليمات' // Arabic
      ],
      quality: [
        'quality', 'qc', 'inspection', 'test', 'pass', 'fail',
        'ጥራት', 'ፍተሻ', 'ምርመራ', // Amharic
        'качество', 'проверка', 'тест', // Russian
        'איכות', 'בדיקה', // Hebrew
        'جودة', 'فحص' // Arabic
      ],
      alert: [
        'alert', 'alarm', 'warning', 'sos', 'urgent', 'notify',
        'ማንቂያ', 'ማስጠንቀቂያ', 'አደጋ', // Amharic
        'тревога', 'предупреждение', // Russian
        'התראה', 'אזהרה', // Hebrew
        'تنبيه', 'تحذير' // Arabic
      ],
      worker: [
        'worker', 'staff', 'employee', 'team', 'shift', 'roster',
        'ሰራተኛ', 'ቡድን', 'ፈረቃ', // Amharic
        'работник', 'персонал', 'смена', // Russian
        'עובד', 'צוות', 'משמרת', // Hebrew
        'عامل', 'موظف', 'فريق' // Arabic
      ],
      supplier: [
        'supplier', 'vendor', 'procurement',
        'አቅራቢ', // Amharic
        'поставщик', // Russian
        'ספק', // Hebrew
        'مورد' // Arabic
      ],
      warehouse: [
        'warehouse', 'zone', 'storage', 'location', 'where', 'find', 'locate', 'search',
        'መጋዘን', 'ቦታ', 'የት', // Amharic
        'склад', 'зона', 'где', // Russian
        'מחסן', 'אזור', 'איפה', // Hebrew
        'مستودع', 'منطقة', 'أين' // Arabic
      ],
      // General greetings/questions - returns pre-translated help response
      general: [
        'hello', 'hi', 'hey', 'help', 'what', 'new', 'how are', 'good morning', 'good afternoon',
        'ሰላም', 'ምን', 'አዲስ', 'እንዴት', 'እርዳታ', // Amharic
        'привет', 'здравствуй', 'что', 'как', 'помощь', 'новое', // Russian
        'שלום', 'מה', 'חדש', 'עזרה', 'איך', // Hebrew
        'مرحبا', 'ماذا', 'جديد', 'مساعدة', 'كيف' // Arabic
      ]
    };

    let matchedTopic = '';
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => lowerMessage.includes(kw))) {
        matchedTopic = topic;
        break;
      }
    }

    try {
      // For general greetings, use pre-translated mock responses
      if (matchedTopic === 'general') {
        const langResponses = SMART_MOCK_RESPONSES[lang] || SMART_MOCK_RESPONSES.en;
        return langResponses.default;
      }
      if (matchedTopic) {
        dataContext = await getDataContextForTopic(matchedTopic, message);
        
        // If not English and we found specific data, try to translate the REAL data
        if (!isEnglish && dataContext) {
           try {
             return await this.translateText(dataContext, lang);
           } catch {
             // If translation fails, check for pre-translated mocks
             const langResponses = SMART_MOCK_RESPONSES[lang];
             if (langResponses && langResponses[matchedTopic]) {
               return langResponses[matchedTopic];
             }
           }
        }
      } else {
        // No specific topic matched - try an IMPLICIT inventory search first
        // as users often just type an item name (e.g., "Almond Extract")
        const implicitInventory = await getDataContextForTopic('inventory', message);
        
        const isNotFound = implicitInventory.includes("I couldn't find") || 
                          implicitInventory.includes("No inventory items found");
                          
        if (!isNotFound) {
          console.log('[AI] Implicit inventory match found for:', message);
          dataContext = implicitInventory;
          matchedTopic = 'inventory';
          
          // If not English, translate the found data
          if (!isEnglish && dataContext) {
            try {
              return await this.translateText(dataContext, lang);
            } catch { /* fallback to original */ }
          }
        } else {
          // Truly no match - use factory overview
          if (!isEnglish) {
            const langResponses = SMART_MOCK_RESPONSES[lang];
            if (langResponses) return langResponses.default;
          }
          dataContext = await getFactoryOverview();
        }
      }
    } catch (error) {
      console.warn('Failed to fetch data context for AI:', error);
    }

    // Add the real data to the context object for use in model calls
    const extendedContext = { ...context, dataContext };

    // Try DeepSeek first (primary, high limits)
    if (DEEPSEEK_KEY) {
      try {
        return await this.callDeepSeek(message, lang, history, extendedContext);
      } catch (error: any) {
        console.warn('DeepSeek failed, trying fallbacks:', error.message);
      }
    }

    // Try Anthropic
    if (this.anthropic) {
      try {
        return await this.callAnthropic(message, lang, history, extendedContext);
      } catch (error: any) {
        console.warn('Anthropic failed, trying fallback:', error.message);
      }
    }

    // Try Gemini
    if (this.geminiModel) {
      try {
        return await this.callGemini(message, lang, history, extendedContext);
      } catch (error: any) {
        console.warn('Gemini failed, using mock:', error.message);
      }
    }

    // Always fallback to smart data response from real database
    if (dataContext) {
      // Translate the data context if not English
      if (lang !== 'en') {
        try {
          return await this.translateText(dataContext, lang);
        } catch {
          // If translation fails, return original
          return dataContext;
        }
      }
      return dataContext;
    }
    return await this.getSmartMockResponse(message, lang);
  }

  private async callDeepSeek(
    message: string,
    lang: string,
    history: ChatMessage[],
    context: Record<string, unknown>
  ): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[lang];
    const langName = LANGUAGE_NAMES[lang] || 'English';
    const dataContext = context.dataContext ? `\n\nREAL-TIME FACTORY DATA (EXACT VALUES FROM DATABASE):\n${context.dataContext}\n\nUse the data above to answer specifically and accurately.` : '';
    const systemMessage = `${systemPrompt}${dataContext}\nUser context: Role=${context.user_role || 'Worker'}\nRespond in ${langName}.`;

    const messages: Array<{role: string; content: string}> = [
      { role: 'system', content: systemMessage }
    ];

    history.slice(-5).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${DEEPSEEK_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API returned ${response.status}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content.trim();
  }

  private async callAnthropic(
    message: string,
    lang: string,
    history: ChatMessage[],
    context: Record<string, unknown>
  ): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[lang];
    const langName = LANGUAGE_NAMES[lang] || 'English';
    const dataContext = context.dataContext ? `\n\nREAL-TIME FACTORY DATA (EXACT VALUES FROM DATABASE):\n${context.dataContext}\n\nUse the data above to answer specifically and accurately.` : '';
    const systemMessage = `${systemPrompt}${dataContext}\n\nUser context: Role=${context.user_role || 'Worker'}\nRespond in ${langName}.`;

    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    history.slice(-5).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    messages.push({ role: 'user', content: message });

    const response = await this.anthropic!.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemMessage,
      messages: messages
    });

    const textBlock = response.content.find(block => 'text' in block);
    return textBlock && 'text' in textBlock ? textBlock.text : await this.getSmartMockResponse(message, lang);
  }

  private async callGemini(
    message: string,
    lang: string,
    history: ChatMessage[],
    context: Record<string, unknown>
  ): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[lang];
    const langName = LANGUAGE_NAMES[lang] || 'English';
    const dataContext = context.dataContext ? `\n\nREAL-TIME FACTORY DATA (EXACT VALUES FROM DATABASE):\n${context.dataContext}\n\nUse the data above to answer specifically and accurately.` : '';

    let prompt = `${systemPrompt}${dataContext}\n\n`;
    prompt += `User context: Role=${context.user_role || 'Worker'}\n`;
    prompt += `Respond in ${langName}.\n\n`;

    history.slice(-5).forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });

    prompt += `User: ${message}\nAssistant:`;

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async getSmartMockResponse(message: string, language: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    const langResponses = SMART_MOCK_RESPONSES[language] || SMART_MOCK_RESPONSES.en;

    // Keyword groups mapped to database context topics
    const keywordMap: [string[], string][] = [
      [['temper', 'temperature', 'crystalliz', 'cooling curve'], 'machine'],
      [['log', 'audit', 'history', 'clearance', 'restricted', 'supervisor', 'record', 'trace', 'trail'], 'logs'],
      [['access', 'permission', 'role', 'authorize', 'login', 'credential', 'clearance level', 'who can'], 'access'],
      [['warehouse', 'zone', 'storage', 'dock', 'rack', 'shelf', 'location', 'store', 'capacity'], 'warehouse'],
      [['order', 'ship', 'deliver', 'track', 'dispatch', 'freight', 'logistics'], 'production'],
      [['worker', 'staff', 'employee', 'team', 'personnel', 'operator', 'headcount', 'people'], 'worker'],
      [['shift', 'schedule', 'roster', 'rotation', 'overtime', 'hour'], 'worker'],
      [['alert', 'alarm', 'warning', 'critical', 'sos', 'urgent', 'notification', 'notify'], 'alert'],
      [['safety', 'incident', 'hazard', 'ppe', 'compliance', 'regulation', 'osha', 'fire'], 'alert'],
      [['supplier', 'vendor', 'procurement', 'purchase', 'source', 'contract'], 'supplier'],
      [['inventory', 'stock', 'material', 'ingredient', 'supply', 'quantity', 'level', 'remain', 'left', 'how much', 'how many'], 'inventory'],
      [['recipe', 'instruction', 'formula', 'method', 'procedure', 'how to make', 'step', 'bake', 'cook', 'prepare'], 'recipe'],
      [['production', 'batch', 'output', 'yield', 'line', 'manufacture', 'process', 'run', 'progress'], 'production'],
      [['quality', 'qc', 'inspection', 'test', 'check', 'standard', 'defect', 'pass', 'fail', 'reject'], 'quality'],
      [['machine', 'equipment', 'maintenance', 'repair', 'fix', 'breakd', 'fault', 'calibrat', 'motor', 'conveyor', 'pump'], 'machine'],
      [['chocolate', 'cocoa', 'roast', 'conch', 'mold', 'truffle', 'praline', 'ganache', 'dark choc', 'milk choc', 'white choc'], 'recipe'],
      [['help', 'what can', 'how do', 'guide', 'tutorial', 'assist', 'support', 'hi', 'hello', 'hey',
        'እርዳታ', 'ሰላም', 'ምን', 'አዲስ', 'እንዴት', // Amharic (help, hello, what, new, how)
        'помощь', 'привет', 'что', 'как', // Russian
        'עזרה', 'שלום', 'מה', 'איך', // Hebrew
        'مساعدة', 'مرحبا', 'ماذا', 'كيف' // Arabic
      ], 'help'],
    ];

    // Find the matching topic
    let matchedTopic = '';
    for (const [keywords, topic] of keywordMap) {
      if (keywords.some(kw => lowerMessage.includes(kw))) {
        matchedTopic = topic;
        break;
      }
    }

    // If 'help' matched, return static help text in user's language
    if (matchedTopic === 'help') {
      return langResponses.help || langResponses.default;
    }

    // For non-English: prioritize pre-translated responses
    if (language !== 'en') {
      if (matchedTopic && langResponses[matchedTopic]) {
        return langResponses[matchedTopic];
      }
      // No specific translation available, return default in user's language
      return langResponses.default;
    }

    // English: Try to fetch real data from the database
    if (matchedTopic) {
      try {
        const realData = await getDataContextForTopic(matchedTopic, message);
        if (realData && realData.length > 0) {
          return realData;
        }
      } catch (error) {
        console.warn('Failed to fetch real data for topic:', matchedTopic, error);
      }
      return langResponses[matchedTopic] || langResponses.default;
    }

    // No keyword match — show factory overview
    try {
      const overview = await getFactoryOverview();
      if (overview && overview.length > 0) {
        return overview;
      }
    } catch (error) {
      console.warn('Failed to fetch factory overview:', error);
    }

    return langResponses.default;
  }

  private getLocalTranslationFallback(text: string, targetLanguage: string): string {
    const dictionary: Record<string, Record<string, string>> = {
      // Basic UI/Technical
      'step': { am: 'ደረጃ', ru: 'Шаг', he: 'שלב', ar: 'خطوة' },
      'recipe': { am: 'የምግብ አሰራር', ru: 'Рецепт', he: 'מתכון', ar: 'وصفة' },
      'instructions': { am: 'መመሪያዎች', ru: 'Инструкции', he: 'הוראות', ar: 'تعليمات' },
      'ingredients': { am: 'ግብዓቶች', ru: 'Ингредиенты', he: 'מרכיבים', ar: 'مكونات' },
      
      // Verbs (Actions)
      'boil': { am: 'ቀቅል', ru: 'Кипятить', he: 'להרתיח', ar: 'اغلي' },
      'cook': { am: 'አብስል', ru: 'Готовить', he: 'לבשל', ar: 'طبخ' },
      'bake': { am: 'ጋግር', ru: 'Печь', he: 'לאפות', ar: 'خبز' },
      'melt': { am: 'አቅልጥ', ru: 'Растопить', he: 'להמיס', ar: 'تذويب' },
      'mix': { am: 'ቀላቅል', ru: 'Смешать', he: 'לערבב', ar: 'خلط' },
      'pour': { am: 'አፍስስ', ru: 'Налить', he: 'למזוג', ar: 'صب' },
      'whisk': { am: 'ምታ', ru: 'Взбить', he: 'להקציף', ar: 'خفق' },
      'cool': { am: 'አቀዝቅዝ', ru: 'Охладить', he: 'לקרר', ar: 'تبريد' },
      'set': { am: 'አረጋጋ', ru: 'Застыть', he: 'להתקשות', ar: 'تماسك' },
      'temper': { am: 'ተምፐር', ru: 'Темперировать', he: 'לטמפרר', ar: 'تبريد حراري' },
      'add': { am: 'ጨምር', ru: 'Добавить', he: 'להוסיף', ar: 'أضف' },

      // Ingredients (Nouns)
      'milk': { am: 'ወተት', ru: 'молоко', he: 'חלב', ar: 'حليب' },
      'rice': { am: 'ሩዝ', ru: 'рис', he: 'אורז', ar: 'أرز' },
      'cream': { am: 'ክሬም', ru: 'сливки', he: 'שמנת', ar: 'كريمة' },
      'butter': { am: 'ቅቤ', ru: 'масло', he: 'חמאה', ar: 'زبدة' },
      'sugar': { am: 'ስኳር', ru: 'сахар', he: 'סוכר', ar: 'سكر' },
      'chocolate': { am: 'ቸኮሌት', ru: 'шоколад', he: 'שוקולד', ar: 'شيكولاتة' },
      'brandy': { am: 'ብራንዲ', ru: 'бренди', he: 'ברנדי', ar: 'براندي' },
      'yolk': { am: 'የእንቁላል አስኳል', ru: 'желток', he: 'חלמון', ar: 'صفار البيض' },
      'egg': { am: 'እንቁላል', ru: 'яйцо', he: 'ביצה', ar: 'بيض' },
      'fruit': { am: 'ፍራፍሬ', ru: 'фрукт', he: 'פרי', ar: 'فاكهة' },
      'dried': { am: 'የደረቀ', ru: 'сушеный', he: 'מיובש', ar: 'مجفف' },
      'sauce': { am: 'ሶስ', ru: 'ሶус', he: 'רוטב', ar: 'صلصة' },
      'ganache': { am: 'ጋናሽ', ru: 'ганаш', he: 'גנאש', ar: 'جانااش' },
      'hazelnut': { am: 'የለውዝ', ru: 'фундук', he: 'אגוז לוז', ar: 'بندق' },
      'truffle': { am: 'ትሩፍል', ru: 'трюфель', he: 'כמהין', ar: 'ترافل' },
      
      // Descriptors
      'tender': { am: 'ለስላሳ', ru: 'мягкий', he: 'רך', ar: 'طري' },
      'smooth': { am: 'ለስላሳ', ru: 'гладкий', he: 'חלק', ar: 'ناعم' },
      'hot': { am: 'ትኩስ', ru: 'горячий', he: 'חם', ar: 'ساخن' },
      'dark': { am: 'ጥቁር', ru: 'темный', he: 'כהה', ar: 'داكن' },
      'until': { am: 'እስከ', ru: 'до', he: 'עד', ar: 'حتى' },
      'all': { am: 'ሁሉንም', ru: 'все', he: 'הכל', ar: 'الكل' },
      'together': { am: 'አንድ ላይ', ru: 'вместе', he: 'ביחד', ar: 'معاً' },
      'and': { am: 'እና', ru: 'и', he: 'ו-', ar: 'و' },
      'with': { am: 'ከ ... ጋር', ru: 'с', he: 'עם', ar: 'مع' },
    };

    let result = text;
    const lang = targetLanguage.toLowerCase();
    
    // Sort keys by length descending to replace "dried fruits" before "fruits"
    const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);

    sortedKeys.forEach(word => {
      if (dictionary[word][lang]) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, dictionary[word][lang]);
      }
    });

    // Patterns
    const patterns = [
      { regex: /step\s+(\d+)/gi, replace: dictionary['step'][lang] ? `${dictionary['step'][lang]} $1` : 'Step $1' },
      { regex: /boil\s+(\w+)/gi, replace: dictionary['boil']?.[lang] ? `${dictionary['boil'][lang]} $1` : 'Boil $1' },
      { regex: /mix\s+in\s+(\w+)/gi, replace: dictionary['mix']?.[lang] ? `${dictionary['mix'][lang]} $1` : 'Mix in $1' },
    ];

    patterns.forEach(p => {
      result = result.replace(p.regex, p.replace);
    });

    return result;
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    // Try DeepSeek first
    if (DEEPSEEK_KEY) {
      try {
        const response = await fetch(`${DEEPSEEK_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: `You are a professional translator for an artisan chocolate factory. Return ONLY translated text. Target language: ${langName}. Preserve list numbering (e.g. 1., 2.) and translate technical steps precisely.` },
              { role: 'user', content: text }
            ],
            temperature: 0,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          return data.choices[0].message.content.trim();
        }
      } catch (error) {
        console.warn('DeepSeek translation failed:', error);
      }
    }

    // Try Anthropic
    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Translate the following text to ${langName}. Only return the translation, nothing else:\n\n"${text}"`
          }]
        });
        const textBlock = response.content.find(block => 'text' in block);
        if (textBlock && 'text' in textBlock) return textBlock.text;
      } catch (error) {
        console.warn('Anthropic translation failed:', error);
      }
    }

    // Try Gemini
    if (this.geminiModel) {
      try {
        const prompt = `Translate the following text to ${langName}. Only return the translation, nothing else:\n\n"${text}"`;
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.warn('Gemini translation failed:', error);
      }
    }

    // Final fallback to local dictionary
    return this.getLocalTranslationFallback(text, targetLanguage);
  }


  getProvider(): string {
    return this.provider;
  }
}

export const aiService = new AIService();
