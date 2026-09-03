interface TodaysThemeProps {
  theme: string;
  sourced: number;
  generated: number;
}

export function TodaysTheme({ theme, sourced, generated }: TodaysThemeProps) {
  return (
    <div className="w-full bg-white rounded-md border  px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Today&apos;s Theme</span>
        <span className="text-base font-semibold text-foreground">
          &ldquo;{theme}&rdquo;
        </span>
      </div>
      <div className="text-sm text-muted-foreground font-medium bg-gray-300 px-2 py-1 rounded">
        {sourced} sourced · {generated} generated
      </div>
    </div>
  );
}