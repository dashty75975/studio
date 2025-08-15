
'use client';

import type { VehicleCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grip } from "lucide-react";

interface VehicleFilterProps {
  categories: VehicleCategory[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function VehicleFilter({ categories, selectedType, onSelectType }: VehicleFilterProps) {
  const selectedCategory = categories.find(c => c.value === selectedType);
  const SelectedIcon = selectedCategory?.icon || Grip;

  return (
    <Select value={selectedType} onValueChange={onSelectType}>
      <SelectTrigger className="w-[280px] capitalize">
        <div className="flex items-center gap-2">
          <SelectedIcon className="w-4 h-4" />
          <SelectValue>
            {selectedCategory?.label || "Select a vehicle type"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value as string} className="capitalize">
            <div className="flex items-center gap-2">
               <category.icon className="w-4 h-4" />
               {category.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
