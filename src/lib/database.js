import { supabase } from '../supabaseClient'

export async function saveTrackingData(userId, data) {
  const { error } = await supabase
    .from('tracking_data')
    .upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) throw error
  return data
}

export async function getTrackingData(userId) {
  const { data, error } = await supabase
    .from('tracking_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function saveStopPreference(userId, stop) {
  const { error } = await supabase
    .from('stop_preferences')
    .upsert({
      user_id: userId,
      stop_name: stop.name,
      stop_lat: stop.lat,
      stop_lng: stop.lng,
      radius: stop.radius,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) throw error
  return stop
}

export async function getStopPreferences(userId) {
  const { data, error } = await supabase
    .from('stop_preferences')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data ?? []
}

export async function saveAlertHistory(userId, alert) {
  const { error } = await supabase
    .from('alert_history')
    .insert({
      user_id: userId,
      stop_name: alert.stopName,
      distance: alert.distance,
      eta_minutes: alert.etaMinutes,
      triggered_at: new Date().toISOString(),
    })

  if (error) throw error
  return alert
}