
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

const ThemeToggle = () => {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Helles Design aktiv"
      className="border-green-100 text-green-700"
      disabled
    >
      <Sun size={16} />
    </Button>
  );
};

export default ThemeToggle;
