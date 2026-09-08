<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreItemRequest;
use App\Http\Requests\Api\UpdateItemRequest;
use App\Models\Item;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Item::query()
            ->with('category')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->low_stock, function ($query) {
                $query->whereColumn('quantity', '<=', 'reorder_level');
            })
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return response()->json($items);
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $item = Item::create($request->validated());

        return response()->json($item->load('category'), 201);
    }

    public function show(Item $item): JsonResponse
    {
        return response()->json($item->load('category'));
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $wasBelowReorder = $item->quantity <= $item->reorder_level;

        $item->update($request->validated());

        if (!$wasBelowReorder && $item->quantity <= $item->reorder_level) {
            $this->notifyLowStock($item);
        }

        return response()->json($item->load('category'));
    }

    public function destroy(Item $item): JsonResponse
    {
        $item->delete();

        return response()->json(['message' => 'Item deleted']);
    }

    private function notifyLowStock(Item $item): void
    {
        User::where('role', 'admin')->get()->each(function (User $admin) use ($item) {
            $admin->notify(new LowStockNotification($item));
        });
    }
}