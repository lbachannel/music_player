/**
 *  1. Render songs
 *  2. Scroll top
 *  3. Play / pause / seek
 *  4. CD rotate
 *  5. Next / prev
 *  6. Random
 *  7. Next / Repeat when ended
 *  8. Active song
 *  9. Scroll active song into view
 *  10. Play song when click 
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const cd = $('.cd')
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const togglePlay = $('.btn-toggle-play');
const player = $('.player');
const process = $('#progress');
const nextBtn = $('.btn-next');
const previousBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const PLAYER_STOGRAGE_KEY = 'PLAYER';

const app = {
    // Lấy ra chỉ mục đầu tiên của mảng
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STOGRAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STOGRAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        { name: 'Let Me Love You', singer: 'D Snake, Justin Bieber', path: './assets/music/song1.mp3', image: './assets/img/song1.jpg'},
        { name: 'Marry You', singer: 'Bruno Mars', path: './assets/music/song2.mp3', image: './assets/img/song2.jpg'},
        { name: 'Bật Tình Yêu Lên', singer: 'Tăng Duy Tân, Hòa Minzy', path: './assets/music/song3.mp3', image: './assets/img/song3.jpg'},
        { name: 'Nơi Tình Yêu Bắt Đầu', singer: 'Lam Anh, Bằng Kiều', path: './assets/music/song4.mp3', image: './assets/img/song4.jpg'},
        { name: 'Cơn Mơ Băng Giá', singer: 'Bằng Kiều', path: './assets/music/song5.mp3', image: './assets/img/song5.jpg'},
        { name: 'Ngày Mai Người Ta Lấy Chồng', singer: 'Thành Đạt', path: './assets/music/song6.mp3', image: './assets/img/song6.jpg'},
        { name: 'See Tình', singer: 'Hoang Thuy Linh', path: './assets/music/song7.mp3', image: './assets/img/song7.jpg'},
        { name: 'Cảm Ơn Vì Tất Cả', singer: 'Anh Quân Idol', path: './assets/music/song8.mp3', image: './assets/img/song8.jpg'},
        { name: 'Anh Mệt Rồi', singer: 'Anh Quân Idol', path: './assets/music/song9.mp3', image: './assets/img/song9.jpg'},
        { name: 'Hoa Cỏ Lau', singer: 'Phong Max', path: './assets/music/song10.mp3', image: './assets/img/song10.jpg'},
        { name: 'Nevada', singer: 'Vicetone', path: './assets/music/song11.mp3', image: './assets/img/song11.jpg'},
        { name: 'Sumertime', singer: 'K-391', path: './assets/music/song12.mp3', image: './assets/img/song12.jpg'},
    ],

    // 1. Render songs
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ""}" data-index="${index}">
                        <div class="thumb" style="background-image: url('${song.image}')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
        })
        playlist.innerHTML = htmls.join('');
    },

    handleEvents: function() {
        // 2. ScrollTop
        const cdWidth = cd.offsetWidth;

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            /**
             *  Toán tử logic
             *  không có ông window.scrollY thì lấy document.documentElement.scrollTop
             *  Lý do là 1 số trình duyệt không hỗ trợ window.scrollY
             */
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        togglePlay.onclick = function() {
            if(app.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        // Click play
        audio.onplay = function() {   
            player.classList.add('playing');
            app.isPlaying = true;
            cdThumbAnimate.play();
        }

        // Click pause
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi thanh % thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration){
                const percent = Math.floor((audio.currentTime / audio.duration) * 100);
                process.value = percent;
            }
        }

        // Xử lý tua nhanh
        process.onchange = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        }

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)'}], {
            duration: 10000, // 10 giây
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Khi next song
        nextBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }

        // Khi previous song
        previousBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            } else {
                app.previousSong();
            }
            audio.play()
            app.render();
            app.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }

        // Khi nhạc kết thúc, tư động qua bài tiếp theo hoặc có repeat thì phát lại
        audio.onended = function() {
            if(app.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Xử lý lặp lại khi bài hát kết thúc
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                // xử lý khi click vào song
                if(songNode) {
                    // songNode.dataset.index, songNode.getAttribute('data-index') như nhau
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                }
                // xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 100)
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex == this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },

    previousSong: function() {
        if(this.currentIndex === 0){
            this.currentIndex = this.songs.length;
        }
        this.currentIndex--;
        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Lắng nghe / xử lý các sự kiện (DOM Events)
        this.handleEvents();

        // Render playlist
        this.render();
        
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    }
}
app.start()