import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function CategoryList({ 
  categories, 
  onSelect, 
  onDelete,
  isRTL = false,
  t = key => key
}) {
  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div 
            key={category.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-750"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color || '#4f46e5' }}
              />
              <div className="overflow-hidden">
                <div className="font-medium text-white truncate">{isRTL && category.name_he ? category.name_he : category.name}</div>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="text-xs text-gray-400 truncate">
                    {`${t('subcategories')}: ${category.subcategories.length}`}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onSelect(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-400 hover:text-red-300"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-4 text-gray-400">
          {t('noCategories')}
        </div>
      )}
    </div>
  );
}