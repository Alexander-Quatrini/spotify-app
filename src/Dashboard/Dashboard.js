import React, {useEffect, useState} from "react";
import { channels } from "../shared/constants";

function DashBoard(props){

    const [username, setUsername] = useState('default');

    if(username == 'default') {
        getUserInfo();
    }
    useEffect(() => {
        
        window.api.receive(channels.RECEIVE_USER, (response) =>{
            console.log(response);
            setUsername(response['display_name'])
        });
        
        window.api.receive(channels.RECEIVE_QUEUE, (response) =>{
            console.log(response);
        })

    });
    
    return(<p data-testid="username">{username}</p>)
}

function getUserInfo(){
    window.api.send(channels.CALL_API, {url: "/api/getuserinfo", method: "GET", isBody: false, channel: channels.RECEIVE_USER});
    window.api.send(channels.CALL_API, {url: "/api/getqueue", method: "GET", isBody: false, channel: channels.RECEIVE_QUEUE});
}
export default DashBoard;