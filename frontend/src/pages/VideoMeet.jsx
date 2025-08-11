import React from 'react'
import styles from '../styles/videoComponent.module.css';
import { useRef, useState, useEffect} from 'react';
import { Badge, Button, IconButton, TextField} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import {useNavigate} from 'react-router';
import io from 'socket.io-client';
import server from '../environment';
const server_url = server;

var connections = {};

const peerConfigConnections = {
    'iceServers':[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video,setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages,setMessages] = useState([]);
    let [message,setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername,setAskForUsername] = useState(true);
    let [username,setUsername] = useState("");

    let routeTo = useNavigate();

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    const getPermission = async ()=> {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getPermission();
    },[])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track=>track.stop());
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}));
                })
                .catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach((track) => track.onended = () =>{
            setVideo(false)
            setAudio(false)

            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }catch(e){console.log(e)}

            //TODO BlackSilence
            let blackSilence = (...args) => new MediaStream([black(...args),silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
            for(let id in connections){
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit('signal',id, JSON.stringify({'sdp':connections[id].localDescription}))
                    }).catch(e=>console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0],{enabled : false});
    }

    let black = ({width = 640, height =480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"),{width,height});

        canvas.getContext('2d').fillRect(0,0, width,height);

        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0],{enabled:false});
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video:video,audio:audio})
            .then(getUserMediaSuccess)
            .then((stream)=>{})
            .catch(err => console.log(err))
        }else{
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (err) {
                console.log(err);
            }
        }
    }

    useEffect(()=>{
        if(video !== undefined && audio !== undefined){
            getUserMedia();
        }
    },[audio,video])

    // let gotMessageFromServer = (fromId, message) => {
    //     var signal = JSON.parse(message);

    //     if (fromId !== socketIdRef.current) {
    //         if (signal.sdp) {
    //             connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
    //                 // console.log('RTCSession : ',connections[fromId]);
    //                 if (signal.sdp.type === 'offer') {
    //                     connections[fromId].createAnswer().then((description) => {
    //                         connections[fromId].setLocalDescription(description).then(() => {
    //                             socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
    //                         }).catch(e => console.log(e))
    //                     }).catch(e => console.log(e))
    //                 }
    //             }).catch(e => console.log(e))
    //         }

    //         if (signal.ice) {
    //             connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
    //         }
    //     }
    // }

    let addMessage = (data,sender, socketIdSender) =>{
        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender:sender,data:data}
        ]);

        if(socketIdSender !== socketIdRef.current){
            setNewMessages((prevMsg) => prevMsg + 1);
        }
    }
    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url,{
            secure:false,
        });

        socketRef.current.on('signal',gotMessageFromServer);

        socketRef.current.on('connect',()=>{

            socketRef.current.emit('join-call',window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message',addMessage);
            socketRef.current.on('user-left',(id)=>{
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })
            socketRef.current.on('user-joined', (id, clients) => {
    console.log("User joined:", id, "Existing clients:", clients);

    if (id === socketIdRef.current) {
        // I am the new user
        clients.forEach((clientId) => {
            if (clientId === socketIdRef.current) return; // skip myself
            
            createPeerConnection(clientId, true); // true = create offer
        });
    } else {
        // I am an existing user, create peer connection but wait for their offer
        createPeerConnection(id, false); // false = wait for offer
    }
});


function addOrUpdateVideo(socketId, stream) {
    setVideos((prev) => {
        const exists = prev.some((v) => v.socketId === socketId);
        const updated = exists
            ? prev.map((v) => (v.socketId === socketId ? { ...v, stream } : v))
            : [...prev, { socketId, stream, autoPlay: true, playsinline: true }];
        videoRef.current = updated;
        return updated;
    });
}


        })
    }

    // helper to create and store a PC with handlers
function createPeerConnection(remoteId) {
  if (connections[remoteId]) return connections[remoteId];

  const pc = new RTCPeerConnection(peerConfigConnections);
  connections[remoteId] = pc;

  pc.onicecandidate = (ev) => {
    if (ev.candidate) {
      socketRef.current.emit('signal', remoteId, JSON.stringify({ ice: ev.candidate }));
    }
  };

  // Prefer ontrack + addTrack (modern)
  pc.ontrack = (ev) => {
    const stream = ev.streams && ev.streams[0];
    if (stream) {
      setVideos(prev => {
        const exists = prev.some(v => v.socketId === remoteId);
        const updated = exists
          ? prev.map(v => v.socketId === remoteId ? { ...v, stream } : v)
          : [...prev, { socketId: remoteId, stream, autoPlay: true, playsinline: true }];
        videoRef.current = updated;
        return updated;
      });
    }
  };

  // add local tracks (if available) so offer contains m-lines
  if (window.localStream) {
    window.localStream.getTracks().forEach(track => pc.addTrack(track, window.localStream));
  }

  return pc;
}
    // robust signal handler
let gotMessageFromServer = async (fromId, message) => {
  const signal = JSON.parse(message);
  if (fromId === socketIdRef.current) return; // ignore own signals

  const pc = createPeerConnection(fromId);

  try {
    if (signal.sdp) {
      const remoteDesc = new RTCSessionDescription(signal.sdp);
      console.log('[incoming sdp]', fromId, remoteDesc.type, 'pc state', pc.signalingState);

      // detect offer/answer collision
      const isOffer = remoteDesc.type === 'offer';
      const polite = socketIdRef.current > fromId; // deterministic "polite" decision

      if (isOffer) {
        const offerCollision = (pc.signalingState !== 'stable');
        if (offerCollision && !polite) {
          // impolite and in collision: ignore the incoming offer
          console.warn('Offer collision & I am impolite — ignoring incoming offer from', fromId);
          return;
        }
        if (offerCollision && polite) {
          // polite: rollback local pending state
          try {
            await pc.setLocalDescription({ type: 'rollback' });
          } catch (e) {
            console.warn('rollback failed (maybe unsupported)', e);
          }
        }

        // Accept the offer
        await pc.setRemoteDescription(remoteDesc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription }));
      } else if (remoteDesc.type === 'answer') {
        // Only set answer if we previously created an offer
        const haveLocalOffer = pc.signalingState === 'have-local-offer' ||
                               (pc.localDescription && pc.localDescription.type === 'offer');
        if (haveLocalOffer) {
          await pc.setRemoteDescription(remoteDesc);
        } else {
          console.warn('Received answer but no local offer present — ignoring', fromId);
        }
      }
    }

    if (signal.ice) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      } catch (err) {
        console.warn('addIceCandidate failed', err);
      }
    }
  } catch (err) {
    console.error('Error handling signal from', fromId, err);
  }
};
    let getMedia = () =>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo = () =>{
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.log(err);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit('signal',id,JSON.stringify({"sdp":connections[id].localDescription}))
                })
                .catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach((track) => track.onended = () =>{
            setScreen(false)

            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }catch(e){console.log(e)}

            //TODO BlackSilence
            let blackSilence = (...args) => new MediaStream([black(...args),silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
            
            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                .then(getDisplayMediaSuccess)
                .then((stream)=>{ })
                .catch(e => console.log(e))
            }
        }
    }
    useEffect(()=>{
        if(screen !== undefined){
            getDisplayMedia();
        }
    },[screen])

    let handleScreen = () =>{
        setScreen(!screen);
    }

    let sendMessage = () => {
        socketRef.current.emit('chat-message',message,username);
        setMessage("");
    }

    let handleEndCall = () =>{
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.map(track=>track.stop());
        }catch(e){
            console.log(e)
        }

        routeTo('/home')
    }

  return (
    <div>
        {askForUsername === true ?
        <div>
            <h2>Enter into Lobby</h2>
            <TextField id='outlined-basic' label='Username' value={username} onChange={e =>setUsername(e.target.value)} varient='outlined' />
            <Button varient="contained" onClick={connect}>Connect</Button>
            
            <div>
                <video ref={localVideoRef} autoPlay muted></video>
            </div>


        </div>:
        <div className={styles.meetVideoContainer}>

           {showModal? <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
                
            <h1>Chat</h1>

            <div className={styles.chattingDisplay}>
                {messages.length > 0? messages.map((item,idx)=>{
                    return(
                    <div style={{marginBottom:"20px"}} key={idx}>
                    <p style={{fontWeight:"bold"}}>{item.sender}</p>
                    <p>{item.data}</p>
                    </div>
                    )
                }) :<p>No messages found</p> }
            </div>

            <div className={styles.chattingArea}>
                <TextField value={message}  onChange={e => setMessage(e.target.value)} id='outlined-basic' varient='outlined' label='Enter your chat' />
                <Button variant='contained' onClick={sendMessage}>Send</Button>
            </div>
            </div>
            </div>:<></>}

            <div className={styles.buttonContianer}>

                <IconButton onClick={handleVideo} style={{color:"white"}}>
                    {(video == true)?<VideocamIcon />:<VideocamOffIcon />}
                </IconButton>
                <IconButton onClick={handleEndCall} style={{color:"red"}}>
                    <CallEndIcon />
                </IconButton>
                <IconButton onClick={handleAudio} style={{color:"white"}}>
                    {audio === true ? <MicIcon /> : <MicOffIcon />}
                </IconButton>

                {screenAvailable === true ?
                <IconButton onClick={handleScreen} style={{color:"white"}}>
                    {screen === true ? <ScreenShareIcon />:<StopScreenShareIcon />}
                </IconButton>:<></>}
                
                <Badge badgeContent={newMessages} max={999} color='secondary'>
                    <IconButton onClick={()=>{setModal(!showModal);}} style={{color:"white"}}>
                    <ChatIcon />
                </IconButton>
                </Badge>
            </div>

            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
            <div className='styles.conferenceView'>
            {videos.map((video)=>(
                <div key={video.socketId}>
                    {/* <h2>{video.socketId}</h2> */}
                    <video
                    
                    data-socket = {video.socketId}
                    ref={ref=>{
                        if(ref && video.stream){
                            ref.srcObject = video.stream;
                        }
                    }}
                    autoPlay
                    >

                    </video>
                </div>
            ))}
            </div>
        </div>}
    </div>
  )
}
