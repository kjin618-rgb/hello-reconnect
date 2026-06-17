export type Customer = {
  id: string;
  name: string;
  phone: string;
  lastVisit: string; // ISO date
  favoriteMenu: string;
  visitCount: number;
  totalSpend: number;
};

export type SavedMessage = {
  id: string;
  customerId: string;
  customerName: string;
  tone: string;
  coupon: string;
  greeting: string;
  couponText: string;
  socialPost: string;
  createdAt: string;
  status: "created" | "copied" | "sent";
};

export type Settings = {
  storeName: string;
  category: string;
  signatureMenu: string;
  defaultTone: string;
  defaultCoupon: string;
  privacyNote: string;
};

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const sampleCustomers: Customer[] = [
  { id: "c1", name: "이지은", phone: "010-1234-5678", lastVisit: daysAgo(35), favoriteMenu: "아이스 바닐라 라떼", visitCount: 18, totalSpend: 162000 },
  { id: "c2", name: "김민혁", phone: "010-2345-6789", lastVisit: daysAgo(42), favoriteMenu: "소금빵 세트", visitCount: 12, totalSpend: 108000 },
  { id: "c3", name: "박서윤", phone: "010-3456-7890", lastVisit: daysAgo(28), favoriteMenu: "얼그레이 타르트", visitCount: 9, totalSpend: 81000 },
  { id: "c4", name: "최도윤", phone: "010-4567-8901", lastVisit: daysAgo(56), favoriteMenu: "카페라떼", visitCount: 22, totalSpend: 198000 },
  { id: "c5", name: "정하늘", phone: "010-5678-9012", lastVisit: daysAgo(31), favoriteMenu: "치즈케이크", visitCount: 7, totalSpend: 63000 },
  { id: "c6", name: "한지민", phone: "010-6789-0123", lastVisit: daysAgo(45), favoriteMenu: "콜드브루", visitCount: 14, totalSpend: 126000 },
  { id: "c7", name: "오세훈", phone: "010-7890-1234", lastVisit: daysAgo(33), favoriteMenu: "크루아상", visitCount: 6, totalSpend: 54000 },
  { id: "c8", name: "윤소라", phone: "010-8901-2345", lastVisit: daysAgo(38), favoriteMenu: "딸기 생크림 케이크", visitCount: 11, totalSpend: 132000 },
  { id: "c9", name: "강태우", phone: "010-9012-3456", lastVisit: daysAgo(62), favoriteMenu: "에스프레소", visitCount: 25, totalSpend: 200000 },
  { id: "c10", name: "임수아", phone: "010-0123-4567", lastVisit: daysAgo(29), favoriteMenu: "마들렌", visitCount: 5, totalSpend: 35000 },
  { id: "c11", name: "조현우", phone: "010-1122-3344", lastVisit: daysAgo(40), favoriteMenu: "아메리카노", visitCount: 19, totalSpend: 95000 },
  { id: "c12", name: "신예린", phone: "010-2233-4455", lastVisit: daysAgo(48), favoriteMenu: "스콘 세트", visitCount: 8, totalSpend: 72000 },
  // some recent visitors (not at risk) for realism
  { id: "c13", name: "장유진", phone: "010-3344-5566", lastVisit: daysAgo(5), favoriteMenu: "플랫화이트", visitCount: 16, totalSpend: 144000 },
  { id: "c14", name: "백승호", phone: "010-4455-6677", lastVisit: daysAgo(12), favoriteMenu: "당근 케이크", visitCount: 10, totalSpend: 90000 },
];

export const defaultSettings: Settings = {
  storeName: "소담베이커리",
  category: "베이커리 카페",
  signatureMenu: "소금빵, 아이스 바닐라 라떼",
  defaultTone: "다정한",
  defaultCoupon: "아메리카노 무료",
  privacyNote: "본 메시지는 고객님의 동의 하에 안부 인사 목적으로만 발송됩니다.",
};

export const sampleCsv = `고객명,연락처,마지막 방문일,최근 구매 메뉴,총 방문 횟수,총 구매 금액
이지은,010-1234-5678,${daysAgo(35).slice(0,10)},아이스 바닐라 라떼,18,162000
김민혁,010-2345-6789,${daysAgo(42).slice(0,10)},소금빵 세트,12,108000
박서윤,010-3456-7890,${daysAgo(28).slice(0,10)},얼그레이 타르트,9,81000
장유진,010-3344-5566,${daysAgo(5).slice(0,10)},플랫화이트,16,144000
`;
