import type { BookData } from '../types';

export const mockBooks: BookData[] = [
  {
    key: '1',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
    title: 'Toán học 12',
    bookId: '115554',
    status: 'active',
    publisher: 'NXB Giáo dục',
    category: 'Sách giáo khoa',
    totalPublished: 10,
    updatedAt: '2024-12-15 20:51',
  },
  {
    key: '2',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
    title: 'Ngữ văn 12',
    bookId: '603246',
    status: 'active',
    publisher: 'NXB Giáo dục',
    category: 'Sách giáo khoa',
    totalPublished: 1185,
    updatedAt: '2024-12-08 20:10',
  },
];