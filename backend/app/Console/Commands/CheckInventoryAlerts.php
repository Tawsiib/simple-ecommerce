<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\InventoryService;
use Illuminate\Support\Facades\Log;

class CheckInventoryAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-alerts {--generate-pos : Generate purchase orders for low stock products}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check inventory alerts and optionally generate purchase orders';

    protected $inventoryService;

    /**
     * Create a new command instance.
     */
    public function __construct(InventoryService $inventoryService)
    {
        parent::__construct();
        $this->inventoryService = $inventoryService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking inventory alerts...');

        try {
            // Check for new alerts
            $alerts = $this->inventoryService->checkInventoryAlerts();
            
            if (empty($alerts)) {
                $this->info('No new inventory alerts found.');
            } else {
                $this->info("Found " . count($alerts) . " new inventory alerts:");
                
                foreach ($alerts as $alert) {
                    $this->line("- {$alert->type}: {$alert->message}");
                }
            }

            // Generate purchase orders if requested
            if ($this->option('generate-pos')) {
                $this->info('Generating purchase orders for low stock products...');
                
                $orders = $this->inventoryService->generatePurchaseOrders();
                
                if (empty($orders)) {
                    $this->info('No purchase orders generated.');
                } else {
                    $this->info("Generated " . count($orders) . " purchase orders:");
                    
                    foreach ($orders as $order) {
                        $this->line("- PO: {$order->po_number} for {$order->supplier->name}");
                    }
                }
            }

            $this->info('Inventory check completed successfully.');
            
            Log::info('Inventory alerts checked via command', [
                'alerts_found' => count($alerts),
                'purchase_orders_generated' => $this->option('generate-pos') ? count($orders ?? []) : 0
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error checking inventory: ' . $e->getMessage());
            
            Log::error('Inventory check command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }
}
