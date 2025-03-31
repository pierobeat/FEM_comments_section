const images: Record<string, string> = import.meta.glob('/src/assets/avatars/*.{png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

export function getImagePath(imagePath: string): string {
   const filename = imagePath.split('/').pop();
   return images[`/src/assets/avatars/${filename}`] || imagePath; 
}