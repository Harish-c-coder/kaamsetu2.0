import React, { useState } from 'react';
import TailoredCategoriesSection from '../components/TailoredCategoriesSection';
import CategoryDetailModal from '../components/CategoryDetailModal';

export default function CustomerCategoriesPage() {
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 space-y-10">
      {/* Category Section: ONLY categories, no services */}
      <TailoredCategoriesSection onSelectCategoryModal={setSelectedCategoryModal} />

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={selectedCategoryModal}
        isOpen={!!selectedCategoryModal}
        onClose={() => setSelectedCategoryModal(null)}
      />
    </div>
  );
}
