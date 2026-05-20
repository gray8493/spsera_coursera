"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useI18n } from "@/lib/i18n";
import { PRICING, PRICING_USD, PAYPAL_INFO, getVietQrUrl, generateTransferContent, BANK_INFO } from "@/lib/payment";
import type { ServiceType } from "@/lib/payment";

const COURSERA_LOGIN_URL = "https://www.coursera.org/?authMode=login";

export default function HomePage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseTarget, setCourseTarget] = useState("");
  const [fptCode, setFptCode] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("FULL_SUPPORT");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState("");

  const amount = PRICING[serviceType];
  const amountUsd = PRICING_USD[serviceType];
  const transferContent = currentRequestId
    ? generateTransferContent(currentRequestId)
    : "";
  const qrUrl = currentRequestId
    ? getVietQrUrl(amount, transferContent)
    : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contactEmail: contactEmail || undefined,
          password,
          courseTarget,
          fptCode: fptCode || undefined,
          serviceType,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Không thể gửi yêu cầu");
      }
      setCurrentRequestId(payload.data.id);
      setShowPayment(true);
      toast.success(t.form.success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setPending(false);
    }
  }

  async function handlePaymentConfirm() {
    try {
      await fetch("/api/submit/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentRequestId }),
      });
      toast.success("Cảm ơn bạn! Yêu cầu sẽ được xử lý trong 24-48 giờ.");
      setShowPayment(false);
      setEmail("");
      setContactEmail("");
      setPassword("");
      setCourseTarget("");
      setFptCode("");
      setCurrentRequestId("");
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              {t.hero.badge}
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {t.hero.highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="bg-blue-600 px-6 hover:bg-blue-700"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                Xem gói dịch vụ
              </Button>
              <Button
                variant="outline"
                className="px-6"
                onClick={() => document.getElementById("submit-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Gửi yêu cầu ngay
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="absolute -right-6 bottom-6 h-36 w-36 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-blue-100/30 sm:p-8">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Dịch vụ hỗ trợ</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">Online</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Nhanh chóng</p>
                    <p className="mt-2 text-base font-semibold">Quy trình rõ ràng, xử lý gọn.</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Uy tín</p>
                    <p className="mt-2 text-base font-semibold">Theo dõi tiến độ minh bạch.</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bảo mật</p>
                    <p className="mt-2 text-base font-semibold">Giữ thông tin an toàn và riêng tư.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t.pricing.title}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.pricing.subtitle}</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 sm:gap-8">
            {/* Full Support */}
            <div
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all hover:shadow-xl sm:p-8 ${
                serviceType === "FULL_SUPPORT"
                  ? "border-blue-600 bg-white shadow-lg ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
              onClick={() => setServiceType("FULL_SUPPORT")}
            >
              <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                <Star className="mr-1 inline h-3 w-3" />
                {t.pricing.popular}
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.pricing.full.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.pricing.full.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">{t.pricing.full.price}</span>
                <span className="text-slate-500">{t.pricing.full.per}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {t.pricing.full.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  serviceType === "FULL_SUPPORT"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
                variant={serviceType === "FULL_SUPPORT" ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  setServiceType("FULL_SUPPORT");
                  document.getElementById("submit-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.pricing.full.cta}
              </Button>
            </div>

            {/* Skip Video */}
            <div
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all hover:shadow-xl sm:p-8 ${
                serviceType === "SKIP_VIDEO"
                  ? "border-blue-600 bg-white shadow-lg ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
              onClick={() => setServiceType("SKIP_VIDEO")}
            >
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Zap className="h-3 w-3" />
                  Tiết kiệm
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t.pricing.skip.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.pricing.skip.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-emerald-600">{t.pricing.skip.price}</span>
                <span className="text-slate-500">{t.pricing.skip.per}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {t.pricing.skip.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={serviceType === "SKIP_VIDEO" ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  setServiceType("SKIP_VIDEO");
                  document.getElementById("submit-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.pricing.skip.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.items.map((stat, i) => (
            <div key={i} className="flex flex-col items-center border-r border-slate-100 px-6 py-8 last:border-r-0 sm:py-10 sm:[&:nth-child(2)]:border-r lg:[&:nth-child(2)]:border-r">
              <span className="text-3xl font-bold text-blue-600 sm:text-4xl">{stat.value}</span>
              <span className="mt-2 text-sm text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t.howItWorks.title}</h2>
            <p className="mt-4 text-lg text-slate-600">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {t.howItWorks.steps.map((step, i) => (
              <div key={i} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{step.desc}</p>
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-300 sm:block">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Form / Payment */}
      <section id="submit-form" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            {showPayment ? (
              /* Payment QR */
              <Card className="border-slate-200 shadow-xl">
                <CardHeader className="space-y-2 px-5 text-center sm:px-6">
                  <CardTitle className="text-2xl text-slate-900">{t.payment.title}</CardTitle>
                  <CardDescription>{t.payment.scanQr}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-5 sm:space-y-6 sm:px-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                    {/* VietQR */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-center">
                        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrUrl}
                            alt="VietQR Payment"
                            width={200}
                            height={200}
                            className="h-auto w-full max-w-[200px] rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-900">{t.payment.bankInfo}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.payment.bank}</span>
                            <span className="font-medium text-slate-900">{BANK_INFO.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.payment.account}</span>
                            <span className="font-mono font-medium text-slate-900">{BANK_INFO.accountNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.payment.name}</span>
                            <span className="font-medium text-slate-900">{BANK_INFO.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.payment.amount}</span>
                            <span className="font-bold text-blue-600">{amount.toLocaleString("vi-VN")}₫</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.payment.content}</span>
                            <span className="font-mono font-medium text-blue-600">{transferContent}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PayPal */}
                    <div className="flex-1 space-y-4">
                      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-blue-50 p-4 text-center">
                        <h4 className="mb-4 text-lg font-semibold text-blue-900">{t.payment.paypalTitle}</h4>
                        <p className="text-sm text-blue-700 mb-6">{t.payment.paypalNote}</p>
                        <div className="w-full space-y-3 text-sm">
                          <div className="flex justify-between bg-white px-4 py-2 rounded-lg border border-blue-100">
                            <span className="text-slate-500">PayPal Email</span>
                            <span className="font-medium text-slate-900 text-right">{PAYPAL_INFO.email}</span>
                          </div>
                          <div className="flex justify-between bg-white px-4 py-2 rounded-lg border border-blue-100">
                            <span className="text-slate-500">{t.payment.amount}</span>
                            <span className="font-bold text-blue-600">${amountUsd} USD</span>
                          </div>
                          <div className="flex justify-between bg-white px-4 py-2 rounded-lg border border-blue-100">
                            <span className="text-slate-500">{t.payment.content}</span>
                            <span className="font-mono font-medium text-blue-600">{transferContent}</span>
                          </div>
                          <div className="pt-4">
                            <a href={PAYPAL_INFO.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center rounded-lg bg-[#0070ba] px-4 py-3 text-sm font-semibold text-white hover:bg-[#005ea6] transition-colors">
                              Pay with PayPal
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-amber-200 bg-amber-50">
                    <p className="text-sm text-amber-800">{t.payment.note}</p>
                  </Alert>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPayment(false)}
                    >
                      {t.payment.back}
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handlePaymentConfirm}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t.payment.confirm}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Submit Form */
              <Card className="border-slate-200 shadow-xl">
                <CardHeader className="space-y-2 px-5 text-center sm:px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <Lock className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{t.form.title}</CardTitle>
                  <CardDescription>{t.form.desc}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 sm:px-6">
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Service Type */}
                    <div className="space-y-2">
                      <Label>{t.form.service}</Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          className={`rounded-xl border-2 p-3 text-left text-sm transition-all ${
                            serviceType === "FULL_SUPPORT"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-700 hover:border-blue-300"
                          }`}
                          onClick={() => setServiceType("FULL_SUPPORT")}
                        >
                          <span className="block font-semibold">{t.pricing.full.name}</span>
                          <span className="block font-bold text-blue-600">{t.pricing.full.price}</span>
                        </button>
                        <button
                          type="button"
                          className={`rounded-xl border-2 p-3 text-left text-sm transition-all ${
                            serviceType === "SKIP_VIDEO"
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 text-slate-700 hover:border-emerald-300"
                          }`}
                          onClick={() => setServiceType("SKIP_VIDEO")}
                        >
                          <span className="block font-semibold">{t.pricing.skip.name}</span>
                          <span className="block font-bold text-emerald-600">{t.pricing.skip.price}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t.form.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.form.emailPh}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">
                        {t.form.contactEmail}
                        <span className="ml-1 text-xs font-normal text-slate-400">(tuỳ chọn)</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder={t.form.contactEmailPh}
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{t.form.password}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t.form.passwordPh}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-900"
                          aria-label={showPassword ? t.form.hidePw : t.form.showPw}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseTarget">
                        {t.form.course}
                        <span className="ml-1 text-xs font-normal text-slate-400">(tuỳ chọn)</span>
                      </Label>
                      <Input
                        id="courseTarget"
                        type="text"
                        placeholder={t.form.coursePh}
                        value={courseTarget}
                        onChange={(event) => setCourseTarget(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fptCode">
                        {t.form.fptCode}
                        <span className="ml-1 text-xs font-normal text-slate-400">(tuỳ chọn)</span>
                      </Label>
                      <Input
                        id="fptCode"
                        type="text"
                        placeholder={t.form.fptCodePh}
                        value={fptCode}
                        onChange={(event) => setFptCode(event.target.value)}
                      />
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <div className="space-y-3">
                        <p className="text-sm leading-6 text-slate-700">
                          {t.form.forgotHelper}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="border-blue-200 text-blue-700 hover:bg-blue-100"
                          onClick={() => window.open(COURSERA_LOGIN_URL, "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t.form.openCoursera}
                        </Button>
                      </div>
                    </Alert>

                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
                      {pending ? t.form.submitting : t.form.submit}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <span className="text-sm font-medium text-slate-700">{t.footer.support}</span>
            <a
              href="https://t.me/+84837474615"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.85.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.48-1.46 4.2-1.71 4.67-1.72.1 0 .34.02.48.13.12.09.16.21.18.33.02.09.02.22.01.31z" />
              </svg>
              Liss Gray (+84 837474615)
            </a>
          </div>
          <p className="text-sm text-slate-500">{t.footer.copyright}</p>
          <p className="mt-1 text-xs text-slate-400">{t.footer.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
