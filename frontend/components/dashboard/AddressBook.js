import { useState, useEffect } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import useAddressStore from '../../lib/stores/addressStore';
import DashboardLayout from './DashboardLayout';
import AddressModal from './AddressModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const AddressBook = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressType, setAddressType] = useState('all');
  
  const {
    addresses,
    isLoading,
    fetchAddresses,
    deleteAddress,
    setDefaultAddress
  } = useAddressStore();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const filteredAddresses = addressType === 'all'
    ? addresses
    : addresses.filter(addr => addr.type === addressType);

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const getAddressIcon = (label) => {
    if (label?.toLowerCase().includes('home')) return HomeIcon;
    if (label?.toLowerCase().includes('office')) return BuildingOfficeIcon;
    return MapPinIcon;
  };

  if (isLoading && addresses.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
            <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Address
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setAddressType('all')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              addressType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setAddressType('shipping')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              addressType === 'shipping'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shipping ({addresses.filter(a => a.type === 'shipping').length})
          </button>
          <button
            onClick={() => setAddressType('billing')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              addressType === 'billing'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Billing ({addresses.filter(a => a.type === 'billing').length})
          </button>
        </div>

        {/* Address List */}
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No addresses found</h3>
            <p className="mt-2 text-gray-600">
              {addressType === 'all'
                ? "You haven't added any addresses yet."
                : `You haven't added any ${addressType} addresses yet.`}
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAddresses.map((address) => {
              const Icon = getAddressIcon(address.label);
              return (
                <div
                  key={address.id}
                  className={`relative bg-white rounded-lg border ${
                    address.is_default
                      ? 'border-rose-500 shadow-md'
                      : 'border-gray-200'
                  } p-6 transition-all duration-200 hover:shadow-md`}
                >
                  {/* Default Badge */}
                  {address.is_default && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {address.label || `${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address`}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          address.type === 'shipping'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 font-medium">{address.full_name}</p>
                      <p className="text-gray-600">{address.address}</p>
                      <p className="text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-gray-600">{address.country}</p>
                      <p className="text-gray-600 mt-2">📞 {address.phone}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <AddressModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingAddress(null);
            }}
            address={editingAddress}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddressBook;
