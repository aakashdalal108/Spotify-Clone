
let currentSong = new Audio()
let currFolder;
let songs


function secondsToMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// function to fetch songs
const getsongs = async (folder) => {

    currFolder = folder
    const a = await fetch(`http://127.0.0.1:3000/spotify/${folder}`);
    const response = await a.text();


    const div = document.createElement("div");
    div.innerHTML = response;

    const as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop());

        }
    }


    let songsUl = document.querySelector(".playlist ul")
    songsUl.innerHTML = ""
    for (const song of songs) {

        let songsGaane = decodeURIComponent(song);
        let parts = songsGaane.replace("128 Kbps.mp3", "").split(" - ");
        let songName = parts[0] || "Unknown";
        let artistName = parts[1] || "Unknown";


        songsUl.innerHTML = songsUl.innerHTML + `
         <li data-filename="${song}">
           
            <i class="fa-solid fa-music "></i>
            <div class="info">
            <div class="songName">${songName}</div>
            <div class="artist">${artistName}</div>
            <i class="fa-solid fa-circle-play playnow"></i>
            </div>
         </li> `

    }

    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {

            let track = e.getAttribute("data-filename")
            playMusic(track)

        })

    })
    return songs

};

// ------- fumction to play songs -------
function playMusic(track) {

    currentSong.src = `${currFolder}/${track}`

        currentSong.play()
        play.src = "img/pause.svg"

    document.querySelector(".track").innerHTML = decodeURIComponent(track).replace(".mp3", "").split(" - ")[0]
    document.querySelector(".duration").innerHTML = "00:00 / 00:00"
}

// function to show album and its sonngs
const album = async () => {

    let a = await fetch(`http://127.0.0.1:3000/spotify/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let card = document.querySelector(".content")
    let aLinks = div.getElementsByTagName("a");


    let array = Array.from(aLinks)
    for (let index = 0; index < array.length; index++) {
        const element = array[index];

    
    if (element.href.includes("/songs")) {
        let folder = element.href.split("/").slice(-2).join("/")

        if (folder.endsWith(".DS_Store") || folder.includes(".")) continue;


        let a = await fetch(`http://127.0.0.1:3000/spotify/songs/${folder}/info.json`);
        let response = await a.json();
        
        card.innerHTML = card.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="black"
                        style="background-color: #1db954; border-radius: 50%; padding: 12px;">
                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05  20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                        </path>
                    </svg>

                    </div>
                    <img src="/spotify/songs/${folder}/cover.jpeg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
    }
}

Array.from(document.getElementsByClassName("card")).forEach(e => {
   
    e.addEventListener("click", async item => {
   
         await getsongs(`songs/${item.currentTarget.dataset.folder}`)
    })
})
}


// --------- main function -------
async function main() {
    await getsongs("songs/bollywood")


   await album()

    play.addEventListener("click", () => {
      
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    seekbar.addEventListener("click", (e) => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })


    previous.addEventListener("click", () => {
        let currentFile = songs.indexOf(currentSong.src.split("/").pop())
        if ((currentFile - 1) >= 0) {
            playMusic(songs[currentFile - 1])
        }
    })


    next.addEventListener("click", () => {
        let currentFile = songs.indexOf(currentSong.src.split("/").pop())
        if ((currentFile + 1) < songs.length) {
            playMusic(songs[currentFile + 1])
        }
    })

}

main() 