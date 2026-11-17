import { supabase } from "./supabase.js";

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function loadDashboard(userId) {
  const today = localDateString();

  const [{ data: profile, error: profileError }, { data: goal, error: goalError }, { data: logs, error: logsError }] = await Promise.all([
    supabase.from("profiles").select("full_name, username").eq("id", userId).single(),
    supabase.from("daily_goals").select("target_ml, glass_size_ml").eq("user_id", userId).eq("goal_date", today).maybeSingle(),
    supabase.from("water_logs").select("id, amount_ml, consumed_at").eq("user_id", userId).eq("log_date", today).order("consumed_at", { ascending: false })
  ]);

  if (profileError) throw profileError;
  if (goalError) throw goalError;
  if (logsError) throw logsError;

  return {
    profile,
    goal: goal || { target_ml: 2000, glass_size_ml: 250 },
    logs: logs || []
  };
}

export async function saveGoal(userId, targetMl, glassSizeMl) {
  const { error } = await supabase.from("daily_goals").upsert({
    user_id: userId,
    goal_date: localDateString(),
    target_ml: targetMl,
    glass_size_ml: glassSizeMl
  }, { onConflict: "user_id,goal_date" });
  if (error) throw error;
}

export async function addWaterLog(userId, amountMl) {
  const { error } = await supabase.from("water_logs").insert({
    user_id: userId,
    amount_ml: amountMl,
    log_date: localDateString()
  });
  if (error) throw error;
}
