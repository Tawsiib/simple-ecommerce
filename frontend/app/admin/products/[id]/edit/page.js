'use client';

import AdminLayout from '../../../../components/admin/AdminLayout';
import AdminProductForm from '../../../../components/admin/AdminProductForm';

const EditProductPage = ({ params }) => {
  return (
    <AdminLayout>
      <AdminProductForm mode="edit" productId={params.id} />
    </AdminLayout>
  );
};

export default EditProductPage;
