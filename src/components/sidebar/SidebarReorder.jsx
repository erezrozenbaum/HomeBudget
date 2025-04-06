import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function SidebarReorder({ navigation, currentOrder, onSaveOrder, onCancel }) {
  // Convert navigation items to a simple array of objects with just name, label and icon
  const simplifiedNavigation = React.useMemo(() => {
    if (!navigation || !Array.isArray(navigation)) {
      console.error('Navigation is not an array:', navigation);
      return [];
    }
    
    return navigation.map(item => ({
      name: item.name,
      label: item.label || item.name,
      iconName: item.icon ? item.icon.name : null
    }));
  }, [navigation]);
  
  // Create initial sorted items based on current order
  const initialItems = React.useMemo(() => {
    if (!simplifiedNavigation || simplifiedNavigation.length === 0) {
      return [];
    }
    
    // Create a map for quick lookup
    const navMap = {};
    simplifiedNavigation.forEach(item => {
      navMap[item.name] = item;
    });
    
    // Get dashboard and settings items
    const dashboardItem = navMap['Dashboard'];
    const settingsItem = navMap['Settings'];
    
    // Create middle items based on current order
    let middleItems = [];
    if (currentOrder && currentOrder.length > 0) {
      middleItems = currentOrder
        .filter(name => navMap[name] && name !== 'Dashboard' && name !== 'Settings')
        .map(name => navMap[name]);
    } else {
      // Use default order
      middleItems = simplifiedNavigation.filter(item => 
        item.name !== 'Dashboard' && item.name !== 'Settings'
      );
    }
    
    // Return full array with Dashboard first and Settings last
    return [
      dashboardItem,
      ...middleItems,
      settingsItem
    ].filter(Boolean);
  }, [simplifiedNavigation, currentOrder]);

  const [items, setItems] = useState(initialItems);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    // Ensure Dashboard is first and Settings is last
    const dashboardIndex = newItems.findIndex(item => item.name === 'Dashboard');
    const settingsIndex = newItems.findIndex(item => item.name === 'Settings');
    
    if (dashboardIndex !== 0 && dashboardIndex !== -1) {
      const [dashboardItem] = newItems.splice(dashboardIndex, 1);
      newItems.unshift(dashboardItem);
    }
    
    if (settingsIndex !== newItems.length - 1 && settingsIndex !== -1) {
      const [settingsItem] = newItems.splice(settingsIndex, 1);
      newItems.push(settingsItem);
    }
    
    setItems(newItems);
  };

  const handleSave = () => {
    // Extract just the names for storage
    const orderNames = items.map(item => item.name);
    onSaveOrder(orderNames);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-400 mb-2">
        Drag and drop to reorder navigation items. Dashboard will always remain first, and Settings last.
      </p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sidebar-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <Draggable 
                  key={item.name} 
                  draggableId={item.name} 
                  index={index}
                  isDragDisabled={item.name === 'Dashboard' || item.name === 'Settings'}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center p-3 rounded-md ${
                        item.name === 'Dashboard' || item.name === 'Settings' 
                          ? 'bg-gray-700/30 text-gray-400' 
                          : 'bg-gray-800/70 text-gray-200'
                      }`}
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className={`mr-2 ${
                          item.name === 'Dashboard' || item.name === 'Settings' 
                            ? 'text-gray-500' 
                            : 'text-gray-400'
                        }`}
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <span>{item.label}</span>
                      </div>
                      
                      {item.name === 'Dashboard' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400">
                          Fixed First
                        </span>
                      )}
                      
                      {item.name === 'Settings' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400">
                          Fixed Last
                        </span>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Order
        </Button>
      </div>
    </div>
  );
}