

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const loading = $('.loading')
const audio= $('#audio') // get element audio player!
const progress = $('#progress');// get element input range
let playing = false; // status 'playing' when first load app
const loader = $('.loader'); // get element current progress
const bgContainer = $('.container')
const bgMain = $('.main-bg')

const curSong = $('.cur-playing') // get element to render current songs

//// get element button control
const playPause = $('.play-pause');
const btnPlay = $('.btn-play')
const btnPause = $('.btn-pause')
const btnNext = $('.next')
const btnPrev = $('.prev')
const repeat = $('.repeat')// get element repeat current song
let isRepeat 
const shuffle = $('.shuffle') //get element random song
let isShuffle

const list = $('.column') // get element to render songs


const theme = $('.theme-icon') //get element change theme
let ramdomMemory = [];
var listSong ; //get song after render playlist
var currentSong =0; // index song

const hostLink = 'https://raw.githubusercontent.com/NVB07/m3-data/main/acssets/mp3/'
const apiMusic = 'https://raw.githubusercontent.com/NVB07/m3-data/main/package.json';

function start(){
    
    async function getDataFromAPI() {
        try {
          // Hiển thị animation loading
          loading.style.display = 'flex';
          
          // Gọi API và đợi kết quả trả về
        await getApi((data)=>{
            const arrayData = data.mp3;
            mainApp.start(arrayData)
            handleTimes.onTimeStart()
        })
          
          // Ẩn animation loading và hiển thị dữ liệu trả về
          loading.style.display = 'none';
        } catch (error) {
          console.error(error);
        }
    }
    getDataFromAPI()

    
}
start();

function getApi(data) {
    return fetch(apiMusic)
        .then(response => response.json())
        .then(data)
        .catch(error => console.error(error));
}


const mainApp = {
    renderPlaylist : function(arraySong){
        const htmlsList = arraySong.map((song,index)=>{
            return `
                    <div class="song">
                        <img src="${song.image}" alt="" class="img-song-item">
                        <div class="decript">
                            <div class="name-song-item">${song.name}</div>
                            <div class="singer-song-item">${song.singer}</div>
                        </div>
                        
                    </div>
                    `
        })
        list.innerHTML = htmlsList.join('')
    
        //get element listsong after render playlist
        listSong = $$('.song')
    },
    
    renderCurrentSong: function(items){
        audio.src = hostLink + items[currentSong].src;
        bgContainer.style.backgroundImage =`url(${items[currentSong].image}) `
        bgMain.style.backgroundImage = `url(${items[currentSong].image}) `
        async function innerCurSong() {
                curSong.innerHTML = 
                `
                <div class="cur-song">
                    <div class="now">Now playing :</div>
                    <div class="name-song">${items[currentSong].name}</div>
                    <div class="name-singer">${items[currentSong].singer}</div>
                </div>
                <div class="cur-img">
                    <img src="${items[currentSong].image}" alt="" class="img">
                    <img src="${items[currentSong].image}" alt="" class="drop-img">
                </div>
                `
          }
          innerCurSong()
        
        //add class 'now-play' for first song
        
        listSong[currentSong].classList.add('now-play')
        //
        let widthBoxText = $('.cur-song').offsetWidth
        let textsong = $('.name-song')
        if(textsong.offsetWidth > widthBoxText){
            let translate = [
                { left: `${(textsong.offsetWidth )}px` },
                { left:`${-(textsong.offsetWidth )}px` },
              ];
              
            let translateTimming = {
            duration:textsong.offsetWidth*10 + 10000,
            iterations: Infinity,
            };
            textsong.animate(translate, translateTimming);
        }
    },
    handleEvents: function(array){
        theme.onclick =()=>{
            $('.main-bg-filter').classList.toggle('change-theme')
        }
        
        repeat.onclick = ()=>{
            isRepeat= repeat.classList.toggle('focus')
        }
        
        shuffle.onclick = ()=>{
            isShuffle= shuffle.classList.toggle('focus')
        }
        playPause.onclick = ()=>{
            if(!playing){
                generalFunction.audioPlay();
            }
            else{
                generalFunction.audioPause()
            }
        }
        
        btnNext.onclick=()=>{
            generalFunction.audioNext(array)
        }
        btnPrev.onclick=()=>{
            generalFunction.audioBack(array)
        }
        audio.onended =()=>{
            if(isRepeat){
                generalFunction.audioPlay()
            }
            else{
                generalFunction.audioNext(array)
            }
        }
    
        for(let j = 0 ; j< listSong.length; j++){
            listSong[j].onclick=()=>{
                currentSong = j;
                generalFunction.removeClass()
                this.renderCurrentSong(array)
                generalFunction.audioPlay()
            }
        }
    },

    start : function(array){
        this.renderPlaylist(array)
        this.renderCurrentSong(array)
        this.handleEvents(array)
    }
}


const generalFunction= {
    removeClass :function(){
        var activeElements = $$(".now-play");
        for (var i = 0; i < activeElements.length; i++) {
            activeElements[i].classList.remove("now-play");
        }
    },
    audioPlay: function(){
        audio.play();
        playing= true;
        btnPlay.classList.add('dp-none')
        btnPause.classList.remove('dp-none')
    },
    
    audioPause :function(){
        audio.pause();
        playing= false;
        btnPause.classList.add('dp-none')
        btnPlay.classList.remove('dp-none')
    },
    audioNext: function(array){
        if(isShuffle){
          currentSong =  this.isShuffled(array.length, ramdomMemory)
        }
        else{
            currentSong++;
            if( currentSong >= array.length ){
                currentSong = 0;
            }
        }
        this.removeClass() 
        mainApp.renderCurrentSong(array)
        this.audioPlay()
    },
    
    audioBack :function(array){
        if(isShuffle){
            currentSong =  this.isShuffled(array.length, ramdomMemory)
          }
        else{
            currentSong--;
            if( currentSong < 0 ){
                currentSong = array.length -1 ;
            }
        }
        
        this.removeClass()
        mainApp.renderCurrentSong(array);
        this.audioPlay()
    },
    isShuffled: function(arrLength, arr) {
        let randomNumber = Math.floor(Math.random() * arrLength);
        while (arr.includes(randomNumber)) {
          randomNumber = Math.floor(Math.random() * arrLength);
        }
        arr.push(randomNumber);
        return randomNumber;
    },
}

//handle times
const handleTimes={
    updateTrack: function(){
        audio.ontimeupdate = function () {
            if (audio.duration) {
              const progressPercent = Math.floor(
                (audio.currentTime / audio.duration) * 1000
              );
              progress.value = progressPercent ;
              if(progress.value <500){
                loader.style.width = progress.value/10 +0.5+"%";
                }
                else{
                    loader.style.width = progress.value/10 - 0.5 +"%";
                }
            }
          }
        progress.oninput = function (e) {
            const seekTime = (audio.duration / 1000) * e.target.value;
            audio.currentTime = seekTime;
        };
    },
    updateTime:function(){
            var time = audio.currentTime;
            var timeSecons = Math.floor(time / 1);
            var min = Math.floor(timeSecons / 60);
            (min >= 1) ? timeSecons = timeSecons - (min*60) : min = '0';
            (timeSecons < 1) ? sec='0' : void 0;
            if(min < 10) {
                min = "0" + min;
            }
            if(timeSecons < 10) {
                timeSecons = "0" + timeSecons;
            }
            $(".curTime").innerHTML = min + ":" + timeSecons;
    }, 
    getDurationTimes:function(){
        audio.onloadedmetadata = function() {
            var time = audio.duration;
          
          
            var timeSecons = Math.floor(time / 1);
            
              var min = Math.floor(timeSecons / 60);
              (min >= 1) ? timeSecons = timeSecons - (min*60) : min = '0';
              (timeSecons < 1) ? sec='0' : void 0;
              if(min < 10) {
                min = "0" + min;
            }
              if(timeSecons < 10) {
                timeSecons = "0" + timeSecons;
            }
            $(".sumTime").innerHTML = min + ":" + timeSecons;
          };
    },
    onTimeStart:function(){
        this.updateTrack();
        setInterval('handleTimes.updateTime()', 1000);
        this.getDurationTimes()
    }
}


