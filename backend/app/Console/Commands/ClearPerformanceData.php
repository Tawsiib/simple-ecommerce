<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PerformanceService;

class ClearPerformanceData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'performance:clear {--days=30 : Number of days to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear old performance metrics data to prevent database bloat';

    /**
     * Execute the console command.
     */
    public function handle(PerformanceService $performanceService): int
    {
        $days = (int) $this->option('days');
        
        if ($days < 1 || $days > 365) {
            $this->error('Days must be between 1 and 365');
            return Command::FAILURE;
        }

        $this->info("Clearing performance data older than {$days} days...");

        try {
            $deleted = $performanceService->clearOldData($days);
            
            if ($deleted > 0) {
                $this->info("Successfully cleared {$deleted} old performance records.");
            } else {
                $this->info('No old performance records found to clear.');
            }
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to clear performance data: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
