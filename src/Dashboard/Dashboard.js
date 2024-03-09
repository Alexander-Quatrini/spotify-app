import React, {useEffect, useState, useRef} from "react";
import { channels } from "../shared/constants";
import LibraryViewer from "../LibraryViewer/LibraryViewer";


function DashBoard(props){

    const [username, setUsername] = useState('default');
    const [currentlyPlaying, setCurrentlyPlaying] = useState('default')
    const [queue, setQueue] = useState([])
    const [currentlyPlayingStats, setCurrentlyPlayingStats] = useState('default')

    const time1 = 1

    const initialized = useRef(false);
    if(!initialized.current){
        initialized.current = true;
        getUserInfo();
    }

    useEffect(() => {
        
        setInterval(() => {
            getUserInfo();
        }, 30000);

        window.api.receive(channels.RECEIVE_CURRENTLY_PLAYING, (response) =>{
            setCurrentlyPlayingStats(response.progress_ms)
            console.log(response.progress_ms);
            
        });

        window.api.receive(channels.RECEIVE_USER, (response) =>{
            console.log(response);
            setUsername(response['display_name'])
        });
        
        window.api.receive(channels.RECEIVE_QUEUE, (response) =>{

            console.log(response);
            console.log(response.queue);
            setQueue(response.queue);
            if(response.currently_playing != null){
                setCurrentlyPlaying(response.currently_playing.name);
            }

        })

    }, []);
    
    return(
        <div>
            <h1>{currentlyPlaying}</h1>
            
            <p data-testid="username">{username}</p>
            <button onClick={getUserInfo}>Nicce</button>
            <ul className="list-group">{queue !== undefined && queue.length > 0 ? (queue.map((value) => {
                return (<li className="list-group-item">{value.name}</li>)
            })) : <li>Nothing in Queue!</li>}
            
            </ul>
            <LibraryViewer/>
            
            
        </div>
    )
}

function getUserInfo(){
    window.api.send(channels.CALL_API, {url: "/api/getuserinfo", method: "GET", isBody: false, channel: channels.RECEIVE_USER});
    window.api.send(channels.CALL_API, {url: "/api/getqueue", method: "GET", isBody: false, channel: channels.RECEIVE_QUEUE});
    window.api.send(channels.CALL_API, {url: "/api/getCurrentlyPlaying", method: "GET", isBody: false, channel: channels.RECEIVE_CURRENTLY_PLAYING});
}
export default DashBoard;