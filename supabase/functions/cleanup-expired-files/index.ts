import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of expired files...');

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find expired files
    const { data: expiredFiles, error: queryError } = await supabase
      .from('uploaded_files')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (queryError) {
      throw new Error(`Failed to query expired files: ${queryError.message}`);
    }

    if (!expiredFiles || expiredFiles.length === 0) {
      console.log('No expired files found');
      return new Response(
        JSON.stringify({ deleted: 0, message: 'No expired files found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredFiles.length} expired files`);

    let deletedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Delete files from storage
    for (const file of expiredFiles) {
      try {
        if (file.file_path) {
          const { error: storageError } = await supabase.storage
            .from('temp-media')
            .remove([file.file_path]);

          if (storageError) {
            console.error(`Failed to delete ${file.file_path} from storage:`, storageError);
            errors.push(`Storage: ${file.file_path}`);
            failedCount++;
          } else {
            console.log(`Deleted from storage: ${file.file_path}`);
          }
        }
      } catch (error) {
        console.error(`Error deleting file ${file.id}:`, error);
        errors.push(`File ${file.id}: ${error.message}`);
        failedCount++;
      }
    }

    // Delete records from database (this will cascade to playlists and segments)
    const { error: deleteError } = await supabase
      .from('uploaded_files')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.error('Failed to delete records from database:', deleteError);
      throw new Error(`Database deletion failed: ${deleteError.message}`);
    }

    deletedCount = expiredFiles.length;

    console.log(`Cleanup complete: ${deletedCount} files deleted, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        deleted: deletedCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Cleanup complete: ${deletedCount} expired files deleted`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup-expired-files function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
