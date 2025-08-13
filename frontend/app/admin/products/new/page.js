'use client';

import AdminLayout from '../../../components/admin/AdminLayout';
import AdminProductForm from '../../../components/admin/AdminProductForm';

const NewProductPage = () => {
  return (
    <AdminLayout>
      <AdminProductForm mode="create" />
    </AdminLayout>
  );
};

export default NewProductPage;
