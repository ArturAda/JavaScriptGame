let music_is_playing = JSON.parse(localStorage.getItem('buttonSound') || 'true');

export const gameTracks = [
    new Audio('../music/menu_beta.mp3'),
    new Audio('../music/leaderboard_beta.mp3'),
    new Audio('../music/game_1(default)_beta.mp3'),
];

gameTracks.forEach(track => { track.loop = true });

gameTracks[0].volume = 0.2;
gameTracks[1].volume = 0.2;

let music_playing_now = null;

export function switchTo(track = null, save=true) {
    if (music_playing_now !== track) {
        if (music_playing_now !== null) {
            music_playing_now.pause();
            if (save) {
                music_playing_now.currentTime = 0;
            }
        }
        music_playing_now = track;
        if (music_playing_now !== null && music_is_playing) {
            music_playing_now.play().catch(console.warn);
        }
    }
}

export function setMusicPlaying(change_music, save = true) {
    if (music_is_playing !== Boolean(change_music)) {
        music_is_playing = Boolean(change_music);
        if (save) {
            localStorage.setItem('buttonSound', JSON.stringify(music_is_playing));
        }
        if (music_playing_now !== null) {
            if (music_is_playing) {
                music_playing_now.currentTime = 0;
                music_playing_now.play().catch(console.warn);
            } else {
                music_playing_now.pause();
            }
        }
    }
}

export function isMusicPlaying() {
    return music_is_playing;
}