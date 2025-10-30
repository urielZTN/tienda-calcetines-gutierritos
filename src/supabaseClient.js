import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xhuwdnpwzamoirfyjcdw.supabase.co"; // tu Project URL
const supabaseAnonKey = "sb_publishable_asmG0RQPWi5znKsQD4uopQ_agvBT7hl"; // la que te dio Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
