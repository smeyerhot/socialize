import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import {read} from '../../user/api-user.js'
import auth from '../../auth/auth-helper'
import {listByUser} from '../../post/api-post.js'

import './Chat.css';

let socket;

const Chat = ({ location, match }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [values, setValues] = useState({
    user: {following:[], followers:[]},
    redirectToSignin: false,
    following: false
  })
  const [posts, setPosts] = useState([])
  const ENDPOINT = 'http://localhost:3000/';
  const jwt = auth.isAuthenticated()


      
    useEffect(() => {
      const abortController = new AbortController()
      const signal = abortController.signal

      read({
        userId: match.params.userId
      }, {t: jwt.token}, signal).then((data) => {
        if (data && data.error) {
          setValues({...values, redirectToSignin: true})
        } else {
          setValues({...values, user: data})
  
        }
      })
      var ob = JSON.stringify(values.user)
      console.log(ob)
      setName('teo');
      setRoom('99')
      
      socket = io(ENDPOINT);
      socket.emit('join', { name, room }, (error) => {
        if(error) {
          alert(error);
        }
      });
    }, [ENDPOINT, match.params.userId, location.search]);
    
    useEffect(() => {
      socket.on('message', message => {
        setMessages(messages => [ ...messages, message ]);
      });
      
      socket.on("roomData", ({ users }) => {
        setUsers(users);
      });
  }, []);

    const sendMessage = (event) => {
      event.preventDefault();

      if(message) {
        socket.emit('sendMessage', message, () => setMessage(''));
      }
    }



    return (
      <div className="outerContainer">
        <div className="container">
            <InfoBar room={room} />
            <Messages messages={messages} name={name} />
            <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </div>
        <TextContainer users={users}/>
      </div>
    );
  }

  export default Chat;