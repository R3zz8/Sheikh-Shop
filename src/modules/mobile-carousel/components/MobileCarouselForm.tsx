'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { CarouselSlide } from '../views/MobileCarouselDashboardView';

const slideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string(),
  link: z.string().min(1, 'Link is required').url('Link must be a valid URL'),
  order: z.coerce.number().int().min(0, 'Order must be a non-negative number'),
});

type SlideFormValues = z.infer<typeof slideSchema>;

const createCarouselSlide = async (newSlide: Omit<CarouselSlide, 'id'>) => {
  const res = await fetch('/api/admin/mobile-carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSlide),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create carousel slide');
  }
  return res.json();
};

const updateCarouselSlide = async (updatedSlide: Partial<CarouselSlide> & { id: string }) => {
  const res = await fetch(`/api/admin/mobile-carousel/${updatedSlide.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSlide),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update carousel slide');
  }
  return res.json();
};

type MobileCarouselFormProps = {
  slide: CarouselSlide | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MobileCarouselForm({ slide, onClose, onSuccess }: MobileCarouselFormProps) {
  const queryClient = useQueryClient();
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

  const createMutation = useMutation({
    mutationFn: createCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      toast.success('Slide created successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      toast.success('Slide updated successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
    // FIXED: Manually validate the image field
    if (!data.image) {
      toast.error('Image is required');
      return;
    }
    if (slide) {
      updateMutation.mutate({ ...data, id: slide.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const onFormError = (errors: any) => {
    console.error('Form validation errors:', errors);
    toast.error('Please check the form for errors.');
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="image-upload">Image</Label>
        <Input id="image-upload" type="file" onChange={handleImageUpload} disabled={uploading || isSaving} />
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
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving || uploading}>Cancel</Button>
        <Button type="submit" disabled={isSaving || uploading}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
