'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, CheckCircle2, Phone, User, MessageSquare, Send, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface Rule {
  id: string;
  title: string;
  key: string;
  category: 'TYPE' | 'FEATURE' | string;
  price: number;
  icon?: string | null;
  isDefault?: boolean;
}

interface WebCalculatorSectionProps {
  rules: Rule[];
}

const formatToman = (amount: number) => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export default function WebCalculatorSection({ rules }: WebCalculatorSectionProps) {
  const typeRules = useMemo(() => rules.filter((r) => r.category === 'TYPE'), [rules]);
  const featureRules = useMemo(() => rules.filter((r) => r.category === 'FEATURE'), [rules]);

  const defaultTypeKey = useMemo(() => {
    const def = typeRules.find((r) => r.isDefault);
    return def ? def.key : typeRules[0]?.key || 'store';
  }, [typeRules]);

  const [selectedTypeKey, setSelectedTypeKey] = useState<string>(defaultTypeKey);
  const [selectedFeatureKeys, setSelectedFeatureKeys] = useState<string[]>([]);

  // Form Lead State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic real-time estimate
  const estimatedPrice = useMemo(() => {
    const typeRule = typeRules.find((r) => r.key === selectedTypeKey);
    let total = typeRule ? typeRule.price : 0;

    selectedFeatureKeys.forEach((key) => {
      const featRule = featureRules.find((r) => r.key === key);
      if (featRule) {
        total += featRule.price;
      }
    });

    return total;
  }, [selectedTypeKey, selectedFeatureKeys, typeRules, featureRules]);

  const toggleFeature = (key: string) => {
    setSelectedFeatureKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('لطفاً شماره تماس معتبر ۱۰ یا ۱۱ رقمی وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/web/calculator/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTypeKey: selectedTypeKey,
          selectedFeatureKeys,
          name,
          phone,
          notes,
          submitLead: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'خطا در ثبت درخواست');
      }

      setSuccessMessage('درخواست مشاوره و برآورد قیمت شما با موفقیت ثبت شد. کارشناسان شیخ وب بزودی با شما تماس خواهند گرفت.');
      setName('');
      setPhone('');
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="calculator" className="py-16 md:py-24 bg-stone-950 font-vazirmatn text-right relative z-10 border-t border-b border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>محاسبه آنلاین شفاف و هوشمند</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            برآورد هوشمند قیمت پروژه وب‌سایت
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg leading-relaxed">
            نوع سایت و امکانات مورد نظر خود را انتخاب کنید تا برآورد اولیه سرمایه‌گذاری پروژه خود را به صورت آنی مشاهده نمایید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT/MAIN column: Type and Options Selection */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Select Site Type */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">۱</span>
                <span>انتخاب نوع وب‌سایت</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {typeRules.map((rule) => {
                  const isSelected = selectedTypeKey === rule.key;
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setSelectedTypeKey(rule.key)}
                      className={`p-4 rounded-2xl border text-right transition-all duration-200 flex flex-col justify-between min-h-[100px] ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-stone-950 border-stone-800 hover:border-amber-500/30 text-stone-300'
                      }`}
                    >
                      <span className="text-sm font-bold">{rule.title}</span>
                      <span className="text-xs text-amber-400 font-semibold mt-2">
                        {formatToman(rule.price)} تومان
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Optional Features */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">۲</span>
                <span>امکانات و ماژول‌های درخواستی (اختیاری)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureRules.map((rule) => {
                  const isChecked = selectedFeatureKeys.includes(rule.key);
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => toggleFeature(rule.key)}
                      className={`p-3.5 rounded-xl border text-right flex items-center justify-between transition-all duration-200 ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500/80 text-amber-200'
                          : 'bg-stone-950 border-stone-800/80 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-700 bg-stone-900'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">{rule.title}</span>
                      </div>
                      <span className="text-xs text-stone-400 font-medium dir-ltr">
                        +{formatToman(rule.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT column: Live Summary & Lead Request Form */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  برآورد اولیه سرمایه‌گذاری
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-bold">
                  پیش‌فاکتور غیررسمی
                </span>
              </div>

              {/* Price Display */}
              <div className="text-center py-6 bg-stone-950/80 border border-amber-500/30 rounded-2xl mb-6">
                <span className="text-stone-400 text-xs font-semibold block mb-1">
                  مبلغ تخمینی پروژه:
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 mb-1">
                  {formatToman(estimatedPrice)}
                </div>
                <span className="text-amber-200/80 text-xs font-bold">تومان</span>
              </div>

              {/* Disclaimer notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-amber-200 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  این مبلغ صرفاً <strong>برآورد اولیه</strong> بر اساس انتخاب‌های شما است و پس از برگزاری جلسه مشاوره فنی امکان دقیق‌تر شدن دارد.
                </span>
              </div>

              {/* Lead submission form */}
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <h4 className="text-sm font-bold text-white mb-2">ثبت درخواست مشاوره و صدور پیش‌فاکتور</h4>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold leading-relaxed">
                    {successMessage}
                  </div>
                )}

                <div>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="شماره تماس (مانند ۰۹۱۲۳۴۵۶۷۸۹) *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      placeholder="توضیحات تکمیلی پروژه (اختیاری)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'در حال ثبت درخواست...' : 'ثبت رایگان درخواست مشاوره'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
