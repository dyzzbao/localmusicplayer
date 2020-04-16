const { ipcRenderer } = require('electron');
const { $, convertDuration } = require('./helper');
let musicAudio = new Audio();
let allTracks
let currentTrack
$('add-music-button').addEventListener('click', () => {
    ipcRenderer.send('add-music-window');
});
const renderListHTML = (tracks) => {
    const tracksList = $('tracksList');
    const tracksListHTML = tracks.reduce((html, track) => {
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
            <div class="col-xs-8 col-sm-9 col-md-10 col-lg-10">
                <span class="glyphicon glyphicon-music mr-2 text-secondary" ></span>
                <b>${track.fileName}</b>
            </div>
            <div class="col-xs-4 col-sm-3 col-md-2 col-lg-2">
                <span>&nbsp;&nbsp;&nbsp;</span>
                <span class="glyphicon glyphicon-play" data-id="${track.id}"></span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <span class="glyphicon glyphicon-remove" data-id="${track.id}"></span>
            </div>
        </li>`;
        return html;
    }, '');
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}
const rendererPlayerHTML = (name, duration) => {
    const player = $('player-status');
    const html = `<div class="col-xs-8 col-sm-9 col-md-10 col-lg-10 font-weight-bold bg-white pb-4">
        正在播放：${name}        
    </div>
    <div class="col-xs-4 col-sm-3 col-md-2 col-lg-2 font-weight-bold">
        <span id="current-seeker">00:00</span>/${convertDuration(duration)}
    </div>`
    player.innerHTML = html;
}
const updatedProgressHTML = (currentTime, duration) => {
    // 计算progress
    const progress = Math.floor(currentTime / duration * 100);
    const bar = $('player-progress');
    bar.innerHTML = progress + '%';
    bar.style.width = progress + '%';
    if(bar.style.width!=='0%'){
        bar.style.display='block';
    }else{
        bar.style.display='none';
    }
    const seeker = $('current-seeker');
    seeker.innerHTML = convertDuration(currentTime);
}
ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log('receive tracks', tracks);
    allTracks = tracks;
    renderListHTML(tracks);

});
musicAudio.addEventListener('loadedmetadata', () => {
    //渲染播放器状态
    rendererPlayerHTML(currentTrack.fileName, musicAudio.duration)
})
musicAudio.addEventListener('timeupdate', () => {
    //更新播放器状态
    updatedProgressHTML(musicAudio.currentTime, musicAudio.duration)
})
$('tracksList').addEventListener('click', (event) => {
    // console.log('tracks', allTracks);
    event.preventDefault();
    const { dataset, classList } = event.target;
    const id = dataset && dataset.id;
    if (id && classList.contains('glyphicon-play')) {
        //这里开始播放音乐
        if (currentTrack && currentTrack.id === id) {
            // 继续播放音乐
            musicAudio.play();
        } else {
            // 播放新歌曲并还原图标
            currentTrack = allTracks.find(track => track.id === id);
            // console.log(currentTrack);
            musicAudio.src = currentTrack.path;
            musicAudio.play();
            const resetIconEle = document.querySelector('.glyphicon-pause');
            if (resetIconEle) {
                // console.log('resetIconEle: ', resetIconEle);
                resetIconEle.classList.replace('glyphicon-pause', 'glyphicon-play');
            }
        }
        classList.replace('glyphicon-play', 'glyphicon-pause');

    } else if (id && classList.contains('glyphicon-pause')) {
        // 这里处理暂停逻辑
        musicAudio.pause();
        classList.replace('glyphicon-pause', 'glyphicon-play');

    } else if (id && classList.contains('glyphicon-remove')) {
        // 这里删除音乐文件
        // console.log(id);
        ipcRenderer.send('delete-track', id);
    }
});