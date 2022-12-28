window.onload = () => {

    const addStreamerButton = document.getElementById('addStreamerButton');
    const removeStreamerButton = document.getElementById('removeStreamerButton');
    const removeAllButton = document.getElementById('removeAllButton');
    const addStreamerInput = document.getElementById('addStreamerInput');

    const pauseAllButton = document.getElementById('pauseAllButton');
    const resumeAllButton = document.getElementById('resumeAllButton');

    const streamsElement = document.getElementById('streams');

    const cssClasses = [
        {name: 'threeByThree', possibleSizes: [7, 8, 9]},
        {name: 'threeByTwo', possibleSizes: [5, 6]},
        {name: 'twoByTwo', possibleSizes: [3, 4]},
        {name: 'oneByTwo', possibleSizes: [2]},
        {name: 'oneByOne', possibleSizes: [1]}
    ]

    const streamMappings = []

    var streams = [];
    var removing = false;

    addStreamerButton.onclick = () => addStreamer(addStreamerInput.value);

    function addStreamer(streamer) {
        embedId = generateUUID();
    
        let streamElement = document.createElement('div');
        streamElement.id = embedId;
        streamElement.className = 'stream'
    
        streamsElement.appendChild(streamElement);
    
        var stream = new Twitch.Embed(embedId, {
            channel: streamer,
            layout: 'video',
            muted: true
        });
    
        stream.addEventListener(Twitch.Embed.VIDEO_READY, function() {
            stream.setQuality('720p');
            stream.setMuted(true);
        })
    
        stream.addEventListener(Twitch.Embed.VIDEO_PLAY, function() {
            stream.setQuality('720p');
            stream.setMuted(true);
            stream.removeEventListener(Twitch.Embed.VIDEO_PLAY);
        })
    
        streams.push(stream);
        setStreamsGrid();

        addStreamerInput.value = '';
        setDisabledProperties();
    }

    function generateUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function setStreamsGrid() {
        for(let cssClass of cssClasses) {
            if(cssClass.possibleSizes.includes(streams.length)) {
                streamsElement.className = cssClass.name;
            }
        }
    }

    addStreamerInput.addEventListener('input', () => {
        addStreamerButton.disabled = addStreamerInput.value == '' || streams.length >= 9 || removing;
    })

    pauseAllButton.onclick = () => {
        for(let stream of streams) {
            stream.pause();
        }
    }

    resumeAllButton.onclick = () => {
        for(let stream of streams) {
            stream.play();
        }
    }

    removeStreamerButton.onclick = () => addDeleteOverlay();
    removeAllButton.onclick = () => removeAll();

    function addDeleteOverlay() {
        for(let stream of streamsElement.children) {

            let overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.onclick = () => removeStreamer(stream.id);

            let icon = document.createElement('i');
            icon.className = 'material-icons text-shadow';
            icon.style.fontSize = (cssClasses.findIndex(cssClass => cssClass.name == streamsElement.className) + 1) * 3 + 'vw';
            icon.innerText = 'delete_outline';
            
            overlay.appendChild(icon);
            stream.appendChild(overlay, stream.firstChild);

            removeStreamerButton.onclick = () => removeDeleteOverlay();
            removeStreamerButton.innerHTML = "<i class='material-icons'>delete_outline</i>Cancel";
            removing = true;
            setDisabledProperties();
        }
    }

    function removeDeleteOverlay() {
        for(let stream of streamsElement.children) {
            stream.removeChild(stream.lastChild)
        }
        removeStreamerButton.onclick = () => addDeleteOverlay();
        removeStreamerButton.innerHTML = "<i class='material-icons'>delete_outline</i>Remove Streamer";

        removing = false;
        setDisabledProperties();
    }

    function removeStreamer(id) {
        addStreamerButton.disabled = addStreamerInput.value == '';

        streams.splice(streams.findIndex(stream => stream._target == document.getElementById(id)), 1);
        document.getElementById(id).remove();

        setStreamsGrid();
        removeDeleteOverlay();
        setDisabledProperties();
    }

    function removeAll() {
        streams = [];
        streamsElement.replaceChildren();
        setDisabledProperties();
    }

    function setDisabledProperties() {
        addStreamerButton.disabled = addStreamerInput.value == '' || streams.length >= 9 || removing;
        removeStreamerButton.disabled = streams.length <= 0;
        removeAllButton.disabled = streams.length <= 0;
    }

}