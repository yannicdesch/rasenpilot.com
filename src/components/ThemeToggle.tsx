
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

const ThemeToggle = () => {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Helles Design aktiv"
      disabled
    >
      <Sun size={16} />
    </Button>
  );
};

export default ThemeToggle;
