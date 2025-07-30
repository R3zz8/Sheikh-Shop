'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { CircleX } from 'lucide-react';
import { useEffect, useState, type FC } from 'react';
import type { PrismaType } from '@/lib/prisma';
import { deleteImage, fetchImages, uploadImage } from '../services/image';
import Spinner from '@/components/Spinner';

const UploadImage: FC<{ productId: string }> = ({ productId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PrismaType.Image[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const updateImageList = (imageId: string) => {
    setImages(
      (preState) => preState?.filter((img) => img.id !== imageId) || null,
    );
  };

  const handleDelete = async (imageId: string) => {
    try {
      setLoading(true);
      await deleteImage(imageId);
      updateImageList(imageId);
    } catch {
      alert('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !productId) {
      alert('Please select a valid file and ensure product exists');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      const response = await uploadImage(formData);

      if (response?.error) {
        alert(`Upload failed: ${response.error}`);
        return;
      }

      if (response?.data) {
        setImages(response.data);
        setFile(null);
        // Clear the file input
        const fileInput = document.getElementById('picture') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: Invalid response from server');
      }
    } catch {
      alert('Upload failed: Please check your connection and try again');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      const getImages = async () => {
        try {
          const data = await fetchImages(productId);

          if (data?.images) {
            setImages(data.images);
          } else {
            setImages([]);
          }
        } catch {
          setImages([]);
        } finally {
          setLoading(false);
        }
      };
      getImages();
    }
  }, [productId]);

  return (
    <div className="w-full">
      <Label htmlFor="picture">Product Image</Label>
      <div className="flex gap-2 w-full justify-between">
        <Input
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleChangeFile}
          disabled={uploading}
        />
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="flex gap-2 mt-4 flex-wrap items-center justify-between">
          {images && images.length > 0 ? (
            images.map((item) => {
              return (
                <div className="relative group" key={item.id}>
                  <CircleX
                    className="absolute top-1 right-1 text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    onClick={() => handleDelete(item.id)}
                  />
                  <Image
                    width={100}
                    height={100}
                    alt="product image"
                    src={item.image}
                    className="mt-4 mx-auto rounded-md"
                  />
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 mt-4">No images uploaded yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadImage;
