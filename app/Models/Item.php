<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'sku', 'category_id', 'quantity', 'unit_price', 'reorder_level', 'image_path'])]
class Item extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Item $item) {
            if (empty($item->sku)) {
                $item->sku = static::generateSku($item->category_id);
            }
        });
    }

    public static function generateSku(int $categoryId): string
    {
        $prefix = static::prefixFor($categoryId);

        $last = static::where('sku', 'like', "{$prefix}-%")
            ->pluck('sku')
            ->map(fn ($sku) => (int) str_replace("{$prefix}-", '', $sku))
            ->max() ?? 0;

        return sprintf('%s-%03d', $prefix, $last + 1);
    }

    protected static function prefixFor(int $categoryId): string
    {
        $category = Category::find($categoryId);
        $prefix = strtoupper(trim((string) ($category?->prefix ?? '')));

        if ($prefix === '') {
            $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', (string) ($category?->name ?? 'GEN')), 0, 4));
        }

        return $prefix !== '' ? $prefix : 'GEN';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'float',
            'reorder_level' => 'integer',
        ];
    }
}
