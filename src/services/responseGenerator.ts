import { IntentType, Language, EmotionState } from '../types';

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
};

export function generateReply(
  intent: IntentType,
  language: Language,
  emotion: EmotionState,
  userText?: string
): string {
  const emotionKey: EmotionState = emotion;
  const templates = replyTemplates[language]?.[emotionKey]?.[intent];

  if (!templates || templates.length === 0) {
    const fallback = replyTemplates[language]?.calm?.unknown || ['I do not understand.'];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  let reply = templates[Math.floor(Math.random() * templates.length)];

  if (userText && intent === 'unknown' && emotion !== 'calm') {
    const maxLen = 80;
    const preview =
      userText.length > maxLen ? userText.slice(0, maxLen) + '...' : userText;
    reply = reply + `\n\n「${preview}」`;
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
  };
  return qq[language];
}
