-- Update existing blog posts to use proper images instead of placeholder.svg
UPDATE blog_posts 
SET image = CASE 
    WHEN id % 3 = 0 THEN '/src/assets/blog-1.jpg'
    WHEN id % 3 = 1 THEN '/src/assets/blog-2.jpg'
    ELSE '/src/assets/blog-3.jpg'
END
WHERE image = '/placeholder.svg' OR image IS NULL;