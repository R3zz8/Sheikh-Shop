'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { CircleX } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { PrismaType } from '@/lib/prisma';
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
      console.log('File selected:', selectedFile.name, 'Size:', selectedFile.size);
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
      console.log('Deleting image:', imageId);
      const result = await deleteImage(imageId);
      console.log('Delete result:', result);
      updateImageList(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const getImages = async () => {
    try {
      console.log('Fetching images for productId:', productId);
      const data = await fetchImages(productId);
      console.log('Fetched images data:', data);

      if (data?.images) {
        setImages(data.images);
      } else {
        console.log('No images found or invalid response');
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
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
      console.log('Starting upload for productId:', productId);
      console.log('File to upload:', file.name, 'Size:', file.size);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      console.log('FormData created, calling uploadImage...');
      const response = await uploadImage(formData);
      console.log('Upload response:', response);

      if (response?.error) {
        console.error('Upload error:', response.error);
        alert(`Upload failed: ${response.error}`);
        return;
      }

      if (response?.data) {
        console.log('Upload successful, updating images list');
        setImages(response.data);
        setFile(null);
        // Clear the file input
        const fileInput = document.getElementById('picture') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        alert('Image uploaded successfully!');
      } else {
        console.error('Invalid upload response:', response);
        alert('Upload failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: Please check your connection and try again');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      console.log('UploadImage mounted with productId:', productId);
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
