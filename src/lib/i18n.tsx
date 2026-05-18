"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Lang = "vi" | "en";

type Translations = typeof vi;

const vi = {
  nav: {
    brand: "Hệ thống hỗ trợ học tập Coursera",
    tagline: "Thu thập yêu cầu nhanh, bảo mật và rõ ràng.",
    adminLogin: "Đăng nhập quản trị",
  },
  hero: {
    badge: "Nền tảng xử lý yêu cầu Coursera",
    title: "Hoàn thành khóa học Coursera của bạn một cách dễ dàng.",
    subtitle:
      "Chúng tôi hỗ trợ bạn hoàn thành các bài kiểm tra, bài tập và chứng chỉ Coursera với chi phí hợp lý, bảo mật tuyệt đối.",
    highlights: [
      "Hoàn thành nhanh chóng",
      "Uy tín",
      "Bảo mật",
    ],
  },
  howItWorks: {
    title: "Quy trình hoạt động",
    subtitle: "Chỉ 3 bước đơn giản để hoàn thành khóa học",
    steps: [
      {
        num: "01",
        title: "Gửi thông tin",
        desc: "Nhập email, mật khẩu Coursera và link khóa học bạn cần hỗ trợ.",
      },
      {
        num: "02",
        title: "Thanh toán",
        desc: "Quét mã QR để thanh toán qua MBBank. Hệ thống tự động xác nhận.",
      },
      {
        num: "03",
        title: "Hoàn thành",
        desc: "Đội ngũ chuyên gia sẽ hoàn thành khóa học trong 24-48 giờ.",
      },
    ],
  },
  pricing: {
    title: "Bảng giá dịch vụ",
    subtitle: "Chọn gói phù hợp với nhu cầu của bạn",
    full: {
      name: "Hỗ trợ toàn diện",
      price: "79.000₫ / $5",
      per: "/ khóa học",
      desc: "Hoàn thành toàn bộ khóa học bao gồm video, bài đọc, quiz và bài tập.",
      features: [
        "Hoàn thành tất cả bài kiểm tra",
        "Hoàn thành tất cả bài tập",
        "Xem video & bài đọc",
        "Đạt chứng chỉ hoàn thành",
        "Hỗ trợ 24/7",
      ],
      cta: "Chọn gói này",
    },
    skip: {
      name: "Skip Video & Reading",
      price: "20.000₫ / $2",
      per: "/ khóa học",
      desc: "Chỉ bỏ qua phần video và bài đọc, không bao gồm quiz.",
      features: [
        "Bỏ qua video & bài đọc",
        "Không bao gồm quiz",
        "Tiết kiệm chi phí",
        "Hoàn thành nhanh hơn",
        "Hỗ trợ qua email",
      ],
      cta: "Chọn gói này",
    },
    popular: "Phổ biến",
  },
  form: {
    title: "Gửi yêu cầu hỗ trợ",
    desc: "Nhập email Coursera, mật khẩu và Course ID / URL.",
    email: "Email Coursera",
    emailPh: "example@gmail.com",
    password: "Mật khẩu Coursera",
    passwordPh: "Nhập mật khẩu",
    course: "Course ID hoặc Coursera URL",
    coursePh: "https://www.coursera.org/learn/...",
    fptCode: "Mã môn học (SV FPT)",
    fptCodePh: "Ví dụ: ENW293c, CSI104, ... (bỏ trống nếu không phải SV FPT)",
    service: "Loại dịch vụ",
    forgotHelper:
      "Chưa có tài khoản hoặc quên mật khẩu? Hãy truy cập Coursera, nhấn quên mật khẩu để tạo mật khẩu mới, sau đó điền mật khẩu đó vào biểu mẫu này.",
    openCoursera: "Mở Coursera",
    submit: "Gửi yêu cầu hỗ trợ",
    submitting: "Đang gửi...",
    success: "Gửi yêu cầu thành công!",
    showPw: "Hiện mật khẩu",
    hidePw: "Ẩn mật khẩu",
  },
  payment: {
    title: "Thanh toán",
    scanQr: "Quét mã QR để thanh toán nội địa",
    bankInfo: "Thông tin chuyển khoản",
    bank: "Ngân hàng",
    account: "Số tài khoản",
    name: "Chủ tài khoản",
    amount: "Số tiền",
    content: "Nội dung CK",
    note: "Sau khi chuyển khoản, nhấn nút bên dưới để hoàn tất.",
    paypalTitle: "Thanh toán quốc tế (PayPal)",
    paypalNote: "Gửi tiền qua PayPal tới địa chỉ sau (Vui lòng ghi chú mã yêu cầu):",
    confirm: "Tôi đã thanh toán",
    back: "Quay lại",
  },
  trust: {
    title: "Tại sao chọn chúng tôi?",
    items: [
      { title: "Bảo mật tuyệt đối", desc: "Thông tin tài khoản được mã hóa và xóa sau khi hoàn thành." },
      { title: "Đội ngũ chuyên nghiệp", desc: "Hơn 500+ khóa học đã được hoàn thành thành công." },
      { title: "Hoàn tiền 100%", desc: "Cam kết hoàn tiền nếu không hoàn thành đúng hạn." },
      { title: "Hỗ trợ 24/7", desc: "Liên hệ qua email bất cứ lúc nào, phản hồi trong 2 giờ." },
    ],
  },
  stats: {
    items: [
      { value: "500+", label: "Khóa học hoàn thành" },
      { value: "98%", label: "Tỷ lệ đạt chứng chỉ" },
      { value: "24h", label: "Thời gian xử lý" },
      { value: "100%", label: "Cam kết hoàn tiền" },
    ],
  },

  footer: {
    copyright: "© 2024 Coursera Support Platform. Mọi quyền được bảo lưu.",
    disclaimer: "Đây là dịch vụ hỗ trợ bên thứ ba, không liên kết với Coursera Inc.",
    support: "Hỗ trợ kỹ thuật / Telegram:",
  },
};

const en: Translations = {
  nav: {
    brand: "Coursera Learning Support",
    tagline: "Fast, secure and reliable request processing.",
    adminLogin: "Admin Login",
  },
  hero: {
    badge: "Coursera Request Processing Platform",
    title: "Complete your Coursera courses with ease.",
    subtitle:
      "We help you complete Coursera quizzes, assignments and certificates at affordable prices with absolute security.",
    highlights: ["Fast completion", "Trusted", "Secure"],
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Just 3 simple steps to complete your course",
    steps: [
      {
        num: "01",
        title: "Submit Info",
        desc: "Enter your Coursera email, password and the course link you need help with.",
      },
      {
        num: "02",
        title: "Payment",
        desc: "Scan the QR code to pay via MBBank. The system automatically confirms.",
      },
      {
        num: "03",
        title: "Done",
        desc: "Our expert team will complete the course within 24-48 hours.",
      },
    ],
  },
  pricing: {
    title: "Pricing Plans",
    subtitle: "Choose the plan that fits your needs",
    full: {
      name: "Full Support",
      price: "$5 / 79,000₫",
      per: "/ course",
      desc: "Complete the entire course including videos, readings, quizzes and assignments.",
      features: [
        "Complete all quizzes",
        "Complete all assignments",
        "Watch videos & readings",
        "Earn completion certificate",
        "24/7 Support",
      ],
      cta: "Choose this plan",
    },
    skip: {
      name: "Skip Video & Reading",
      price: "$2 / 20,000₫",
      per: "/ course",
      desc: "Skip the video and reading sections only. Quizzes are not included.",
      features: [
        "Skip videos & readings",
        "No quizzes included",
        "Save money",
        "Faster completion",
        "Email support",
      ],
      cta: "Choose this plan",
    },
    popular: "Popular",
  },
  form: {
    title: "Submit Support Request",
    desc: "Enter your Coursera email, password and Course ID / URL.",
    email: "Coursera Email",
    emailPh: "example@gmail.com",
    password: "Coursera Password",
    passwordPh: "Enter your password",
    course: "Course ID or Coursera URL",
    coursePh: "https://www.coursera.org/learn/...",
    fptCode: "Course Code (FPT Students)",
    fptCodePh: "E.g: ENW293c, CSI104, ... (leave blank if not FPT student)",
    service: "Service Type",
    forgotHelper:
      "Don't have an account or forgot your password? Visit Coursera, click forgot password to create a new one, then enter it in this form.",
    openCoursera: "Open Coursera",
    submit: "Submit Request",
    submitting: "Submitting...",
    success: "Request submitted successfully!",
    showPw: "Show password",
    hidePw: "Hide password",
  },
  payment: {
    title: "Payment",
    scanQr: "Scan QR code for local payment",
    bankInfo: "Local Bank Transfer Information",
    bank: "Bank",
    account: "Account Number",
    name: "Account Holder",
    amount: "Amount",
    content: "Transfer Note",
    note: "After transferring, click the button below to complete.",
    paypalTitle: "International Payment (PayPal)",
    paypalNote: "Send payment via PayPal to the following address (Please include the request code in the note):",
    confirm: "I have paid",
    back: "Go back",
  },
  trust: {
    title: "Why Choose Us?",
    items: [
      { title: "Absolute Security", desc: "Account info is encrypted and deleted after completion." },
      { title: "Professional Team", desc: "Over 500+ courses successfully completed." },
      { title: "100% Refund", desc: "Full refund guarantee if not completed on time." },
      { title: "24/7 Support", desc: "Contact us anytime via email, response within 2 hours." },
    ],
  },
  stats: {
    items: [
      { value: "500+", label: "Courses Completed" },
      { value: "98%", label: "Certificate Rate" },
      { value: "24h", label: "Processing Time" },
      { value: "100%", label: "Refund Guarantee" },
    ],
  },

  footer: {
    copyright: "© 2024 Coursera Support Platform. All rights reserved.",
    disclaimer: "This is a third-party support service, not affiliated with Coursera Inc.",
    support: "Technical Support / Telegram:",
  },
};

const translations: Record<Lang, Translations> = { vi, en };

type I18nContextType = {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nContextType>({
  lang: "vi",
  t: vi,
  toggleLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi");

  const toggleLang = useCallback(() => {
    setLang((current) => (current === "vi" ? "en" : "vi"));
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
