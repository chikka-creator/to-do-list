<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;

class TodoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->todos();

        // Filter by status
        if ($request->has('status')) {
            match ($request->status) {
                'completed' => $query->completed(),
                'pending'   => $query->pending(),
                default     => null,
            };
        }

        // Filter by priority
        if ($request->has('priority') && in_array($request->priority, ['low', 'medium', 'high'])) {
            $query->where('priority', $request->priority);
        }

        // Sort
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = ['created_at', 'due_date', 'priority', 'title'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'priority') {
                $query->orderByRaw("FIELD(priority, 'high', 'medium', 'low') " . ($sortOrder === 'asc' ? 'DESC' : 'ASC'));
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        return TodoResource::collection($query->get());
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = $request->user()->todos()->create($request->validated());

        return response()->json([
            'message' => 'Todo created successfully',
            'todo'    => new TodoResource($todo),
        ], 201);
    }

    public function show(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['todo' => new TodoResource($todo)]);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $todo->update($request->validated());

        return response()->json([
            'message' => 'Todo updated successfully',
            'todo'    => new TodoResource($todo),
        ]);
    }

    public function destroy(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $todo->delete();

        return response()->json(['message' => 'Todo deleted successfully']);
    }

    public function toggle(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $todo->update([
            'is_completed' => !$todo->is_completed,
            'completed_at' => !$todo->is_completed ? Carbon::now() : null,
        ]);

        return response()->json([
            'message' => 'Todo status updated',
            'todo'    => new TodoResource($todo),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $todos = $request->user()->todos();

        return response()->json([
            'total'     => (clone $todos)->count(),
            'completed' => (clone $todos)->where('is_completed', true)->count(),
            'pending'   => (clone $todos)->where('is_completed', false)->count(),
            'overdue'   => (clone $todos)->where('is_completed', false)
                ->whereNotNull('due_date')
                ->where('due_date', '<', now()->toDateString())
                ->count(),
        ]);
    }
}
