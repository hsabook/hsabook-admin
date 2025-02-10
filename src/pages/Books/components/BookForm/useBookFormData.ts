import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getTeachers } from '../../../../api/users';
import { getCategories } from '../../../../api/categories';
import { SubjectValues } from '../../types';

export const useBookFormData = () => {
  const [authors, setAuthors] = useState<{ label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Store the raw data for ID lookup
  const [teachersMap, setTeachersMap] = useState<Record<string, string>>({});
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teachersResponse, categoriesResponse] = await Promise.all([
          getTeachers(),
          getCategories()
        ]);

        // Process teachers
        const teacherOptions = teachersResponse.data.data.map(teacher => ({
          label: teacher.full_name,
          value: teacher.id,
        }));
        setAuthors(teacherOptions);

        // Create teachers map for lookup
        const teachersLookup = teachersResponse.data.data.reduce((acc, teacher) => {
          acc[teacher.full_name] = teacher.id;
          return acc;
        }, {} as Record<string, string>);
        setTeachersMap(teachersLookup);

        // Process categories
        const categoryOptions = categoriesResponse.data.data.map(category => ({
          label: category.name,
          value: category.id,
        }));
        setCategories(categoryOptions);

        // Create categories map for lookup
        const categoriesLookup = categoriesResponse.data.data.reduce((acc, category) => {
          acc[category.name] = category.id;
          return acc;
        }, {} as Record<string, string>);
        setCategoriesMap(categoriesLookup);

      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subjectOptions = Object.entries(SubjectValues).map(([key, value]) => ({
    label: value,
    value: value, // Use the actual subject name as the value
  }));

  return {
    categories,
    authors,
    subjectOptions,
    loading,
    teachersMap,
    categoriesMap,
  };
};