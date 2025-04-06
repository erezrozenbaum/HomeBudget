import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function InsuranceCategoryForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = React.useState({
    name: category?.name || '',
    color: category?.color || '#4f46e5',
    description: category?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-200">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter category name"
          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color" className="text-gray-200">Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-20 h-10 p-1 bg-gray-900 border-gray-700"
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="#000000"
            className="font-mono bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-200">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add a description for this category..."
          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
        >
          {category ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
}