import React, {useEffect, useState, useRef} from "react";
import { channels } from "../shared/constants";


function DashBoard(props){

    const [username, setUsername] = useState('default');
    const [currentlyPlaying, setCurrentlyPlaying] = useState('default')
    const [queue, setQueue] = useState([])

    const initialized = useRef(false);
    if(!initialized.current){
        initialized.current = true;
        getUserInfo();
    }

    useEffect(() => {
        
        window.api.receive(channels.RECEIVE_USER, (response) =>{
            console.log(response);
            setUsername(response['display_name'])
        });
        
        window.api.receive(channels.RECEIVE_QUEUE, (response) =>{

            console.log(response);
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
            <button onClick={getUserInfo}>Nice</button>
            <ul>{queue !== undefined && queue.length > 0 ? (queue.map((value) => {
                return (<li>{value.name}</li>)
            })) : <li>Nothing in Queue!</li>}
            
            </ul>
        </div>
    )
}

function getUserInfo(){
    window.api.send(channels.CALL_API, {url: "/api/getuserinfo", method: "GET", isBody: false, channel: channels.RECEIVE_USER});
    window.api.send(channels.CALL_API, {url: "/api/getqueue", method: "GET", isBody: false, channel: channels.RECEIVE_QUEUE});
}
export default DashBoard;