<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('items')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json($category, 201);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->items()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has items.',
            ], 409);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}