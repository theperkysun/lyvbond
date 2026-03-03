import {
    mediaDevices,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
} from "react-native-webrtc";
import InCallManager from 'react-native-incall-manager';
import SocketService from "./SocketService";

class WebrtcService {
    constructor() {
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isCaller = false;

        // STUN/TURN servers to allow connection through NATs/Firewalls
        this.configuration = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" }
            ],
        };
    }

    // 1. Start Local Stream (Camera/Mic)
    async startLocalStream(isVideo = true) {
        console.log("WebrtcService: startLocalStream called with isVideo =", isVideo);
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: isVideo ? {
                    width: 640,
                    height: 480,
                    frameRate: 30,
                    facingMode: "user"
                } : false,
            });
            console.log("WebrtcService: getUserMedia success", stream.id);
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error("WebrtcService: Error getting user media", error);
            throw error;
        }
    }

    // 2. Create Peer Connection
    createPeerConnection(onRemoteStream, receiverId) {
        try {
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Add local tracks to connection
            if (this.localStream) {
                this.localStream.getTracks().forEach((track) => {
                    this.peerConnection.addTrack(track, this.localStream);
                });
            }

            // Handle ICE Candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    if (receiverId) {
                        SocketService.emit("call:ice", { candidate: event.candidate, receiverId });
                    }
                }
            };

            // Handle Remote Stream
            this.peerConnection.ontrack = (event) => {
                // Note: 'streams' is an array, usually we take the first one
                if (event.streams && event.streams[0]) {
                    this.remoteStream = event.streams[0];
                    if (onRemoteStream) onRemoteStream(event.streams[0]);
                }
            };

            return this.peerConnection;
        } catch (e) {
            console.error("Create Peer Connection Error", e);
        }
    }

    // Helper for safe native calls
    _safeInCall(action) {
        try {
            action();
        } catch (err) {
            console.warn("InCallManager Error: Native module likely missing. Please rebuild the app (npx react-native run-android).", err);
        }
    }

    // 3. Initiate Call (Caller)
    async startCall(receiverId, callerDetails, isVideo = true) {
        this.isCaller = true;

        // Setup Audio Route
        this._safeInCall(() => {
            InCallManager.start({ media: isVideo ? 'video' : 'audio' });
            InCallManager.setForceSpeakerphoneOn(isVideo); // Video -> Speaker default
        });

        // Create Offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Send Request via Socket (triggers IncomingCallModal on receiver)
        console.log("Emitting call:request", { receiverId, ...callerDetails });
        SocketService.emit("call:request", {
            receiverId,
            callerId: callerDetails.callerId,
            name: callerDetails.name,
            profileImage: callerDetails.profileImage,
            type: isVideo ? 'video' : 'audio',
            offer
        });
    }

    // 4. Handle Incoming Offer (Receiver)
    async handleOffer(offer, callerId, onRemoteStream) {
        this.isCaller = false;

        // Determine type? Offer usually contains SDP with 'm=video'.
        // But we passed 'offer' object, check SDP.
        const isVideo = offer.sdp.includes('m=video');

        // Setup Audio Route
        this._safeInCall(() => {
            InCallManager.start({ media: isVideo ? 'video' : 'audio' });
            InCallManager.setForceSpeakerphoneOn(isVideo);
        });

        // Ensure PC exists if not already
        if (!this.peerConnection) {
            this.createPeerConnection(onRemoteStream, callerId);
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Create Answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send Answer
        SocketService.emit("call:answer", {
            answer,
            callerId // Send back to caller
        });
    }

    // 5. Handle Incoming Answer (Caller)
    async handleAnswer(answer) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    // 6. Handle Incoming ICE Candidate
    async handleIce(candidate) {
        if (this.peerConnection) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Error adding ICE", e);
            }
        }
    }

    // 7. Cleanup
    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }
        this.remoteStream = null;
        this._safeInCall(() => InCallManager.stop());
    }

    switchCamera() {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track._switchCamera();
            });
        }
    }

    setSpeaker(enable) {
        this._safeInCall(() => InCallManager.setForceSpeakerphoneOn(enable));
    }

    toggleAudio(enable) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enable;
                console.log(`Microphone ${enable ? 'enabled' : 'disabled'}`);
            });
        }
    }

    toggleVideo(enable) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enable;
                console.log(`Camera ${enable ? 'enabled' : 'disabled'}`);
            });
        }
    }
}

export default new WebrtcService();
