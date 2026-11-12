export const imageUploader = async (image) => {
  const formData = new FormData();
  formData.append("image", image);
  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

