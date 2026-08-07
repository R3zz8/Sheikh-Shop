'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { CircleX, Play, Film, ImageIcon, ArrowRight, ArrowLeft, Star, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, type FC } from 'react';
import { deleteImage, fetchImages, uploadImage } from '../services/image';
import Spinner from '@/components/Spinner';
import { toast } from 'sonner';

const UploadImage: FC<{ productId: string }> = ({ productId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<any[] | null>(null);
  const [videos, setVideos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !productId) {
      toast.error('لطفاً یک فایل معتبر انتخاب کنید.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      const response = await uploadImage(formData);

      if (response?.error) {
        toast.error(`بارگذاری با خطا مواجه شد: ${response.error}`);
        return;
      }

      toast.success('فایل با موفقیت بارگذاری شد!');
      setFile(null);
      // Clear file input
      const fileInput = document.getElementById('media-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh media assets
      await loadMedia();
    } catch {
      toast.error('خطایی در ارتباط با سرور رخ داده است.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, publicId?: string) => {
    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;
    try {
      setLoading(true);
      if (publicId) {
        await deleteImage(publicId);
      } else {
        await fetch(`/api/upload/local/${imageId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
      setImages((prev) => prev?.filter((img) => img.id !== imageId && img.publicId !== publicId) || null);
      toast.success('تصویر با موفقیت حذف شد.');
    } catch {
      toast.error('خطا در حذف تصویر کالا.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('آیا از حذف این ویدیو اطمینان دارید؟')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/upload/video/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setVideos((prev) => prev?.filter((vid) => vid.id !== videoId) || null);
        toast.success('ویدیو با موفقیت حذف شد.');
      } else {
        toast.error('خطا در حذف ویدیو.');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // Set selected image as Featured / Main image
  const handleSetMainImage = async (imageId: string) => {
    if (!images) return;

    // Optimistic UI update
    const updated = images.map((img) => ({
      ...img,
      isFeatured: img.id === imageId,
    }));
    setImages(updated);

    try {
      const res = await fetch('/api/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setFeatured',
          imageId,
          productId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('تصویر به عنوان تصویر اصلی کالا تنظیم گردید.');
    } catch {
      toast.error('خطا در تنظیم تصویر اصلی.');
      loadMedia();
    }
  };

  // Toggle Visibility of Image
  const handleToggleVisibility = async (imageId: string, currentVisibility: boolean) => {
    if (!images) return;
    const newVisibility = !currentVisibility;

    // Optimistic UI update
    const updated = images.map((img) => {
      if (img.id === imageId) {
        return { ...img, isVisible: newVisibility };
      }
      return img;
    });
    setImages(updated);

    try {
      const res = await fetch('/api/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleVisibility',
          imageId,
          isVisible: newVisibility,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(newVisibility ? 'تصویر نمایان شد.' : 'تصویر مخفی شد.');
    } catch {
      toast.error('خطا در تغییر وضعیت نمایش تصویر.');
      loadMedia();
    }
  };

  // Reorder functions with immediate DB persistence
  const handleMoveImage = async (index: number, direction: 'left' | 'right') => {
    if (!images) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Reassign sortOrder sequentially
    const updatedWithSortOrder = newImages.map((img, idx) => ({
      ...img,
      sortOrder: idx,
    }));

    setImages(updatedWithSortOrder);

    try {
      const res = await fetch('/api/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          images: updatedWithSortOrder.map((img) => ({ id: img.id, sortOrder: img.sortOrder })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('چیدمان جدید تصاویر ذخیره شد.');
    } catch {
      toast.error('خطا در ذخیره ترتیب جدید تصاویر.');
      loadMedia();
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchImages(productId);
      if (data?.images) {
        setImages(data.images);
      } else {
        setImages([]);
      }
      if (data?.videos) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
    } catch {
      setImages([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadMedia();
    }
  }, [productId]);

  return (
    <div className="w-full space-y-6 text-right font-vazirmatn bg-[#0d0907]/90 border border-amber-500/15 rounded-3xl p-6 shadow-2xl backdrop-blur-lg" dir="rtl">
      <div>
        <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-300 flex items-center gap-2">
          <span>📦 مدیریت رسانه‌های کالا (Media Manager)</span>
        </h3>
        <p className="text-[11px] text-stone-400 mt-1">آپلود تصاویر گالری، تعیین تصویر شاخص (اصلی)، تغییر ترتیب چیدمان و بارگذاری ویدیوهای نقد و بررسی</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="media-upload-input" className="text-xs font-bold text-stone-300">بارگذاری فایل جدید (عکس یا ویدیو)</Label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between bg-stone-950/60 p-4 rounded-2xl border border-stone-850">
          <Input
            id="media-upload-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleChangeFile}
            disabled={uploading}
            className="bg-stone-950/80 border-stone-800 text-xs py-1.5 focus:border-amber-500/30 text-stone-300"
          />
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs py-2 px-6 shrink-0 rounded-xl"
          >
            {uploading ? 'درحال بارگذاری...' : 'شروع بارگذاری'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <Spinner />
          <p className="text-[10px] text-stone-500 mt-2">در حال بروزرسانی گالری چندرسانه‌ای...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Images Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>تصاویر گالری کالا ({images?.length || 0})</span>
            </h4>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((item, idx) => (
                  <div className={`relative group bg-[#140F0D] border ${item.isFeatured ? 'border-amber-500/50 shadow-amber-500/10' : 'border-stone-850'} rounded-2xl p-3 flex flex-col justify-between`} key={item.id}>

                    {/* Delete button (Top-Left) */}
                    <CircleX
                      className="absolute top-2 left-2 text-red-500 p-1 opacity-100 hover:text-red-400 transition-colors cursor-pointer z-20 w-7 h-7 bg-black/80 rounded-full"
                      onClick={() => handleDeleteImage(item.id, item.publicId)}
                    />

                    {/* Featured Star Indicator (Top-Right) */}
                    {item.isFeatured ? (
                      <span className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full z-15 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>اصلی</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(item.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-black/80 text-stone-300 hover:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full z-15"
                      >
                        شاخص کردن
                      </button>
                    )}

                    {/* Image Render */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-950/40 border border-stone-900 mt-2">
                      <Image
                        fill
                        alt="تصویر گالری"
                        src={item.secureUrl || item.image}
                        className={`object-contain p-1 ${item.isVisible ? '' : 'opacity-30'}`}
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                      {!item.isVisible && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <span className="text-[10px] font-bold bg-stone-900 text-stone-400 px-2 py-1 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>پنهان شده</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Controls Panel */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-900/60 z-10">
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item.id, item.isVisible)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                          item.isVisible
                            ? 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-amber-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}
                        title={item.isVisible ? 'مخفی کردن' : 'نمایش دادن'}
                      >
                        {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px] font-black">{item.isVisible ? 'نمایان' : 'مخفی'}</span>
                      </button>

                      {/* Reordering Controls */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-400 disabled:opacity-20 transition-colors"
                          title="انتقال به راست"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'right')}
                          disabled={idx === images.length - 1}
                          className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-400 disabled:opacity-20 transition-colors"
                          title="انتقال به چپ"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-stone-950/25 border border-dashed border-stone-850 rounded-2xl">
                <p className="text-[11px] text-stone-500">هیچ تصویری برای این کالا ثبت نشده است.</p>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="space-y-3 pt-4 border-t border-stone-900">
            <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              <span>ویدیوهای معرفی کالا ({videos?.length || 0})</span>
            </h4>
            {videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {videos.map((item) => (
                  <div className="relative group bg-[#140F0D] border border-stone-850 rounded-2xl p-3 flex flex-col justify-between" key={item.id}>
                    <CircleX
                      className="absolute top-2 left-2 text-red-500 p-1 opacity-100 hover:text-red-400 transition-colors cursor-pointer z-20 w-7 h-7 bg-black/80 rounded-full"
                      onClick={() => handleDeleteVideo(item.id)}
                    />
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-900 flex items-center justify-center">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="ویدیو" className="w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="text-stone-600">🎥</div>
                      )}
                      <Play className="absolute w-10 h-10 text-amber-500 fill-amber-500 opacity-80 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(item.url)}
                        className="text-[11px] font-black text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 border border-amber-500/15 rounded-lg py-1 w-full"
                      >
                        پیش‌نمایش ویدیو کالا
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-stone-950/25 border border-dashed border-stone-850 rounded-2xl">
                <p className="text-[11px] text-stone-500">هیچ ویدیوی معرفی برای این کالا بارگذاری نشده است.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Preview Modal Overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-[#140F0D] border border-amber-500/15 rounded-3xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 edit-video-modal-close-btn z-50 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/10 hover:bg-black"
            >
              ✕
            </button>
            <video src={previewUrl} controls autoPlay playsInline className="w-full rounded-2xl aspect-video" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
