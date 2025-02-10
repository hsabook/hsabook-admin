import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { BookList, BookCategories, BookIds } from './pages/Books';
import { UserManagement } from './pages/Users';
import { Questions, Exams } from './pages/Warehouse';
import { Sliders, Teachers, RecentSearches } from './pages/Settings';
import BookMenu from './pages/Books/components/BookMenu/BookMenu';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      
      {/* Books routes */}
      <Route path="/books/list" element={<BookList />} />
      <Route path="/books/categories" element={<BookCategories />} />
      <Route path="/books/ids" element={<BookIds />} />
      <Route path="/books/:id/menu" element={<BookMenu />} />
      
      {/* Users route */}
      <Route path="/users" element={<UserManagement />} />
      
      {/* Warehouse routes */}
      <Route path="/warehouse/questions" element={<Questions />} />
      <Route path="/warehouse/exams" element={<Exams />} />
      
      {/* Settings routes */}
      <Route path="/settings/sliders" element={<Sliders />} />
      <Route path="/settings/teachers" element={<Teachers />} />
      <Route path="/settings/recent-searches" element={<RecentSearches />} />
    </Routes>
  );
};

export default AppRoutes;