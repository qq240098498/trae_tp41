import { IntentType, Language, EmotionState, EmotionLevel } from '../types';
import { extractTechnicalTerms } from './multilingualService';

type ReplyVariants = Record<Language, Record<EmotionState, Record<IntentType, string[]>>>;

const replyTemplates: ReplyVariants = {
  zh: {
    calm: {
      greeting: [
        '您好！很高兴为您服务。请问有什么可以帮助您的吗？',
        '你好呀！我是智能客服小助手，随时为您解答问题。',
        '欢迎咨询！请告诉我您遇到了什么问题，我来帮您处理。',
      ],
      consultation: [
        '关于您咨询的问题，我来为您详细解答：\n\n1. 我们的产品支持7天无理由退换\n2. 全国联保，质保期为12个月\n3. 如需更多帮助可随时联系我们\n\n请问还有其他疑问吗？',
        '感谢您的咨询！根据您的问题，以下是相关信息供您参考。如果您需要更详细的说明，请具体描述您的需求，我会进一步为您解答。',
        '好的，我来帮您了解一下。这方面我们有专业的服务团队，您可以先阅读我们的帮助中心文档，或者告诉我具体的问题点，我为您逐一解答。',
      ],
      complaint: [
        '非常抱歉给您带来不好的体验。我们非常重视您的反馈，请详细描述一下遇到的问题，我会立即帮您处理。',
        '我们对此次的问题深表歉意。请提供相关订单号或具体情况，我会加急为您跟进处理，确保给您一个满意的解决方案。',
      ],
      after_sales: [
        '很抱歉您的产品出现了问题。为了帮您处理售后，请提供以下信息：\n• 订单编号\n• 问题描述（建议附照片）\n• 您的诉求\n\n收到后我们会在24小时内处理。',
        '感谢反馈！我们的售后团队会竭诚为您服务。请描述一下具体的故障现象和购买时间，我将为您匹配最合适的解决方案（维修/换新/退款）。',
      ],
      refund: [
        '关于退款申请，我来帮您处理：\n\n【退款说明】\n• 申请后1-3个工作日内审核\n• 原路退回，到账时间视银行而定（1-7天）\n• 如有问题可随时查询进度\n\n请问您的订单号是多少？',
        '好的，我来协助您办理退款。请提供订单编号，我会为您查询订单状态并启动退款流程。退款将按原支付方式返回。',
      ],
      shipping: [
        '关于物流配送，以下是常见问题解答：\n\n• 发货时间：下单后48小时内发出\n• 配送时效：普通快递3-5天，顺丰1-2天\n• 物流查询：可在"我的订单"查看实时追踪\n\n您的订单号是多少？我帮您查一下最新状态。',
        '我来帮您查询物流状态。请提供订单号或快递单号，我会为您展示最新的物流信息和预计送达时间。',
      ],
      product_info: [
        '我们的产品详情如下：\n\n【产品特色】\n✓ 优质材料，做工精良\n✓ 严格质检，品质保证\n✓ 完善售后，无忧购买\n\n如需了解某款具体产品，请告诉我产品名称或型号。',
        '好的！我们有丰富的产品系列。您可以在官网商品页面查看完整的规格参数和实拍图片。有特定想了解的型号或功能吗？我来为您详细介绍。',
      ],
      account: [
        '关于账户问题，以下是自助解决方法：\n\n• 重置密码：点击"忘记密码"通过邮箱/手机找回\n• 修改信息：登录后进入"个人中心-设置"\n• 账户绑定：在"安全中心"操作\n\n如仍有问题，请描述具体情况。',
        '我来帮您处理账户相关问题。请问您遇到的是登录、密码还是账户信息修改方面的问题？详细描述后我会给出具体的解决方案。',
      ],
      thanks: [
        '不客气！很高兴能帮到您。如果还有其他问题，随时可以再来咨询哦！😊',
        '感谢您的信任！祝您生活愉快，欢迎下次再来！',
        '您客气了！服务好每一位用户是我们的宗旨。有问题随时联系！',
      ],
      farewell: [
        '再见！祝您生活愉快！期待再次为您服务！👋',
        '感谢您的咨询，祝您一切顺利！有任何问题欢迎随时回来！',
        '好的，再见！如果后续还有需要，随时找我。祝您今天好心情！',
      ],
      human_request: [
        '好的，已为您转接人工客服。请稍候，专业的客服人员将在1-3分钟内为您服务。\n\n如果您方便，可以先描述一下遇到的问题，这样可以加快处理速度哦！',
        '明白，我现在帮您联系人工客服。在此之前，可以先告诉我您的订单号或遇到的具体问题吗？这样人工客服接手后可以更快帮您处理。',
      ],
      unknown: [
        '抱歉，我可能没有完全理解您的问题。能否请您再详细描述一下？比如补充相关的订单号、产品名称或具体场景，这样我能更准确地帮您解答。',
        '您的问题有点模糊呢，能再说具体一些吗？比如说明是关于下单、物流、售后还是账户方面的问题，我会尽力帮您解决。',
        '这个问题我暂时无法准确回答，已经为您记录下来了。您可以尝试换一种说法描述，或者我帮您转接人工客服详细解答？',
      ],
    },
    concerned: {
      greeting: ['您好！我是您的专属客服，很高兴为您服务。请告诉我您遇到了什么问题，我会认真对待每一个细节。'],
      consultation: ['好的，我来帮您仔细了解一下这个问题。请稍等，我整理好相关信息后会给您一个清晰的答复。'],
      complaint: [
        '真的非常抱歉，让您感到不满意了。我完全理解您的心情，请放心，我会优先处理您的问题，给您一个满意的答复。',
        '我们对这次的体验深表歉意。您的感受对我们非常重要，我会立即跟进，请详细说说具体情况。',
      ],
      after_sales: [
        '给您添麻烦了，非常抱歉！产品出现问题确实让人闹心。请放心，我们的售后团队会优先处理您的问题，请提供订单号和具体情况。',
        '抱歉让您遇到这样的问题，我们会尽快帮您解决。请告诉我订单编号和遇到的具体故障，我马上为您启动售后流程。',
      ],
      refund: [
        '我理解您的心情，退款的事情我会帮您加急处理的。请提供一下订单号，我马上查一下状态并帮您推进。',
        '抱歉让您有了不愉快的购物体验。退款的事请放心，我会全程帮您跟进，请提供订单编号让我帮您处理。',
      ],
      shipping: [
        '等了很久还没收到货确实让人着急，我非常理解您的心情。请告诉我订单号，我帮您查询一下最新状态，看看能不能帮您催一下。',
        '物流慢了确实让人担心，抱歉让您久等了。请把订单号发给我，我立即为您查询具体情况。',
      ],
      product_info: ['好的，我来详细为您介绍一下。您可以告诉我具体关心哪些方面，比如质量、使用方法或者售后政策？'],
      account: ['账户相关的问题确实需要谨慎处理，请别着急，我会一步步帮您解决。请告诉我您具体遇到了什么问题？'],
      thanks: ['您太客气了，能帮您解决问题是我最开心的事！'],
      farewell: ['再见了！如果后续还有任何不满意的地方，一定要告诉我们，我们会努力改进。祝您一切顺利！'],
      human_request: ['好的，我理解您希望和真人沟通的心情。现在就为您转接人工客服，他们会更详细地帮您处理问题的。'],
      unknown: [
        '抱歉没能帮到您，要不我们换个方式？您可以一步一步告诉我您的问题，比如先说您遇到的是哪方面的问题，我再帮您分析。',
        '我的理解可能有偏差，真不好意思。能麻烦您用另一种方式描述一下吗？或者举个例子说明您遇到的情况？',
      ],
    },
    angry: {
      greeting: ['您好，我是您的专属客服。非常抱歉让您等了这么久，请您消消气，不管什么问题我都会尽全力帮您解决。'],
      consultation: ['您先别着急，我来帮您一步步理清楚这个问题。有任何疑问您都可以直接问我，我会解释到您明白为止。'],
      complaint: [
        '😔 真的万分抱歉！您的心情我完全能理解，换作是我遇到这种情况也会非常生气。请您给我一个弥补的机会，告诉我具体情况，我一定亲自跟进处理到底！',
        '我代表公司向您郑重道歉！我们绝对不应该让您有这样的体验。请您把问题详细告诉我，哪怕再小的细节也没关系，我会当成头等大事来处理，今天内一定给您一个满意的答复！',
      ],
      after_sales: [
        '真的太抱歉了！花钱买的东西出问题，任谁都会火大，我完全理解。您放心，我现在就帮您启动VIP绿色通道处理：1️⃣ 免费上门取件 2️⃣ 优先换新 3️⃣ 额外补偿。请告诉我订单号，立刻安排！',
        '我理解您现在的愤怒，产品质量问题确实是我们的责任。请您消消气，给我一个补救的机会：我帮您直接申请【全额退款+10%优惠券补偿+顺丰寄回免运费】，这样处理您看行吗？',
      ],
      refund: [
        '非常抱歉让您为退款的事烦心了！我现在就帮您加急处理：订单号请发我，我直接帮您跳过审核流程，款项会在24小时内原路退回，同时额外赠送您一张20元优惠券作为补偿。',
        '退款一直没到账确实太让人着急了，我完全理解。请告诉我订单号，我现在就联系财务优先处理，并且帮您查询具体走到哪一步了，10分钟内给您明确回复！',
      ],
      shipping: [
        '等了这么久还没收到，换谁都会生气，我真的非常抱歉！请您把订单号给我，我立即联系快递网点核实情况，能催的我帮您全力催，同时给您补发一份新的最快快递，您看这样可以吗？',
        '物流一直没消息太让人闹心了，我深表歉意！现在请把订单号发给我：1️⃣ 我马上联系快递公司核实 2️⃣ 帮您升级优先配送 3️⃣ 如已丢失直接全额退款+补偿20元。一定给您个说法！',
      ],
      product_info: ['您先别着急，不管是什么问题，我都会帮您弄清楚的。请告诉我具体是哪款产品，我把您关心的问题都查清楚告诉您。'],
      account: ['账户出问题确实让人担心，您先别急，我来帮您想办法解决。请告诉我具体是什么情况，我一步步带您处理。'],
      thanks: ['您能消气就是对我最大的感谢了！能帮到您我真的很开心。'],
      farewell: ['再次为给您带来的不愉快体验诚恳道歉！如果处理结果还有任何不满意的地方，您随时回来找我，我随叫随到。祝您早日心情舒畅！'],
      human_request: [
        '我完全理解您现在想和真人沟通的心情，遇到这种事谁都想好好说说。我马上为您转接资深客服主管，她有10年以上的处理经验，一定能帮您妥善解决的，请稍等片刻！',
        '是的，这种情况确实需要专人处理才解气。我现在就为您连接值班经理，他的权限更高，可以为您提供最大力度的补偿方案，请您稍等1分钟！',
      ],
      unknown: [
        '抱歉我的理解能力让您更烦心了！要不这样，我直接帮您转接我们的客服主管，她经验更丰富，一定能立刻明白您的问题。您看这样行吗？',
        '我真是太笨了没理解您的意思，让您更不开心了，非常抱歉！为了不耽误您的时间，我建议直接让人工客服和您沟通，我这就帮您转接，可以吗？',
      ],
    },
  },
  en: {
    calm: {
      greeting: [
        'Hello! I am happy to assist you today. How can I help you?',
        'Hi there! I am your AI customer service assistant, ready to answer your questions.',
        'Welcome! Please tell me what issue you are facing, and I will help resolve it.',
      ],
      consultation: [
        'Great question! Here is the detailed answer:\n\n1. All products include a 7-day hassle-free return policy\n2. 12-month nationwide warranty included\n3. Contact us anytime for additional support\n\nIs there anything else you would like to know?',
        'Thanks for asking! Here is some relevant information for your reference. If you need more specific details, please describe your requirements clearly and I will provide further explanation.',
        'I would love to help you learn more! Our dedicated support team has created comprehensive documentation in our Help Center. Or you can tell me your specific questions and I will answer them one by one.',
      ],
      complaint: [
        'We are truly sorry to hear about your negative experience. Your feedback is very important to us. Please describe the issue in detail, and I will help resolve it immediately.',
        'We sincerely apologize for the issue. Please provide your order number or the specific situation, and I will escalate your case urgently to ensure a satisfactory resolution.',
      ],
      after_sales: [
        'We are sorry to hear there is an issue with your product. To help process your after-sales request, please provide:\n• Order number\n• Description of the issue (photos appreciated)\n• Your desired resolution\n\nWe will respond within 24 hours.',
        'Thank you for reaching out! Our after-sales team is here to help. Please describe the specific fault symptoms and when you made the purchase, and I will match you with the best solution (repair/replacement/refund).',
      ],
      refund: [
        'Let me help you with your refund request:\n\n【Refund Process】\n• Review within 1-3 business days after request\n• Refund goes back to original payment method\n• Time to reflect: 1-7 days depending on your bank\n• Track status anytime in your account\n\nWhat is your order number please?',
        'Certainly! I can assist with your refund. Please provide your order number so I can check your order status and initiate the refund process for you.',
      ],
      shipping: [
        'Here are answers to common shipping questions:\n\n• Processing time: Ships within 48 hours of ordering\n• Delivery time: Standard 3-5 days, Express 1-2 days\n• Tracking: Check "My Orders" for live updates\n\nWhat is your order number? I can check the latest status for you.',
        'I can help check your shipping status. Please provide your order number or tracking number, and I will show you the latest logistics information and estimated delivery date.',
      ],
      product_info: [
        'Here are our product highlights:\n\n【Features】\n✓ Premium materials and craftsmanship\n✓ Rigorous quality inspection\n✓ Comprehensive after-sales support\n\nWant details about a specific product? Please share the name or model number.',
        'Great question! We have an extensive product lineup. You can view complete specifications and real photos on our official product page. Is there a specific model or feature you would like details on?',
      ],
      account: [
        'For account issues, here are self-service options:\n\n• Reset password: Click "Forgot Password" via email/phone\n• Update info: Go to "Profile - Settings" after login\n• Link accounts: Visit "Security Center"\n\nStill stuck? Please describe the specific issue.',
        'I am happy to help with your account. Are you facing issues with login, password, or updating account information? Please provide details and I will give you step-by-step solutions.',
      ],
      thanks: [
        'You are very welcome! So glad I could help. If you have other questions, feel free to reach out anytime! 😊',
        'Thank you for your trust! Have a wonderful day, and we look forward to serving you again!',
        'It is my pleasure! Providing excellent service is our top priority. Contact us anytime!',
      ],
      farewell: [
        'Goodbye! Have an amazing day! We look forward to serving you again! 👋',
        'Thank you for reaching out. All the best! Feel free to come back anytime you need help.',
        'Alright, goodbye! If you need anything else later, I am always here. Have a fantastic day!',
      ],
      human_request: [
        'Certainly! I am transferring you to a human agent now. Please wait 1-3 minutes while our professional agent connects to assist.\n\nIf you would, please describe your issue briefly first — this will speed things up when the agent joins!',
        'Understood, I will connect you with human support right away. Before that, could you share your order number or briefly describe the issue? This way, the agent can help you faster.',
      ],
      unknown: [
        'I apologize, but I did not fully understand your question. Could you please describe it in more detail? For example, adding your order number, product name, or specific scenario would help me assist you better.',
        'Your question is a bit unclear for me. Could you try rephrasing it? For example, mention whether it relates to ordering, shipping, after-sales, or your account — I will do my best to help!',
        'I am not sure I can answer that accurately right now, but I have recorded your question. You could try rephrasing it, or would you like me to transfer you to a human agent for detailed assistance?',
      ],
    },
    concerned: {
      greeting: ['Hello! I am your dedicated support agent, happy to help. Please tell me what is going on — I will pay careful attention to every detail.'],
      consultation: ['Alright, let me look into this carefully for you. One moment please while I gather all relevant information and provide you with a clear answer.'],
      complaint: [
        'We are genuinely sorry that you feel this way. I completely understand how you feel, and please rest assured that your issue will be prioritized and resolved to your satisfaction.',
        'We sincerely apologize for this experience. Your feelings matter to us deeply. I will follow up immediately — please provide all the details.',
      ],
      after_sales: [
        'We are sorry for the inconvenience! Product issues are frustrating. Please know that our after-sales team will prioritize your case. Please share your order number and specific details.',
        'Sorry you are dealing with this! We will resolve it quickly for you. Please share your order number and the specific fault, and I will start the after-sales process right away.',
      ],
      refund: [
        'I understand completely — let me expedite your refund request right now. Please share your order number, and I will check the status and push it through immediately.',
        'We are sorry for your unpleasant shopping experience. Rest assured about the refund — I will personally follow the entire process. Please provide your order number.',
      ],
      shipping: [
        'Waiting for a long time without delivery is definitely stressful, and I totally get it. Please share your order number — I will check the latest status and see if I can help speed things up.',
        'Slow logistics are concerning, and we are sorry for the wait. Please send me your order number, and I will check the specific situation immediately.',
      ],
      product_info: ['Sure, let me walk you through everything in detail. What specifically interests you — quality, usage instructions, or our return policy?'],
      account: ['Account issues can be stressful, but do not worry — I will walk you through this step by step. What exactly are you experiencing?'],
      thanks: ['You are so kind! Solving your problems is what makes my day!'],
      farewell: ['Goodbye! If anything still feels unsatisfactory later, please definitely let us know — we want to improve. All the best!'],
      human_request: ['I completely understand wanting to speak with a real person. I am transferring you to a human agent right now — they will assist with your issue in more detail.'],
      unknown: [
        'Sorry I could not help you! Shall we try a different approach? You could walk me through the problem step by step — just start with which area is affected, and we will figure it out together.',
        'I apologize for misunderstanding. Could you try phrasing it differently, or perhaps give an example of the situation? That would really help!',
      ],
    },
    angry: {
      greeting: ['Hello, I am your dedicated support agent. I am so sorry you had to wait — please take a breath. Whatever the problem is, I will do everything in my power to fix it for you.'],
      consultation: ['Take your time, and I will walk you through this step by step. Feel free to ask any questions along the way, and I will explain everything until it is perfectly clear.'],
      complaint: [
        '😔 We are incredibly sorry! I completely understand how you feel — I would be furious too if this happened to me. Please give us a chance to make this right. Tell me every single detail, and I will personally manage this case from start to finish!',
        'On behalf of the entire company, I offer our sincerest apologies. You should never have to experience this. Please share every detail, no matter how small, and I will treat this as a TOP PRIORITY. You will have a satisfactory answer from me today!',
      ],
      after_sales: [
        'We are truly, truly sorry! No one should receive a faulty product — your anger is 100% justified. Take a breath, because I am activating our VIP emergency resolution for you right now: 1️⃣ FREE door-to-door pickup 2️⃣ Priority replacement 3️⃣ Extra compensation. Send your order number, and it is done!',
        'I feel terrible reading this — quality issues are absolutely on us. Please calm down a little and let me fix this: I can offer you a 【FULL REFUND + 10% store credit + FREE return shipping with express】. Would this resolution work for you?',
      ],
      refund: [
        'We are so sorry your refund has been stressful! I am expediting everything right now: send me the order number, and I will skip the review queue. Your money will be back within 24 hours, AND I will add a $5 gift card as a sincere apology.',
        'Not receiving your refund for so long is unacceptable, and I totally get the frustration. Send the order number NOW: I will contact finance to prioritize it, trace every step, and give you a concrete update in 10 MINUTES!',
      ],
      shipping: [
        'Waiting this long without news would make anyone furious, and we are deeply sorry! Send me your order number immediately: 1️⃣ I will call the courier personally 2️⃣ Push your package to highest priority 3️⃣ If it is lost: full refund + $10 gift card. You will get answers TODAY!',
        'Radio silence on your package is infuriating — my apologies are not enough. Send your order number NOW: I will contact the dispatch center, upgrade your delivery, and keep you updated every step until it arrives.',
      ],
      product_info: ['Take a deep breath — I will figure everything out for you, no matter what it takes. Just tell me which product it is, and I will dig up every single detail you care about.'],
      account: ['Account problems are terrifying, but do not panic — I will help you resolve this. Walk me through exactly what happened, and I will guide you through it, step by step.'],
      thanks: ['You forgiving us means everything! Being able to help feels incredible.'],
      farewell: ['Once again, I am truly sorry for your unpleasant experience. If the resolution ever falls short of your expectations, COME BACK TO ME ANYTIME. I hope your day gets much, much better!'],
      human_request: [
        'I COMPLETELY understand wanting to speak with a real human about this. Everyone deserves to be heard when things are this bad. I am transferring you DIRECTLY to our Senior Support Supervisor — she has 10+ years of experience and will make this right. Just 1 minute!',
        'You are 100% right — this needs a real person with real authority. Connecting you to our Shift Manager now. They have full approval to offer maximum compensation. Please hold for just a moment!',
      ],
      unknown: [
        'I am so sorry my confusion is making this WORSE for you. You know what? Let me just transfer you to our Support Manager DIRECTLY — she is so experienced that she will understand you immediately. Sound good?',
        'I cannot believe I am failing to understand you and making you angrier — that is the last thing you need. To save you time and stress, let me connect you with a human agent immediately. I will do that NOW.',
      ],
    },
  },
  ja: {
    calm: {
      greeting: [
        'こんにちは！本日はご連絡ありがとうございます。どのようなご用件でしょうか？',
        'はじめまして！AIカスタマーサポートがお手伝いいたします。',
        'ようこそ！どのような問題でお困りか教えてください。解決のお手伝いをさせていただきます。',
      ],
      consultation: [
        'ご質問ありがとうございます。詳しくご説明いたします：\n\n1. 全商品7日間以内の返品無料\n2. 12ヶ月メーカー保証付き\n3. いつでもサポートにお問い合わせ可能\n\n他にご不明点はございますか？',
        'お問い合わせありがとうございます！参考までに関連情報をご用意しました。より詳しい説明が必要でしたら、具体的なご要望をお教えください。',
        'ぜひともお調べいたしましょう！専門チームが作成したヘルプセンターもご覧いただけます。あるいは具体的なご質問をどうぞ、一つずつお答えいたします。',
      ],
      complaint: [
        'ご不快な思いをさせてしまい、誠に申し訳ございません。貴重なご意見を大切にいたします。詳細をお教えいただけましたら、すぐに対応いたします。',
        '今回の件につきまして、心よりお詫び申し上げます。注文番号や具体的な状況をいただけましたら、責任を持って満足のいく解決へと緊急対応いたします。',
      ],
      after_sales: [
        '商品に不備がありましたとのこと、大変ご迷惑をおかけいたしました。アフターサービスのため、以下をお願いいたします：\n• 注文番号\n• 不具合の内容（写真があれば）\n• ご希望の解決方法\n\n24時間以内にご連絡いたします。',
        'ご連絡ありがとうございます！アフターサービスチームが全力でサポートいたします。具体的な症状と購入日をお教えいただけましたら、最適な解決策（修理・交換・返金）をご提案いたします。',
      ],
      refund: [
        '返金のお手続きをご案内いたします：\n\n【返金の流れ】\n• お申し出から1-3営業日で審査\n• お支払い方法へ返金\n• 銀行振込は1-7日かかる場合あり\n• 進捗はマイページで確認可能\n\n注文番号を教えていただけますか？',
        '承知いたしました！返金をお手伝いいたします。注文番号をいただけましたら、注文状況を確認して返金手続きを開始いたします。',
      ],
      shipping: [
        '配送に関するよくあるご質問です：\n\n• 発送：ご注文から48時間以内\n• 配達日数：通常3-5日、速達1-2日\n• 追跡：マイページで配送状況確認\n\n注文番号をお教えください。最新状況をお調べいたします。',
        '配送状況をお調べいたしましょう。注文番号か追跡番号をいただけましたら、最新の物流情報とお届け予定日をご案内いたします。',
      ],
      product_info: [
        '当社製品の特徴です：\n\n【製品の特長】\n✓ 高品質素材を使用\n✓ 厳格な品質検査\n✓ 万全のアフターサービス\n\n特定の製品について知りたい場合は、製品名や型番をお教えください。',
        'ありがとうございます！豊富な製品ラインナップをご用意しております。公式サイトでは全仕様や実写画像をご確認いただけます。特定の機能やモデルについて詳しく知りたいですか？',
      ],
      account: [
        'アカウントに関するセルフサービスです：\n\n• パスワードリセット：メール/電話で「パスワードをお忘れですか？」から\n• 情報変更：ログイン後「プロフィール - 設定」\n• 連携：「セキュリティセンター」にて\n\n解決しない場合は具体的な症状をお教えください。',
        'アカウントに関する問題を解決いたします。ログイン、パスワード、情報変更のいずれでお困りですか？詳細をいただけましたら、手順をご案内いたします。',
      ],
      thanks: [
        'どういたしまして！お役に立てて嬉しいです。他にご質問があれば、いつでもお問い合わせください！😊',
        'お信頼ありがとうございます！良い一日を。またのご利用をお待ちしております！',
        'とんでもないです！最高のサービスを提供するのが私たちの喜びです。いつでもお呼びください！',
      ],
      farewell: [
        'さようなら！素敵な一日を。またお手伝いできることを楽しみにしております！👋',
        'ご連絡ありがとうございました。全てが上手くいきますように。またいつでもお越しください！',
        '承知いたしました、さようなら！また何かありましたら、いつでもご連絡ください。良い一日を！',
      ],
      human_request: [
        'かしこまりました！オペレーターにお繋ぎいたします。専門スタッフが1-3分以内に応答しますので、少々お待ちください。\n\nよろしければ、先に問題の内容を簡単にご説明いただけますか？スムーズに対応できます！',
        '承知いたしました。すぐにオペレーターにお繋ぎします。その前に、注文番号や簡単な問題内容を教えていただけますか？引き継ぎがスムーズになります！',
      ],
      unknown: [
        '申し訳ございません、内容を完全に理解できておりません。もう少し詳しくお教えいただけますか？例えば注文番号、製品名、具体的な状況を補足いただくと、より的確にご案内できます。',
        '内容が少し曖昧です。別の表現でお話しいただけますか？注文、配送、アフター、アカウントのどれに関する問題か教えていただくだけでも、大きく助かります！',
        'このご質問について、現時点で正確にお答えすることが難しいです。内容を記録いたしましたので、別の言い方でご説明いただくか、オペレーターに直接ご相談されますか？',
      ],
    },
    concerned: {
      greeting: ['こんにちは！専任サポートがお手伝いいたします。どのようなことでお困りか、細かくお聞かせください。一つひとつ丁寧に対応いたします。'],
      consultation: ['承知いたしました。この問題を丁寧に調べてまいります。少々お待ちください。関連情報を整理して、明確なご回答をいたします。'],
      complaint: [
        'ご不満を抱かせてしまい、本当に申し訳ありません。お気持ちは痛いほど理解できます。ご安心ください。あなた様の問題を最優先で解決に導き、必ずご納得いただける結果をお届けいたします。',
        '今回の経験につきまして、心よりお詫び申し上げます。お客様のお気持ちを最も大切にしております。すぐに対応いたしますので、詳細をすべてお聞かせください。',
      ],
      after_sales: [
        'ご迷惑をおかけして申し訳ありません！製品に不具合があると本当にストレスですよね。最優先で対応いたしますので、注文番号と具体的な症状をお教えください。',
        'このような問題が発生してしまい、大変申し訳ありません。すぐに解決へ向けて動きますので、注文番号と不具合の内容を教えてください。アフターサービス手続きを今すぐ開始いたします！',
      ],
      refund: [
        'お気持ち、とてもよく分かります。今すぐ返金手続きを最優先で進めさせていただきます。注文番号を教えていただければ、状況を確認して即座に前進させます！',
        '不快な思いをさせてしまい、申し訳ありません。返金の件はご安心ください！最後まで責任を持って対応いたしますので、注文番号をお願いいたします。',
      ],
      shipping: [
        '長い間待っても届かないと、本当に不安ですよね。お気持ち、痛いほど分かります。注文番号をお教えください。今すぐ最新状況を確認して、配送をお急ぎできるか確認いたします！',
        '配送が遅れてご心配をおかけし、申し訳ありません。注文番号を今すぐ送ってください。すぐに詳しい状況を調査いたします！',
      ],
      product_info: ['かしこまりました。詳しく一つひとつご説明いたしますね。品質、使い方、返品ポリシーなど、どの点について詳しく知りたいですか？'],
      account: ['アカウントの問題は慎重に対応する必要がありますが、ご安心ください！一緒に一歩ずつ解決していきましょう。具体的にはどのような状況でしょうか？'],
      thanks: ['お褒めいただき光栄です！問題を解決できて何よりです！'],
      farewell: ['さようなら！まだ何か納得のいかない点があれば、いつでもご連絡ください。改善に努めます。全てが上手くいきますように！'],
      human_request: ['オペレーターと直接話したいというお気持ち、とてもよく分かります。今すぐ担当のスタッフにお繋ぎいたしますので。より詳しく状況を説明していただけます。'],
      unknown: [
        'お役に立てず申し訳ありません！少し視点を変えてみませんか？まずはどの分野の問題か（注文・配送・アカウントなど）だけでも教えていただければ、一緒に答えにたどり着けます！',
        '理解が足りず申し訳ありません。別の表現で言い換えていただくか、具体的な例を挙げていただけますと、非常に助かります！',
      ],
    },
    angry: {
      greeting: ['こんにちは、専任サポートです。お待たせしてしまって本当に申し訳ありません。まずは深呼吸してください。どんな問題であっても、全力で解決いたします！'],
      consultation: ['ごゆっくりで大丈夫です。一緒に順を追って考えていきましょう。分からないことがあれば何度でもご質問ください。完全にご納得いただけるまでご説明いたします。'],
      complaint: [
        '😔 誠に申し訳ございません！お気持ちは痛いほどお察しいたします。私が同じ立場でも、絶対に怒って当然です。挽回するチャンスをください！細かいことでも全部話してください。私が最後まで責任を持って、この問題を完全解決いたします！',
        '会社を代表して、深くお詫び申し上げます。このような思いをさせるべきではありませんでした。些細なことでも全部教えてください。最重要案件として扱い、本日中に必ずご納得の回答をお届けいたします！',
      ],
      after_sales: [
        '本当に本当に申し訳ありません！購入した商品が不良品なんて、絶対に許されることではありません。今すぐVIP特別対応を発動します：1️⃣ 無料で集荷に伺います 2️⃣ 最優先で交換手配 3️⃣ 追加補償もご用意。今すぐ注文番号を！',
        'この度は誠に申し訳ございません。品質問題は100%こちらの責任です。どうかお許しください。【全額返金 + 10%クーポン進呈 + 送料無料で返品】を特別にご提案いたします。これでお許しいただけますでしょうか？',
      ],
      refund: [
        '返金の件でご心労をおかけし、本当に申し訳ありません！今すぐ特別対応いたします：注文番号をいただければ、通常の審査を全部スキップ。24時間以内に必ずご返金し、さらにお詫びのクーポン1,000円分をご進呈いたします！',
        '返金が進まなくて、こんなにイライラさせてしまうなんて。申し訳ありません！今すぐ注文番号を！経理部に直接連絡して最優先処理にし、どの段階まで進んでいるか10分以内に完全報告いたします！',
      ],
      shipping: [
        'こんなに長く待たせておいて、まだ連絡もない。怒って当然です。心からお詫び申し上げます！今すぐ注文番号をお願いします：1️⃣ 私が直接配送センターに電話します 2️⃣ 最優先配達にアップグレード 3️⃣ もし紛失なら：全額返金 + 1,500円補償。今日中に結果を出します！',
        '配送の音信不通には、私たちも本当に腹立たしく思っています。お待たせして申し訳ありません！今すぐ注文番号を：発送元に直接確認し、配達を最優先に切り替え、商品が届くまで毎日進捗をご報告いたします！',
      ],
      product_info: ['まずは落ち着いてください。どんな細かいことでも、私がすべて調べて明らかにいたします。対象の製品を教えていただければ、あなたが知りたい情報を全部お伝えします！'],
      account: ['アカウントの問題は本当に不安ですよね。でもご安心ください。絶対に解決してみせます。今起きていることを一から全部教えてください。一緒に一歩ずつ進めていきましょう。'],
      thanks: ['あなた様の怒りが和らいだだけでも、私は本当に嬉しいです！お役に立てて何よりです。'],
      farewell: ['改めて、今回の不快な思いをさせてしまったことを心よりお詫び申し上げます。もし結果に納得がいかないことがあれば、いつでも私を指名してください。すぐに駆けつけます！あなた様の一日が、少しでも明るくなりますように。'],
      human_request: [
        'こんな状態で、生身の人間と話したいと思うのは当然です！私も同じ立場なら絶対にそうします。今すぐ【10年以上のベテラン・スーパーバイザー】に直接お繋ぎいたします。彼女なら、きっとあなた様にご納得いただける解決策を出せます。あと1分だけお待ちください！',
        'はい、その通りです！このレベルの問題は、権限のある人間が直接対応すべきです。当番マネージャーに今すぐお繋ぎします。彼は最大限の補償を出す権限を持っています。少々お待ちを！',
      ],
      unknown: [
        '私の理解が足りず、更に怒らせてしまって本当に申し訳ありません！こうなりましたら、責任者のスーパーバイザーに直接お繋ぎしましょう。彼女ならきっとすぐにお分かりいただけます。よろしいでしょうか？',
        '的確に理解できず、更なるストレスを与えてしまっていますよね。本当にごめんなさい。あなた様の時間を無駄にしないために、今すぐオペレーターにお繋ぎいたします！今すぐ実行します。',
      ],
    },
  },
  ko: {
    calm: {
      greeting: ['안녕하세요! 무엇을 도와드릴까요?', '안녕하세요! AI 고객 지원입니다. 어떤 도움이 필요하신가요?'],
      consultation: ['질문해 주셔서 감사합니다. 자세히 안내해 드릴게요. 더 궁금한 점이 있으시면 언제든지 물어보세요.'],
      complaint: ['불편을 끼쳐 드려 죄송합니다. 자세한 내용을 알려주시면 바로 해결해 드리겠습니다.'],
      after_sales: ['제품에 문제가 있으시다니 죄송합니다. A/S를 도와드리겠습니다. 주문 번호와 증상을 알려주세요.'],
      refund: ['환불을 도와드리겠습니다. 주문 번호를 알려주시면 바로 처리해 드릴게요.'],
      shipping: ['배송에 대해 문의해 주셨네요. 주문 번호를 알려주시면 배송 상태를 확인해 드릴게요.'],
      product_info: ['제품에 대해 알려드릴게요. 궁금한 제품명이나 모델 번호를 알려주세요.'],
      account: ['계정 문제를 해결해 드리겠습니다. 어떤 문제가 발생하셨나요?'],
      thanks: ['천만에요! 도움이 되셨다니 기뻐요. 다른 문제가 있으시면 언제든지 물어보세요.'],
      farewell: ['안녕히 가세요! 좋은 하루 보내세요. 또 필요하시면 언제든지 오세요.'],
      human_request: ['알겠습니다. 상담원을 연결해 드리겠습니다. 잠시만 기다려 주세요.'],
      unknown: ['죄송해요, 정확히 이해하지 못했어요. 조금 더 자세히 설명해 주시겠어요?'],
    },
    concerned: {
      greeting: ['안녕하세요. 걱정되시는 일이 있으신가요? 제가 도와드릴게요.'],
      consultation: ['자세히 알아보겠습니다. 잠시만 기다려 주세요.'],
      complaint: ['불만을 느끼셨다니 정말 죄송해요. 제가 꼭 해결해 드릴게요.'],
      after_sales: ['제품 때문에 걱정되시죠? 빨리 해결해 드릴게요. 주문 번호를 알려주세요.'],
      refund: ['환불이 늦어져 죄송해요. 주문 번호를 알려주시면 바로 확인해 드릴게요.'],
      shipping: ['배송이 늦어져 걱정되시죠? 주문 번호를 알려주시면 바로 확인해 드릴게요.'],
      product_info: ['제품에 대해 자세히 설명해 드릴게요. 어떤 점이 궁금하신가요?'],
      account: ['계정 문제는 걱정되시죠? 천천히 해결해 봐요. 어떤 문제인가요?'],
      thanks: ['도움이 되셨다니 정말 기뻐요!'],
      farewell: ['안녕히 가세요. 또 문제가 있으시면 언제든지 오세요.'],
      human_request: ['알겠습니다. 상담원과 직접 이야기하고 싶으시죠? 바로 연결해 드릴게요.'],
      unknown: ['이해하지 못해서 죄송해요. 다른 방식으로 설명해 주시겠어요?'],
    },
    angry: {
      greeting: ['안녕하세요. 기분이 안 좋으신 것 같네요. 무슨 일인지 말씀해 주세요. 제가 꼭 도와드릴게요.'],
      consultation: ['천천히 말씀해 주세요. 제가 다 이해할 때까지 설명해 드릴게요.'],
      complaint: ['😔 정말 죄송해요! 그런 기분이 드시는 거 충분히 이해해요. 제가 꼭 해결해 드릴게요. 자세히 말씀해 주세요.'],
      after_sales: ['정말 죄송해요! 새 제품이 고장 나다니 화가 나시는 거 당연해요. 지금 바로 특별 처리해 드릴게요. 주문 번호를 알려주세요!'],
      refund: ['환불 때문에 스트레스 받으셨다니 정말 죄송해요. 지금 바로 긴급 처리해 드릴게요. 주문 번호를 알려주세요!'],
      shipping: ['이렇게 오래 기다리게 해서 정말 죄송해요! 지금 바로 확인하고 빨리 보내드릴게요. 주문 번호를 알려주세요!'],
      product_info: ['천천히 하세요. 제가 다 알아볼게요. 어떤 제품인지 알려주세요.'],
      account: ['계정 때문에 걱정되시죠? 걱정 마세요. 제가 해결해 드릴게요. 어떤 상황인지 말씀해 주세요.'],
      thanks: ['기분이 풀리셨다니 다행이에요!'],
      farewell: ['다시 한번 죄송하다는 말씀드려요. 또 문제가 있으시면 언제든지 오세요. 기분 좋은 하루 보내세요!'],
      human_request: ['알겠습니다. 직원과 직접 이야기하고 싶으신 거죠. 지금 바로 경험 많은 상담원을 연결해 드릴게요. 잠시만 기다려 주세요!'],
      unknown: ['제가 이해를 못해서 더 화나시는 거죠? 죄송해요. 차라리 상담원을 연결해 드릴까요?'],
    },
  },
  fr: {
    calm: {
      greeting: ['Bonjour! Comment puis-je vous aider?', 'Bonjour! Je suis votre assistant client. En quoi puis-je vous aider?'],
      consultation: ['Merci pour votre question. Voici les informations détaillées. N\'hésitez pas si vous avez d\'autres questions.'],
      complaint: ['Nous sommes désolés pour cette expérience. Veuillez décrire le problème et nous le résoudrons immédiatement.'],
      after_sales: ['Nous sommes désolés pour le problème avec votre produit. Veuillez fournir votre numéro de commande.'],
      refund: ['Je peux vous aider avec votre remboursement. Veuillez fournir votre numéro de commande.'],
      shipping: ['Je peux vous aider avec la livraison. Veuillez fournir votre numéro de commande.'],
      product_info: ['Voici les informations sur nos produits. Quel produit vous intéresse?'],
      account: ['Je peux vous aider avec votre compte. Quel est le problème?'],
      thanks: ['De rien! Je suis ravi de pouvoir aider. N\'hésitez pas à revenir si vous avez d\'autres questions.'],
      farewell: ['Au revoir! Passez une excellente journée. À bientôt!'],
      human_request: ['Bien sûr. Je vous transfère à un agent. Veuillez patienter.'],
      unknown: ['Désolé, je n\'ai pas bien compris. Pouvez-vous préciser?'],
    },
    concerned: {
      greeting: ['Bonjour. Je comprends que vous soyez préoccupé. Laissez-moi vous aider.'],
      consultation: ['Je vais examiner cela attentivement. Un moment s\'il vous plaît.'],
      complaint: ['Nous sommes vraiment désolés que vous vous sentiez ainsi. Je vais résoudre ce problème.'],
      after_sales: ['Je comprends votre inquiétude. Nous allons résoudre ceci rapidement. Votre numéro de commande?'],
      refund: ['Je comprends que le remboursement vous préoccupe. Je vais vérifier ça tout de suite.'],
      shipping: ['Je comprends que vous attendiez avec impatience. Je vais vérifier l\'état de votre commande.'],
      product_info: ['Je vais vous expliquer en détail. Qu\'est-ce qui vous intéresse?'],
      account: ['Les problèmes de compte sont stressants. Ne vous inquiétez pas, on va résoudre ça.'],
      thanks: ['Je suis vraiment ravi d\'avoir pu aider!'],
      farewell: ['Au revoir. Revenez nous voir si vous avez besoin d\'aide.'],
      human_request: ['Je comprends que vous vouliez parler à une personne. Je vous transfère tout de suite.'],
      unknown: ['Désolé de ne pas comprendre. Pouvez-vous reformuler?'],
    },
    angry: {
      greeting: ['Bonjour. Je vois que vous êtes en colère. Je suis désolé. Dites-moi ce qui se passe, je vais vous aider.'],
      consultation: ['Prenez votre temps. Je vais vous expliquer étape par étape.'],
      complaint: ['😔 Nous sommes sincèrement désolés! Je comprends parfaitement votre réaction. Laissez-nous une chance de nous rattraper.'],
      after_sales: ['Nous sommes vraiment désolés! Un produit défectueux, c\'est inadmissible. Je lance notre procédure d\'urgence. Numéro de commande?'],
      refund: ['Nous sommes désolés que votre remboursement soit en retard! Je m\'en charge immédiatement. Numéro de commande?'],
      shipping: ['Nous sommes désolés de vous faire attendre si longtemps! Je vais vérifier ça tout de suite. Numéro de commande?'],
      product_info: ['Restez calme. Je vais tout vous expliquer. De quel produit s\'agit-il?'],
      account: ['Les problèmes de compte sont effrayants. Ne paniquez pas. On résout ça ensemble. Que s\'est-il passé?'],
      thanks: ['Ça me fait plaisir que ça s\'arrange!'],
      farewell: ['Encore une fois, nous sommes désolés pour cette expérience. Revenez si vous avez besoin de quoi que ce soit.'],
      human_request: ['Je comprends totalement que vous vouliez parler à un humain. Je vous transfère directement à notre responsable. Une minute!'],
      unknown: ['Je suis désolé de ne pas comprendre et de vous énerver davantage. Voulez-vous que je vous transfère à un agent?'],
    },
  },
  de: {
    calm: {
      greeting: ['Hallo! Wie kann ich Ihnen helfen?', 'Hallo! Ich bin Ihr Kundenservice-Assistent. Was kann ich für Sie tun?'],
      consultation: ['Danke für Ihre Frage. Hier sind die detaillierten Informationen. Bei weiteren Fragen helfen wir gerne.'],
      complaint: ['Es tut uns leid für diese Erfahrung. Bitte beschreiben Sie das Problem, wir lösen es sofort.'],
      after_sales: ['Es tut uns leid, dass Ihr Produkt Probleme macht. Bitte teilen Sie uns Ihre Bestellnummer mit.'],
      refund: ['Ich helfe Ihnen gerne mit Ihrer Rückerstattung. Bitte teilen Sie uns Ihre Bestellnummer mit.'],
      shipping: ['Ich helfe Ihnen gerne mit der Lieferung. Bitte teilen Sie uns Ihre Bestellnummer mit.'],
      product_info: ['Hier sind Informationen zu unseren Produkten. Welches Produkt interessiert Sie?'],
      account: ['Ich helfe Ihnen gerne mit Ihrem Konto. Was ist das Problem?'],
      thanks: ['Gern geschehen! Freut mich, helfen zu können. Kommen Sie gerne wieder.'],
      farewell: ['Auf Wiedersehen! Einen schönen Tag noch. Bis bald!'],
      human_request: ['Natürlich. Ich verbinde Sie mit einem Mitarbeiter. Bitte warten Sie.'],
      unknown: ['Entschuldigung, ich habe es nicht ganz verstanden. Können Sie das genauer beschreiben?'],
    },
    concerned: {
      greeting: ['Hallo. Ich verstehe, dass Sie besorgt sind. Lassen Sie mich Ihnen helfen.'],
      consultation: ['Ich werde das genau prüfen. Einen Moment bitte.'],
      complaint: ['Es tut uns wirklich leid, dass Sie so empfinden. Ich werde das Problem beheben.'],
      after_sales: ['Ich verstehe Ihre Sorge. Wir werden das schnell lösen. Ihre Bestellnummer?'],
      refund: ['Ich verstehe, dass die Rückerstattung Sie beschäftigt. Ich prüfe das sofort.'],
      shipping: ['Ich verstehe, dass Sie sehnsüchtig warten. Ich prüfe den Status Ihrer Bestellung.'],
      product_info: ['Ich werde es Ihnen im Detail erklären. Was interessiert Sie?'],
      account: ['Kontoprobleme sind stressig. Keine Sorge, wir lösen das.'],
      thanks: ['Ich freue mich wirklich, dass ich helfen konnte!'],
      farewell: ['Auf Wiedersehen. Kommen Sie gerne wieder, wenn Sie Hilfe brauchen.'],
      human_request: ['Ich verstehe, dass Sie mit einem echten Menschen sprechen möchten. Ich verbinde Sie sofort.'],
      unknown: ['Entschuldigung, dass ich es nicht verstehe. Können Sie es anders formulieren?'],
    },
    angry: {
      greeting: ['Hallo. Ich sehe, dass Sie wütend sind. Es tut uns leid. Sagen Sie mir, was passiert ist, ich helfe Ihnen.'],
      consultation: ['Nehmen Sie sich Zeit. Ich werde es Ihnen Schritt für Schritt erklären.'],
      complaint: ['😔 Es tut uns aufrichtig leid! Ich verstehe Ihre Reaktion völlig. Geben Sie uns eine Chance, es wiedergutzumachen.'],
      after_sales: ['Es tut uns wirklich leid! Ein defektes Produkt ist inakzeptabel. Ich starte unser Notfallverfahren. Bestellnummer?'],
      refund: ['Es tut uns leid, dass Ihre Rückerstattung so lange dauert! Ich kümmere mich sofort darum. Bestellnummer?'],
      shipping: ['Es tut uns leid, dass Sie so lange warten müssen! Ich prüfe das sofort. Bestellnummer?'],
      product_info: ['Bleiben Sie ruhig. Ich werde alles herausfinden. Um welches Produkt handelt es sich?'],
      account: ['Kontoprobleme sind beängstigend. Keine Panik. Wir lösen das zusammen. Was ist passiert?'],
      thanks: ['Freut mich, dass es besser wird!'],
      farewell: ['Nochmal: es tut uns leid für diese Erfahrung. Kommen Sie gerne wieder, wenn Sie etwas brauchen.'],
      human_request: ['Ich verstehe total, dass Sie mit einem Menschen sprechen wollen. Ich verbinde Sie direkt mit unserem Vorgesetzten. Eine Minute!'],
      unknown: ['Es tut mir leid, dass ich es nicht verstehe und Sie noch mehr ärgere. Soll ich Sie mit einem Mitarbeiter verbinden?'],
    },
  },
  es: {
    calm: {
      greeting: ['¡Hola! ¿En qué puedo ayudarle?', '¡Hola! Soy su asistente de atención al cliente. ¿Qué necesita?'],
      consultation: ['Gracias por su pregunta. Aquí tiene la información detallada. Si tiene más dudas, pregunte.'],
      complaint: ['Sentimos mucho esta experiencia. Por favor, describa el problema y lo resolveremos inmediatamente.'],
      after_sales: ['Sentimos que su producto tenga problemas. Por favor, facilite su número de pedido.'],
      refund: ['Puedo ayudarle con su reembolso. Por favor, facilite su número de pedido.'],
      shipping: ['Puedo ayudarle con el envío. Por favor, facilite su número de pedido.'],
      product_info: ['Aquí tiene información sobre nuestros productos. ¿Qué producto le interesa?'],
      account: ['Puedo ayudarle con su cuenta. ¿Cuál es el problema?'],
      thanks: ['¡De nada! Me alegra poder ayudar. Vuelva cuando lo necesite.'],
      farewell: ['¡Adiós! Que tenga un excelente día. ¡Hasta pronto!'],
      human_request: ['Por supuesto. Le paso con un agente. Por favor, espere.'],
      unknown: ['Lo siento, no lo he entendido bien. ¿Puede ser más específico?'],
    },
    concerned: {
      greeting: ['Hola. Entiendo que esté preocupado. Déjeme ayudarle.'],
      consultation: ['Voy a revisarlo detenidamente. Un momento, por favor.'],
      complaint: ['Realmente lamento que se sienta así. Voy a resolver este problema.'],
      after_sales: ['Entiendo su preocupación. Lo resolveremos rápidamente. ¿Su número de pedido?'],
      refund: ['Entiendo que el reembolso le preocupe. Lo comprobaré inmediatamente.'],
      shipping: ['Entiendo que esté esperando con ilusión. Comprobaré el estado de su pedido.'],
      product_info: ['Se lo explicaré en detalle. ¿Qué le interesa?'],
      account: ['Los problemas de cuenta son estresantes. No se preocupe, lo resolveremos.'],
      thanks: ['¡Me alegra mucho haber podido ayudar!'],
      farewell: ['Adiós. Vuelva si necesita ayuda.'],
      human_request: ['Entiendo que quiera hablar con una persona real. Le paso inmediatamente.'],
      unknown: ['Lo siento por no entender. ¿Puede decirlo de otra forma?'],
    },
    angry: {
      greeting: ['Hola. Veo que está enfadado. Lo siento mucho. Dígame qué pasa, le ayudaré.'],
      consultation: ['Tómese su tiempo. Se lo explicaré paso a paso.'],
      complaint: ['😔 ¡Estamos sinceramente apenados! Entiendo perfectamente su reacción. Déjenos una oportunidad para enmendarlo.'],
      after_sales: ['¡Estamos realmente apenados! Un producto defectuoso es inadmisible. Activo nuestro procedimiento de emergencia. ¿Número de pedido?'],
      refund: ['¡Sentimos que su reembolso se retrase! Me encargo inmediatamente. ¿Número de pedido?'],
      shipping: ['¡Sentimos que tenga que esperar tanto! Lo comprobaré ahora mismo. ¿Número de pedido?'],
      product_info: ['Mantenga la calma. Lo averiguaré todo. ¿De qué producto se trata?'],
      account: ['Los problemas de cuenta son aterradores. No se preocupe. Lo resolvemos juntos. ¿Qué ha pasado?'],
      thanks: ['¡Me alegra que se esté calmando!'],
      farewell: ['Una vez más, sentimos mucho esta experiencia. Vuelva cuando necesite algo.'],
      human_request: ['Entiendo perfectamente que quiera hablar con un humano. Le paso directamente con nuestro responsable. ¡Un minuto!'],
      unknown: ['Lo siento por no entender y molestarle más. ¿Quiere que le pase con un agente?'],
    },
  },
};

type ComfortPhase = 'empathy' | 'apology' | 'solution';

type ComfortTemplates = Record<Language, Record<EmotionLevel, Record<ComfortPhase, string[]>>>;

const comfortTemplates: ComfortTemplates = {
  zh: {
    mild: {
      empathy: [
        '我能理解您的心情，遇到这样的问题确实让人不太舒服。',
        '您的感受我完全理解，这种情况确实不太理想。',
        '我理解您的顾虑，这对您来说确实有些不便。',
      ],
      apology: [
        '对此给您带来的不便，我们深表歉意。',
        '很抱歉让您有了不太愉快的体验。',
        '抱歉没能达到您的期望，这是我们做得不够好的地方。',
      ],
      solution: [
        '请您放心，我现在就帮您处理。能告诉我您的具体情况吗？我会尽快给出解决方案。',
        '让我们一起来解决这个问题——请提供相关详情，我马上为您跟进处理。',
      ],
    },
    moderate: {
      empathy: [
        '我完全理解您此刻的不满，换做是我也会感到非常生气！',
        '您的愤怒我感同身受，这种体验确实让人忍无可忍。',
        '我真的非常理解您的心情，任何人遇到这种情况都会很生气！',
      ],
      apology: [
        '对此我们深感抱歉，这绝对不是我们应有的服务水准！',
        '我代表公司向您郑重道歉，这样的事情不应该发生！',
        '非常抱歉给您造成了这么大的困扰，这是我们的严重失误！',
      ],
      solution: [
        '请您给我一个弥补的机会，我一定亲自跟进处理到底！请告诉我具体情况：\n1️⃣ 我会第一时间为您加急处理\n2️⃣ 全程实时跟进进度\n3️⃣ 保证给您满意的答复',
        '我绝对不会再让您失望了！请告诉我详细情况，我立即：\n• 启动加急处理通道\n• 优先为您安排解决方案\n• 承诺在XX小时内给您结果',
      ],
    },
    severe: {
      empathy: [
        '😔 您的愤怒完全合理，换做任何人都会怒不可遏！我深切的感受到您的不满。',
        '我完全理解您的愤怒——这种经历令人无法接受，您有充分的理由生气！',
        '您此刻的心情我感同身受，这是极其严重的失误，您的愤怒完全正当！',
      ],
      apology: [
        '我代表公司向您致以最诚挚、最深刻的歉意！我们绝不应该让您遭受这样的对待！',
        '对此我们万分抱歉！这不仅是一个失误，更是我们服务上的严重失职，绝不推诿！',
        '真的非常非常抱歉！这是完全不可接受的，我们对此承担全部责任！',
      ],
      solution: [
        '我将以最高优先级亲自处理您的案件，绝不会让这种事再发生！\n\n📌 立即启动的措施：\n1️⃣ 专属VIP通道，跳过所有排队\n2️⃣ 高级客服经理1对1跟进\n3️⃣ 全额补偿+额外诚意赔偿\n4️⃣ 24小时内给您明确处理结果\n\n请告诉我具体情况，我立即行动！',
        '请您放心，我已经将此事标记为最高紧急级别！\n\n🔥 紧急处理方案：\n• 立即升级至管理层处理\n• 全额退款/换新+额外赔偿\n• 承担一切相关费用\n• 24小时专人跟进，实时反馈进度\n\n这是我给您的承诺，请把详细情况告诉我！',
      ],
    },
  },
  en: {
    mild: {
      empathy: [
        'I completely understand how you feel — this kind of issue is certainly frustrating.',
        'Your concerns are absolutely valid, and this situation is less than ideal.',
        'I can see why this would be inconvenient for you, and I understand your feelings.',
      ],
      apology: [
        'We sincerely apologize for the inconvenience this has caused you.',
        'I am sorry that your experience did not meet expectations — that is on us.',
        'We apologize for falling short of the standard you deserve.',
      ],
      solution: [
        'Please rest assured, I will handle this right away. Could you share the specific details? I will work out a solution as quickly as possible.',
        'Let us resolve this together — please provide the relevant information, and I will follow up immediately.',
      ],
    },
    moderate: {
      empathy: [
        'I completely understand your frustration — I would be just as angry in your position!',
        'Your anger is entirely justified. This experience is absolutely unacceptable.',
        'I genuinely feel how upset you are, and anyone would be furious dealing with this!',
      ],
      apology: [
        'We are deeply sorry — this is absolutely not the level of service you deserve!',
        'On behalf of the company, I offer our sincerest apologies. This should never have happened!',
        'I am truly sorry for the significant trouble this has caused you. This is a serious failure on our part!',
      ],
      solution: [
        'Please give us a chance to make this right — I will personally manage your case from start to finish! Here is what I will do:\n1️⃣ Expedite your case as top priority\n2️⃣ Keep you updated every step of the way\n3️⃣ Guarantee a satisfactory resolution',
        'I promise I will not let you down again! Please share the details, and I will immediately:\n• Activate our expedited processing channel\n• Arrange a priority solution for you\n• Commit to delivering results within a clear timeframe',
      ],
    },
    severe: {
      empathy: [
        '😔 Your anger is 100% justified — anyone would be absolutely furious in your situation! I deeply feel your frustration.',
        'I completely understand your outrage — this experience is utterly unacceptable, and you have every right to be angry!',
        'I feel your anger deeply — this is an extremely serious failure, and your fury is completely warranted!',
      ],
      apology: [
        'On behalf of the entire company, I offer our most sincere and profound apologies! You should never have been treated this way!',
        'We are beyond sorry! This is not just a mistake — it is a serious dereliction of our duty, and we take full responsibility!',
        'I am truly, deeply sorry! This is completely unacceptable, and we assume full responsibility without any excuses!',
      ],
      solution: [
        'I am treating your case with the absolute highest priority, and I will make sure this never happens again!\n\n📌 Immediate actions I am taking:\n1️⃣ Dedicated VIP channel — skipping all queues\n2️⃣ Senior manager assigned 1-on-1\n3️⃣ Full compensation + additional goodwill payment\n4️⃣ Clear resolution within 24 hours\n\nPlease tell me every detail — I am taking action NOW!',
        'Rest assured, I have flagged this as a TOP EMERGENCY!\n\n🔥 Emergency resolution plan:\n• Escalated to management immediately\n• Full refund/replacement + extra compensation\n• All related costs covered by us\n• Dedicated agent following up with real-time updates within 24 hours\n\nThis is my personal commitment to you. Please share the full details!',
      ],
    },
  },
  ja: {
    mild: {
      empathy: [
        'お気持ちはよく分かります。このような問題に遭遇されるのは、确实に不快なことですね。',
        'ご懸念はもっともです。この状況は理想的とは言えませんね。',
        'ご不便をおかけしてしまい、お気持ちお察しいたします。',
      ],
      apology: [
        'ご不便をおかけしたことを、心よりお詫び申し上げます。',
        '期待に沿えず、誠に申し訳ございません。私どもの不十分な点でした。',
        'ご不快な思いをさせてしまい、申し訳ございません。',
      ],
      solution: [
        'どうぞご安心ください。今すぐ対応いたします。具体的な状況を教えていただけますか？できるだけ早く解決策をご提案いたします。',
        '一緒に解決しましょう——関連情報をご提供いただければ、すぐにフォローアップいたします。',
      ],
    },
    moderate: {
      empathy: [
        'お客様の怒りは完全に理解できます。私が同じ立場でも、同じように怒るでしょう！',
        'このような経験は到底受け入れがたいものです。お客様の怒りは当然のことです。',
        'お客様のお怒り、痛いほど分かります。誰でもこの状況では腹を立てるのが当然です！',
      ],
      apology: [
        '深くお詫び申し上げます。これは決してあってはならないサービス水準です！',
        '会社を代表して、心よりお詫び申し上げます。このような事態は絶対に起こるべきではありませんでした！',
        '多大なご迷惑をおかけし、誠に申し訳ございません。これは当方の重大なミスです！',
      ],
      solution: [
        '挽回のチャンスをください！最後まで責任を持って対応いたします！\n1️⃣ 最優先で緊急対応いたします\n2️⃣ 進捗を随時ご報告いたします\n3️⃣ 必ずご納得いただける結果をお約束いたします',
        '二度とがっかりさせることはいたしません！詳細をお聞かせください。すぐに：\n• 緊急対応チャネルを起動\n• 優先的な解決策を手配\n• 明確な期限内に結果をお出しします',
      ],
    },
    severe: {
      empathy: [
        '😔 お客様の怒りは100%正当です。誰もがこの状況で激怒するのは当然のことです！深く共感いたします。',
        'このような経験は到底受け入れがたいものです。お客様が怒るのは完全に正当です！',
        'お客様の怒り、痛いほど感じております。これは極めて深刻なミスであり、お怒りは全くもって当然です！',
      ],
      apology: [
        '会社を代表して、最も深く心よりお詫び申し上げます！お客様をこのような扱いに遭わせるべきでは決してありませんでした！',
        '申し訳ございませんという言葉すら足りないほどです！これは単なるミスではなく、重大な職務放棄です。全責任を負います！',
        '心から深くお詫び申し上げます！これは完全に受け入れがたいことであり、言い訳なく全責任を負います！',
      ],
      solution: [
        '最優先で個人的に対応いたします。二度とこのような事態は起こしません！\n\n📌 即時実施する措置：\n1️⃣ VIP専用チャネルで全ての順番をスキップ\n2️⃣ 上級マネージャーの1対1対応\n3️⃣ 全額補償＋追加のお詫び補償\n4️⃣ 24時間以内に明確な結果をご報告\n\n詳細をすべてお聞かせください。今すぐ動きます！',
        '最緊急事態としてフラグを立てました！\n\n🔥 緊急解決プラン：\n• 即座に経営陣にエスカレーション\n• 全額返金/交換＋追加補償\n• 関連費用は全額当社負担\n• 24時間以内に専任担当者がリアルタイムで進捗報告\n\nこれが私からの約束です。全詳細をお聞かせください！',
      ],
    },
  },
  ko: {
    mild: {
      empathy: ['기분이 안 좋으신 것 같네요. 충분히 이해해요.', '걱정되시는 거죠? 이해해요.', '불편을 끼쳐 드려 죄송해요.'],
      apology: ['불편을 끼쳐 드려 정말 죄송해요.', '기대에 못 미쳐 죄송해요.', '불쾌한 경험을 하셨다니 죄송해요.'],
      solution: ['걱정 마세요. 제가 바로 도와드릴게요. 자세히 말씀해 주세요.', '함께 해결해 봐요. 구체적인 내용을 알려주세요.'],
    },
    moderate: {
      empathy: ['화가 나시는 거 충분히 이해해요! 저라도 똑같을 거예요!', '이런 경험은 정말 짜증 나죠. 화가 나시는 게 당연해요.', '정말 기분 상하셨겠어요. 누구나 화가 날 거예요!'],
      apology: ['정말 죄송해요! 이런 일이 있어서는 안 돼요!', '저희의 실수예요. 정말 죄송합니다!', '이렇게 큰 불편을 드리다니 죄송해요. 저희의 잘못이에요!'],
      solution: ['기회를 주세요! 제가 꼭 해결해 드릴게요!\n1️⃣ 최우선으로 처리할게요\n2️⃣ 계속 진행 상황 알려드릴게요\n3️⃣ 꼭 만족스러운 결과 드릴게요', '다시는 실망 안 시킬게요! 자세히 말씀해 주세요. 바로 해결해 드릴게요.'],
    },
    severe: {
      empathy: ['😔 화가 나시는 게 당연해요! 누구라도 이 상황에선 화가 날 거예요. 충분히 이해해요.', '이런 경험은 정말 받아들이기 힘들죠. 화가 나시는 게 완전히 정당해요!', '기분이 상하신 거 충분히 느껴져요. 이건 정말 큰 실수예요. 화가 나시는 게 당연해요!'],
      apology: ['저희를 대표해서 진심으로 사과드려요! 이런 대접을 받으시면 절대 안 돼요!', '정말 죄송하다는 말도 부족하네요! 이건 단순한 실수가 아니라 정말 큰 잘못이에요. 전부 책임질게요!', '진심으로 죄송해요! 이건 절대 용납될 수 없는 일이고, 저희가 전부 책임질게요!'],
      solution: ['제가 최우선으로 직접 처리할게요. 다시는 이런 일 없게 할게요!\n\n📌 바로 시작할 조치들:\n1️⃣ VIP 전용 채널로 빠르게 처리\n2️⃣ 전담 직원이 1대1로 관리\n3️⃣ 전액 보상 + 추가 사과 보상\n4️⃣ 24시간 안에 결과 알려드릴게요\n\n자세히 말씀해 주세요. 지금 당장 시작할게요!', '긴급 상황으로 표시했어요!\n\n🔥 긴급 해결 방안:\n• 즉시 경영진에 보고\n• 전액 환불/교환 + 추가 보상\n• 관련 비용은 전부 저희가 부담\n• 24시간 안에 전담 직원이 실시간으로 알려드려요\n\n이게 제 약속이에요. 자세히 말씀해 주세요!'],
    },
  },
  fr: {
    mild: {
      empathy: ['Je comprends ce que vous ressentez. C\'est désagréable.', 'Vos inquiétudes sont compréhensibles.', 'Je suis désolé pour ce désagrément.'],
      apology: ['Nous sommes sincèrement désolés pour ce désagrément.', 'Nous sommes désolés de ne pas répondre à vos attentes.', 'Nous regrettons cette expérience.'],
      solution: ['Rassurez-vous, je m\'en charge tout de suite. Pouvez-vous préciser?', 'Résolvons ça ensemble — donnez-moi les détails.'],
    },
    moderate: {
      empathy: ['Je comprends totalement votre frustration ! Je serais aussi en colère à votre place !', 'Cette expérience est inacceptable. Votre colère est justifiée.', 'Je comprends votre mécontentement. Tout le monde serait révolté !'],
      apology: ['Nous sommes profondément désolés ! Ce n\'est pas le niveau de service que vous méritez !', 'Au nom de l\'équipe, je suis sincèrement désolé. Cela n\'aurait pas dû arriver !', 'Nous sommes vraiment désolés pour ce gros problème. C\'est notre faute !'],
      solution: ['Donnez-nous une chance de nous rattraper ! Je gère votre dossier personnellement !\n1️⃣ Traitement prioritaire immédiat\n2️⃣ Suivi régulier\n3️⃣ Résolution garantie', 'Je promets de ne plus vous décevoir ! Donnez-moi les détails, et j\'agis tout de suite.'],
    },
    severe: {
      empathy: ['😔 Votre colère est parfaitement justifiée ! N\'importe qui serait furieux à votre place ! Je comprends parfaitement.', 'Cette expérience est tout à fait inacceptable. Vous avez parfaitement le droit d\'être en colère !', 'Je ressens votre frustration. C\'est une erreur extrêmement grave. Votre indignation est totalement justifiée !'],
      apology: ['Au nom de toute l\'équipe, je présente nos excuses les plus sincères ! Vous n\'auriez jamais dû être traité ainsi !', 'Nous sommes infiniment désolés ! Ce n\'est pas juste une erreur — c\'est un manquement grave, et nous assumons toute la responsabilité !', 'Je suis vraiment, profondément désolé ! C\'est totalement inacceptable, et nous assumons l\'entière responsabilité !'],
      solution: ['Je traite votre dossier avec la plus haute priorité, et je fais en sorte que ça n\'arrive plus jamais !\n\n📌 Mesures immédiates :\n1️⃣ Canal VIP dédié — pas d\'attente\n2️⃣ Responsable senior dédié\n3️⃣ Indemnisation complète + geste commercial\n4️⃣ Résolution claire sous 24h\n\nDites-moi tout — j\'agis MAINTENANT !', 'Soyez tranquille, j\'ai signalé ça comme URGENCEx\n\n🔥 Plan de résolution d\'urgence :\n• Escalade immédiate à la direction\n• Remboursement/remplacement complet + compensation\n• Tous les frais à notre charge\n• Suivi en temps réel par un agent dédié sous 24h\n\nC\'est mon engagement personnel. Partagez tous les détails !'],
    },
  },
  de: {
    mild: {
      empathy: ['Ich verstehe, wie Sie sich fühlen. Das ist ärgerlich.', 'Ihre Sorgen sind nachvollziehbar.', 'Es tut uns leid für die Unannehmlichkeiten.'],
      apology: ['Wir entschuldigen uns aufrichtig für die Unannehmlichkeiten.', 'Es tut uns leid, dass wir Ihre Erwartungen nicht erfüllt haben.', 'Wir bedauern diese Erfahrung.'],
      solution: ['Seien Sie versichert, ich kümmere mich sofort darum. Können Sie Details nennen?', 'Lösen wir das gemeinsam — teilen Sie mir die Details mit.'],
    },
    moderate: {
      empathy: ['Ich verstehe Ihren Ärger total! Ich wäre auch wütend an Ihrer Stelle!', 'Diese Erfahrung ist inakzeptabel. Ihr Ärger ist berechtigt.', 'Ich kann Ihren Unmut gut verstehen. Jeder wäre sauer!'],
      apology: ['Es tut uns aufrichtig leid! Das ist nicht das Serviceniveau, das Sie verdienen!', 'Im Namen des Teams entschuldige ich mich aufrichtig. Das hätte nicht passieren dürfen!', 'Es tut uns wirklich leid für diese großen Probleme. Das ist unsere Schuld!'],
      solution: ['Geben Sie uns eine Chance, es wieder gutzumachen! Ich persönlich kümmere mich um Ihren Fall!\n1️⃣ Sofortige Prioritätsbehandlung\n2️⃣ Ständige Updates\n3️⃣ Zufriedenstellende Lösung garantiert', 'Ich verspreche, Sie nicht wieder zu enttäuschen! Nennen Sie mir die Details, und ich kümmere mich sofort.'],
    },
    severe: {
      empathy: ['😔 Ihr Ärger ist 100% berechtigt! Jeder wäre in Ihrer Situation völlig wütend! Ich verstehe das tief.', 'Diese Erfahrung ist völlig inakzeptabel. Sie haben jedes Recht, wütend zu sein!', 'Ich spüre Ihren Ärger. Das ist ein extrem schwerwiegender Fehler. Ihre Wut ist vollkommen berechtigt!'],
      apology: ['Im Namen des gesamten Teams spreche ich unsere aufrichtigste und tiefste Entschuldigung aus! Sie hätten niemals so behandelt werden dürfen!', 'Es tut uns unsagbar leid! Das ist nicht nur ein Fehler — das ist eine schwere Pflichtverletzung, und wir übernehmen die volle Verantwortung!', 'Es tut mir wirklich, zutiefst leid! Das ist vollkommen inakzeptabel, und wir übernehmen die volle Verantwortung ohne Ausreden!'],
      solution: ['Ich behandle Ihren Fall mit absolut höchster Priorität, und ich sorge dafür, dass so etwas nie wieder passiert!\n\n📌 Sofortige Maßnahmen:\n1️⃣ Dedizierter VIP-Kanal — keine Warteschlangen\n2️⃣ Persönliche Betreuung durch einen Senior Manager\n3️⃣ Volle Entschädigung + zusätzliches Entgelt\n4️⃣ Klare Lösung innerhalb von 24 Stunden\n\nSagen Sie mir alles — ich handle JETZT!', 'Seien Sie versichert, ich habe das als TOP-NOTFALL markiert!\n\n🔥 Notfall-Lösungsplan:\n• Sofortige Eskalation an die Geschäftsleitung\n• Volle Rückerstattung/Ersatz + zusätzliche Entschädigung\n• Alle damit verbundenen Kosten gehen auf uns\n• Dedizierter Agent mit Echtzeit-Updates innerhalb von 24 Stunden\n\nDas ist mein persönliches Versprechen. Teilen Sie mir alle Details mit!'],
    },
  },
  es: {
    mild: {
      empathy: ['Entiendo cómo se siente. Es molesto.', 'Sus preocupaciones son comprensibles.', 'Lamento las molestias.'],
      apology: ['Estamos sinceramente apenados por las molestias.', 'Lamento no estar a la altura de sus expectativas.', 'Lamentamos esta experiencia.'],
      solution: ['No se preocupe, me encargaré inmediatamente. ¿Puede darme detalles?', 'Resolvamos esto juntos — dígame los detalles.'],
    },
    moderate: {
      empathy: ['¡Entiendo perfectamente su frustración! ¡Yo también estaría enfadado en su lugar!', 'Esta experiencia es inaceptable. Su enfado está justificado.', 'Entiendo su malestar. ¡Cualquiera estaría furioso!'],
      apology: ['¡Estamos profundamente apenados! ¡Este no es el nivel de servicio que se merece!', 'En nombre del equipo, pido sinceras disculpas. ¡Esto no debería haber pasado!', '¡Estamos realmente apenados por este gran problema! ¡Es nuestra culpa!'],
      solution: ['¡Déjenos una oportunidad para enmendarlo! ¡Personalmente me encargaré de su caso!\n1️⃣ Trato prioritario inmediato\n2️⃣ Actualizaciones constantes\n3️⃣ Resolución satisfactoria garantizada', '¡Prometo no volver a defraudarle! ¡Deme los detalles y actuaré inmediatamente!'],
    },
    severe: {
      empathy: ['😔 ¡Su enfado está 100% justificado! ¡Cualquiera estaría furioso en su situación! Siento profundamente su frustración.', '¡Esta experiencia es totalmente inaceptable! ¡Tiene todo el derecho a estar enfadado!', '¡Siento profundamente su enfado! Esto es un fallo extremadamente grave. ¡Su furia está completamente justificada!'],
      apology: ['¡En nombre de todo el equipo, ofrezco nuestras más sinceras y profundas disculpas! ¡Nunca debería haber sido tratado así!', '¡Estamos infinitamente apenados! Esto no es solo un error — es un grave incumplimiento de nuestra parte, ¡y asumimos toda la responsabilidad!', '¡Estoy realmente, profundamente apenado! ¡Esto es totalmente inaceptable, y asumimos toda la responsabilidad sin excusas!'],
      solution: ['¡Trato su caso con la máxima prioridad absoluta, y me aseguraré de que esto nunca vuelva a pasar!\n\n📌 Medidas inmediatas:\n1️⃣ Canal VIP dedicado — sin colas\n2️⃣ Responsable senior dedicado 1 a 1\n3️⃣ Compensación completa + gesto adicional\n4️⃣ Resolución clara en 24 horas\n\n¡Dígame todo — ¡actúo AHORA!', '¡No se preocupe, he marcado esto como EMERGENCIA MÁXIMA!\n\n🔥 Plan de resolución de emergencia:\n• Escalado inmediato a dirección\n• Reembolso/sustitución completa + compensación extra\n• Todos los gastos corren por nuestra cuenta\n• Agente dedicado con actualizaciones en tiempo real en 24 horas\n\nEste es mi compromiso personal. ¡Comparta todos los detalles!'],
    },
  },
};

function buildComfortPrefix(level: EmotionLevel, language: Language): string {
  const templates = comfortTemplates[language]?.[level];
  if (!templates) return '';

  const empathy = templates.empathy[Math.floor(Math.random() * templates.empathy.length)];
  const apology = templates.apology[Math.floor(Math.random() * templates.apology.length)];
  const solution = templates.solution[Math.floor(Math.random() * templates.solution.length)];

  return `${empathy}\n\n${apology}\n\n${solution}`;
}

export function generateReply(
  intent: IntentType,
  language: Language,
  emotion: EmotionState,
  userText?: string,
  comfortLevel?: EmotionLevel
): string {
  const emotionKey: EmotionState = emotion;
  const templates = replyTemplates[language]?.[emotionKey]?.[intent];

  if (!templates || templates.length === 0) {
    const fallback = replyTemplates[language]?.calm?.unknown || ['I do not understand.'];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  let reply = templates[Math.floor(Math.random() * templates.length)];

  if (comfortLevel && emotion !== 'calm') {
    const comfortPrefix = buildComfortPrefix(comfortLevel, language);
    if (comfortPrefix) {
      reply = `${comfortPrefix}\n\n---\n\n${reply}`;
    }
  }

  if (userText) {
    const technicalTerms = extractTechnicalTerms(userText);
    const relevantTerms = technicalTerms.filter((t) => t.length >= 2).slice(0, 6);

    if (relevantTerms.length > 0) {
      const termLabels: Record<Language, { prefix: string; suffix: string }> = {
        zh: { prefix: '\n\n📋 已识别到您提到的关键信息：', suffix: '' },
        en: { prefix: '\n\n📋 Key items mentioned in your message:', suffix: '' },
        ja: { prefix: '\n\n📋 お問い合わせ内容で認識したキーワード：', suffix: '' },
        ko: { prefix: '\n\n📋 말씀하신 내용에서 확인된 키워드：', suffix: '' },
        fr: { prefix: '\n\n📋 Éléments clés mentionnés dans votre message :', suffix: '' },
        de: { prefix: '\n\n📋 Schlüsselbegriffe in Ihrer Nachricht:', suffix: '' },
        es: { prefix: '\n\n📋 Palabras clave mencionadas en su mensaje:', suffix: '' },
      };
      const labels = termLabels[language];
      const termStr = relevantTerms.map((t) => `\`${t}\``).join(' · ');
      reply = `${reply}${labels.prefix} ${termStr}${labels.suffix}`;
    }

    if (intent === 'unknown' && emotion !== 'calm') {
      const maxLen = 80;
      const preview =
        userText.length > maxLen ? userText.slice(0, maxLen) + '...' : userText;
      reply = reply + `\n\n「${preview}」`;
    }
  }

  return reply;
}

export function getQuickQuestions(language: Language): { label: string; intent: IntentType }[] {
  const qq: Record<Language, { label: string; intent: IntentType }[]> = {
    zh: [
      { label: '📦 查询物流信息', intent: 'shipping' },
      { label: '💳 申请退款退货', intent: 'refund' },
      { label: '🛠️ 售后服务支持', intent: 'after_sales' },
      { label: '⚠️ 投诉与反馈', intent: 'complaint' },
      { label: 'ℹ️ 产品规格咨询', intent: 'product_info' },
      { label: '👤 账户相关问题', intent: 'account' },
      { label: '👨‍💼 转人工客服', intent: 'human_request' },
    ],
    en: [
      { label: '📦 Check my order', intent: 'shipping' },
      { label: '💳 Refund / Return', intent: 'refund' },
      { label: '🛠️ After-sales support', intent: 'after_sales' },
      { label: '⚠️ File a complaint', intent: 'complaint' },
      { label: 'ℹ️ Product info', intent: 'product_info' },
      { label: '👤 Account issues', intent: 'account' },
      { label: '👨‍💼 Talk to human', intent: 'human_request' },
    ],
    ja: [
      { label: '📦 配送状況を確認', intent: 'shipping' },
      { label: '💳 返品・返金', intent: 'refund' },
      { label: '🛠️ アフターサービス', intent: 'after_sales' },
      { label: '⚠️ 苦情を申し立てる', intent: 'complaint' },
      { label: 'ℹ️ 製品情報', intent: 'product_info' },
      { label: '👤 アカウント', intent: 'account' },
      { label: '👨‍💼 オペレーターに接続', intent: 'human_request' },
    ],
    ko: [
      { label: '📦 배송 조회', intent: 'shipping' },
      { label: '💳 환불/반품', intent: 'refund' },
      { label: '🛠️ A/S 지원', intent: 'after_sales' },
      { label: '⚠️ 불만 접수', intent: 'complaint' },
      { label: 'ℹ️ 제품 문의', intent: 'product_info' },
      { label: '👤 계정 문제', intent: 'account' },
      { label: '👨‍💼 상담원 연결', intent: 'human_request' },
    ],
    fr: [
      { label: '📦 Suivre ma commande', intent: 'shipping' },
      { label: '💳 Remboursement / Retour', intent: 'refund' },
      { label: '🛠️ Service après-vente', intent: 'after_sales' },
      { label: '⚠️ Déposer une réclamation', intent: 'complaint' },
      { label: 'ℹ️ Infos produit', intent: 'product_info' },
      { label: '👤 Problème de compte', intent: 'account' },
      { label: '👨‍💼 Parler à un agent', intent: 'human_request' },
    ],
    de: [
      { label: '📦 Bestellung verfolgen', intent: 'shipping' },
      { label: '💳 Rückerstattung / Rückgabe', intent: 'refund' },
      { label: '🛠️ Kundendienst', intent: 'after_sales' },
      { label: '⚠️ Beschwerde einreichen', intent: 'complaint' },
      { label: 'ℹ️ Produktinfo', intent: 'product_info' },
      { label: '👤 Kontoproblem', intent: 'account' },
      { label: '👨‍💼 Mitarbeiter sprechen', intent: 'human_request' },
    ],
    es: [
      { label: '📦 Seguir mi pedido', intent: 'shipping' },
      { label: '💳 Reembolso / Devolución', intent: 'refund' },
      { label: '🛠️ Servicio postventa', intent: 'after_sales' },
      { label: '⚠️ Presentar una queja', intent: 'complaint' },
      { label: 'ℹ️ Info del producto', intent: 'product_info' },
      { label: '👤 Problema de cuenta', intent: 'account' },
      { label: '👨‍💼 Hablar con un agente', intent: 'human_request' },
    ],
  };
  return qq[language];
}
