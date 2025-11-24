'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type CarouselSlide = {
  id: string;
  title: string;
  image: string;
  link: string;
  order: number;
};

const fetchCarouselSlides = async (): Promise<CarouselSlide[]> => {
  const res = await fetch('/api/admin/mobile-carousel');
  if (!res.ok) {
    throw new Error('Failed to fetch carousel slides');
  }
  return res.json();
};

const createCarouselSlide = async (newSlide: Omit<CarouselSlide, 'id'>) => {
  const res = await fetch('/api/admin/mobile-carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSlide),
  });
  if (!res.ok) {
    throw new Error('Failed to create carousel slide');
  }
  return res.json();
};

const updateCarouselSlide = async (updatedSlide: CarouselSlide) => {
  const res = await fetch(`/api/admin/mobile-carousel/${updatedSlide.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSlide),
  });
  if (!res.ok) {
    throw new Error('Failed to update carousel slide');
  }
  return res.json();
};

const deleteCarouselSlide = async (id: string) => {
  const res = await fetch(`/api/admin/mobile-carousel/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete carousel slide');
  }
};

export default function MobileCarouselClient() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const { data: slides, isLoading, isError } = useQuery({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides
  });

  const createMutation = useMutation({
    mutationFn: createCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides']});
      toast.success('Slide created successfully');
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Failed to create slide');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides']});
      toast.success('Slide updated successfully');
      setSelectedSlide(null);
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Failed to update slide');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides']});
      toast.success('Slide deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete slide');
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

  const handleFormClose = () => {
    setSelectedSlide(null);
    setIsFormOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching slides</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mobile Carousel Slides</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedSlide(null);
              setIsFormOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            </DialogHeader>
            <SlideForm
              slide={selectedSlide}
              onSubmit={selectedSlide ? updateMutation.mutate : createMutation.mutate}
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides?.map((slide) => (
          <div key={slide.id} className="border rounded-lg p-4">
            <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded-md mb-4" />
            <h2 className="font-bold">{slide.title}</h2>
            <p className="text-sm text-gray-500">{slide.link}</p>
            <p className="text-sm">Order: {slide.order}</p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(slide)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the slide.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (slideToDelete) {
                  deleteMutation.mutate(slideToDelete);
                }
                setIsDeleteConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlideForm({ slide, onSubmit, onClose }: { slide: CarouselSlide | null, onSubmit: (data: any) => void, onClose: () => void }) {
  const [title, setTitle] = useState(slide?.title || '');
  const [image, setImage] = useState(slide?.image || '');
  const [link, setLink] = useState(slide?.link || '');
  const [order, setOrder] = useState(slide?.order || 0);
  const [uploading, setUploading] = useState(false);

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
      setImage(data.secure_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: slide?.id, title, image, link, order: Number(order) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="image">Image</Label>
        <Input id="image" type="file" onChange={handleImageUpload} />
        {uploading && <p>Uploading...</p>}
        {image && <img src={image} alt="preview" className="mt-2 h-20 w-20 object-cover" />}
      </div>
      <div>
        <Label htmlFor="link">Link URL</Label>
        <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input id="order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} required />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
