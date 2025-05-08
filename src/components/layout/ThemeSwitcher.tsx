
"use client";
import { useTheme, type ThemeScheme, type ThemeMode } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import IconComponent from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes: { name: string, scheme: ThemeScheme }[] = [
  { name: 'Purple Bliss', scheme: 'purple-bliss' },
  { name: 'Classic Teal', scheme: 'classic-teal' },
  { name: 'Forest Whisper', scheme: 'forest-whisper' },
  { name: 'Ocean Blue', scheme: 'ocean-blue' },
  { name: 'Sunset Orange', scheme: 'sunset-orange' },
  { name: 'Rose Pink', scheme: 'rose-pink' },
];

export function ThemeSwitcher() {
  const { themeScheme, setThemeScheme, themeMode, setThemeMode, effectiveMode } = useTheme();

  const toggleMode = () => {
    if (effectiveMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  };
  
  const handleSetThemeMode = (mode: string) => {
    setThemeMode(mode as ThemeMode);
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle light/dark mode">
        {effectiveMode === 'light' ? <IconComponent name="Moon" className="h-5 w-5" /> : <IconComponent name="Sun" className="h-5 w-5" />}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Change theme">
            <IconComponent name="Palette" className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Appearance Mode</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={themeMode} onValueChange={handleSetThemeMode}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={themeScheme} onValueChange={(value) => setThemeScheme(value as ThemeScheme)}>
            {themes.map((theme) => (
              <DropdownMenuRadioItem key={theme.scheme} value={theme.scheme}>
                {theme.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
