'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Layers,
  FolderGit2,
  HelpCircle,
  Calculator,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SheikhWebDashboardView() {
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'portfolio' | 'faqs' | 'rules'>('services');

  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Form States
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resS, resP, resF, resR] = await Promise.all([
        fetch('/api/admin/web/services'),
        fetch('/api/admin/web/portfolio'),
        fetch('/api/admin/web/faqs'),
        fetch('/api/admin/web/calculator-rules'),
      ]);

      if (resS.ok) setServices(await resS.json());
      if (resP.ok) setPortfolio(await resP.json());
      if (resF.ok) setFaqs(await resF.json());
      if (resR.ok) setRules(await resR.json());
    } catch (e) {
      toast.error('خطا در دریافت اطلاعات داشبورد شیخ وب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler for Deletions
  const handleDeleteService = async (id: string) => {
    if (!confirm('آیا از حذف این خدمت و پکیج‌های وابسته مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/web/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('خدمت با موفقیت حذف شد');
        fetchAllData();
      } else {
        toast.error('خطا در حذف خدمت');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('آیا از حذف این پکیج مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/web/packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('پکیج با موفقیت حذف شد');
        fetchAllData();
      } else {
        toast.error('خطا در حذف پکیج');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('آیا از حذف این نمونه‌کار مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/web/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('نمونه‌کار با موفقیت حذف شد');
        fetchAllData();
      } else {
        toast.error('خطا در حذف نمونه‌کار');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('آیا از حذف این سوال متداول مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/web/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('سوال متداول حذف شد');
        fetchAllData();
      } else {
        toast.error('خطا در حذف سوال متداول');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('آیا از حذف این قانون محاسباتی مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/web/calculator-rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('قانون با موفقیت حذف شد');
        fetchAllData();
      } else {
        toast.error('خطا در حذف قانون');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-vazirmatn text-right dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>مدیریت ارشد دپارتمان شیخ وب</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">مدیریت خدمات و محصولات شیخ وب</h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            مدیریت کامل لیست خدمات، تعرفه‌ها، پکیج‌ها، نمونه‌کارها، سوالات متداول و قوانین محاسباتی
          </p>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-800 pb-4">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>خدمات اصلی ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'packages'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>پکیج‌های تعرفه‌ای</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'portfolio'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>نمونه‌کارها ({portfolio.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'faqs'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>سوالات متداول ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>قوانین برآورد قیمت ({rules.length})</span>
        </button>
      </div>

      {/* Tab 1: Services */}
      {activeTab === 'services' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">لیست خدمات شیخ وب</h2>
            <button
              onClick={() => setEditingService({ title: '', slug: '', shortDescription: '', startingPrice: 30000000, features: [], isActive: true, displayOrder: services.length + 1 })}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن خدمت جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div key={svc.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-amber-400 font-mono">/web/{svc.slug}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{svc.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingService(svc)}
                      className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-amber-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-2 rounded-lg bg-stone-800 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-stone-400 text-xs mb-4 line-clamp-2">{svc.shortDescription}</p>

                <div className="flex items-center justify-between text-xs pt-4 border-t border-stone-800">
                  <span className="text-amber-300 font-bold">
                    شروع از: {new Intl.NumberFormat('fa-IR').format(svc.startingPrice)} تومان
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${svc.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {svc.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Packages */}
      {activeTab === 'packages' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">پکیج‌های تعرفه‌ای خدمات</h2>
            <button
              onClick={() => setEditingPackage({ serviceId: services[0]?.id || '', name: 'حرفه‌ای', price: 45000000, features: [], isActive: true })}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن پکیج جدید</span>
            </button>
          </div>

          <div className="space-y-6">
            {services.map((svc) => (
              <div key={svc.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-amber-300 mb-4 pb-2 border-b border-stone-800">
                  پکیج‌های {svc.title} ({svc.packages?.length || 0})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {svc.packages?.map((pkg: any) => (
                    <div key={pkg.id} className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                          <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-400 text-xs">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-amber-400 font-bold text-xs mb-3">
                          {new Intl.NumberFormat('fa-IR').format(pkg.price)} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!svc.packages || svc.packages.length === 0) && (
                    <p className="text-stone-500 text-xs col-span-3">پکیجی برای این خدمت ثبت نشده است.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Portfolio */}
      {activeTab === 'portfolio' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">لیست نمونه‌کارهای ثبت شده</h2>
            <button
              onClick={() => setEditingPortfolio({ title: '', imageUrl: '', technologies: [], isActive: true })}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن نمونه‌کار جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4">
                <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
                <p className="text-stone-400 text-xs mb-4">{item.category || 'عمومی'}</p>
                <button
                  onClick={() => handleDeletePortfolio(item.id)}
                  className="w-full py-2 bg-red-500/10 text-red-300 rounded-lg text-xs font-bold hover:bg-red-500/20"
                >
                  حذف نمونه‌کار
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeTab === 'faqs' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">مدیریت سوالات متداول</h2>
            <button
              onClick={() => setEditingFaq({ question: '', answer: '', category: 'عمومی', isActive: true })}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن سوال جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{faq.question}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-2 bg-stone-800 text-red-400 hover:bg-red-500/20 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Rules */}
      {activeTab === 'rules' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">قوانین محاسبه آنلاین قیمت</h2>
            <button
              onClick={() => setEditingRule({ title: '', key: '', category: 'FEATURE', price: 5000000, isActive: true })}
              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن قانون قیمت‌گذاری</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono">{rule.category} : {rule.key}</span>
                  <h4 className="font-bold text-white text-xs mt-0.5">{rule.title}</h4>
                  <span className="text-xs text-amber-300 font-bold mt-1 block">
                    {new Intl.NumberFormat('fa-IR').format(rule.price)} تومان
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Service Edit / Create */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full">
            <h3 className="text-lg font-bold text-white mb-4">ویرایش / ایجاد خدمت</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const url = editingService.id ? `/api/admin/web/services/${editingService.id}` : '/api/admin/web/services';
                  const method = editingService.id ? 'PATCH' : 'POST';
                  const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingService),
                  });
                  if (res.ok) {
                    toast.success('خدمت با موفقیت ذخیره شد');
                    setEditingService(null);
                    fetchAllData();
                  } else {
                    const d = await res.json();
                    toast.error(d.message || 'خطا در ذخیره خدمت');
                  }
                } catch {
                  toast.error('خطا در لارتباط');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-300 block mb-1">عنوان خدمت</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">اسلاگ (لاتین)</label>
                <input
                  type="text"
                  value={editingService.slug}
                  onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">توضیحات کوتاه</label>
                <textarea
                  rows={2}
                  value={editingService.shortDescription}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">شروع قیمت (تومان)</label>
                <input
                  type="number"
                  value={editingService.startingPrice}
                  onChange={(e) => setEditingService({ ...editingService, startingPrice: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl">
                  ذخیره تغییرات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Package Edit / Create */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">ایجاد پکیج تعرفه‌ای</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/admin/web/packages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingPackage),
                  });
                  if (res.ok) {
                    toast.success('پکیج ایجاد شد');
                    setEditingPackage(null);
                    fetchAllData();
                  } else {
                    toast.error('خطا در ذخیره پکیج');
                  }
                } catch {
                  toast.error('خطا در ارتباط');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-300 block mb-1">انتخاب خدمت</label>
                <select
                  value={editingPackage.serviceId}
                  onChange={(e) => setEditingPackage({ ...editingPackage, serviceId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-stone-300 block mb-1">نام پکیج (مثلا اقتصادی)</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">قیمت (تومان)</label>
                <input
                  type="number"
                  value={editingPackage.price}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl">
                  ثبت پکیج
                </button>
                <button type="button" onClick={() => setEditingPackage(null)} className="px-4 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Portfolio Edit / Create */}
      {editingPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">ثبت نمونه‌کار جدید</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/admin/web/portfolio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingPortfolio),
                  });
                  if (res.ok) {
                    toast.success('نمونه‌کار ثبت شد');
                    setEditingPortfolio(null);
                    fetchAllData();
                  } else {
                    toast.error('خطا در ذخیره نمونه‌کار');
                  }
                } catch {
                  toast.error('خطا در ارتباط');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-300 block mb-1">عنوان نمونه‌کار</label>
                <input
                  type="text"
                  value={editingPortfolio.title}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">آدرس تصویر (URL)</label>
                <input
                  type="text"
                  value={editingPortfolio.imageUrl}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, imageUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl">
                  ذخیره
                </button>
                <button type="button" onClick={() => setEditingPortfolio(null)} className="px-4 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for FAQ Edit / Create */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">ثبت سوال متداول</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/admin/web/faqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingFaq),
                  });
                  if (res.ok) {
                    toast.success('سوال ثبت شد');
                    setEditingFaq(null);
                    fetchAllData();
                  } else {
                    toast.error('خطا در ذخیره سوال');
                  }
                } catch {
                  toast.error('خطا در ارتباط');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-300 block mb-1">پرسش</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">پاسخ</label>
                <textarea
                  rows={3}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl">
                  ذخیره
                </button>
                <button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Calculator Rule Edit / Create */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">ثبت قانون محاسبات قیمت</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/admin/web/calculator-rules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingRule),
                  });
                  if (res.ok) {
                    toast.success('قانون ثبت شد');
                    setEditingRule(null);
                    fetchAllData();
                  } else {
                    toast.error('خطا در ثبت قانون');
                  }
                } catch {
                  toast.error('خطا در ارتباط');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-stone-300 block mb-1">عنوان قانون (مثلاً چندزبانه)</label>
                <input
                  type="text"
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">کلید انگلیسی (مثلاً multilingual)</label>
                <input
                  type="text"
                  value={editingRule.key}
                  onChange={(e) => setEditingRule({ ...editingRule, key: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-stone-300 block mb-1">دسته‌بندی</label>
                <select
                  value={editingRule.category}
                  onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                >
                  <option value="TYPE">نوع سایت (TYPE)</option>
                  <option value="FEATURE">امکانات جانبی (FEATURE)</option>
                </select>
              </div>
              <div>
                <label className="text-stone-300 block mb-1">مبلغ به تومان</label>
                <input
                  type="number"
                  value={editingRule.price}
                  onChange={(e) => setEditingRule({ ...editingRule, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl">
                  ذخیره
                </button>
                <button type="button" onClick={() => setEditingRule(null)} className="px-4 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
