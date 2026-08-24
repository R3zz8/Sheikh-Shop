'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
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
import type { BmwCarouselSlide } from '../views/BmwCarouselDashboardView';
import BmwCarouselForm from './BmwCarouselForm';

const deleteSlideApi = async (id: string) => {
  const res = await fetch(`/api/admin/bmw-carousel/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'خطا در حذف تصویر کروسل');
  }
};

type BmwCarouselTableProps = {
  slides: BmwCarouselSlide[];
};

export default function BmwCarouselTable({ slides }: BmwCarouselTableProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<BmwCarouselSlide | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteSlideApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bmwCarouselSlides'] });
      queryClient.invalidateQueries({ queryKey: ['bmwCarouselData'] });
      toast.success('تصویر کروسل ۳بعدی با موفقیت حذف شد');
      setIsDeleteConfirmOpen(false);
      setSlideToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (slide: BmwCarouselSlide) => {
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
          <h1 className="text-xl sm:text-2xl font-black text-amber-100">مدیریت کروسل ۳بعدی (3D Coverflow Carousel)</h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            افزودن، حذف، ویرایش، تعویض تصویر و تنظیم ترتیب نمایش اسلایدهای ۳بعدی دسکتاپ
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedSlide(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold shadow-lg shadow-amber-500/10"
        >
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن تصویر به کروسل
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-stone-900/40 rounded-2xl border border-amber-500/10 backdrop-blur-md shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-100 mb-2 font-vazirmatn">
            هنوز تصویری برای این کروسل اضافه نشده است
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed font-vazirmatn">
            تصاویر کروسل ۳بعدی هنوز خالی هستند. برای افزودن تصویر جدید روی دکمه زیر کلیک کنید.
          </p>
          <Button
            onClick={() => {
              setSelectedSlide(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all font-vazirmatn"
          >
            <PlusCircle className="ml-2 h-5 w-5" /> افزودن تصویر
          </Button>
        </div>
      ) : (
        <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950/60 backdrop-blur-md shadow-2xl">
          <Table>
            <TableHeader className="bg-stone-900/90 border-b border-stone-800">
              <TableRow className="border-stone-800 hover:bg-transparent">
                <TableHead className="text-right text-amber-300 font-bold">پیش‌نمایش تصویر</TableHead>
                <TableHead className="text-right text-amber-300 font-bold">عنوان اسلاید</TableHead>
                <TableHead className="text-center text-amber-300 font-bold">وضعیت</TableHead>
                <TableHead className="text-center text-amber-300 font-bold">ترتیب</TableHead>
                <TableHead className="text-left text-amber-300 font-bold">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...slides]
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((slide) => (
                  <TableRow key={slide.id} className="border-stone-800/60 hover:bg-stone-900/40">
                    <TableCell>
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={slide.title || 'تصویر کروسل ۳بعدی'}
                          className="w-24 h-16 object-cover rounded-xl border border-amber-500/30 bg-stone-900"
                        />
                      ) : (
                        <div className="w-24 h-16 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 text-xs">
                          بدون تصویر
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-amber-200 text-sm max-w-xs line-clamp-2">
                        {slide.title || 'بدون عنوان'}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {slide.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-800 border border-stone-700 text-stone-400">
                          <XCircle className="w-3.5 h-3.5" /> غیرفعال
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-mono text-amber-300 font-bold text-sm">
                      {slide.sortOrder ?? 0}
                    </TableCell>

                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="ویرایش تصویر"
                          onClick={() => handleEdit(slide)}
                          className="text-stone-300 hover:text-amber-300 hover:bg-amber-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="حذف تصویر"
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
      <Dialog
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSlide(null);
          }
          setIsFormOpen(isOpen);
        }}
      >
        <DialogContent className="bg-stone-950 border-amber-500/30 text-stone-100 max-w-lg">
          <DialogHeader className="text-right border-b border-stone-800 pb-3 font-vazirmatn" dir="rtl">
            <DialogTitle className="text-lg font-bold text-amber-200">
              {selectedSlide ? 'ویرایش تصویر کروسل ۳بعدی' : 'افزودن تصویر جدید به کروسل ۳بعدی'}
            </DialogTitle>
          </DialogHeader>
          <BmwCarouselForm
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
            <DialogTitle className="text-lg font-bold text-rose-400">آیا از حذف این تصویر کروسل اطمینان دارید؟</DialogTitle>
            <DialogDescription className="text-stone-400 text-sm mt-2">
              با حذف این اسلاید، تصویر و دارایی مرتبط آن از سیستم و Cloudinary به طور کامل پاک خواهند شد.
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
              {deleteMutation.isPending ? 'در حال حذف...' : 'حذف تصویر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
