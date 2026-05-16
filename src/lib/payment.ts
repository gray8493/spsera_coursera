const BANK_BIN = "970422";
const ACCOUNT_NO = "0837474615";
const ACCOUNT_NAME = "TRAN DANG ANH THI";

export const PRICING = {
  FULL_SUPPORT: 79000,
  SKIP_VIDEO: 20000,
} as const;

export const PRICING_USD = {
  FULL_SUPPORT: 5,
  SKIP_VIDEO: 2,
} as const;

export const PAYPAL_INFO = {
  email: "your-paypal-email@example.com",
  link: "https://paypal.me/yourpaypal",
};

export type ServiceType = keyof typeof PRICING;

export function getVietQrUrl(amount: number, transferContent: string): string {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: transferContent,
    accountName: ACCOUNT_NAME,
  });
  return `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-compact2.png?${params.toString()}`;
}

export function generateTransferContent(requestId: string): string {
  const shortId = requestId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `COURSERA ${shortId}`;
}

export const BANK_INFO = {
  bankName: "MB Bank (MBBank)",
  accountNo: ACCOUNT_NO,
  accountName: ACCOUNT_NAME,
};
