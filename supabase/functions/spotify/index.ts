
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to get Spotify access token
async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials'
    })
  });

  const data = await response.json();
  return data.access_token;
}

// Get artist tracks
async function getArtistTopTracks(artistId: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return await response.json();
}

// Get artist info
async function getArtist(artistId: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return await response.json();
}

// Get artists
async function getArtists(accessToken: string) {
  const { data: artists, error } = await supabase
    .from('spotify_artists')
    .select('*');

  if (error) throw error;
  return artists;
}

// Sync artist tracks
async function syncArtistTracks(artistId: string, artistName: string, accessToken: string) {
  try {
    console.log(`Syncing tracks for artist ${artistName} (${artistId})`);
    const topTracks = await getArtistTopTracks(artistId, accessToken);
    
    if (!topTracks.tracks || topTracks.error) {
      throw new Error(topTracks.error?.message || 'Failed to fetch top tracks');
    }

    const tracksToInsert = topTracks.tracks.map((track: any) => ({
      track_id: track.id,
      artist_id: artistId,
      title: track.name,
      album_name: track.album.name,
      release_date: track.album.release_date,
      duration_ms: track.duration_ms,
      cover_image_url: track.album.images[0]?.url || '',
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify
    }));

    // Delete existing tracks for this artist
    const { error: deleteError } = await supabase
      .from('spotify_tracks')
      .delete()
      .eq('artist_id', artistId);

    if (deleteError) throw deleteError;

    // Insert new tracks
    const { error: insertError } = await supabase
      .from('spotify_tracks')
      .insert(tracksToInsert);

    if (insertError) throw insertError;

    console.log(`Successfully synced ${tracksToInsert.length} tracks for ${artistName}`);
    return { success: true, count: tracksToInsert.length };
  } catch (error) {
    console.error('Error syncing tracks:', error);
    throw error;
  }
}

// Create Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Get Spotify access token
    const accessToken = await getSpotifyToken();
    if (!accessToken) {
      throw new Error('Failed to obtain Spotify access token');
    }

    // Routes
    if (req.method === 'POST' && path === 'add-artist') {
      // Add a new artist to track
      const { artistId } = await req.json();
      
      // Check if artist exists in Spotify
      const artistData = await getArtist(artistId, accessToken);
      
      if (artistData.error) {
        throw new Error(artistData.error.message || 'Artist not found');
      }
      
      // Add artist to database
      const { data: existingArtist, error: checkError } = await supabase
        .from('spotify_artists')
        .select()
        .eq('artist_id', artistId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (!existingArtist) {
        const { error } = await supabase
          .from('spotify_artists')
          .insert({
            artist_id: artistId,
            artist_name: artistData.name
          });
        
        if (error) throw error;
      }
      
      // Sync the artist's tracks
      await syncArtistTracks(artistId, artistData.name, accessToken);
      
      return new Response(
        JSON.stringify({ success: true, artist: artistData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (req.method === 'GET' && path === 'sync') {
      // Sync all artists
      const artists = await getArtists(accessToken);
      const results = [];
      
      for (const artist of artists) {
        try {
          const result = await syncArtistTracks(artist.artist_id, artist.artist_name, accessToken);
          results.push({ artist: artist.artist_name, ...result });
        } catch (error) {
          results.push({ artist: artist.artist_name, error: error.message });
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (req.method === 'GET' && path === 'tracks') {
      // Get all tracks
      const { data: tracks, error } = await supabase
        .from('spotify_tracks')
        .select('*, spotify_artists(artist_name)')
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ success: true, tracks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (req.method === 'DELETE' && path === 'remove-artist') {
      const { artistId } = await req.json();
      
      // Delete all tracks from this artist
      const { error: tracksError } = await supabase
        .from('spotify_tracks')
        .delete()
        .eq('artist_id', artistId);
      
      if (tracksError) throw tracksError;
      
      // Delete the artist
      const { error: artistError } = await supabase
        .from('spotify_artists')
        .delete()
        .eq('artist_id', artistId);
      
      if (artistError) throw artistError;
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid route' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Spotify API:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
