
interface Window {
  Spotify: {
    Player: new (options: Spotify.PlayerOptions) => Spotify.Player;
  };
  onSpotifyWebPlaybackSDKReady: () => void;
}

declare namespace Spotify {
  interface PlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: PlayerEvent, callback: PlayerCallback): void;
    removeListener(event: PlayerEvent, callback?: PlayerCallback): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  type PlayerEvent =
    | 'ready'
    | 'not_ready'
    | 'player_state_changed'
    | 'initialization_error'
    | 'authentication_error'
    | 'account_error'
    | 'playback_error';

  type PlayerCallback = (data: any) => void;

  interface PlaybackState {
    context: {
      uri: string;
      metadata: any;
    };
    disallows: {
      pausing: boolean;
      skipping_prev: boolean;
      skipping_next: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface Track {
    id: string;
    uri: string;
    type: string;
    media_type: string;
    name: string;
    duration_ms: number;
    album: Album;
    artists: Artist[];
  }

  interface Album {
    uri: string;
    name: string;
    images: Image[];
  }

  interface Artist {
    uri: string;
    name: string;
  }

  interface Image {
    url: string;
    height: number;
    width: number;
  }
}
