
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';

const corsOptionsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LawnProfile {
  id: string;
  user_id: string;
  name: string;
  grass_type: string;
  lawn_size: string;
  last_mowed: string | null;
  last_fertilized: string | null;
  soil_type: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  email_preferences: {
    reminders: boolean;
    frequency: string;
    time: string;
  };
}

interface CareTask {
  type: 'mowing' | 'fertilizing' | 'watering' | 'aerating';
  title: string;
  description: string;
  frequency: number; // days
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders, ...corsOptionsHeaders } });
  }

  try {
    const { scheduledRun = false } = await req.json();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    console.log('Starting care reminder job...');
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get all users with lawn profiles who have reminders enabled
    const { data: usersWithProfiles, error: usersError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        email_preferences,
        lawn_profiles (
          id,
          user_id,
          name,
          grass_type,
          lawn_size,
          last_mowed,
          last_fertilized,
          soil_type
        )
      `)
      .eq('email_preferences->reminders', true)
      .not('lawn_profiles', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!usersWithProfiles || usersWithProfiles.length === 0) {
      console.log('No users with lawn profiles and reminders enabled found');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to send reminders to' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${usersWithProfiles.length} users to check for reminders`);

    let remindersSent = 0;
    const errors: string[] = [];

    for (const user of usersWithProfiles) {
      try {
        const lawnProfile = user.lawn_profiles?.[0];
        if (!lawnProfile) continue;

        const tasksForToday = getTasksForToday(lawnProfile, today);
        
        if (tasksForToday.length === 0) {
          console.log(`No tasks for user ${user.email} today`);
          continue;
        }

        // Check if we already sent reminders for these tasks today
        const { data: existingLogs } = await supabaseClient
          .from('reminder_logs')
          .select('task_type')
          .eq('user_id', user.id)
          .eq('task_date', todayStr);

        const alreadySentTypes = existingLogs?.map(log => log.task_type) || [];
        const newTasks = tasksForToday.filter(task => !alreadySentTypes.includes(task.type));

        if (newTasks.length === 0) {
          console.log(`Already sent reminders to ${user.email} for today`);
          continue;
        }

        // Send email reminder
        const emailSent = await sendReminderEmail(user, lawnProfile, newTasks);
        
        if (emailSent) {
          // Log the sent reminders
          for (const task of newTasks) {
            await supabaseClient
              .from('reminder_logs')
              .insert({
                user_id: user.id,
                task_type: task.type,
                task_date: todayStr,
                email_sent: true
              });
          }
          
          remindersSent++;
          console.log(`Reminder sent to ${user.email} for ${newTasks.length} tasks`);
        } else {
          errors.push(`Failed to send reminder to ${user.email}`);
        }

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        errors.push(`Error processing ${user.email}: ${error.message}`);
      }
    }

    const response = {
      success: true,
      remindersSent,
      totalUsers: usersWithProfiles.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Care reminder job completed:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-care-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getTasksForToday(profile: LawnProfile, today: Date): CareTask[] {
  const tasks: CareTask[] = [];
  
  // Define care schedules based on grass type and season
  const careSchedules = {
    mowing: getMovingFrequency(profile.grass_type, today),
    fertilizing: getFertilizingFrequency(profile.grass_type, today),
    watering: 3, // Every 3 days during growing season
    aerating: 365 // Once per year
  };

  // Check if mowing is due
  if (profile.last_mowed) {
    const lastMowed = new Date(profile.last_mowed);
    const daysSinceLastMowed = Math.floor((today.getTime() - lastMowed.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastMowed >= careSchedules.mowing) {
      tasks.push({
        type: 'mowing',
        title: 'Zeit zum Mähen!',
        description: `Es ist Zeit, Ihren ${profile.grass_type}-Rasen zu mähen. Letztes Mal gemäht: ${formatDate(lastMowed)}`
      });
    }
  } else {
    // If no last mowed date, suggest mowing
    tasks.push({
      type: 'mowing',
      title: 'Rasen mähen',
      description: 'Es wäre gut, Ihren Rasen zu mähen.'
    });
  }

  // Check if fertilizing is due
  if (profile.last_fertilized) {
    const lastFertilized = new Date(profile.last_fertilized);
    const daysSinceLastFertilized = Math.floor((today.getTime() - lastFertilized.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastFertilized >= careSchedules.fertilizing) {
      tasks.push({
        type: 'fertilizing',
        title: 'Zeit zum Düngen!',
        description: `Ihr ${profile.grass_type}-Rasen sollte gedüngt werden. Letztes Mal gedüngt: ${formatDate(lastFertilized)}`
      });
    }
  }

  return tasks;
}

function getMovingFrequency(grassType: string, date: Date): number {
  const month = date.getMonth(); // 0-11
  const isGrowingSeason = month >= 3 && month <= 9; // April to October
  
  if (!isGrowingSeason) return 14; // Every 2 weeks in winter
  
  switch (grassType.toLowerCase()) {
    case 'zier': return 7; // Weekly for ornamental grass
    case 'sport': return 5; // Every 5 days for sports grass
    case 'spiel': return 7; // Weekly for play grass
    default: return 10; // Every 10 days for others
  }
}

function getFertilizingFrequency(grassType: string, date: Date): number {
  const month = date.getMonth();
  const isSpringOrFall = (month >= 2 && month <= 4) || (month >= 8 && month <= 10);
  
  if (!isSpringOrFall) return 120; // Every 4 months outside growing season
  
  return 45; // Every 6-7 weeks during growing season
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE');
}

async function sendReminderEmail(user: UserProfile, lawnProfile: LawnProfile, tasks: CareTask[]): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.log('RESEND_API_KEY not configured - would send email to:', user.email);
    return false;
  }

  const taskList = tasks.map(task => `
    <div style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #10b981;">${task.title}</h3>
      <p style="margin: 0; color: #64748b;">${task.description}</p>
    </div>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rasenpflege Erinnerung</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #10b981; margin: 0;">🌱 Rasenpilot</h1>
          <p style="color: #64748b; margin: 10px 0 0 0;">Ihre tägliche Rasenpflege-Erinnerung</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Hallo ${user.full_name || 'Rasenfreund'},</p>
          <p>Es ist Zeit für die Pflege Ihres <strong>${lawnProfile.name || 'Rasens'}</strong>!</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #166534; margin: 0 0 20px 0;">Heute zu erledigen:</h2>
          ${taskList}
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065f46;"><strong>💡 Tipp:</strong> Die beste Zeit für die Rasenpflege ist am frühen Morgen oder späten Nachmittag.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Sie erhalten diese E-Mail, weil Sie Rasenpflege-Erinnerungen aktiviert haben.<br>
            <a href="#" style="color: #10b981;">Einstellungen ändern</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Rasenpilot <noreply@rasenpilot.com>',
        to: [user.email],
        subject: `🌱 Rasenpflege für heute - ${tasks.length} Aufgabe${tasks.length > 1 ? 'n' : ''}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
