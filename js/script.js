console.log("welcome to java script");

//get list of all songs
let currentsong = new Audio();
let songs;
let currfolder;
function formatTime(totalSeconds) {
  // if(isNaN(seconds) || seconds< 0){
  //   return "00:00";
  // }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60); // no decimals
  const formattedMins = minutes < 10 ? "0" + minutes : minutes;
  const formattedSecs = seconds < 10 ? "0" + seconds : seconds;
  return `${formattedMins}:${formattedSecs}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let links = div.querySelectorAll("ul#files a");
  console.log(links);
  
  songs = [];

  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    if (link.href.endsWith(".mp3")) {
      let filename=link.href.split("/").pop()
      console.log(filename);
      songs.push(filename);
      }
  }

  //display all the songs
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li><img class="invert" src="img/music.svg" alt="">
                        <div class=" info">
                            <div data-file=${song}>${song.replace(".mp3"," " )}</div>
                            <div>Tapan</div>
                        </div>
                        <div class="playnow">
                        <span>playnow</span>
                        <img class="invert" src="img/play.svg" alt=""></div>
      </li>`;
  }
  // attach an event listener for each songs
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let file = e.querySelector(".info div").dataset.file;
      playmusic(file);
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
  return songs
}
const playmusic = (track, pause = false) => {
  // let audio=new audio("/songs/" + track)
  currentsong.src = `/${currfolder}/` + track;

  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3", " "));
  document.querySelector(".songtime").innerHTML = "00.00/00.00";
};

async function displayAlbums() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.querySelectorAll("ul#files a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      //get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle -->
                                <circle cx="50" cy="50" r="48" fill="green" />

                                <!-- Black Play Triangle -->
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>


                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title} </h2>
                        <p> ${response.description}</p>
                    </div>`;
    }
  }
}
async function main() {
  await getsongs("songs/ncs");
  playmusic(songs[0], true);
  await displayAlbums();
  //Attach an event listner to play,pause and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/playbutton.svg";
    }
  });
  //listen for time update event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )}
    / ${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });
  //add an event listner to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listner to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //play the previous song
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    console.log(index);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });
  //play the next song
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    console.log(index + 1);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });
  //add an event listner to range
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
      document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
    });

  //load the playlist whenever card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
     playmusic(songs[0])

    });
  });
  //add an event listner to mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume =1 ;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 20;
    }
  });
}
main();
