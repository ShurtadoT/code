import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { pet_id, location_id, confidence } = body

    if (!pet_id || !location_id) {
      return NextResponse.json({ error: "pet_id and location_id are required" }, { status: 400 })
    }

    // Verify the pet belongs to the user
    const { data: pet, error: petError } = await supabase.from("pets").select("user_id").eq("id", pet_id).single()

    if (petError || pet?.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data: prediction, error } = await supabase
      .from("predictions")
      .insert({
        pet_id,
        location_id,
        confidence: confidence || 1.0,
        timestamp: new Date().toISOString(),
      })
      .select(`
        *,
        location:locations(id, name),
        pet:pets(id, name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prediction }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
