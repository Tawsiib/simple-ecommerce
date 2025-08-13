<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Inventory management fields
            $table->integer('reorder_point')->default(10)->after('stock_quantity');
            $table->integer('reorder_quantity')->default(50)->after('reorder_point');
            $table->foreignId('supplier_id')->nullable()->after('brand_id')->constrained()->onDelete('set null');
            $table->decimal('cost_price', 10, 2)->nullable()->after('compare_price');
            $table->date('expiry_date')->nullable()->after('dimensions');
            $table->integer('shelf_life_days')->nullable()->after('expiry_date');
            $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock'])->default('in_stock')->after('shelf_life_days');
            $table->timestamp('last_stock_update')->nullable()->after('stock_status');
            $table->boolean('auto_reorder_enabled')->default(false)->after('last_stock_update');
            $table->json('inventory_settings')->nullable()->after('auto_reorder_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'reorder_point',
                'reorder_quantity',
                'supplier_id',
                'cost_price',
                'expiry_date',
                'shelf_life_days',
                'stock_status',
                'last_stock_update',
                'auto_reorder_enabled',
                'inventory_settings'
            ]);
        });
    }
};
