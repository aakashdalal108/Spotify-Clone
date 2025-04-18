let currentSong = new Audio();
let currFolder;
let songs;

function secondsToMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// function to fetch songs from GitHub
const getsongs = async (folder) => {
    currFolder = folder;

    const apiUrl = `https://api.github.com/repos/aakashdalal/Spotify-Clone/contents/${folder}`;
    const response = await fetch(apiUrl);
    const files = await response.json();

    songs = [];

    files.forEach(file => {
        if (file.name.endsWith(".mp3")) {
            songs.push({
                name: file.name,
                url: file.download_url
            });
        }
    });

    let songsUl = document.querySelector(".playlist ul");
    songsUl.innerHTML = "";

    for (const song of songs) {
        let songsGaane = decodeURIComponent(song.name);
        let parts = songsGaane.replace("128 Kbps.mp3", "").split(" - ");
        let songName = parts[0] || "Unknown";
        let artistName = parts[1] || "Unknown";

        songsUl.innerHTML += `
         <li data-filename="${song.name}">
            <i class="fa-solid fa-music"></i>
            <div class="info">
                <div class="songName">${songName}</div>
                <div class="artist">${artistName}</div>
                <i class="fa-solid fa-circle-play playnow"></i>
            </div>
         </li>`;
    }

    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.getAttribute("data-filename");
            playMusic(track);
        });
    });

    return songs;
};

// function to play songs using GitHub URL
function playMusic(track) {
    let selectedSong = songs.find(s => s.name === track);
    currentSong.src = selectedSong.url;

    currentSong.play();
    play.src = "img/pause.svg";

    document.querySelector(".track").innerHTML = decodeURIComponent(track).replace(".mp3", "").split(" - ")[0];
    document.querySelector(".duration").innerHTML = "00:00 / 00:00";
}

// function to show album and its songs from GitHub
const album = async () => {
    const foldersApi = `https://api.github.com/repos/aakashdalal/Spotify-Clone/contents/songs`;
    const folderRes = await fetch(foldersApi);
    const folders = await folderRes.json();

    const card = document.querySelector(".content");

    for (const folder of folders) {
        if (folder.type === "dir") {
            try {
                const infoRes = await fetch(`https://raw.githubusercontent.com/aakashdalal/Spotify-Clone/main/songs/${folder.name}/info.json`);
                const info = await infoRes.json();

                card.innerHTML += `
                    <div data-folder="songs/${folder.name}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="black"
                            style="background-color: #1db954; border-radius: 50%; padding: 12px;">
                            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05  20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                            </svg>
                        </div>
                        <img src="https://raw.githubusercontent.com/aakashdalal/Spotify-Clone/main/songs/${folder.name}/cover.jpeg" alt="">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (e) {
                console.warn(`Missing info.json or cover for ${folder.name}`);
            }
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(item.currentTarget.dataset.folder);
        });
    });
};

// --------- main function -------
async function main() {
    await getsongs("songs/bollywood");
    await album();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    seekbar.addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    previous.addEventListener("click", () => {
        let currentFile = songs.findIndex(s => s.url === currentSong.src);
        if ((currentFile - 1) >= 0) {
            playMusic(songs[currentFile - 1].name);
        }
    });

    next.addEventListener("click", () => {
        let currentFile = songs.findIndex(s => s.url === currentSong.src);
        if ((currentFile + 1) < songs.length) {
            playMusic(songs[currentFile + 1].name);
        }
    });
}

main();
