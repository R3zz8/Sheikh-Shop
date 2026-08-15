'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import type { CarouselSlide } from '../views/MobileCarouselDashboardView';
import MobileCarouselForm from './MobileCarouselForm';

const deleteCarouselSlide = async (id: string) => {
  const res = await fetch(`/api/admin/mobile-carousel/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'خطا در حذف اسلاید');
  }
};

type MobileCarouselTableProps = {
  slides: CarouselSlide[];
};

export default function MobileCarouselTable({ slides }: MobileCarouselTableProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      toast.success('اسلاید با موفقیت حذف شد');
      setIsDeleteConfirmOpen(false);
      setSlideToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSlideToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6 font-vazirmatn text-right" dir="rtl">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900/80 p-5 rounded-2xl border border-amber-500/20 backdrop-blur-md">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-100">مدیریت اسلایدر تبلیغاتی موبایل</h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">مدیریت بنرهای ویژه صفحه نخست موبایل (متن‌ها، لینک و تصویر)</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSlide(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold shadow-lg shadow-amber-500/10"
        >
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن اسلاید جدید
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/40 rounded-2xl border border-stone-800">
          <p className="text-stone-400 text-sm">هیچ اسلایدی یافت نشد. برای شروع یک اسلاید جدید بیفزایید.</p>
        </div>
      ) : (
        <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950/60 backdrop-blur-md shadow-2xl">
          <Table>
            <TableHeader className="bg-stone-900/90 border-b border-stone-800">
              <TableRow className="border-stone-800 hover:bg-transparent">
                <TableHead className="text-right text-amber-300 font-bold">تصویر</TableHead>
                <TableHead className="text-right text-amber-300 font-bold">عنوان اصلی / بالای تیتر</TableHead>
                <TableHead className="text-right text-amber-300 font-bold">متن تبلیغاتی & زیرعنوان</TableHead>
                <TableHead className="text-right text-amber-300 font-bold">دکمه & لینک مقصد</TableHead>
                <TableHead className="text-center text-amber-300 font-bold">ترتیب</TableHead>
                <TableHead className="text-left text-amber-300 font-bold">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...slides]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((slide) => (
                  <TableRow key={slide.id} className="border-stone-800/60 hover:bg-stone-900/40">
                    <TableCell>
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-20 h-12 object-cover rounded-lg border border-amber-500/20 bg-stone-900"
                        />
                      ) : (
                        <div className="w-20 h-12 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 text-xs">
                          بدون تصویر
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-stone-100 text-sm">{slide.topTitle || 'فروشگاه شیخ'}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-amber-200 text-sm">{slide.title}</div>
                      <div className="text-stone-400 text-xs mt-0.5">{slide.subtitle || 'international store'}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-amber-400 font-medium">{slide.ctaText || 'مشاهده فروشگاه'}</div>
                      <a
                        href={slide.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 text-xs mt-0.5 transition-colors font-mono"
                        dir="ltr"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{slide.link}</span>
                      </a>
                    </TableCell>

                    <TableCell className="text-center font-mono text-stone-300 text-sm">
                      {slide.order ?? 0}
                    </TableCell>

                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="ویرایش اسلاید"
                          data-testid="edit-slide-btn"
                          onClick={() => handleEdit(slide)}
                          className="text-stone-300 hover:text-amber-300 hover:bg-amber-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="حذف اسلاید"
                          data-testid="delete-slide-btn"
                          onClick={() => handleDelete(slide.id)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Slide Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedSlide(null);
        }
        setIsFormOpen(isOpen);
      }}>
        <DialogContent className="bg-stone-950 border-amber-500/30 text-stone-100 max-w-lg">
          <DialogHeader className="text-right border-b border-stone-800 pb-3">
            <DialogTitle className="text-lg font-bold text-amber-200 font-vazirmatn">
              {selectedSlide ? 'ویرایش اسلاید تبلیغاتی' : 'افزودن اسلاید جدید'}
            </DialogTitle>
          </DialogHeader>
          <MobileCarouselForm
            slide={selectedSlide}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedSlide(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-stone-950 border-rose-500/30 text-stone-100 max-w-md text-right font-vazirmatn" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-rose-400">آیا از حذف این اسلاید اطمینان دارید؟</DialogTitle>
            <DialogDescription className="text-stone-400 text-sm mt-2">
              این عملیات قابل بازگشت نیست و اسلاید به طور کامل حذف خواهد شد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="border-stone-700 text-stone-300 hover:bg-stone-800"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (slideToDelete) {
                  deleteMutation.mutate(slideToDelete);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 font-bold"
            >
              {deleteMutation.isPending ? 'در حال حذف...' : 'حذف اسلاید'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
