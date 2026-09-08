<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ],
        );

        User::firstOrCreate(
            ['email' => 'admin@inventory.test'],
            [
                'name' => 'Admin User',
                'email' => 'admin@inventory.test',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
        );

        $electronics = Category::firstOrCreate(['name' => 'Electronics']);
        $office = Category::firstOrCreate(['name' => 'Office Supplies']);
        $warehouse = Category::firstOrCreate(['name' => 'Warehouse']);

        $demoItems = [
            ['name' => 'USB-C Cable', 'sku' => 'ELEC-001', 'category_id' => $electronics->id, 'quantity' => 120, 'unit_price' => 8.99, 'reorder_level' => 20],
            ['name' => 'Wireless Mouse', 'sku' => 'ELEC-002', 'category_id' => $electronics->id, 'quantity' => 8, 'unit_price' => 24.50, 'reorder_level' => 15],
            ['name' => 'A4 Printer Paper (500)', 'sku' => 'OFF-001', 'category_id' => $office->id, 'quantity' => 60, 'unit_price' => 6.75, 'reorder_level' => 25],
            ['name' => 'Ballpoint Pens (Box of 12)', 'sku' => 'OFF-002', 'category_id' => $office->id, 'quantity' => 5, 'unit_price' => 4.20, 'reorder_level' => 10],
            ['name' => 'Packing Tape', 'sku' => 'WRH-001', 'category_id' => $warehouse->id, 'quantity' => 300, 'unit_price' => 3.10, 'reorder_level' => 50],
        ];

        foreach ($demoItems as $item) {
            Item::firstOrCreate(['sku' => $item['sku']], $item);
        }
    }
}