import type { Category } from '../types';

export const mockCategories: Category[] = [
  {
    key: '1',
    name: 'Sách giáo khoa',
    totalBooks: 156,
    status: 'active',
    description: 'Sách giáo khoa chính thức được Bộ Giáo dục và Đào tạo phê duyệt sử dụng trong các trường học',
    children: [
      {
        key: '1-1',
        name: 'Sách giáo khoa cấp 1',
        totalBooks: 56,
        status: 'active',
        description: 'Sách giáo khoa dành cho học sinh tiểu học từ lớp 1 đến lớp 5',
      },
      {
        key: '1-2',
        name: 'Sách giáo khoa cấp 2',
        totalBooks: 48,
        status: 'active',
        description: 'Sách giáo khoa dành cho học sinh THCS từ lớp 6 đến lớp 9',
      },
    ],
  },
  {
    key: '2',
    name: 'Sách tham khảo',
    totalBooks: 89,
    status: 'active',
    description: 'Sách bổ trợ kiến thức, luyện tập và nâng cao',
    children: [
      {
        key: '2-1',
        name: 'Sách bài tập',
        totalBooks: 45,
        status: 'active',
        description: 'Sách bài tập và luyện tập theo chương trình học',
      },
    ],
  },
];