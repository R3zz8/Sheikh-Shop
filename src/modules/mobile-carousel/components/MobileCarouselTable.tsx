'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
    throw new Error(errorData.message || 'Failed to delete carousel slide');
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
      toast.success('Slide deleted successfully');
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
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mobile Carousel Management</h1>
        <Button onClick={() => {
          setSelectedSlide(null);
          setIsFormOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No slides found. Add a new one to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...slides].sort((a,b) => a.order - b.order).map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <img src={slide.image} alt={slide.title} className="w-24 h-12 object-cover rounded-md" />
                  </TableCell>
                  <TableCell>{slide.title}</TableCell>
                  <TableCell>
                    <a href={slide.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {slide.link}
                    </a>
                  </TableCell>
                  <TableCell>{slide.order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedSlide(null);
        }
        setIsFormOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
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
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
