-- Fix the image paths to use the correct public paths
UPDATE blog_posts 
SET image = CASE 
    WHEN id % 3 = 0 THEN '/lovable-uploads/2d49b520-6bf6-4cc2-aba9-d223a8fd9097.png'
    WHEN id % 3 = 1 THEN '/lovable-uploads/2d49b520-6bf6-4cc2-aba9-d223a8fd9097.png'
    ELSE '/lovable-uploads/2d49b520-6bf6-4cc2-aba9-d223a8fd9097.png'
END
WHERE image LIKE '/src/assets/%';