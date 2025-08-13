import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useAddressStore from '../../lib/stores/addressStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const AddressModal = ({ isOpen, onClose, address }) => {
  const { addAddress, updateAddress } = useAddressStore();
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    defaultValues: {
      type: address?.type || 'shipping',
      label: address?.label || '',
      full_name: address?.full_name || '',
      phone: address?.phone || '',
      address: address?.address || '',
      city: address?.city || '',
      state: address?.state || '',
      postal_code: address?.postal_code || '',
      country: address?.country || 'Bangladesh',
      is_default: address?.is_default || false
    }
  });

  const addressType = watch('type');

  useEffect(() => {
    if (address) {
      reset({
        type: address.type,
        label: address.label || '',
        full_name: address.full_name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state || '',
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default
      });
    }
  }, [address, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateAddress(address.id, data);
      } else {
        await addAddress(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                          {isEditing ? 'Edit Address' : 'Add New Address'}
                        </Dialog.Title>

                        <div className="space-y-4">
                          {/* Address Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Type
                            </label>
                            <select
                              {...register('type', { required: 'Address type is required' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                            >
                              <option value="shipping">Shipping</option>
                              <option value="billing">Billing</option>
                            </select>
                          </div>

                          {/* Label */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Label (optional)
                            </label>
                            <input
                              type="text"
                              {...register('label')}
                              placeholder="e.g., Home, Office"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                            />
                          </div>

                          {/* Full Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              {...register('full_name', { required: 'Full name is required' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                            />
                            {errors.full_name && (
                              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              {...register('phone', { required: 'Phone number is required' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                            />
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              {...register('address', { required: 'Address is required' })}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                            />
                            {errors.address && (
                              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                            )}
                          </div>

                          {/* City and State */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                {...register('city', { required: 'City is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                              />
                              {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province
                              </label>
                              <input
                                type="text"
                                {...register('state')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                              />
                            </div>
                          </div>

                          {/* Postal Code and Country */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                {...register('postal_code', { required: 'Postal code is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                              />
                              {errors.postal_code && (
                                <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                {...register('country', { required: 'Country is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                              />
                              {errors.country && (
                                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                              )}
                            </div>
                          </div>

                          {/* Set as Default */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              {...register('is_default')}
                              id="is_default"
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                              Set as default {addressType} address
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full justify-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        isEditing ? 'Update Address' : 'Add Address'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AddressModal;
