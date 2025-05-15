
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';

const ThemeToggle = () => {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Dunkles Design aktiv"
      className="border-gray-700 text-gray-200 bg-gray-800 hover:bg-gray-700"
      disabled
    >
      <Moon size={16} />
    </Button>
  );
};

export default ThemeToggle;
