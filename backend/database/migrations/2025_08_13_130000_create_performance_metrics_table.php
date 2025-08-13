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
        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('method', 10); // HTTP method (GET, POST, etc.)
            $table->string('uri'); // Request URI
            $table->decimal('duration_ms', 10, 2); // Response time in milliseconds
            $table->decimal('memory_mb', 10, 2); // Memory usage in MB
            $table->boolean('is_slow')->default(false); // Whether request was slow
            $table->boolean('memory_warning')->default(false); // Whether memory usage was high
            $table->timestamp('timestamp'); // When the request was made
            
            // Indexes for efficient querying
            $table->index('timestamp');
            $table->index(['method', 'uri']);
            $table->index('is_slow');
            $table->index('memory_warning');
            $table->index(['timestamp', 'is_slow']);
            $table->index(['timestamp', 'memory_warning']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_metrics');
    }
};
