<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CacheService;

class WarmUpCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm-up';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up the application cache for better performance';

    /**
     * Execute the console command.
     */
    public function handle(CacheService $cacheService): int
    {
        $this->info('Starting cache warming process...');

        try {
            $results = $cacheService->warmUpCache();
            
            $this->info('Cache warming completed successfully!');
            
            $this->table(
                ['Cache Type', 'Status'],
                collect($results)->map(fn($status, $type) => [
                    $type,
                    $status ? '✅ Success' : '❌ Failed'
                ])->toArray()
            );

            $successCount = collect($results)->filter()->count();
            $totalCount = count($results);
            
            $this->info("Successfully warmed up {$successCount}/{$totalCount} cache types.");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Cache warming failed: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
