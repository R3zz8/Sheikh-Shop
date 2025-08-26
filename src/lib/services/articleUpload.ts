export const uploadArticleImage = async (formData: FormData) => {
    try {
        const response = await fetch('/api/article/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Upload failed' };
        }

        return data;
    } catch (error) {
        return { error: 'Network error during upload' };
    }
}; 