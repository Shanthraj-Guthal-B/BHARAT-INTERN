// 🚫 End the video call
function endCall() {
    if (peerConn) {
        peerConn.close();
    }
    document.getElementById("video-call-div").style.display = "none";
}

// ... Your existing JavaScript code ...

// 📡 Send ICE candidate data
peerConn.onicecandidate = (e) => {
    if (e.candidate == null)
        return;
    
    sendData({
        type: "send_candidate",
        candidate: e.candidate
    });
}

// ... Continue with your existing code ...

// 🚀 Create and send an answer
function createAndSendAnswer() {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer);
        sendData({
            type: "send_answer",
            answer: answer
        });
    }, (error) => {
        console.log(error);
    });
}
