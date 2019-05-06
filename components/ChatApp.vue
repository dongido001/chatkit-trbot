<template>
    <div class="main">
      <Rooms @joinRoom="subscribeToRoom" :rooms="rooms"/>
      <div class="message-area">
        <div class="message-header"> 
          <div class="message-header-left"> Group Name </div>
          <div class="message-header-right"> Menu </div>
        </div>
        <Messages 
          :messages="[...messages]" 
          :currentUser="currentUser" 
        />
        <InputForm 
          @newMessage="addMessage"
          @joinedRoom="joinedRoom=true" 
          :activeRoom="activeRoom"
        />
      </div>
    </div>
</template>

<script>
import { ChatManager, TokenProvider } from '@pusher/chatkit-client'
import axios from 'axios'

import Messages from '@/components/Messages'
import InputForm from '@/components/InputForm'
import Rooms from '@/components/Rooms'

import '@/styles/ChatApp.css'

export default {
  name: 'app',
  components: {
    Messages,
    InputForm,
    Rooms
  },
  data() {
    return {
      messages: [],
      userId: 1,
      chatManager: null,
      currentUser: null,
      rooms: [],
      activeRoom: null,
      loggedUser: null
    }
  },
  created() {
    const tokenProvider = new TokenProvider({
      url: process.env.VUE_APP_CHATKIT_TOKEN_ENDPOINT
    });

    this.chatManager = new ChatManager({
      instanceLocator: process.env.VUE_APP_CHATKIT_INSTANCE_LOCATOR,
      userId: "dongido",
      tokenProvider: tokenProvider
    });

    this.chatManager
      .connect()
      .then( currentUser => {
        this.currentUser = currentUser
        console.log(currentUser)
        axios.get('http://localhost:3000/get_rooms')
          .then(data => {
            this.rooms = data.data.data
            console.log(data.data)
          })
      })
      .catch( error => {
        console.log(error)
      });
  },
  methods: {
    addMessage(message) {
      this.currentUser.sendSimpleMessage({
          roomId: this.activeRoom.id,
          text: message,
        })
        .then(messageId => {
          console.log(`Added message to ${this.activeRoom.name}`)
        })
        .catch(err => {
          console.log(`Error adding message to ${this.activeRoom.name}: ${err}`)
        })
    },
    subscribeToRoom(room) {
      this.messages = []
      this.currentUser
        .subscribeToRoomMultipart({
          roomId: room.id,
          hooks: {
            onMessage: message => {
              this.messages.push(message)
            }
          },
          messageLimit: 40
        })
      
      this.activeRoom = room
    }
  },
}
</script>