import { useSongStore } from '../../store/songStore';
import { Plus, Music, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { songs, createNewSong, loadSong } = useSongStore();
  const navigate = useNavigate();

  const handleNewSong = () => {
    createNewSong();
    navigate('/harmony');
  };

  const handleSongClick = (songId: string) => {
    loadSong(songId);
    navigate('/harmony');
  };

  const totalSongs = songs.length;
  const completedSongs = songs.filter((song) => 
    song.sections.length > 0 && 
    song.sections.every((section) => section.lyrics && section.chords)
  ).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Let's create something amazing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary mb-1">Total Songs</p>
              <p className="text-3xl font-bold text-text-primary">{totalSongs}</p>
            </div>
            <Music className="text-track-orange-700" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary mb-1">Completed</p>
              <p className="text-3xl font-bold text-text-primary">{completedSongs}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary mb-1">This Month</p>
              <p className="text-3xl font-bold text-text-primary">
                {songs.filter((song) => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(song.createdAt) > monthAgo;
                }).length}
              </p>
            </div>
            <Calendar className="text-white" size={32} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Recent Songs</h2>
          <button
            onClick={handleNewSong}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Song
          </button>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <Music className="mx-auto text-text-disabled mb-4" size={48} />
            <p className="text-text-secondary mb-4">No songs yet. Create your first one!</p>
            <button onClick={handleNewSong} className="btn-primary">
              Create New Song
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.slice(0, 6).map((song) => (
              <div
                key={song.id}
                className="card-interactive p-4"
                onClick={() => handleSongClick(song.id)}
              >
                <h3 className="font-semibold text-text-primary mb-2">{song.title}</h3>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span>{song.key.root} {song.key.mode}</span>
                  <span>{song.tempo} BPM</span>
                  <span>{song.sections.length} sections</span>
                </div>
                <p className="text-xs text-text-disabled mt-2">
                  Updated {new Date(song.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

