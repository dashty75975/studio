
'use client';

import { cn } from "@/lib/utils";
import type { VehicleCategory } from "@/lib/types";

interface VehicleFilterProps {
  categories: VehicleCategory[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function VehicleFilter({ categories, selectedType, onSelectType }: VehicleFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectType(category.value as string)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-2 capitalize border",
            selectedType === category.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background/80 text-foreground hover:bg-muted border-border"
          )}
        >
          <category.icon className="w-4 h-4" />
          {category.label}
        </button>
      ))}
    </div>
  );
}
