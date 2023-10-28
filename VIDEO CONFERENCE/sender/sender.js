// 🌐 Connect to the WebSocket server
const webSocket = new WebSocket("ws://SERVER-IP-HERE:3000");

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data));
}

// 🤖 Handle incoming signalling data
function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer);
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate);
    }
}

let username;

// 🚀 Send the username to the server
function sendUsername() {
    username = document.getElementById("username-input").value;
    sendData({
        type: "store_user"
    });
}

// 📡 Send data to the server
function sendData(data) {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;

// 📹 Start the video call
function startCall() {
    document.getElementById("video-call-div").style.display = "inline";

    // 🎥 Access the user's camera and microphone
    navigator.getUserMedia({
        video: {
            frameRate: 42,
            width: {
                min: 480,
                ideal: 1920,
                max: 1920
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream;
        document.getElementById("local-video").srcObject = localStream;

        // 🚀 Create a peer connection
        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration);
        peerConn.addStream(localStream);

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream;
        }

        // 📡 Send ICE candidate data
        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return;
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            });
        })

        // 🚀 Create and send an offer
        createAndSendOffer();
    }, (error) => {
        console.log(error);
    })
}

// 🚀 Create and send an offer
function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        });

        peerConn.setLocalDescription(offer);
    }, (error) => {
        console.log(error);
    })
}

let isAudio = true;

// 🔊 Toggle audio
function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;

// 📹 Toggle video
function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
}

// 🚫 End the video call
function endCall() {
    if (peerConn) {
        peerConn.close();
    }
    document.getElementById("video-call-div").style.display = "none";
}
