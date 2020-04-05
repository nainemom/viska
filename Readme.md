<div align="center">
  <img src="https://raw.githubusercontent.com/nainemom/viska/dev/static/logo.png" height="200"/>
  <h1><b> Viska </b></h1>
  <p>An <b>Anonymous</b> Chat Service.</p>
  <br>
</div>

## Details

**Viska** (meaning `whisper` in swedish and `everything` in lithuanian) is an anonymous chat service created using nodejs/socket.io (backend) and webpack/vue (client).

## What Is It? How Is It Different Than Hazy?
Well, **Hazy** is a commenting service where users have their own space and ask others to answer their questions or polls anonymously. There is no thread for received comments and basicly the receiver can only look at the received data or just reply to them. But on the other hand, **Viska** is a chat service. The anonymous part still exists, but the receiver and the sender can chat with each other. Unlike **Hazy**, all the users are anonymous in **Viska** and there is no database to keep the conversations or the usernames.

## How Does the Authentication System Work?
Basicaly, all of the user accounts in the system are based on a hash. You'll send a string (manual passphrase or device id) to the server and get its hash string back. This hash will be your username and you can send and receive messages through it. If anyone wants to access your account, they should generate the same hash again which it's not possible easily.

## How Does the Conversation History Work?
This is a simple and useful feature created for **PID** accounts. As mentioned before, there is no database for keeping the conversations or user data. So every messages will be stored on your browser untill you manually logout.

## What's the Difference between DID and PID Accounts?
**DID** users are temporary and automatically generated. Each time you open the app, you will get a random id and in essence you are a ghost. **PID** id's will be generated based on your entered passphrase and you can have the same id by entering that same passphrase again. So **PID** is good for people who want to have a static address and share it with others for example on social networks and ask others to talk.

## Is My Activity Trackable?
In a one word, NO. But still you have to be carefull to be anonymous. So:
- don't share your personal information in any of your open chats.
- don't use your **PID** to send a dangerous message if you have shared it before.
- use the **DID** account if you don't sure what is this.

## How Can I Contribute?
First make sure you have `nodejs` >=11.0.0 and `npm` >=6.0.0 installed on your system, then clone this repo and do the following to run **Viska** locally:

```bash
npm i # to install dependencies

npm run dev:server # to start server locally on :3002 port
npm run dev:client # to start client locally on :8080 port
```

## Donation
If you like this project and want to help, You can send me BTC to the following address:
```
1DckVaVPkJQDBfga2Wd8moX9MbqUiurNoL
```