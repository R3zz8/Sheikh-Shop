'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, Trash2, Edit3, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  imagePublicId?: string | null;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

interface CategoryManagementViewProps {
  initialCategories: CategoryData[];
}

export default function CategoryManagementView({ initialCategories }: CategoryManagementViewProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Form states for text editing
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchLatestCategories = async () => {
    try {
      const res = await fetch('/api/categories?includeInactive=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to refetch categories:', err);
    }
  };

  const handleOpenEditModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditSortOrder(cat.sortOrder || 0);
    setEditIsActive(cat.isActive);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۲ مگابایت باشد.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSaveImageUpload = async () => {
    if (!editingCategory || !selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/admin/categories/${editingCategory.id}/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'خطا در بارگذاری تصویر');
      }

      toast.success('تصویر دسته‌بندی با موفقیت بروزرسانی شد.');
      await fetchLatestCategories();

      if (data.data) {
        setEditingCategory(data.data);
      }
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در آپلود تصویر');
    } finally {
      setIsUploading(false);
    }
  };


  const handleSaveCategoryInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSavingInfo(true);
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDescription,
          sortOrder: editSortOrder,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'خطا در ذخیره اطلاعات');
      }

      toast.success('اطلاعات دسته‌بندی با موفقیت ویرایش شد.');
      await fetchLatestCategories();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'خطا در بروزرسانی دسته‌بندی');
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-vazirmatn text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-500/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 bg-clip-text text-transparent">
            مدیریت دسته‌بندی‌های اصلی
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            مشاهده، ویرایش اطلاعات و مدیریت تصاویر دسته‌بندی‌های اصلی فروشگاه شیخ
          </p>
        </div>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-stone-900/60 border border-amber-500/15 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-stone-200 text-sm">
            <thead className="bg-stone-950/80 text-amber-300/80 uppercase text-xs border-b border-amber-500/10 font-bold">
              <tr>
                <th className="px-6 py-4">تصویر</th>
                <th className="px-6 py-4">نام دسته‌بندی</th>
                <th className="px-6 py-4">نام مستعار (Slug)</th>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-amber-500/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-amber-500/30 bg-stone-950 flex items-center justify-center shrink-0">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-amber-500/60" />
                        )}
                      </div>
                      {!cat.image && (
                        <span className="px-2 py-1 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚠️ فاقد تصویر
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-100">{cat.name}</td>
                  <td className="px-6 py-4 text-amber-200/70 font-mono dir-ltr text-right">{cat.slug}</td>
                  <td className="px-6 py-4">{cat.sortOrder}</td>
                  <td className="px-6 py-4">
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all duration-200 text-xs font-bold"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>مدیریت و تصویر</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/20 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h2 className="text-xl font-bold text-amber-200">
                مدیریت دسته‌بندی: {editingCategory.name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-stone-400 hover:text-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Editor Section */}
            <div className="bg-stone-950/60 p-5 rounded-xl border border-amber-500/10 space-y-4">
              <h3 className="text-sm font-bold text-amber-300/90 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                تصویر کنونی و بروزرسانی
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Current / Preview Image Display */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-xl bg-stone-900 flex items-center justify-center">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="پیش‌نمایش" fill className="object-cover" unoptimized />
                    ) : editingCategory.image ? (
                      <Image src={editingCategory.image} alt={editingCategory.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="text-xs text-stone-500">بدون تصویر</span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 font-medium">
                    {previewUrl ? 'پیش‌نمایش جدید' : 'تصویر فعلی'}
                  </span>
                </div>

                {/* Upload & Action Controls */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">انتخاب تصویر جایگزین (حداکثر ۲ مگابایت):</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-stone-400 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {selectedFile ? (
                      <button
                        type="button"
                        onClick={handleSaveImageUpload}
                        disabled={isUploading}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>جایگزینی و ذخیره تصویر جدید</span>
                      </button>
                    ) : (
                      <p className="text-[11px] text-amber-200/70 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        ✦ طبق قوانین سیستم، هر دسته‌بندی باید همواره دارای یک تصویر اصلی باشد. برای تغییر تصویر فعلی، فایل جدید انتخاب کنید.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Information Form */}
            <form onSubmit={handleSaveCategoryInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">نام دسته‌بندی</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">نام مستعار (Slug)</label>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">توضیحات</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-stone-950 border border-amber-500/20 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className="text-xs text-stone-300">نمایش به عنوان دسته‌بندی فعال</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors text-xs font-bold shadow-lg disabled:opacity-50"
                >
                  {isSavingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
