<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Get user's addresses
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // If no authenticated user, return empty data
            if (!$user) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No addresses found (user not authenticated)'
                ]);
            }
            
            $addresses = Address::where('user_id', $user->id)
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $addresses->map(function ($address) {
                    return $this->transformAddress($address);
                }),
                'message' => 'Addresses retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve addresses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new address
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // If no authenticated user, return error
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required to add addresses'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'type' => 'required|string|in:home,work,other',
                'address_line_1' => 'required|string|max:255',
                'address_line_2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'postal_code' => 'required|string|max:20',
                'country' => 'required|string|max:100',
                'phone' => 'nullable|string|max:20',
                'is_default' => 'nullable|boolean',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // If this is the first address or user wants it as default, set as default
            if ($request->is_default || Address::where('user_id', $user->id)->count() === 0) {
                // Remove default from other addresses
                Address::where('user_id', $user->id)->update(['is_default' => false]);
                $request->merge(['is_default' => true]);
            }

            $address = Address::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'address_line_1' => $request->address_line_1,
                'address_line_2' => $request->address_line_2,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'phone' => $request->phone,
                'is_default' => $request->is_default ?? false,
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'data' => $this->transformAddress($address),
                'message' => 'Address added successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific address
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $address = Address::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Address not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $this->transformAddress($address),
                'message' => 'Address retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an address
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'type' => 'nullable|string|in:home,work,other',
                'address_line_1' => 'nullable|string|max:255',
                'address_line_2' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:20',
                'is_default' => 'nullable|boolean',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            $address = Address::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Address not found'
                ], 404);
            }

            // If setting this address as default, remove default from others
            if ($request->has('is_default') && $request->is_default) {
                Address::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->update(['is_default' => false]);
            }

            $address->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $this->transformAddress($address->fresh()),
                'message' => 'Address updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $address = Address::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Address not found'
                ], 404);
            }

            // If this was the default address, set another one as default
            if ($address->is_default) {
                $newDefault = Address::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->first();
                
                if ($newDefault) {
                    $newDefault->update(['is_default' => true]);
                }
            }

            $address->delete();

            return response()->json([
                'success' => true,
                'message' => 'Address deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set an address as default
     */
    public function setDefault(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $address = Address::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Address not found'
                ], 404);
            }

            // Remove default from other addresses
            Address::where('user_id', $user->id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);

            // Set this address as default
            $address->update(['is_default' => true]);

            return response()->json([
                'success' => true,
                'data' => $this->transformAddress($address->fresh()),
                'message' => 'Default address updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update default address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get address types
     */
    public function getTypes(): JsonResponse
    {
        try {
            $types = [
                'home' => [
                    'value' => 'home',
                    'label' => 'Home',
                    'icon' => 'home',
                    'description' => 'Residential address'
                ],
                'work' => [
                    'value' => 'work',
                    'label' => 'Work',
                    'icon' => 'briefcase',
                    'description' => 'Office or workplace address'
                ],
                'other' => [
                    'value' => 'other',
                    'label' => 'Other',
                    'icon' => 'map-pin',
                    'description' => 'Other address type'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $types,
                'message' => 'Address types retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve address types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get countries list
     */
    public function getCountries(): JsonResponse
    {
        try {
            $countries = [
                'BD' => [
                    'code' => 'BD',
                    'name' => 'Bangladesh',
                    'phone_code' => '+880',
                    'currency' => 'BDT',
                    'currency_symbol' => '৳'
                ],
                'US' => [
                    'code' => 'US',
                    'name' => 'United States',
                    'phone_code' => '+1',
                    'currency' => 'USD',
                    'currency_symbol' => '$'
                ],
                'GB' => [
                    'code' => 'GB',
                    'name' => 'United Kingdom',
                    'phone_code' => '+44',
                    'currency' => 'GBP',
                    'currency_symbol' => '£'
                ],
                'IN' => [
                    'code' => 'IN',
                    'name' => 'India',
                    'phone_code' => '+91',
                    'currency' => 'INR',
                    'currency_symbol' => '₹'
                ],
                'PK' => [
                    'code' => 'PK',
                    'name' => 'Pakistan',
                    'phone_code' => '+92',
                    'currency' => 'PKR',
                    'currency_symbol' => '₨'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $countries,
                'message' => 'Countries retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve countries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform address data for API response
     */
    protected function transformAddress($address): array
    {
        return [
            'id' => $address->id,
            'type' => $address->type,
            'type_label' => ucfirst($address->type),
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'city' => $address->city,
            'state' => $address->state,
            'postal_code' => $address->postal_code,
            'country' => $address->country,
            'phone' => $address->phone,
            'is_default' => $address->is_default,
            'notes' => $address->notes,
            'full_address' => $this->getFullAddress($address),
            'created_at' => $address->created_at,
            'updated_at' => $address->updated_at,
        ];
    }

    /**
     * Get formatted full address
     */
    protected function getFullAddress($address): string
    {
        $parts = [
            $address->address_line_1,
            $address->address_line_2,
            $address->city,
            $address->state,
            $address->postal_code,
            $address->country
        ];

        return implode(', ', array_filter($parts));
    }
}
