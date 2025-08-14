
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { VehicleCategory } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  label: z.string().min(2, 'Category name must be at least 2 characters.'),
  value: z.string().min(2, 'Value must be at least 2 characters (e.g., "new_service").').regex(/^[a-z0-9_]+$/, 'Value must be lowercase letters, numbers, and underscores only.'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g., #RRGGBB).'),
  iconName: z.string().min(2, 'Icon name is required.'),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category: VehicleCategory | null;
  onSubmit: (data: CategoryFormValues) => void;
}

export default function CategoryForm({ category, onSubmit }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      value: '',
      color: '#000000',
      iconName: '',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        label: category.label,
        value: category.value as string,
        color: category.color,
        iconName: (category.icon as any).displayName || 'Icon', // This is a simplification
      });
    } else {
        form.reset({
            label: '',
            value: '',
            color: '#000000',
            iconName: '',
        });
    }
  }, [category, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Special Transport" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Value</FormLabel>
              <FormControl>
                <Input placeholder="e.g. special_transport" {...field} disabled={!!category} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input type="color" className="w-12 h-10 p-1" {...field} />
                </FormControl>
                <Input placeholder="#FF5733" {...field} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="iconName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Rocket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {category ? 'Save Changes' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
}

