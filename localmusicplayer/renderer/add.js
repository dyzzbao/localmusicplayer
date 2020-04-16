const { ipcRenderer } = require('electron');
const { $ } = require('./helper');
const path = require('path');
let musciFilesPath = []
$('select-music').addEventListener('click', () => {
    ipcRenderer.send('open-music-file');
});
$('add-music').addEventListener('click', () => {
    ipcRenderer.send('add-tracks', musciFilesPath);
});
const renderListHTML = (paths) => {
    const musicList = $('musicList');
    const musicItemsHTML = paths.reduce((html, music) => {
        html += `<li class="list-group-item">
            <span class="glyphicon glyphicon-music mr-2" ></span>
            <b>${path.basename(music)}</b>
        </li>`;
        return html;
    }, '')
    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
}
ipcRenderer.on('selected-file', (event, path) => {
    if (Array.isArray(path)) {
        renderListHTML(path);
        musciFilesPath = path;
    }
})