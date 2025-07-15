
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ContentCardProps = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: number;
  tags: string[];
};

const ContentCard = ({ id, title, excerpt, image, category, readTime, tags }: ContentCardProps) => {
  return (
    <Card className="lawn-card overflow-hidden flex flex-col h-full border-none">
      <CardHeader className="pb-2 relative">
        <span className="absolute top-2 right-2 bg-lawn-green text-white text-xs font-medium px-2.5 py-1 rounded">
          {category}
        </span>
        <CardTitle className="text-lg font-bold line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3 mb-3">{excerpt}</p>
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="lawn-tag">{tag}</span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{readTime} min read</span>
        <Button variant="outline" size="sm">Read Now</Button>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
