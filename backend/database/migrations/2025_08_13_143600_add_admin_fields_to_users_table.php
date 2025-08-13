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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->boolean('is_active')->default(true)->after('gender');
            $table->enum('role', ['user', 'admin', 'manager'])->default('user')->after('is_active');
            $table->boolean('marketing_emails')->default(false)->after('role');
            $table->boolean('newsletter_subscription')->default(false)->after('marketing_emails');
            $table->timestamp('last_login_at')->nullable()->after('newsletter_subscription');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'date_of_birth',
                'gender',
                'is_active',
                'role',
                'marketing_emails',
                'newsletter_subscription',
                'last_login_at'
            ]);
        });
    }
};
