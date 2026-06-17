import type { Customer, Settings } from "./sample-data";
import { daysSince } from "./customer-utils";

export type GenerateInput = {
  customer: Customer;
  tone: string;
  coupon: string;
  customCoupon?: string;
  settings: Settings;
};

export type GenerateResult = {
  greeting: string;
  couponText: string;
  socialPost: string;
};

const firstName = (full: string) => (full.length >= 2 ? full.slice(1) : full);

// Mock AI: rule-based templates that read naturally per tone.
// Replace with real LLM call later — same signature.
export async function generateMessage(input: GenerateInput): Promise<GenerateResult> {
  // small delay to feel async
  await new Promise((r) => setTimeout(r, 600));
  const { customer, tone, settings } = input;
  const coupon = input.coupon === "직접 입력" ? (input.customCoupon || "특별 혜택") : input.coupon;
  const days = daysSince(customer.lastVisit);
  const name = firstName(customer.name);
  const menu = customer.favoriteMenu;
  const store = settings.storeName;

  let greeting = "";
  if (tone === "정중한") {
    greeting = `${name}님, 안녕하세요. ${store}입니다. 그동안 잘 지내고 계셨는지요. ${days}일 만에 안부 인사를 드리고 싶어 조심스럽게 연락드립니다. 늘 즐겨 찾아 주시던 ${menu}가 떠올라, 다시 한 번 모실 수 있다면 정성껏 준비해 드리겠습니다.`;
  } else if (tone === "다정한") {
    greeting = `${name}님, 안녕하세요. ${store}예요. 요즘 잘 지내고 계신가요? 지난번 자주 찾아주셨던 ${menu}가 생각나서 조심스럽게 안부 전해요. 오랜만에 들러주시면 감사한 마음을 담아 ${coupon} 한 잔 준비해드릴게요.`;
  } else if (tone === "동네 사장님 말투") {
    greeting = `${name}님~ ${store} 사장입니다 :) 한동안 안 보이셔서 ${menu} 만들 때마다 생각이 났어요. 시간 되실 때 잠깐 들러주세요. 오시면 ${coupon} 챙겨드릴게요!`;
  } else {
    greeting = `${name}님, ${store}입니다. ${menu} 다시 한 잔 어떠세요? 오시면 ${coupon} 준비해두겠습니다.`;
  }

  const couponText = `[${store}] ${name}님을 위한 ${coupon} 쿠폰\n· 사용 기간: 발급일로부터 14일\n· 매장 방문 시 본 메시지 제시\n· 1인 1회 사용 가능`;

  const socialPost = `오랜만에 안부를 전합니다.\n${store}의 ${menu}, 변함없이 정성껏 준비하고 있어요.\n오랜만에 들러주시는 단골 분들께 ${coupon} 혜택을 드립니다.\n#${store.replace(/\s/g, "")} #동네카페 #단골감사`;

  return { greeting, couponText, socialPost };
}
