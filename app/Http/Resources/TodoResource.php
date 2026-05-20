<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'priority'     => $this->priority,
            'due_date'     => $this->due_date?->format('Y-m-d'),
            'is_completed' => $this->is_completed,
            'completed_at' => $this->completed_at?->toISOString(),
            'is_overdue'   => !$this->is_completed && $this->due_date && $this->due_date->isPast(),
            'created_at'   => $this->created_at->toISOString(),
            'updated_at'   => $this->updated_at->toISOString(),
        ];
    }
}
