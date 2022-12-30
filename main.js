window.onload = () => {

    const addChannelButton = document.getElementById('addChannelButton');
    const removeChannelButton = document.getElementById('removeChannelButton');
    const removeAllButton = document.getElementById('removeAllButton');
    const addChannelInput = document.getElementById('addChannelInput');

    const pauseAllButton = document.getElementById('pauseAllButton');
    const resumeAllButton = document.getElementById('resumeAllButton');

    const soundSwitchInput = document.getElementById('soundSwitchInput');
    const soundSwitchApply = document.getElementById('soundSwitchApply');
    const soundSwitchClear = document.getElementById('soundSwitchClear');
    const volumeSlider = document.getElementById('volumeSlider');

    const channelsElement = document.getElementById('channels');

    const cssClasses = [
        {name: 'threeByThree', possibleSizes: [7, 8, 9]},
        {name: 'threeByTwo', possibleSizes: [5, 6]},
        {name: 'twoByTwo', possibleSizes: [3, 4]},
        {name: 'oneByTwo', possibleSizes: [2]},
        {name: 'oneByOne', possibleSizes: [1]}
    ]

    const channelMappings = []

    var channels = [];

    var removing = false;
    var soundSwitchActive = false;
    var soundSwitchIteration = 0;

    var soundSwitchInterval;

    addChannelButton.onclick = () => addChannel(addChannelInput.value);

    function addChannel(channel) {
        embedId = generateUUID();
    
        let channelElement = document.createElement('div');
        channelElement.id = embedId;
        channelElement.className = 'channel'
    
        channelsElement.appendChild(channelElement);
    
        var channel = new Twitch.Embed(embedId, {
            channel: channel,
            layout: 'video',
            muted: true
        });
    
        channel.addEventListener(Twitch.Embed.VIDEO_READY, function() {
            channel.setQuality('720p');
            channel.setMuted(true);
            channel.setVolume(volumeSlider.value/ 100);
        })
    
        channel.addEventListener(Twitch.Embed.VIDEO_PLAY, function() {
            channel.setQuality('720p');
            channel.setMuted(true);
            channel.setVolume(volumeSlider.value / 100);
            channel.removeEventListener(Twitch.Embed.VIDEO_PLAY);
        })
    
        channels.push(channel);
        setChannelsGrid();

        addChannelInput.value = '';
        setDisabledProperties();
    }

    function generateUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function setChannelsGrid() {
        for(let cssClass of cssClasses) {
            if(cssClass.possibleSizes.includes(channels.length)) {
                channelsElement.className = cssClass.name;
            }
        }
    }

    addChannelInput.addEventListener('input', () => {
        setDisabledProperties();
    });

    soundSwitchInput.addEventListener('input', () => {
        setDisabledProperties();
    })

    volumeSlider.addEventListener('input', () => {
        for(let channel of channels) {
            channel.setVolume(volumeSlider.value / 100);
        }
    });

    pauseAllButton.onclick = () => {
        for(let channel of channels) {
            channel.pause();
        }
    }

    resumeAllButton.onclick = () => {
        for(let channel of channels) {
            channel.play();
        }
    }

    removeChannelButton.onclick = () => addDeleteOverlay();
    removeAllButton.onclick = () => removeAll();

    function addDeleteOverlay() {
        for(let channel of channelsElement.children) {

            let overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.onclick = () => removeChannel(channel.id);

            overlay.addEventListener('mouseover', () => {
                overlay.firstChild.innerText = 'delete_forever';
            })

            overlay.addEventListener('mouseleave', () => {
                overlay.firstChild.innerText = 'delete_outline';
            })

            let icon = document.createElement('i');
            icon.className = 'material-icons text-shadow';
            icon.style.fontSize = (cssClasses.findIndex(cssClass => cssClass.name == channelsElement.className) + 1) * 3 + 'vw';
            icon.innerText = 'delete_outline';
            icon.style.color = 'darkred';
            
            overlay.appendChild(icon);
            channel.appendChild(overlay, channel.firstChild);

            removeChannelButton.onclick = () => removeDeleteOverlay();
            removeChannelButton.innerHTML = "<i class='material-icons'>delete_outline</i>Cancel";
            removing = true;
            setDisabledProperties();
        }
    }

    function removeDeleteOverlay() {
        for(let channel of channelsElement.children) {
            channel.removeChild(channel.lastChild)
        }
        removeChannelButton.onclick = () => addDeleteOverlay();
        removeChannelButton.innerHTML = "<i class='material-icons'>delete_outline</i>Remove Channel";

        removing = false;
        setDisabledProperties();
    }

    function removeChannel(id) {
        channels.splice(channels.findIndex(channel => channel._target == document.getElementById(id)), 1);
        document.getElementById(id).remove();

        setChannelsGrid();
        removeDeleteOverlay();
        setDisabledProperties();

        resetSoundSwitchIteration();
    }

    function removeAll() {
        channels = [];
        channelsElement.replaceChildren();
        setDisabledProperties();
    }

    function setDisabledProperties() {
        addChannelButton.disabled = addChannelInput.value == '' || channels.length >= 9 || removing;

        removeChannelButton.disabled = channels.length <= 0;
        removeAllButton.disabled = channels.length <= 0 || removing;

        soundSwitchApply.disabled = soundSwitchInput.value == '' || channels.length < 2;
        soundSwitchClear.disabled = !soundSwitchActive;

        soundSwitchIteration = soundSwitchIteration % channels.length;

        if (channels.length < 2) {
            soundSwitchClear.click()
        }
    }

    soundSwitchApply.onclick = () => {
        clearInterval(soundSwitchInterval);

        for(let channel of channels) {
            channel.setMuted(true);
        }
        soundSwitchActive = true;

        soundSwitchIteration = 0;
        channels[soundSwitchIteration % channels.length].setMuted(false);
        soundSwitchIteration++;

        soundSwitchInterval = setInterval(() => {
            channels[(soundSwitchIteration - 1 + channels.length) % channels.length].setMuted(true);
            channels[soundSwitchIteration % channels.length].setMuted(false);
            soundSwitchIteration++;
        }, soundSwitchInput.value * 1000)

        setDisabledProperties();
    }

    function resetSoundSwitchIteration() {
        for(let channel of channels) {
            channel.setMuted(true);
        }
        soundSwitchIteration = 0;
    }

    soundSwitchClear.onclick = () => {
        soundSwitchActive = false
        setDisabledProperties();

        clearInterval(soundSwitchInterval);
        for(let channel of channels) {
            channel.setMuted(true);
        }
    }
}