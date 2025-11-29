'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { CarouselSlide } from '../views/MobileCarouselDashboardView';

const slideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().min(1, 'Image is required').url('Image must be a valid URL'),
  link: z.string().min(1, 'Link is required').url('Link must be a valid URL'),
  order: z.coerce.number().int().min(0, 'Order must be a non-negative number'),
});

type SlideFormValues = z.infer<typeof slideSchema>;

type MobileCarouselFormProps = {
  slide: CarouselSlide | null;
  onSubmit: (values: Omit<CarouselSlide, 'id'>) => void;
  onClose: () => void;
};

export default function MobileCarouselForm({ slide, onSubmit, onClose }: MobileCarouselFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SlideFormValues>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: slide?.title || '',
      image: slide?.image || '',
      link: slide?.link || '',
      order: slide?.order || 0,
    },
  });

  const [uploading, setUploading] = useState(false);
  const imageUrl = watch('image');

  useEffect(() => {
    if (slide) {
      setValue('title', slide.title);
      setValue('image', slide.image);
      setValue('link', slide.link);
      setValue('order', slide.order);
    }
  }, [slide, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      setValue('image', data.secure_url, { shouldValidate: true });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFormSubmit = (data: SlideFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="image">Image</Label>
        <Input id="image-upload" type="file" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-sm mt-1">Uploading...</p>}
        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
        {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 h-20 w-auto object-cover rounded-md" />}
        <Input id="image" {...register('image')} type="hidden" />
      </div>
      <div>
        <Label htmlFor="link">Link URL</Label>
        <Input id="link" {...register('link')} />
        {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link.message}</p>}
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input id="order" type="number" {...register('order')} />
        {errors.order && <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
