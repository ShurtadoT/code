import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("petId")

    if (!petId) {
      return NextResponse.json({ error: "petId is required" }, { status: 400 })
    }

    // Get the latest prediction with location details
    const { data: prediction, error } = await supabase
      .from("predictions")
      .select(`
        *,
        location:locations(id, name, description),
        pet:pets(id, name, user_id)
      `)
      .eq("pet_id", petId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verify the pet belongs to the user
    if (prediction?.pet?.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ prediction })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
