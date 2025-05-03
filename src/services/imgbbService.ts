const IMGBB_API_KEY = '6cea1a2438628b127a6ce186a4f9a91f';

export const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw new Error('Não foi possível fazer upload da imagem');
  }
}; 