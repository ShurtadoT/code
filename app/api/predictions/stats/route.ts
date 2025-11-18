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
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!petId) {
      return NextResponse.json({ error: "petId is required" }, { status: 400 })
    }

    // Calculate the time threshold
    const timeThreshold = new Date()
    timeThreshold.setHours(timeThreshold.getHours() - hours)

    // Get predictions with location info for the specified time period
    const { data: predictions, error } = await supabase
      .from("predictions")
      .select(`
        id,
        timestamp,
        confidence,
        location:locations(id, name),
        pet:pets(id, name, user_id)
      `)
      .eq("pet_id", petId)
      .gte("timestamp", timeThreshold.toISOString())
      .order("timestamp", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verify the pet belongs to the user
    if (predictions && predictions.length > 0 && predictions[0]?.pet?.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Calculate location distribution
    const locationCounts: Record<string, number> = {}
    predictions?.forEach((pred) => {
      const locationName = pred.location?.name || "Desconocido"
      locationCounts[locationName] = (locationCounts[locationName] || 0) + 1
    })

    const stats = Object.entries(locationCounts).map(([name, count]) => ({
      location: name,
      count,
      percentage: ((count / (predictions?.length || 1)) * 100).toFixed(1),
    }))

    return NextResponse.json({
      stats,
      total: predictions?.length || 0,
      timeRange: hours,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
