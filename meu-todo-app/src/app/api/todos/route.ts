// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST: Add a new todo and optionally enhance via N8N
export async function POST(req: NextRequest) {
  try {
    const { title, description, userEmail } = await req.json()

    if (!title || !userEmail) {
      return NextResponse.json({ error: 'Title and userEmail are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        user_email: userEmail,
        completed: false,
        processing_status: 'processing'
      }])
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to insert task' }, { status: 500 })
    }

    // Call N8N webhook for enhancement
    const n8nWebhookUrl = process.env.N8N_TODO_WEBHOOK
    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            todoId: data.id, 
            title: data.title,
            description: data.description 
          })
        })
        
        if (n8nResponse.ok) {
          const enhanced = await n8nResponse.json()
          
          // Update with enhanced content if available
          if (enhanced?.title || enhanced?.description) {
            const { data: updatedData } = await supabase
              .from('todos')
              .update({
                title: enhanced.title || data.title,
                description: enhanced.description || data.description,
                processing_status: 'ready'
              })
              .eq('id', data.id)
              .select()
              .single()

            return NextResponse.json(updatedData || data)
          }
        }
        
        // Mark as ready even if N8N didn't enhance
        await supabase
          .from('todos')
          .update({ processing_status: 'ready' })
          .eq('id', data.id)
          
      } catch (n8nError) {
        console.error('N8N enhancement failed:', n8nError)
        // Continue without enhancement
        await supabase
          .from('todos')
          .update({ processing_status: 'ready' })
          .eq('id', data.id)
      }
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('POST /api/todos error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}

// GET: Fetch all todos for a user
export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('GET /api/todos error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}

// PATCH: Update a todo (title, description, completed)
export async function PATCH(req: NextRequest) {
  try {
    const { todoId, title, description, completed } = await req.json()
    
    if (!todoId) {
      return NextResponse.json({ error: 'todoId is required' }, { status: 400 })
    }

    const updates: any = {}
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (completed !== undefined) updates.completed = completed

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', todoId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('PATCH /api/todos error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}

// DELETE: Remove a todo
export async function DELETE(req: NextRequest) {
  try {
    const { todoId } = await req.json()
    
    if (!todoId) {
      return NextResponse.json({ error: 'todoId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/todos error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}