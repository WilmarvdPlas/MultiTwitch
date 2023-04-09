window.onload = () => {


    // Get all elements from the DOM.
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

    // Define grid structures.
    const cssClasses = [
        {name: 'threeByThree', possibleSizes: [7, 8, 9]},
        {name: 'threeByTwo', possibleSizes: [5, 6]},
        {name: 'twoByTwo', possibleSizes: [3, 4]},
        {name: 'oneByTwo', possibleSizes: [2]},
        {name: 'oneByOne', possibleSizes: [1]}
    ];

    // Define important variables.
    var channels = [];

    var removingChannel = false;
    var soundSwitchActive = false;
    var soundSwitchIteration = 0;

    var soundSwitchInterval;

    // Add click and event listeners to buttons and inputs.
    addChannelButton.onclick = () => addChannel(addChannelInput.value);
    removeChannelButton.onclick = () => addDeleteOverlay();
    removeAllButton.onclick = () => removeAll();
    soundSwitchClear.onclick = () => clearSoundSwitch();
    soundSwitchApply.onclick = () => applySoundSwitch();

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


    // Define all the methods used by the click and event listeners.
    function addChannel(channelName) {
        const embedId = generateUUID();
        const channelElement = createChannelsElement(embedId);
        
        channelsElement.appendChild(channelElement);
    
        const channel = createTwitchEmbed(embedId, channelName);
    
        addVideoReadyEventListener(channel);
        addVideoPlayEventListener(channel);
    
        channels.push(channel);
        setChannelsGrid();

        addChannelInput.value = '';
        setDisabledProperties();
    }

    function addVideoReadyEventListener(channel) {
        channel.addEventListener(Twitch.Embed.VIDEO_READY, function() {
            channel.setQuality('720p');
            channel.setMuted(true);
            channel.setVolume(volumeSlider.value/ 100);
        })
    }

    function addVideoPlayEventListener(channel) {
        channel.addEventListener(Twitch.Embed.VIDEO_PLAY, function() {
            channel.setQuality('720p');
            channel.setMuted(true);
            channel.setVolume(volumeSlider.value / 100);
            channel.removeEventListener(Twitch.Embed.VIDEO_PLAY);
        })
    }

    function createChannelsElement(embedId) {
        let channelElement = document.createElement('div');
        
        channelElement.id = embedId;
        channelElement.className = 'channel';

        return channelElement;
    }

    function createTwitchEmbed(embedId, channelName) {
        return new Twitch.Embed(embedId, {
            channel: channelName,
            layout: 'video',
            muted: true
        });
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

    function addDeleteOverlay() {
        for(let channel of channelsElement.children) {

            const overlay = createDeleteOverlay(channel.id);

            addHoverEffect(overlay);

            const icon = createIcon();
            
            overlay.appendChild(icon);
            channel.appendChild(overlay, channel.firstChild);
        }

        removeChannelButton.onclick = () => removeDeleteOverlay();
        removeChannelButton.innerHTML = "<i class='material-icons'>delete_outline</i>Cancel";
        removingChannel = true;
        setDisabledProperties();
    }

    function createIcon() {
        const icon = document.createElement('i');
        icon.className = 'material-icons text-shadow';
        icon.style.fontSize = (cssClasses.findIndex(cssClass => cssClass.name == channelsElement.className) + 1) * 3 + 'vw';
        icon.innerText = 'delete_outline';
        icon.style.color = 'darkred';

        return icon;
    }

    function createDeleteOverlay(channelId) {
        const overlay = document.createElement('div');

        overlay.className = 'overlay';
        overlay.onclick = () => removeChannel(channelId);

        return overlay;
    }

    function addHoverEffect(overlay) {
        overlay.addEventListener('mouseover', () => {
            overlay.firstChild.innerText = 'delete_forever';
        })

        overlay.addEventListener('mouseleave', () => {
            overlay.firstChild.innerText = 'delete_outline';
        })
    }

    function removeDeleteOverlay() {
        for(let channel of channelsElement.children) {
            channel.removeChild(channel.lastChild)
        }
        removeChannelButton.onclick = () => addDeleteOverlay();
        removeChannelButton.innerHTML = "<i class='material-icons'>delete_outline</i>Remove Channel";

        removingChannel = false;
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
        addChannelButton.disabled = addChannelInput.value == '' || channels.length >= 9 || removingChannel;

        removeChannelButton.disabled = channels.length <= 0;
        removeAllButton.disabled = channels.length <= 0 || removingChannel;

        soundSwitchApply.disabled = soundSwitchInput.value == '' || channels.length < 2;
        soundSwitchClear.disabled = !soundSwitchActive;

        soundSwitchIteration = soundSwitchIteration % channels.length;

        if (channels.length < 2) {
            soundSwitchClear.click()
        }
    }

    function resetSoundSwitchIteration() {
        for(let channel of channels) {
            channel.setMuted(true);
        }
        soundSwitchIteration = 0;
    }

    function applySoundSwitch() {
        clearInterval(soundSwitchInterval);
        resetSoundSwitchIteration();

        channels[soundSwitchIteration % channels.length].setMuted(false);
        soundSwitchIteration++;

        soundSwitchInterval = setInterval(() => {
            channels[(soundSwitchIteration - 1 + channels.length) % channels.length].setMuted(true);
            channels[soundSwitchIteration % channels.length].setMuted(false);
            soundSwitchIteration++;
        }, soundSwitchInput.value * 1000)

        soundSwitchActive = true;
        setDisabledProperties();
    }

    function clearSoundSwitch() {
        soundSwitchActive = false
        setDisabledProperties();

        clearInterval(soundSwitchInterval);
        for(let channel of channels) {
            channel.setMuted(true);
        }
    }
}