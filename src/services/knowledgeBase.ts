import {
  Language,
  IntentType,
  KnowledgeBaseEntry,
  KnowledgeBaseCategory,
  KnowledgeSearchResult,
  KnowledgeSearchResponse,
} from '../types';
import { classifyIntent } from './intentClassifier';

const CONFIDENCE_THRESHOLD = 0.55;
const HIGH_CONFIDENCE_THRESHOLD = 0.75;
const MAX_RESULTS = 3;

const knowledgeBase: KnowledgeBaseEntry[] = [
  {
    id: 'KB-001',
    category: 'faq',
    title: {
      zh: '退款退货政策',
      en: 'Refund and Return Policy',
      ja: '返品・返金ポリシー',
      ko: '환불 및 반품 정책',
      fr: 'Politique de remboursement et de retour',
      de: 'Rückerstattungs- und Rückgaberecht',
      es: 'Política de reembolso y devolución',
    },
    content: {
      zh: '【退款退货政策】\n\n✅ 7天无理由退换货：商品签收后7天内，商品完好不影响二次销售可申请无理由退换\n✅ 12个月全国联保：自签收日起12个月内出现质量问题，享受免费维修服务\n✅ 质量问题保障：确认属质量问题的，我们承担往返运费，并提供换新或全额退款\n✅ 退款时效：审核通过后1-3个工作日内原路退回，到账时间视银行而定（1-7天）\n\n申请流程：\n1. 进入「我的订单」选择对应订单\n2. 点击「申请售后」并选择退款/退货\n3. 填写原因并上传凭证（如有）\n4. 等待审核（1-3个工作日）',
      en: '【Refund and Return Policy】\n\n✅ 7-Day Hassle-Free Return: Within 7 days after delivery, items in original condition can be returned\n✅ 12-Month Nationwide Warranty: Free repair service for quality issues within 12 months of delivery\n✅ Quality Issue Guarantee: We cover round-trip shipping for confirmed quality issues, with replacement or full refund options\n✅ Refund Timeline: Refund processed within 1-3 business days after approval, received via original payment method (1-7 days depending on bank)\n\nProcess:\n1. Go to "My Orders" and select the order\n2. Click "Request After-Sales" and choose refund/return\n3. Fill in reason and upload evidence (if any)\n4. Wait for review (1-3 business days)',
      ja: '【返品・返金ポリシー】\n\n✅ 7日間無条件返品：商品到着後7日以内、状態が良好で二次販売に影響がない場合は返品可能\n✅ 12ヶ月メーカー保証：到着後12ヶ月以内に品質問題が発生した場合、無料修理サービスを提供\n✅ 品質問題保証：品質問題と確認された場合、往復送料を当社負担とし、交換または全額返金を提供\n✅ 返金期間：承認後1-3営業日以内にお支払い方法へ返金、銀行により1-7日かかる場合あり\n\n手続き：\n1. 「マイオーダー」から対象の注文を選択\n2. 「アフターサービスを申請」をクリックし、返金・返品を選択\n3. 理由を記入し証拠をアップロード（あれば）\n4. 審査を待つ（1-3営業日）',
      ko: '【환불 및 반품 정책】\n\n✅ 7일 무조건 반품: 상품 수령 후 7일 이내, 상태가 양호하면 반품 가능\n✅ 12개월 전국 보증: 수령 후 12개월 이내 품질 문제 발생 시 무료 수리 서비스\n✅ 품질 문제 보장: 품질 문제 확인 시 왕복 배송비는 당사 부담, 교환 또는 전액 환불\n✅ 환불 기간: 승인 후 1-3영업일 이내 원래 결제 수단으로 환불, 은행에 따라 1-7일 소요\n\n절차:\n1. 「내 주문」에서 해당 주문 선택\n2. 「A/S 신청」 클릭 후 환불/반품 선택\n3. 사유 작성 및 증빙 자료 업로드 (있는 경우)\n4. 심사 대기 (1-3영업일)',
      fr: '【Politique de remboursement et de retour】\n\n✅ Retour sans motif sous 7 jours : Retour possible dans les 7 jours suivant la réception, si le produit est intact\n✅ Garantie nationale de 12 mois : Service de réparation gratuit pour les défauts de qualité\n✅ Garantie sur les défauts : Nous prenons en charge les frais de port pour les défauts confirmés, avec remplacement ou remboursement complet\n✅ Délai de remboursement : Traitement sous 1-3 jours ouvrés après approbation, retour via le mode de paiement initial (1-7 jours selon la banque)\n\nProcédure :\n1. Aller dans "Mes commandes" et sélectionner la commande\n2. Cliquer sur "Demander un SAV" et choisir remboursement/retour\n3. Remplir le motif et télécharger des preuves (si nécessaire)\n4. Attendre la validation (1-3 jours ouvrés)',
      de: '【Rückerstattungs- und Rückgaberecht】\n\n✅ 7-Tage Rückgaberecht ohne Angabe von Gründen: Innerhalb von 7 Tagen nach Lieferung bei einwandfreiem Zustand\n✅ 12-monatige Garantie: Kostenloser Reparaturservice bei Qualitätsproblemen innerhalb von 12 Monaten\n✅ Qualitätsgarantie: Bei bestätigten Qualitätsproblemen übernehmen wir die Versandkosten, bieten Austausch oder volle Rückerstattung\n✅ Rückerstattungszeitraum: Bearbeitung innerhalb von 1-3 Werktagen nach Genehmigung, Rückgabe über ursprüngliche Zahlungsmethode (1-7 Tage je nach Bank)\n\nVorgehensweise:\n1. Gehen Sie zu "Meine Bestellungen" und wählen Sie die Bestellung\n2. Klicken Sie auf "Kundenservice anfordern" und wählen Sie Rückerstattung/Rückgabe\n3. Grund angeben und Beweise hochladen (falls vorhanden)\n4. Auf Prüfung warten (1-3 Werktage)',
      es: '【Política de reembolso y devolución】\n\n✅ Devolución sin motivo en 7 días: Dentro de 7 días tras la recepción, si el producto está en perfecto estado\n✅ Garantía nacional de 12 meses: Servicio de reparación gratuito por problemas de calidad\n✅ Garantía de calidad: Si se confirma un problema de calidad, cubrimos los gastos de envío, con cambio o reembolso completo\n✅ Plazo de reembolso: Procesado en 1-3 días laborables tras la aprobación, a través del método de pago original (1-7 días según el banco)\n\nProcedimiento:\n1. Ir a "Mis pedidos" y seleccionar el pedido\n2. Hacer clic en "Solicitar postventa" y elegir reembolso/devolución\n3. Rellenar el motivo y subir pruebas (si las hay)\n4. Esperar la revisión (1-3 días laborables)',
    },
    keywords: {
      zh: ['退款', '退货', '退钱', '退单', '取消订单', '7天', '无理由', '质保', '保修', '售后政策'],
      en: ['refund', 'return', 'money back', 'cancel order', '7 day', 'warranty', 'policy', 'reimburse'],
      ja: ['返金', '返品', 'キャンセル', '7日', '保証', 'ポリシー', '返却'],
      ko: ['환불', '반품', '취소', '7일', '보증', '정책'],
      fr: ['remboursement', 'retour', 'annuler', '7 jours', 'garantie', 'politique'],
      de: ['Rückerstattung', 'Rückgabe', 'stornieren', '7 Tage', 'Garantie', 'Richtlinie'],
      es: ['reembolso', 'devolución', 'cancelar', '7 días', 'garantía', 'política'],
    },
    tags: ['refund', 'return', 'policy', 'after_sales'],
    intents: ['refund', 'after_sales', 'consultation'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-002',
    category: 'faq',
    title: {
      zh: '物流配送查询',
      en: 'Shipping and Delivery Tracking',
      ja: '配送・物流の追跡',
      ko: '배송 및 물류 조회',
      fr: 'Suivi de livraison et expédition',
      de: 'Versand- und Lieferverfolgung',
      es: 'Seguimiento de envío y entrega',
    },
    content: {
      zh: '【物流配送说明】\n\n⏱️ 发货时效：\n• 下单后48小时内发出（工作日）\n• 预售商品以页面标注时间为准\n\n🚚 配送时效：\n• 普通快递：3-5个工作日\n• 顺丰速运：1-2个工作日\n• 偏远地区：5-7个工作日\n\n📦 物流查询：\n1. 进入「我的订单」- 选择订单\n2. 点击「查看物流」查看实时追踪\n3. 如有异常可联系客服介入处理\n\n❓ 常见问题：\n• 显示签收但未收到：请先联系小区门卫/物业/驿站，如仍未找到联系客服发起查件\n• 物流长时间不更新：超过3天未更新可联系客服催件\n• 需要改地址：发货前可联系客服修改，发货后需联系快递网点',
      en: '【Shipping and Delivery Information】\n\n⏱️ Processing Time:\n• Ships within 48 hours after ordering (business days)\n• Pre-order items: as indicated on the product page\n\n🚚 Delivery Time:\n• Standard shipping: 3-5 business days\n• Express shipping: 1-2 business days\n• Remote areas: 5-7 business days\n\n📦 Tracking Your Order:\n1. Go to "My Orders" - select your order\n2. Click "Track Package" for real-time updates\n3. Contact support for any anomalies\n\n❓ Common Issues:\n• Shows delivered but not received: Check with doorman/concierge/parcel station first, then contact us if still missing\n• No tracking update for 3+ days: Contact us to follow up with the courier\n• Address change: Contact us before shipping; after shipping, contact the courier directly',
      ja: '【配送・物流について】\n\n⏱️ 発送時間：\n• 注文後48時間以内に発送（営業日）\n• 予約商品：ページ記載の通り\n\n🚚 配達時間：\n• 通常配送：3-5営業日\n• 速達：1-2営業日\n• 遠隔地：5-7営業日\n\n📦 追跡方法：\n1. 「マイオーダー」から対象注文を選択\n2. 「配送状況を確認」でリアルタイム追跡\n3. 異常があればカスタマーサポートへ\n\n❓ よくある問題：\n• 配達完了表示だが届いていない：まず管理人・宅配ボックスを確認、それでもなければお問い合わせを\n• 3日以上追跡情報が更新されない：お問い合わせください\n• 住所変更：発送前は可能、発送後は配送業者へ直接連絡',
      ko: '【배송 및 물류 안내】\n\n⏱️ 출고 시간:\n• 주문 후 48시간 이내 출고 (영업일 기준)\n• 예약 상품: 페이지 표기 기준\n\n🚚 배송 시간:\n• 일반 배송: 3-5영업일\n• 고속 배송: 1-2영업일\n• 도서 산간 지역: 5-7영업일\n\n📦 배송 조회 방법:\n1. 「내 주문」 - 해당 주문 선택\n2. 「배송 조회」 클릭하여 실시간 추적\n3. 이상이 있으면 고객센터로 문의\n\n❓ 자주 묻는 질문:\n• 배송 완료 표시인데 받지 못함: 경비실/택배함 확인 후 여전히 없으면 문의\n• 3일 이상 배송 정보 업데이트 안 됨: 문의해 주세요\n• 주소 변경: 출고 전은 가능, 출고 후는 택배사에 직접 연락',
      fr: '【Informations sur la livraison】\n\n⏱️ Délai de préparation :\n• Expédition sous 48h après commande (jours ouvrés)\n• Articles en précommande : comme indiqué sur la page\n\n🚚 Délais de livraison :\n• Standard : 3-5 jours ouvrés\n• Express : 1-2 jours ouvrés\n• Zones éloignées : 5-7 jours ouvrés\n\n📦 Suivi de commande :\n1. Aller dans "Mes commandes" - sélectionner la commande\n2. Cliquer sur "Suivre le colis" pour la mise à jour en temps réel\n3. Contacter le support en cas d\'anomalie\n\n❓ Problèmes courants :\n• Livré mais non reçu : Vérifier d\'abord avec le concierge/le point relais, puis nous contacter\n• Aucune mise à jour depuis 3+ jours : Nous contacter pour relancer le transporteur\n• Changement d\'adresse : Possible avant expédition ; après, contacter directement le transporteur',
      de: '【Versand- und Lieferinformationen】\n\n⏱️ Bearbeitungszeit:\n• Versand innerhalb von 48 Stunden nach Bestellung (Werktage)\n• Vorbestellungen: wie auf der Produktseite angegeben\n\n🚚 Lieferzeiten:\n• Standardversand: 3-5 Werktage\n• Expressversand: 1-2 Werktage\n• Abgelegenere Gebiete: 5-7 Werktage\n\n📦 Sendungsverfolgung:\n1. Gehen Sie zu "Meine Bestellungen" - wählen Sie die Bestellung\n2. Klicken Sie auf "Sendung verfolgen" für Echtzeit-Updates\n3. Bei Auffälligkeiten Support kontaktieren\n\n❓ Häufige Probleme:\n• Zugestellt, aber nicht erhalten: Zuerst beim Hausmeister/Abholstation nachfragen, dann uns kontaktieren\n• Kein Tracking-Update seit 3+ Tagen: Kontaktieren Sie uns, wir verfolgen das beim Versanddienst\n• Adressänderung: Vor Versand möglich; nach Versand direkt den Versanddienst kontaktieren',
      es: '【Información de envío y entrega】\n\n⏱️ Tiempo de preparación:\n• Envío en 48h tras el pedido (días laborables)\n• Artículos en preventa: como se indica en la página\n\n🚚 Plazos de entrega:\n• Estándar: 3-5 días laborables\n• Exprés: 1-2 días laborables\n• Zonas remotas: 5-7 días laborables\n\n📦 Seguimiento del pedido:\n1. Ir a "Mis pedidos" - seleccionar el pedido\n2. Hacer clic en "Seguir envío" para actualizaciones en tiempo real\n3. Contactar con soporte ante cualquier anomalía\n\n❓ Problemas comunes:\n• Entregado pero no recibido: Comprobar primero con conserje/punto de recogida, luego contactarnos\n• Sin actualización en 3+ días: Contactarnos para seguimiento con el transportista\n• Cambio de dirección: Posible antes del envío; tras el envío, contactar directamente al transportista',
    },
    keywords: {
      zh: ['物流', '快递', '发货', '配送', '送货', '什么时候到', '没收到', '包裹', '单号', '追踪', '查件', '催件'],
      en: ['shipping', 'delivery', 'package', 'tracking', 'track', 'shipment', 'deliver', 'when arrive', 'where is my order', 'logistics', 'parcel'],
      ja: ['配送', '出荷', '物流', '荷物', '追跡', 'いつ届く', '到着', '送料'],
      ko: ['배송', '출고', '물류', '택배', '추적', '언제 와', '도착'],
      fr: ['livraison', 'expédition', 'colis', 'suivi', 'traquer', 'quand arrive', 'où est ma commande'],
      de: ['Versand', 'Lieferung', 'Paket', 'Verfolgung', 'verfolgen', 'wann kommt', 'wo ist meine Bestellung'],
      es: ['envío', 'entrega', 'paquete', 'seguimiento', 'rastrear', 'cuándo llega', 'dónde está mi pedido'],
    },
    tags: ['shipping', 'delivery', 'logistics', 'tracking'],
    intents: ['shipping', 'consultation'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-003',
    category: 'product_doc',
    title: {
      zh: '产品保修与售后服务',
      en: 'Product Warranty and After-Sales Service',
      ja: '製品保証とアフターサービス',
      ko: '제품 보증 및 A/S 서비스',
      fr: 'Garantie produit et service après-vente',
      de: 'Produktgarantie und Kundendienst',
      es: 'Garantía de producto y servicio postventa',
    },
    content: {
      zh: '【产品保修与售后服务】\n\n🛡️ 保修范围：\n• 全国联保12个月，自签收日起算\n• 保修范围涵盖非人为造成的质量问题\n• 外观损坏、人为损坏、不可抗力损坏不在保修范围\n\n🔧 售后流程：\n1. 联系在线客服，描述故障现象\n2. 提供订单号和故障照片/视频\n3. 客服判定问题类型（质量问题/人为损坏）\n4. 提供解决方案（维修/换新/退款）\n5. 寄回商品或安排上门取件\n\n💰 费用说明：\n• 质量问题：往返运费+维修费用全免\n• 非质量问题：买家承担寄回运费，维修按实际收费\n• 7天无理由退换：买家承担寄回运费（质量问题除外）\n\n⏰ 处理时效：\n• 收到商品后24小时内检测\n• 维修：3-5个工作日完成\n• 换新/退款：检测确认后1-3个工作日处理',
      en: '【Product Warranty and After-Sales Service】\n\n🛡️ Warranty Coverage:\n• 12-month nationwide warranty from delivery date\n• Covers non-human-caused quality issues\n• Excludes: cosmetic damage, human-caused damage, force majeure damage\n\n🔧 Service Process:\n1. Contact online support, describe the fault\n2. Provide order number and fault photos/videos\n3. Support determines issue type (quality/human damage)\n4. Solution provided (repair/replacement/refund)\n5. Send back item or arrange door-to-door pickup\n\n💰 Fee Structure:\n• Quality issues: Round-trip shipping + repair = FREE\n• Non-quality issues: Buyer pays return shipping, repair fees apply\n• 7-Day hassle-free return: Buyer pays return shipping (except quality issues)\n\n⏰ Processing Time:\n• Inspection within 24 hours of receiving item\n• Repair: 3-5 business days\n• Replacement/refund: 1-3 business days after inspection confirmation',
      ja: '【製品保証とアフターサービス】\n\n🛡️ 保証範囲：\n• 到着日から12ヶ月間、全国保証\n• 人為的でない品質問題を対象\n• 外観損傷・人為的損傷・不可抗力による損傷は対象外\n\n🔧 サービス手続き：\n1. オンラインサポートに連絡し、不具合を説明\n2. 注文番号と不具合の写真・動画を提供\n3. 問題の種類を判定（品質問題/人為的損傷）\n4. 解決策を提案（修理/交換/返金）\n5. 商品を返送または集荷手配\n\n💰 料金体系：\n• 品質問題：往復送料＋修理料金＝無料\n• 品質問題以外：返送料は購入者負担、修理料金は実費\n• 7日間無条件返品：返送料は購入者負担（品質問題を除く）\n\n⏰ 処理時間：\n• 商品到着後24時間以内に検品\n• 修理：3-5営業日\n• 交換・返金：検品確認後1-3営業日',
      ko: '【제품 보증 및 A/S 서비스】\n\n🛡️ 보증 범위:\n• 수령일로부터 12개월 전국 보증\n• 인위적이지 않은 품질 문제 대상\n• 외관 손상, 인위적 손상, 천재지변으로 인한 손상은 제외\n\n🔧 서비스 절차:\n1. 온라인 고객센터에 연락하여 고장 현상 설명\n2. 주문 번호와 고장 사진/동영상 제공\n3. 문제 유형 판정 (품질 문제/인위적 손상)\n4. 해결 방안 제공 (수리/교환/환불)\n5. 제품 반송 또는 방문 수거 예약\n\n💰 비용 안내:\n• 품질 문제: 왕복 배송비 + 수리비 = 무료\n• 품질 문제 외: 반송 배송비는 구매자 부담, 수리비는 실비\n• 7일 무조건 반품: 반송 배송비는 구매자 부담 (품질 문제 제외)\n\n⏰ 처리 시간:\n• 제품 수령 후 24시간 이내 검사\n• 수리: 3-5영업일\n• 교환/환불: 검사 확인 후 1-3영업일',
      fr: '【Garantie produit et service après-vente】\n\n🛡️ Couverture de la garantie :\n• Garantie nationale de 12 mois à compter de la réception\n• Couvre les défauts de qualité non causés par l\'homme\n• Exclut : dommages esthétiques, dommages causés par l\'homme, cas de force majeure\n\n🔧 Procédure de SAV :\n1. Contacter le support en ligne, décrire la panne\n2. Fournir le numéro de commande et des photos/vidéos\n3. Le support détermine le type de problème (défaut/dommage causé par l\'homme)\n4. Solution proposée (réparation/remplacement/remboursement)\n5. Retourner l\'article ou organiser un enlèvement à domicile\n\n💰 Tarifs :\n• Défaut de qualité : Port aller-retour + réparation = GRATUIT\n• Hors défaut de qualité : L\'acheteur paie le retour, réparation selon tarif\n• Retour sans motif sous 7 jours : L\'acheteur paie le retour (hors défaut de qualité)\n\n⏰ Délais de traitement :\n• Inspection sous 24h après réception\n• Réparation : 3-5 jours ouvrés\n• Remplacement/remboursement : 1-3 jours ouvrés après confirmation',
      de: '【Produktgarantie und Kundendienst】\n\n🛡️ Garantieumfang:\n• 12-monatige landesweite Garantie ab Lieferdatum\n• Deckt nicht-menschlich verursachte Qualitätsprobleme ab\n• Ausgeschlossen: Kosmetische Schäden, menschlich verursachte Schäden, höhere Gewalt\n\n🔧 Serviceablauf:\n1. Online-Support kontaktieren, Fehler beschreiben\n2. Bestellnummer und Fehlerfotos/videos bereitstellen\n3. Support bestimmt Problemtyp (Qualität/menschlicher Schaden)\n4. Lösung wird angeboten (Reparatur/Austausch/Rückerstattung)\n5. Artikel zurücksenden oder Abholung arrangieren\n\n💰 Gebühren:\n• Qualitätsprobleme: Hin- und Rückversand + Reparatur = KOSTENLOS\n• Keine Qualitätsprobleme: Käufer zahlt Rückversand, Reparatur nach Tarif\n• 7-Tage Rückgaberecht: Käufer zahlt Rückversand (außer bei Qualitätsproblemen)\n\n⏰ Bearbeitungszeit:\n• Prüfung innerhalb von 24 Stunden nach Warenerhalt\n• Reparatur: 3-5 Werktage\n• Austausch/Rückerstattung: 1-3 Werktage nach Prüfungsbestätigung',
      es: '【Garantía de producto y servicio postventa】\n\n🛡️ Cobertura de la garantía:\n• Garantía nacional de 12 meses desde la recepción\n• Cubre defectos de calidad no causados por el usuario\n• Excluye: daños estéticos, daños causados por el usuario, fuerza mayor\n\n🔧 Procedimiento de servicio:\n1. Contactar con soporte online, describir la avería\n2. Facilitar número de pedido y fotos/videos de la avería\n3. El soporte determina el tipo de problema (defecto/daño por el usuario)\n4. Se ofrece una solución (reparación/cambio/reembolso)\n5. Devolver el artículo o concertar una recogida a domicilio\n\n💰 Tarifas:\n• Defectos de calidad: Envío de ida y vuelta + reparación = GRATIS\n• Sin defectos de calidad: El comprador paga el envío de devolución, reparación con tarifa\n• Devolución sin motivo en 7 días: El comprador paga el envío de devolución (excepto defectos)\n\n⏰ Plazos de tratamiento:\n• Inspección en 24h tras recibir el artículo\n• Reparación: 3-5 días laborables\n• Cambio/reembolso: 1-3 días laborables tras confirmación de inspección',
    },
    keywords: {
      zh: ['保修', '售后', '维修', '坏了', '故障', '不能用', '无法使用', '出问题', '质量问题', '质保', '联保', '取件', '换新'],
      en: ['warranty', 'repair', 'broken', 'not working', 'fault', 'issue', 'malfunction', 'after sales', 'customer service', 'support', 'defective', 'replacement'],
      ja: ['保証', '修理', '故障', '壊れた', '動かない', '不具合', 'アフターサービス', 'サポート', '不良', '交換'],
      ko: ['보증', '수리', '고장', '안 돼', '작동 안 해', '불량', 'A/S', '지원', '교환'],
      fr: ['garantie', 'réparation', 'cassé', 'ne marche pas', 'panne', 'défaut', 'SAV', 'support', 'défectueux', 'remplacement'],
      de: ['Garantie', 'Reparatur', 'kaputt', 'funktioniert nicht', 'Fehler', 'Störung', 'Kundendienst', 'defekt', 'Austausch'],
      es: ['garantía', 'reparación', 'roto', 'no funciona', 'avería', 'defecto', 'postventa', 'soporte', 'defectuoso', 'cambio'],
    },
    tags: ['warranty', 'after_sales', 'repair', 'service'],
    intents: ['after_sales', 'refund', 'complaint', 'consultation'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-004',
    category: 'product_doc',
    title: {
      zh: '账户安全与密码管理',
      en: 'Account Security and Password Management',
      ja: 'アカウントの安全とパスワード管理',
      ko: '계정 보안 및 비밀번호 관리',
      fr: 'Sécurité du compte et gestion du mot de passe',
      de: 'Kontosicherheit und Passwortverwaltung',
      es: 'Seguridad de la cuenta y gestión de contraseñas',
    },
    content: {
      zh: '【账户安全与密码管理】\n\n🔐 密码重置：\n1. 登录页点击「忘记密码」\n2. 输入注册手机号/邮箱\n3. 获取验证码（短信/邮件）\n4. 设置新密码（8-20位，含大小写字母和数字）\n\n🔗 第三方账号绑定：\n• 支持绑定：微信、QQ、微博、Apple ID、Google\n• 绑定路径：个人中心 → 设置 → 账号与安全 → 第三方账号绑定\n• 每个第三方账号只能绑定一个平台账号\n\n🛡️ 安全建议：\n• 定期更换密码（建议每3个月）\n• 不要在多个平台使用相同密码\n• 开启登录保护：新设备登录需验证码\n• 注意钓鱼网站，只在官方域名操作\n• 如发现异常登录，立即修改密码并联系客服\n\n❓ 常见问题：\n• 收不到验证码：请检查短信拦截/垃圾邮件箱，或等待60秒重试\n• 手机号已停用：需联系人工客服，提供身份验证材料换绑\n• 账号被锁定：连续输错密码5次将锁定30分钟，可等自动解锁或联系客服',
      en: '【Account Security and Password Management】\n\n🔐 Password Reset:\n1. Click "Forgot Password" on login page\n2. Enter registered phone number/email\n3. Receive verification code (SMS/email)\n4. Set new password (8-20 chars, with uppercase, lowercase, and numbers)\n\n🔗 Third-Party Account Linking:\n• Supported: WeChat, QQ, Weibo, Apple ID, Google\n• Path: Profile → Settings → Account & Security → Third-Party Linking\n• Each third-party account can only link to one platform account\n\n🛡️ Security Tips:\n• Change passwords regularly (every 3 months recommended)\n• Do not reuse passwords across multiple platforms\n• Enable login protection: verification required for new devices\n• Beware of phishing sites — only operate on official domains\n• If suspicious login detected — change password and contact support immediately\n\n❓ Common Issues:\n• No verification code: Check SMS spam/junk mail folder, or wait 60 seconds to retry\n• Phone number deactivated: Contact human support with ID verification materials to change binding\n• Account locked: 5 wrong password attempts locks for 30 minutes; wait for auto-unlock or contact support',
      ja: '【アカウントの安全とパスワード管理】\n\n🔐 パスワードリセット：\n1. ログイン画面で「パスワードをお忘れですか？」をクリック\n2. 登録した電話番号・メールアドレスを入力\n3. 認証コードを取得（SMS・メール）\n4. 新しいパスワードを設定（8-20文字、大小文字と数字を含む）\n\n🔗 SNS連携：\n• 対応：WeChat、QQ、Weibo、Apple ID、Google\n• 手順：プロフィール → 設定 → アカウントと安全 → SNS連携\n• 各SNSアカウントは1つのプラットフォームアカウントとのみ連携可能\n\n🛡️ 安全に関するヒント：\n• 定期的にパスワード変更（3ヶ月ごと推奨）\n• 複数サービスで同じパスワードを使い回さない\n• ログイン保護を有効化：新デバイスは認証コード必須\n• フィッシングサイトに注意 — 公式ドメインのみで操作\n• 不審なログインを検知したら — すぐにパスワード変更＋サポート連絡\n\n❓ よくある問題：\n• 認証コードが届かない：迷惑メールフォルダ確認、または60秒待って再試行\n• 電話番号が使えなくなった：本人確認書類を持ってサポートへ連絡し、変更手続きを\n• アカウントロック：パスワードを5回間違えると30分ロック。自動解除を待つかサポートへ',
      ko: '【계정 보안 및 비밀번호 관리】\n\n🔐 비밀번호 재설정:\n1. 로그인 페이지에서 「비밀번호 찾기」 클릭\n2. 가입한 휴대폰 번호/이메일 입력\n3. 인증번호 받기 (SMS/이메일)\n4. 새 비밀번호 설정 (8-20자, 대소문자+숫자 포함)\n\n🔗 SNS 계정 연동:\n• 지원: 위챗, QQ, 웨이보, Apple ID, Google\n• 경로: 프로필 → 설정 → 계정 및 보안 → SNS 연동\n• 각 SNS 계정은 하나의 플랫폼 계정에만 연동 가능\n\n🛡️ 보안 팁:\n• 정기적으로 비밀번호 변경 (3개월마다 권장)\n• 여러 서비스에서 같은 비밀번호 재사용 금지\n• 로그인 보호 활성화: 새 기기는 인증번호 필수\n• 피싱 사이트 주의 — 공식 도메인에서만 조작\n• 의심스러운 로그인 발견 시 — 즉시 비밀번호 변경 + 고객센터 문의\n\n❓ 자주 묻는 질문:\n• 인증번호 안 옴: 스팸 메일함 확인, 또는 60초 대기 후 재시도\n• 휴대폰 번호 사용 불가: 본인 확인 서류와 함께 고객센터에 문의하여 변경\n• 계정 잠금: 비밀번호 5회 틀리면 30분 잠금. 자동 해제 기다리거나 고객센터 문의',
      fr: '【Sécurité du compte et gestion du mot de passe】\n\n🔐 Réinitialisation du mot de passe :\n1. Cliquer sur "Mot de passe oublié" sur la page de connexion\n2. Saisir le numéro de téléphone/email enregistré\n3. Recevoir le code de vérification (SMS/email)\n4. Définir un nouveau mot de passe (8-20 caractères, avec majuscules, minuscules et chiffres)\n\n🔗 Liaison de comptes tiers :\n• Pris en charge : WeChat, QQ, Weibo, Apple ID, Google\n• Parcours : Profil → Paramètres → Compte et sécurité → Liaison tiers\n• Chaque compte tiers ne peut être lié qu\'à un seul compte plateforme\n\n🛡️ Conseils de sécurité :\n• Changer le mot de passe régulièrement (tous les 3 mois recommandé)\n• Ne pas réutiliser le même mot de passe sur plusieurs services\n• Activer la protection de connexion : code de vérification requis sur nouveaux appareils\n• Attention au phishing — n\'opérer que sur les domaines officiels\n• Si connexion suspecte détectée — changer le mot de passe et contacter le support immédiatement\n\n❓ Problèmes courants :\n• Pas de code de vérification : Vérifiez le dossier spam, ou attendez 60 secondes pour réessayer\n• Numéro de téléphone désactivé : Contacter le support humain avec des pièces d\'identité pour changer l\'attache\n• Compte verrouillé : 5 mauvaises tentatives = verrouillage 30 min ; attendez le déverrouillage automatique ou contactez le support',
      de: '【Kontosicherheit und Passwortverwaltung】\n\n🔐 Passwort zurücksetzen:\n1. Auf der Anmeldeseite "Passwort vergessen" klicken\n2. Registrierte Telefonnummer/E-Mail eingeben\n3. Bestätigungscode erhalten (SMS/E-Mail)\n4. Neues Passwort festlegen (8-20 Zeichen, mit Groß-/Kleinschreibung und Zahlen)\n\n🔗 Drittanbieter-Kontoverknüpfung:\n• Unterstützt: WeChat, QQ, Weibo, Apple ID, Google\n• Pfad: Profil → Einstellungen → Konto & Sicherheit → Drittanbieter-Verknüpfung\n• Jedes Drittanbieter-Konto kann nur mit einem Plattformkonto verknüpft werden\n\n🛡️ Sicherheitstipps:\n• Passwort regelmäßig ändern (alle 3 Monate empfohlen)\n• Dasselbe Passwort nicht auf mehreren Diensten wiederverwenden\n• Anmeldeschutz aktivieren: Bestätigungscode für neue Geräte erforderlich\n• Vorsicht vor Phishing-Seiten — nur auf offiziellen Domains operieren\n• Bei verdächtiger Anmeldung — sofort Passwort ändern und Support kontaktieren\n\n❓ Häufige Probleme:\n• Kein Bestätigungscode: Spam-Ordner prüfen oder 60 Sekunden warten und erneut versuchen\n• Telefonnummer deaktiviert: Menschlichen Support mit Ausweisdokumenten kontaktieren, um Verknüpfung zu ändern\n• Konto gesperrt: 5 falsche Passwortversuche = 30-Minuten-Sperre; auf automatische Entsperrung warten oder Support kontaktieren',
      es: '【Seguridad de la cuenta y gestión de contraseñas】\n\n🔐 Restablecimiento de contraseña:\n1. Hacer clic en "Contraseña olvidada" en la página de inicio de sesión\n2. Introducir el número de teléfono/correo registrado\n3. Recibir el código de verificación (SMS/correo)\n4. Establecer nueva contraseña (8-20 caracteres, con mayúsculas, minúsculas y números)\n\n🔗 Vinculación de cuentas de terceros:\n• Compatibles: WeChat, QQ, Weibo, Apple ID, Google\n• Ruta: Perfil → Ajustes → Cuenta y seguridad → Vinculación de terceros\n• Cada cuenta de terceros solo puede vincularse a una cuenta de la plataforma\n\n🛡️ Consejos de seguridad:\n• Cambiar la contraseña regularmente (recomendado cada 3 meses)\n• No reutilizar la misma contraseña en varios servicios\n• Activar la protección de inicio de sesión: código de verificación requerido en dispositivos nuevos\n• Cuidado con el phishing — operar solo en dominios oficiales\n• Si se detecta un inicio de sesión sospechoso — cambiar la contraseña y contactar con soporte inmediatamente\n\n❓ Problemas comunes:\n• Sin código de verificación: Revisar la carpeta de spam, o esperar 60 segundos para reintentar\n• Número de teléfono desactivado: Contactar con soporte humano con documentos de identidad para cambiar la vinculación\n• Cuenta bloqueada: 5 intentos fallidos = bloqueo de 30 min; esperar desbloqueo automático o contactar con soporte',
    },
    keywords: {
      zh: ['账号', '账户', '登录', '密码', '注册', '忘记密码', '绑定', '解绑', '修改信息', '个人中心', '安全', '验证码', '锁定'],
      en: ['account', 'login', 'password', 'register', 'sign up', 'sign in', 'forgot password', 'profile', 'settings', 'security', 'verification code', 'link', 'unlink', 'locked'],
      ja: ['アカウント', 'ログイン', 'パスワード', '登録', '忘れた', '連携', '設定', 'セキュリティ', '認証コード', 'ロック'],
      ko: ['계정', '로그인', '비밀번호', '가입', '찾기', '연동', '설정', '보안', '인증번호', '잠금'],
      fr: ['compte', 'connexion', 'mot de passe', 'inscription', 'oublié', 'liaison', 'paramètres', 'sécurité', 'code de vérification', 'verrouillé'],
      de: ['Konto', 'Anmeldung', 'Passwort', 'Registrierung', 'vergessen', 'Verknüpfung', 'Einstellungen', 'Sicherheit', 'Bestätigungscode', 'gesperrt'],
      es: ['cuenta', 'inicio de sesión', 'contraseña', 'registro', 'olvidado', 'vinculación', 'ajustes', 'seguridad', 'código de verificación', 'bloqueado'],
    },
    tags: ['account', 'security', 'password', 'login'],
    intents: ['account', 'consultation'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-005',
    category: 'announcement',
    title: {
      zh: '【公告】618大促期间发货延迟通知',
      en: '[Notice] Shipping Delay During 618 Sale Period',
      ja: '【お知らせ】618セール期間中の発送遅延について',
      ko: '【공지】618 세일 기간 배송 지연 안내',
      fr: '[Avis] Retard d\'expédition pendant la période de soldes 618',
      de: '[Hinweis] Versandverzögerung während des 618-Verkaufszeitraums',
      es: '[Aviso] Retraso en el envío durante el periodo de rebajas 618',
    },
    content: {
      zh: '📢【重要公告】\n\n亲爱的用户：\n\n618年度大促期间（6月15日-6月20日），订单量激增，发货时效将做如下调整：\n\n⏰ 发货时间调整：\n• 普通订单：下单后72小时内发出\n• 预售订单：以商品页面标注为准\n• 定制商品：以客服沟通时间为准\n\n🚚 配送时效预计延长：\n• 普通快递：增加1-2个工作日\n• 偏远地区：增加2-3个工作日\n\n💝 感谢您的理解与支持！\n• 618期间下单享额外运费险保障\n• 订单延迟超过5天可联系客服申请10元优惠券补偿\n• 如有紧急需求可选择顺丰特快补差价发货\n\n给您带来的不便，我们深表歉意！如有任何问题，请随时联系在线客服。',
      en: '📢 [Important Notice]\n\nDear Users:\n\nDuring the annual 618 Sale (June 15 - June 20), due to a surge in orders, shipping timelines will be adjusted as follows:\n\n⏰ Adjusted Shipping Schedule:\n• Regular orders: Shipped within 72 hours of ordering\n• Pre-orders: As indicated on product page\n• Customized items: As communicated with customer service\n\n🚚 Delivery Delays Expected:\n• Standard shipping: +1-2 business days\n• Remote areas: +2-3 business days\n\n💝 Thank you for your understanding and support!\n• Free shipping insurance on all 618 orders\n• If order delayed beyond 5 days, contact support for a $2 coupon compensation\n• For urgent needs: SF Express upgrade available at extra cost\n\nWe sincerely apologize for any inconvenience. Contact our online support team anytime with questions.',
      ja: '📢【重要なお知らせ】\n\n皆様へ：\n\n年に一度の618セール期間中（6月15日〜6月20日）、注文が急増するため、発送時間を以下の通り調整いたします：\n\n⏰ 発送時間の調整：\n• 通常注文：注文後72時間以内に発送\n• 予約注文：商品ページ記載の通り\n• カスタム商品：カスタマーサポートとの調整時間通り\n\n🚚 配達遅延の見込み：\n• 通常配送：1-2営業日追加\n• 遠隔地：2-3営業日追加\n\n💝 ご理解とご支援に感謝いたします！\n• 618期間中のご注文は送料保険を無料進呈\n• 5日以上遅延した場合、カスタマーサポートへ連絡いただければ150円クーポンを進呈\n• お急ぎの場合は、追加料金で速達配送に変更可能\n\nご不便をおかけして誠に申し訳ございません。何かございましたら、いつでもオンラインサポートへお問い合わせください。',
      ko: '📢【중요 공지】\n\n사용자 여러분:\n\n연간 최대 세일인 618 기간 중(6월 15일~6월 20일) 주문이 급증하여 배송 시간이 다음과 같이 조정됩니다:\n\n⏰ 출고 시간 조정:\n• 일반 주문: 주문 후 72시간 이내 출고\n• 예약 주문: 상품 페이지 표기 기준\n• 맞춤 상품: 고객센터 협의 기준\n\n🚚 배송 지연 예상:\n• 일반 배송: 1-2영업일 추가\n• 도서 산간 지역: 2-3영업일 추가\n\n💝 이해와 지원에 감사드립니다!\n• 618 기간 모든 주문에 무료 배송 보험\n• 5일 이상 지연 시 고객센터에 문의하면 2,000원 쿠폰 보상\n• 긴하신 경우 추가 비용으로 고속 배송으로 업그레이드 가능\n\n불편을 드려 죄송합니다. 궁금한 점은 언제든 온라인 고객센터로 문의해 주세요.',
      fr: '📢 [Avis important]\n\nChers utilisateurs :\n\nPendant la période de soldes annuelle 618 (15-20 juin), en raison du pic de commandes, les délais d\'expédition sont ajustés comme suit :\n\n⏰ Calendrier d\'expédition ajusté :\n• Commandes classiques : Expédiées sous 72h après commande\n• Précommandes : Comme indiqué sur la fiche produit\n• Articles personnalisés : Selon échange avec le support\n\n🚚 Retards de livraison attendus :\n• Livraison standard : +1-2 jours ouvrés\n• Zones éloignées : +2-3 jours ouvrés\n\n💝 Merci de votre compréhension et soutien !\n• Assurance livraison offerte sur toutes les commandes 618\n• Si retard supérieur à 5 jours, contactez le support pour un coupon de 2€\n• Pour l\'urgence : Upgrade vers livraison express (SF) disponible avec supplément\n\nNous nous excusons sincèrement pour la gêne occasionnée. N\'hésitez pas à contacter notre support en ligne.',
      de: '📢 [Wichtiger Hinweis]\n\nSehr geehrte Nutzer:\n\nWährend des jährlichen 618-Verkaufszeitraums (15. Juni - 20. Juni) werden aufgrund des Bestellungsanstiegs die Versandzeiten wie folgt angepasst:\n\n⏰ Angepasster Versandzeitplan:\n• Standardbestellungen: Versand innerhalb von 72 Stunden nach Bestellung\n• Vorbestellungen: Wie auf der Produktseite angegeben\n• Individualisierte Artikel: Wie mit Kundenservice abgesprochen\n\n🚚 Erwartete Lieferverzögerungen:\n• Standardversand: +1-2 Werktage\n• Abgelegenere Gebiete: +2-3 Werktage\n\n💝 Danke für Ihr Verständnis und Ihre Unterstützung!\n• Kostenlose Versandversicherung bei allen 618-Bestellungen\n• Bei Verzögerung über 5 Tage: Kontaktieren Sie Support für einen 2€-Gutschein\n• Bei Eile: Upgrade auf Express-Versand (SF) gegen Aufpreis verfügbar\n\nWir entschuldigen uns aufrichtig für etwaige Unannehmlichkeiten. Unser Online-Support steht Ihnen jederzeit zur Verfügung.',
      es: '📢 [Aviso importante]\n\nEstimados usuarios:\n\nDurante el periodo de rebajas anual 618 (del 15 al 20 de junio), debido al aumento de pedidos, los plazos de envío se ajustan de la siguiente manera:\n\n⏰ Calendario de envío ajustado:\n• Pedidos normales: Enviados en 72h tras el pedido\n• Pedidos en preventa: Como se indica en la ficha del producto\n• Artículos personalizados: Según lo acordado con el soporte\n\n🚚 Retrasos de entrega esperados:\n• Envío estándar: +1-2 días laborables\n• Zonas remotas: +2-3 días laborables\n\n💝 ¡Gracias por su comprensión y apoyo!\n• Seguro de envío gratuito en todos los pedidos del 618\n• Si el retraso supera los 5 días, contacte con soporte para un cupón de 2€\n• Para urgencias: Disponible mejora a envío exprés (SF) con suplemento\n\nPedimos sinceras disculpas por las molestias. No dude en contactar con nuestro soporte en línea.',
    },
    keywords: {
      zh: ['公告', '通知', '618', '大促', '活动', '延迟', '发货', '配送晚', '优惠券', '补偿'],
      en: ['notice', 'announcement', '618', 'sale', 'promotion', 'delay', 'shipping', 'late delivery', 'coupon', 'compensation'],
      ja: ['お知らせ', '通知', '618', 'セール', 'プロモーション', '遅延', '発送', 'クーポン', '補償'],
      ko: ['공지', '알림', '618', '세일', '프로모션', '지연', '출고', '쿠폰', '보상'],
      fr: ['avis', 'annonce', '618', 'solde', 'promotion', 'retard', 'expédition', 'livraison tardive', 'bon', 'indemnité'],
      de: ['Hinweis', 'Ankündigung', '618', 'Verkauf', 'Aktion', 'Verzögerung', 'Versand', 'späte Lieferung', 'Gutschein', 'Entschädigung'],
      es: ['aviso', 'anuncio', '618', 'rebajas', 'promoción', 'retraso', 'envío', 'entrega tardía', 'cupón', 'compensación'],
    },
    tags: ['announcement', '618', 'shipping_delay', 'promotion'],
    intents: ['shipping', 'consultation', 'complaint'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-006',
    category: 'faq',
    title: {
      zh: '支付方式与发票开具',
      en: 'Payment Methods and Invoice Issuance',
      ja: 'お支払い方法と領収書発行',
      ko: '결제 수단 및 세금계산서 발급',
      fr: 'Modes de paiement et émission de factures',
      de: 'Zahlungsmethoden und Rechnungsstellung',
      es: 'Métodos de pago y emisión de facturas',
    },
    content: {
      zh: '【支付方式与发票开具】\n\n💳 支持的支付方式：\n• 微信支付（推荐）\n• 支付宝\n• 银联卡（储蓄卡/信用卡）\n• 花呗分期（3/6/12期免息）\n• 京东白条\n• Apple Pay\n\n🧾 发票开具说明：\n• 支持开具：电子普通发票、增值税专用发票\n• 开票内容：商品明细/办公用品/服务费\n• 开票时效：订单完成后30天内可申请\n• 电子发票：1-3个工作日发送至邮箱\n• 纸质发票：3-5个工作日寄出（运费到付）\n\n📝 开票流程：\n1. 进入「我的订单」选择对应订单\n2. 点击「申请发票」\n3. 填写发票抬头、税号等信息\n4. 选择发票类型和接收方式\n5. 提交申请等待开具\n\n❓ 常见问题：\n• 发票抬头可以改吗：发票开具前可修改，已开具后不可修改\n• 发票丢了怎么办：电子发票可重新下载，纸质发票可联系客服补开（需承担快递费）\n• 多订单合开：联系人工客服，提供订单列表申请合并开具',
      en: '【Payment Methods and Invoice Issuance】\n\n💳 Supported Payment Methods:\n• WeChat Pay (Recommended)\n• Alipay\n• UnionPay (Debit/Credit Card)\n• Huabei Installments (3/6/12 months, 0% interest)\n• JD Baitiao\n• Apple Pay\n\n🧾 Invoice Information:\n• Types supported: Electronic general invoice, VAT special invoice\n• Invoice content: Item details / Office supplies / Service fee\n• Timeframe: Request within 30 days after order completion\n• Electronic invoice: Sent to email within 1-3 business days\n• Paper invoice: Shipped within 3-5 business days (freight collect)\n\n📝 Invoice Process:\n1. Go to "My Orders" and select your order\n2. Click "Request Invoice"\n3. Fill in invoice title, tax ID, etc.\n4. Choose invoice type and delivery method\n5. Submit and wait for issuance\n\n❓ Common Issues:\n• Can I change the invoice title? Modifications allowed before issuance; not possible after\n• Lost invoice: Electronic invoices can be re-downloaded; paper invoices — contact support for reissue (shipping fee applies)\n• Combined invoices for multiple orders: Contact human support with your order list for combined invoicing',
      ja: '【お支払い方法と領収書発行】\n\n💳 対応するお支払い方法：\n• WeChat Pay（推奨）\n• Alipay\n•銀聯（デビット/クレジットカード）\n• 花唄分割払い（3/6/12回・無金利）\n• JD白条\n• Apple Pay\n\n🧾 領収書について：\n• 対応種別：電子普通領収書、増値税専用領収書\n• 記載内容：商品明細/オフィス用品/サービス料\n• 申請期間：注文完了後30日以内\n• 電子領収書：1-3営業日以内にメール送信\n• 紙の領収書：3-5営業日以内に発送（着払い）\n\n📝 領収書申請手続き：\n1. 「マイオーダー」から対象注文を選択\n2. 「領収書を申請」をクリック\n3. 宛名・税番号などを入力\n4. 領収書の種類と受け取り方法を選択\n5. 申請して発行を待つ\n\n❓ よくある質問：\n• 宛名の変更は？発行前なら変更可能、発行後は不可\n• 領収書をなくした：電子は再ダウンロード可、紙はサポートへ連絡し再発行（送料別）\n• 複数注文をまとめて：サポートへ注文一覧を送って申請',
      ko: '【결제 수단 및 세금계산서 발급】\n\n💳 지원하는 결제 수단:\n• 위챗 페이 (추천)\n• 알리페이\n• 유니온페이 (체크/신용카드)\n• 화바이 할부 (3/6/12개월, 무이자)\n• JD 바이티아오\n• Apple Pay\n\n🧾 세금계산서 안내:\n• 지원 종류: 전자 일반 계산서, 부가가치세 전용 계산서\n• 기재 내용: 상품 명세 / 사무 용품 / 서비스료\n• 신청 기간: 주문 완료 후 30일 이내\n• 전자 계산서: 1-3영업일 내 이메일 발송\n• 종이 계산서: 3-5영업일 내 발송 (착불)\n\n📝 계산서 신청 절차:\n1. 「내 주문」에서 해당 주문 선택\n2. 「계산서 신청」 클릭\n3. 상호명, 세금번호 등 입력\n4. 계산서 종류와 수령 방법 선택\n5. 신청 후 발급 대기\n\n❓ 자주 묻는 질문:\n• 상호명 변경 가능? 발급 전은 가능, 발급 후는 불가\n• 계산서 분실: 전자는 재다운로드 가능, 종이는 고객센터 문의 후 재발행 (배송비 별도)\n• 여러 주문 합산 발급: 주문 목록과 함께 고객센터에 문의',
      fr: '【Modes de paiement et émission de factures】\n\n💳 Modes de paiement acceptés :\n• WeChat Pay (Recommandé)\n• Alipay\n• UnionPay (Carte débit/crédit)\n• Paiement en plusieurs fois Huabei (3/6/12 mois, 0% intérêt)\n• JD Baitiao\n• Apple Pay\n\n🧾 Informations sur la facture :\n• Types supportés : Facture électronique standard, Facture TVA spécifique\n• Contenu : Détails des articles / Fournitures de bureau / Frais de service\n• Délai : Demander dans les 30 jours après fin de commande\n• Facture électronique : Envoyée par email sous 1-3 jours ouvrés\n• Facture papier : Expédiée sous 3-5 jours ouvrés (port dû)\n\n📝 Procédure de facturation :\n1. Aller dans "Mes commandes" et sélectionner la commande\n2. Cliquer sur "Demander une facture"\n3. Remplir le titre, le numéro de TVA, etc.\n4. Choisir le type et le mode de réception\n5. Soumettre et attendre l\'émission\n\n❓ Problèmes courants :\n• Puis-je modifier le titre de la facture ? Modifications autorisées avant émission ; impossible après\n• Facture perdue : Les factures électroniques peuvent être retéléchargées ; pour les papier — contacter le support pour une réédition (frais de port en sus)\n• Factures groupées pour plusieurs commandes : Contacter le support humain avec la liste de vos commandes',
      de: '【Zahlungsmethoden und Rechnungsstellung】\n\n💳 Unterstützte Zahlungsmethoden:\n• WeChat Pay (Empfohlen)\n• Alipay\n• UnionPay (Debit-/Kreditkarte)\n• Huabei-Ratenzahlung (3/6/12 Monate, 0% Zinsen)\n• JD Baitiao\n• Apple Pay\n\n🧾 Rechnungsinformationen:\n• Unterstützte Typen: Elektronische Standardrechnung, Besondere MwSt-Rechnung\n• Rechnungsinhalt: Artikeldetails / Bürobedarf / Servicegebühr\n• Zeitrahmen: Anfrage innerhalb von 30 Tagen nach Bestellabschluss\n• Elektronische Rechnung: Per E-Mail innerhalb von 1-3 Werktagen\n• Papierrechnung: Versendet innerhalb von 3-5 Werktagen (Versandkosten an Sie)\n\n📝 Rechnungsablauf:\n1. Gehen Sie zu "Meine Bestellungen" und wählen Sie die Bestellung\n2. Klicken Sie auf "Rechnung anfordern"\n3. Rechnungstitel, Steuernummer usw. ausfüllen\n4. Rechnungstyp und Empfangsmethode wählen\n5. Einreichen und auf Ausstellung warten\n\n❓ Häufige Probleme:\n• Kann ich den Rechnungstitel ändern? Änderungen vor der Ausstellung erlaubt; danach nicht möglich\n• Rechnung verloren: Elektronische Rechnungen können erneut heruntergeladen werden; Papierrechnungen — Support kontaktieren für Neuausstellung (Versandkosten anfallen)\n• Sammelrechnungen für mehrere Bestellungen: Menschlichen Support mit Bestellliste kontaktieren',
      es: '【Métodos de pago y emisión de facturas】\n\n💳 Métodos de pago admitidos:\n• WeChat Pay (Recomendado)\n• Alipay\n• UnionPay (Tarjeta de débito/crédito)\n• Pago a plazos Huabei (3/6/12 meses, 0% de interés)\n• JD Baitiao\n• Apple Pay\n\n🧾 Información de la factura:\n• Tipos admitidos: Factura electrónica estándar, Factura especial de IVA\n• Contenido: Detalles de artículos / Materiales de oficina / Cuota de servicio\n• Plazo: Solicitar en los 30 días posteriores a la finalización del pedido\n• Factura electrónica: Enviada por email en 1-3 días laborables\n• Factura en papel: Enviada en 3-5 días laborables (envío contra reembolso)\n\n📝 Procedimiento de facturación:\n1. Ir a "Mis pedidos" y seleccionar el pedido\n2. Hacer clic en "Solicitar factura"\n3. Rellenar el título, el número de IVA, etc.\n4. Elegir el tipo y el método de recepción\n5. Enviar y esperar la emisión\n\n❓ Problemas comunes:\n• ¿Puedo cambiar el título de la factura? Modificaciones permitidas antes de la emisión; imposible después\n• Factura perdida: Las facturas electrónicas se pueden volver a descargar; para las en papel — contactar con soporte para reemisión (gastos de envío aparte)\n• Facturas agrupadas para varios pedidos: Contactar con soporte humano con la lista de sus pedidos',
    },
    keywords: {
      zh: ['支付', '付款', '发票', '收据', '开票', '税号', '电子发票', '增值税', '花呗', '白条', '银行卡'],
      en: ['payment', 'pay', 'invoice', 'receipt', 'billing', 'tax id', 'electronic invoice', 'VAT', 'Huabei', 'Baitiao', 'credit card'],
      ja: ['支払い', '決済', '領収書', '請求書', '発行', '税番号', '電子領収書', 'クレジットカード'],
      ko: ['결제', '지불', '세금계산서', '영수증', '발급', '세금번호', '전자 계산서', '신용카드'],
      fr: ['paiement', 'payer', 'facture', 'reçu', 'facturation', 'numéro de TVA', 'facture électronique', 'carte de crédit'],
      de: ['Zahlung', 'bezahlen', 'Rechnung', 'Quittung', 'Fakturierung', 'Steuernummer', 'elektronische Rechnung', 'Kreditkarte'],
      es: ['pago', 'pagar', 'factura', 'recibo', 'facturación', 'número de IVA', 'factura electrónica', 'tarjeta de crédito'],
    },
    tags: ['payment', 'invoice', 'billing'],
    intents: ['consultation', 'account'],
    updatedAt: Date.now(),
  },
  {
    id: 'KB-007',
    category: 'faq',
    title: {
      zh: '如何联系人工客服',
      en: 'How to Contact Human Support',
      ja: 'オペレーターへの連絡方法',
      ko: '인간 고객센터 연락 방법',
      fr: 'Comment contacter un agent humain',
      de: 'So kontaktieren Sie den menschlichen Support',
      es: 'Cómo contactar con soporte humano',
    },
    content: {
      zh: '【联系人工客服】\n\n📞 服务渠道：\n• 在线客服：点击右下角「在线客服」按钮，7×24小时服务\n• 客服热线：400-888-8888（工作日 9:00-21:00，周末 10:00-18:00）\n• 邮件支持：support@example.com（1-2个工作日内回复）\n• 企业微信：添加客服专员账号 CS-Example\n\n⏱️ 响应时效：\n• 在线客服：3分钟内响应\n• 客服热线：等待时间通常不超过5分钟\n• 邮件：1-2个工作日内回复\n\n💡 温馨提示：\n• 联系前请准备好订单号和问题描述\n• VIP会员可享受专属客服通道，无需排队\n• 紧急问题（如退款未到账、质量投诉）优先处理',
      en: '【Contact Human Support】\n\n📞 Contact Channels:\n• Online Chat: Click the "Live Support" button at the bottom right, 24/7 available\n• Hotline: 400-888-8888 (Business days 9:00-21:00, Weekends 10:00-18:00)\n• Email: support@example.com (Reply within 1-2 business days)\n• WeChat Work: Add specialist account CS-Example\n\n⏱️ Response Time:\n• Online Chat: Response within 3 minutes\n• Hotline: Average wait time under 5 minutes\n• Email: Reply within 1-2 business days\n\n💡 Tips:\n• Please have your order number and problem description ready before contacting\n• VIP members enjoy exclusive agent channel with no waiting\n• Urgent issues (missing refunds, quality complaints) prioritized',
      ja: '【オペレーターへの連絡方法】\n\n📞 連絡先：\n• オンラインチャット：右下の「オペレーターに接続」ボタン、24時間年中無休\n• 電話窓口：400-888-8888（営業日 9:00-21:00、土日祝 10:00-18:00）\n• メール：support@example.com（1-2営業日以内に返信）\n• 企業WeChat：CS-Exampleを友達追加\n\n⏱️ 応答時間：\n• オンラインチャット：3分以内に応答\n• 電話窓口：平均待ち時間5分以内\n• メール：1-2営業日以内に返信\n\n💡 ヒント：\n• 連絡前に注文番号と問題の内容をご用意ください\n• VIP会員専用回線あり、待ち時間なし\n• 緊急の問題（返金不着・品質クレーム）は優先対応',
      ko: '【인간 고객센터 연락 방법】\n\n📞 연락 수단:\n• 온라인 채팅: 우측 하단 「실시간 상담」 버튼, 24시간 연중무휴\n• 고객센터: 400-888-8888 (영업일 9:00-21:00, 주말 10:00-18:00)\n• 이메일: support@example.com (1-2영업일 내 답변)\n• 기업 위챗: CS-Example 친구 추가\n\n⏱️ 응답 시간:\n• 온라인 채팅: 3분 내 응답\n• 고객센터: 평균 대기시간 5분 이내\n• 이메일: 1-2영업일 내 답변\n\n💡 팁:\n• 연락 전 주문 번호와 문제 내용을 준비해 주세요\n• VIP 회원은 전용 채널로 대기 없음\n• 긴급 문제 (환불 미도착, 품질 불만) 우선 처리',
      fr: '【Contacter un agent humain】\n\n📞 Canaux de contact :\n• Chat en ligne : Cliquez sur le bouton "Support en direct" en bas à droite, 24h/24 et 7j/7\n• Ligne directe : 400-888-8888 (Jours ouvrés 9h-21h, Week-ends 10h-18h)\n• Email : support@example.com (Réponse sous 1-2 jours ouvrés)\n• WeChat Entreprise : Ajouter le compte CS-Example\n\n⏱️ Délais de réponse :\n• Chat en ligne : Réponse sous 3 minutes\n• Ligne directe : Attente moyenne inférieure à 5 minutes\n• Email : Réponse sous 1-2 jours ouvrés\n\n💡 Conseils :\n• Ayez votre numéro de commande et la description du problème prêts\n• Les membres VIP bénéficient d\'un canal exclusif, sans attente\n• Les urgences (remboursement non reçu, réclamations qualité) traitées en priorité',
      de: '【Menschlichen Support kontaktieren】\n\n📞 Kontaktmöglichkeiten:\n• Online-Chat: Klicken Sie auf die Schaltfläche "Live-Support" unten rechts, 24/7 verfügbar\n• Hotline: 400-888-8888 (Werktage 9:00-21:00, Wochenenden 10:00-18:00)\n• E-Mail: support@example.com (Antwort innerhalb von 1-2 Werktagen)\n• Unternehmens-WeChat: Konto CS-Example hinzufügen\n\n⏱️ Antwortzeiten:\n• Online-Chat: Antwort innerhalb von 3 Minuten\n• Hotline: Durchschnittliche Wartezeit unter 5 Minuten\n• E-Mail: Antwort innerhalb von 1-2 Werktagen\n\n💡 Hinweise:\n• Halten Sie Ihre Bestellnummer und Problembeschreibung bereit\n• VIP-Mitglieder genießen exklusiven Support-Kanal ohne Warteschlange\n• Dringende Probleme (fehlende Rückerstattungen, Qualitätsbeschwerden) priorisiert',
      es: '【Contactar con soporte humano】\n\n📞 Canales de contacto:\n• Chat en línea: Hacer clic en el botón "Soporte en vivo" abajo a la derecha, disponible 24/7\n• Línea directa: 400-888-8888 (Días laborables 9:00-21:00, Fines de semana 10:00-18:00)\n• Email: support@example.com (Respuesta en 1-2 días laborables)\n• WeChat Empresarial: Añadir la cuenta CS-Example\n\n⏱️ Tiempos de respuesta:\n• Chat en línea: Respuesta en 3 minutos\n• Línea directa: Tiempo de espera medio inferior a 5 minutos\n• Email: Respuesta en 1-2 días laborables\n\n💡 Consejos:\n• Tenga listo su número de pedido y la descripción del problema\n• Los miembros VIP disfrutan de un canal exclusivo sin espera\n• Urgencias (reembolso no recibido, quejas de calidad) tratadas con prioridad',
    },
    keywords: {
      zh: ['人工', '真人', '客服', '转人工', '找客服', '工作人员', '人来', '不是机器人', '电话', '热线', '联系', '投诉电话'],
      en: ['human', 'agent', 'real person', 'speak to', 'representative', 'customer support', 'live agent', 'not a bot', 'phone', 'hotline', 'contact'],
      ja: ['人間', 'オペレーター', '担当者', '繋げて', '直接', '話したい', '電話', '窓口', '連絡'],
      ko: ['사람', '상담원', '담당자', '연결해 줘', '직접', '말하고 싶어', '전화', '연락'],
      fr: ['humain', 'agent', 'conseiller', 'parler à', 'directement', 'je veux parler', 'téléphone', 'contacter'],
      de: ['Mensch', 'Mitarbeiter', 'Berater', 'sprechen mit', 'direkt', 'ich will sprechen', 'Telefon', 'Hotline', 'Kontakt'],
      es: ['humano', 'agente', 'asesor', 'hablar con', 'directamente', 'quiero hablar', 'teléfono', 'contactar'],
    },
    tags: ['human_support', 'contact', 'hotline'],
    intents: ['human_request', 'consultation', 'complaint'],
    updatedAt: Date.now(),
  },
];

function normalizeText(text: string, language: Language): string {
  let normalized = text.toLowerCase().trim();
  normalized = normalized.replace(/[，。！？、；：""''（）【】《》…\s]+/g, ' ');
  normalized = normalized.replace(/[,.!?;:\'\"()\[\]<>]+/g, ' ');
  return normalized.trim();
}

function tokenize(text: string, language: Language): string[] {
  const normalized = normalizeText(text, language);
  if (language === 'zh' || language === 'ja' || language === 'ko') {
    const tokens: string[] = [];
    const len = normalized.length;
    for (let i = 0; i < len; i++) {
      for (let j = 2; j <= Math.min(4, len - i); j++) {
        tokens.push(normalized.slice(i, i + j));
      }
      tokens.push(normalized[i]);
    }
    return [...new Set(tokens.filter((t) => t.trim().length > 0))];
  } else {
    return [...new Set(normalized.split(/\s+/).filter((t) => t.length >= 2))];
  }
}

export function extractKeywords(text: string, language: Language): string[] {
  const tokens = tokenize(text, language);
  const scored: { token: string; score: number }[] = [];

  for (const token of tokens) {
    let score = token.length * 0.5;
    for (const entry of knowledgeBase) {
      const kws = entry.keywords[language] || [];
      if (kws.some((k) => k.toLowerCase().includes(token) || token.includes(k.toLowerCase()))) {
        score += 2;
      }
    }
    if (score >= 1) {
      scored.push({ token, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((s) => s.token);
}

export function decomposeIntents(text: string, language: Language): IntentType[] {
  const sentences = text.split(/[。.!?！？;\n]+/).filter((s) => s.trim().length > 0);
  const intents: IntentType[] = [];

  for (const sentence of sentences) {
    const result = classifyIntent(sentence.trim(), language);
    if (result.intent !== 'unknown' && result.confidence >= 0.3) {
      if (!intents.includes(result.intent)) {
        intents.push(result.intent);
      }
    }
  }

  if (intents.length === 0) {
    const overall = classifyIntent(text, language);
    if (overall.confidence >= 0.3) {
      intents.push(overall.intent);
    }
  }

  return intents.slice(0, 3);
}

function calculateKeywordMatch(
  userText: string,
  userKeywords: string[],
  entryKeywords: string[],
  language: Language
): { score: number; matched: string[] } {
  const normalizedText = normalizeText(userText, language);
  const matched: string[] = [];
  let score = 0;

  for (const kw of entryKeywords) {
    const lowerKw = kw.toLowerCase();
    if (normalizedText.includes(lowerKw)) {
      matched.push(kw);
      score += 1.5 + (kw.length >= 3 ? 0.5 : 0);
    }
    for (const uk of userKeywords) {
      if (lowerKw.includes(uk) || uk.includes(lowerKw)) {
        if (!matched.includes(kw)) {
          matched.push(kw);
        }
        score += 1;
      }
    }
  }

  const maxScore = Math.max(entryKeywords.length * 2.5, 1);
  return { score: Math.min(1, score / maxScore), matched };
}

function calculateIntentMatch(
  userIntents: IntentType[],
  entryIntents: IntentType[]
): number {
  if (userIntents.length === 0) return 0.3;
  const matches = userIntents.filter((i) => entryIntents.includes(i)).length;
  return matches / Math.max(userIntents.length, 1);
}

function calculateCategoryBonus(
  userIntents: IntentType[],
  category: KnowledgeBaseCategory
): number {
  if (userIntents.some((i) => ['complaint', 'refund'].includes(i)) && category === 'announcement') {
    return 0.1;
  }
  return 0;
}

export function searchKnowledgeBase(
  userText: string,
  language: Language,
  intent: IntentType
): KnowledgeSearchResponse {
  const extractedKeywords = extractKeywords(userText, language);
  const decomposedIntents = decomposeIntents(userText, language);

  const allIntents = [...new Set([intent, ...decomposedIntents])].filter((i) => i !== 'unknown');

  const results: KnowledgeSearchResult[] = [];

  for (const entry of knowledgeBase) {
    const entryKeywords = entry.keywords[language] || [];
    const kwMatch = calculateKeywordMatch(userText, extractedKeywords, entryKeywords, language);
    const intentMatch = calculateIntentMatch(allIntents, entry.intents);
    const categoryBonus = calculateCategoryBonus(allIntents, entry.category);

    const confidence = Math.min(1, kwMatch.score * 0.55 + intentMatch * 0.4 + categoryBonus);

    if (confidence >= 0.2) {
      results.push({
        entry,
        confidence,
        matchedKeywords: kwMatch.matched,
        categoryMatch: intentMatch > 0.3,
      });
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  const topResults = results.slice(0, MAX_RESULTS);
  const bestMatch = topResults[0];

  const overallConfidence = bestMatch?.confidence || 0;
  const shouldEscalate =
    overallConfidence < CONFIDENCE_THRESHOLD ||
    (overallConfidence >= CONFIDENCE_THRESHOLD && overallConfidence < HIGH_CONFIDENCE_THRESHOLD && topResults.length < 2);

  return {
    results: topResults,
    bestMatch,
    overallConfidence,
    shouldEscalate,
    extractedKeywords,
    decomposedIntents,
  };
}

export function getKnowledgeContent(
  entry: KnowledgeBaseEntry,
  language: Language
): { title: string; content: string } {
  return {
    title: entry.title[language] || entry.title.zh,
    content: entry.content[language] || entry.content.zh,
  };
}

export function buildEscalationMessage(
  language: Language,
  confidence: number
): string {
  const messages: Record<Language, string> = {
    zh: `抱歉，我在知识库中没有找到关于这个问题的高匹配度内容（匹配度：${Math.round(confidence * 100)}%）。\n\n为了确保给您准确的答复，建议您：\n1. 点击右下角「在线客服」联系人工客服\n2. 拨打客服热线：400-888-8888（工作日 9:00-21:00）\n3. 发送邮件至 support@example.com\n\n您也可以尝试换一种表述方式重新提问，比如补充具体的订单号、产品型号等信息。`,
    en: `Sorry, I could not find a highly relevant answer in our knowledge base (match rate: ${Math.round(confidence * 100)}%).\n\nTo ensure you receive accurate information, we recommend:\n1. Click "Live Support" in the bottom right to chat with a human agent\n2. Call our hotline: 400-888-8888 (Business days 9:00-21:00)\n3. Email: support@example.com\n\nYou can also try rephrasing your question with more details (e.g., order number, product model).`,
    ja: `申し訳ございません、ナレッジベースから高いマッチ度の回答が見つかりませんでした（マッチ率：${Math.round(confidence * 100)}%）。\n\n正確な回答を確保するため、以下をお勧めします：\n1. 右下の「オペレーターに接続」をクリックしてオペレーターとチャット\n2. 電話窓口：400-888-8888（営業日 9:00-21:00）\n3. メール：support@example.com\n\n注文番号や製品モデルなどの詳細を含めて、別の言い方でお問い合わせいただくこともできます。`,
    ko: `죄송합니다. 지식베이스에서 높은 매치율의 답변을 찾지 못했습니다 (매치율: ${Math.round(confidence * 100)}%).\n\n정확한 답변을 위해 다음을 권장해 드립니다:\n1. 우측 하단 「실시간 상담」을 클릭하여 상담원과 채팅\n2. 고객센터: 400-888-8888 (영업일 9:00-21:00)\n3. 이메일: support@example.com\n\n주문 번호나 제품 모델 등 자세한 내용을 포함하여 다른 표현으로 다시 문의해 보실 수도 있습니다.`,
    fr: `Désolé, je n'ai pas trouvé de réponse très pertinente dans notre base de connaissances (taux de correspondance : ${Math.round(confidence * 100)}%).\n\nPour garantir une information précise, nous vous recommandons :\n1. Cliquer sur "Support en direct" en bas à droite pour discuter avec un agent\n2. Appeler notre ligne : 400-888-8888 (Jours ouvrés 9h-21h)\n3. Email : support@example.com\n\nVous pouvez aussi reformuler votre question avec plus de détails (n° de commande, modèle du produit, etc.).`,
    de: `Entschuldigung, ich konnte keine hochgradig relevante Antwort in unserer Wissensdatenbank finden (Übereinstimmung: ${Math.round(confidence * 100)}%).\n\nUm Ihnen genaue Informationen zukommen zu lassen, empfehlen wir:\n1. Klicken Sie unten rechts auf "Live-Support", um mit einem Mitarbeiter zu chatten\n2. Unsere Hotline anrufen: 400-888-8888 (Werktage 9:00-21:00)\n3. E-Mail: support@example.com\n\nSie können Ihre Frage auch mit mehr Details (Bestellnummer, Produktmodell usw.) anders formulieren.`,
    es: `Lo siento, no pude encontrar una respuesta muy relevante en nuestra base de conocimientos (índice de coincidencia: ${Math.round(confidence * 100)}%).\n\nPara garantizar que reciba información precisa, le recomendamos:\n1. Hacer clic en "Soporte en vivo" abajo a la derecha para chatear con un agente\n2. Llamar a nuestra línea: 400-888-8888 (Días laborables 9:00-21:00)\n3. Email: support@example.com\n\nTambién puede reformular su pregunta con más detalles (n.° de pedido, modelo de producto, etc.).`,
  };
  return messages[language];
}

export { CONFIDENCE_THRESHOLD, HIGH_CONFIDENCE_THRESHOLD, knowledgeBase };