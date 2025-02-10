import { useState } from 'react';
import type { TreeProps } from 'antd/es/tree';
import type { Category } from '../types';

export const useCategoryTree = (initialCategories: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const findAndRemove = (data: Category[], key: React.Key): [Category | null, Category[]] => {
    const traverse = (items: Category[], parentKey?: string): [Category | null, Category[]] => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          const [removed] = items.splice(i, 1);
          return [removed, items];
        }
        if (items[i].children) {
          const [found, updatedChildren] = traverse(items[i].children!, items[i].key);
          if (found) {
            items[i].children = updatedChildren;
            if (items[i].children.length === 0) {
              delete items[i].children;
            }
            return [found, items];
          }
        }
      }
      return [null, items];
    };

    const [found, updatedData] = traverse(data);
    return [found, updatedData];
  };

  const handleDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const data = [...categories];
    const [draggedNode, updatedData] = findAndRemove(data, dragKey);
    
    if (!draggedNode) return;

    const loop = (items: Category[], key: React.Key, callback: (item: Category, index: number, arr: Category[]) => void) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          callback(items[i], i, items);
          return;
        }
        if (items[i].children) {
          loop(items[i].children!, key, callback);
        }
      }
    };

    // Drop on the gap (between nodes)
    if (info.dropToGap) {
      let arr = data;
      let index = 0;
      loop(data, dropKey, (item, i, arr) => {
        index = i;
      });
      
      if (dropPosition === -1) {
        arr.splice(index, 0, draggedNode);
      } else {
        arr.splice(index + 1, 0, draggedNode);
      }
    } else {
      // Drop on the node
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(draggedNode);
      });
    }

    setCategories(data);
  };

  return {
    categories,
    setCategories,
    handleDrop
  };
};