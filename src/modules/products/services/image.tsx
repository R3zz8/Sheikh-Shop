export const uploadImage = async (formData: FormData) => {
  try {
    const res = await fetch('/api/image', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || 'Upload failed' };
    }

    const data = await res.json();
    return data;
  } catch {
    return { error: 'Network error during upload' };
  }
};

export const fetchImages = async (productId: string) => {
  try {
    const res = await fetch(`/api/image?productId=${productId}`);

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || 'Failed to fetch images' };
    }

    const data = await res.json();
    return data;
  } catch {
    return { error: 'Network error while fetching images' };
  }
};

export const deleteImage = async (imageId: string) => {
  try {
    const res = await fetch(`/api/image?imageId=${imageId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || 'Failed to delete image' };
    }

    const data = await res.json();
    return data;
  } catch {
    return { error: 'Network error while deleting image' };
  }
};
