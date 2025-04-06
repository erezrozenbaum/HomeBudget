import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, Trash } from "lucide-react";

export default function CategoryForm({ 
  category, 
  onSave, 
  onCancel,
  isRTL = false,
  t = key => key
}) {
  const [formData, setFormData] = useState({
    name: '',
    name_he: '',
    color: '#4f46e5',
    subcategories: []
  });
  
  const [newSubcategory, setNewSubcategory] = useState({ name: '', name_he: '' });
  const [editingSubcategoryIndex, setEditingSubcategoryIndex] = useState(null);
  
  // Initialize form data from props
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        name_he: category.name_he || '',
        color: category.color || '#4f46e5',
        subcategories: category.subcategories || []
      });
    }
  }, [category]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddSubcategory = () => {
    if (newSubcategory.name.trim() === '') return;
    
    if (editingSubcategoryIndex !== null) {
      // Update existing subcategory
      const updatedSubcategories = [...formData.subcategories];
      updatedSubcategories[editingSubcategoryIndex] = { ...newSubcategory };
      
      setFormData({
        ...formData,
        subcategories: updatedSubcategories
      });
      setEditingSubcategoryIndex(null);
    } else {
      // Add new subcategory
      setFormData({
        ...formData,
        subcategories: [
          ...formData.subcategories,
          { ...newSubcategory }
        ]
      });
    }
    
    setNewSubcategory({ name: '', name_he: '' });
  };
  
  const handleEditSubcategory = (index) => {
    setNewSubcategory({ ...formData.subcategories[index] });
    setEditingSubcategoryIndex(index);
  };
  
  const handleRemoveSubcategory = (index) => {
    const updatedSubcategories = [...formData.subcategories];
    updatedSubcategories.splice(index, 1);
    
    setFormData({
      ...formData,
      subcategories: updatedSubcategories
    });
    
    if (editingSubcategoryIndex === index) {
      setEditingSubcategoryIndex(null);
      setNewSubcategory({ name: '', name_he: '' });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white">{t('categoryName')}</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white">{t('categoryNameHebrew')}</label>
          <Input
            name="name_he"
            value={formData.name_he}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border-gray-600 text-white"
            dir="rtl"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-white">{t('color')}</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="w-12 h-10 rounded border-0 bg-transparent cursor-pointer"
          />
          <Input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            className="w-32 bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-white">{t('subcategories')}</label>
        <div className="p-4 border border-gray-700 rounded-md bg-gray-900 mb-4">
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {formData.subcategories.map((subcategory, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded bg-gray-800 border border-gray-700"
              >
                <div>
                  <span className="mr-2 text-white">{subcategory.name}</span>
                  {subcategory.name_he && (
                    <span className="text-gray-400 text-sm" dir="rtl">({subcategory.name_he})</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditSubcategory(index)}
                    className="h-7 w-7 text-gray-400 hover:text-blue-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveSubcategory(index)}
                    className="h-7 w-7 text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {formData.subcategories.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No subcategories yet
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <Input
              placeholder="Subcategory name"
              value={newSubcategory.name}
              onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              placeholder="Subcategory name (Hebrew)"
              value={newSubcategory.name_he}
              onChange={(e) => setNewSubcategory({...newSubcategory, name_he: e.target.value})}
              className="bg-gray-700 border-gray-600 text-white"
              dir="rtl"
            />
          </div>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleAddSubcategory}
            disabled={!newSubcategory.name.trim()}
            className="text-white w-full"
          >
            {editingSubcategoryIndex !== null ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Update Subcategory
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Subcategory
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="text-white">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save
        </Button>
      </div>
    </form>
  );
}