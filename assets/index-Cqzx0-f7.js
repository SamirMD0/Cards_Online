var mo=Object.defineProperty;var uo=(e,r,o)=>r in e?mo(e,r,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[r]=o;var Zt=(e,r,o)=>uo(e,typeof r!="symbol"?r+"":r,o);import{r as y,a as ho,N as yr,u as Ge,L as ue,R as Ie,b as fo,c as po,B as xo,d as go,e as ke}from"./react-vendor-CTzny-s9.js";import{l as bo}from"./socket-TjCxX7sJ.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function o(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=o(n);fetch(n.href,a)}})();var kr={exports:{}},ft={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var vo=y,wo=Symbol.for("react.element"),yo=Symbol.for("react.fragment"),ko=Object.prototype.hasOwnProperty,jo=vo.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,No={key:!0,ref:!0,__self:!0,__source:!0};function jr(e,r,o){var s,n={},a=null,i=null;o!==void 0&&(a=""+o),r.key!==void 0&&(a=""+r.key),r.ref!==void 0&&(i=r.ref);for(s in r)ko.call(r,s)&&!No.hasOwnProperty(s)&&(n[s]=r[s]);if(e&&e.defaultProps)for(s in r=e.defaultProps,r)n[s]===void 0&&(n[s]=r[s]);return{$$typeof:wo,type:e,key:a,ref:i,props:n,_owner:jo.current}}ft.Fragment=yo;ft.jsx=jr;ft.jsxs=jr;kr.exports=ft;var t=kr.exports,$t={},Qt=ho;$t.createRoot=Qt.createRoot,$t.hydrateRoot=Qt.hydrateRoot;const Co="http://localhost:3001";class So{constructor(){Zt(this,"socket");this.socket=bo(Co,{autoConnect:!1,reconnection:!0,reconnectionAttempts:5,reconnectionDelay:1e3,auth:r=>{const o=localStorage.getItem("token");r({token:o})}}),this.setupListeners()}setupListeners(){this.socket.on("connect",()=>{console.log("✅ Connected to server:",this.socket.id)}),this.socket.on("disconnect",()=>{console.log("❌ Disconnected from server")}),this.socket.on("connect_error",r=>{console.error("Connection error:",r)})}connect(){this.socket.connected||this.socket.connect()}disconnect(){this.socket.connected&&this.socket.disconnect()}reconnect(){console.log("[Socket] Reconnecting with new token..."),this.socket.disconnect(),this.socket.auth=r=>{const o=localStorage.getItem("token");r({token:o})},this.socket.connect()}getRooms(){this.socket.emit("get_rooms")}createRoom(r,o){this.socket.emit("create_room",{roomName:r,maxPlayers:o})}joinRoom(r,o){this.socket.emit("join_room",{roomId:r,playerName:o})}leaveRoom(){this.socket.emit("leave_room")}startGame(){this.socket.emit("start_game")}playCard(r,o){this.socket.emit("play_card",{cardId:r,chosenColor:o})}drawCard(){this.socket.emit("draw_card")}addBot(){this.socket.emit("add_bot")}onRoomsList(r){this.socket.on("rooms_list",r)}onRoomCreated(r){this.socket.on("room_created",r)}onJoinedRoom(r){this.socket.on("joined_room",r)}onGameState(r){this.socket.on("game_state",r)}onGameStarted(r){this.socket.on("game_started",r)}onHandUpdate(r){this.socket.on("hand_update",r)}onCardPlayed(r){this.socket.on("card_played",r)}onCardDrawn(r){this.socket.on("card_drawn",r)}onGameOver(r){this.socket.on("game_over",r)}onPlayerJoined(r){this.socket.on("player_joined",r)}onPlayerLeft(r){this.socket.on("player_left",r)}onError(r){this.socket.on("error",r)}off(r,o){this.socket.off(r,o)}checkReconnection(){this.socket.emit("check_reconnection")}onReconnectionResult(r){this.socket.on("reconnection_result",r)}onGameRestored(r){this.socket.on("game_restored",r)}onPlayerReconnected(r){this.socket.on("player_reconnected",r)}onReconnectionFailed(r){this.socket.on("reconnection_failed",r)}checkRoomExists(r){this.socket.emit("check_room_exists",{roomId:r})}onRoomExists(r){this.socket.on("room_exists",r)}reconnectToGame(r){console.log("[Socket] Emitting reconnect_to_game for",r),this.socket.emit("reconnect_to_game",{roomId:r})}}const h=new So;h.socket;const Nr=y.createContext(null),Ze="http://localhost:3001";function Ro({children:e}){const[r,o]=y.useState(null),[s,n]=y.useState(!0);y.useEffect(()=>{a()},[]);async function a(){try{const d=await fetch(`${Ze}/api/auth/me`,{credentials:"include"});if(d.ok){const u=await d.json();o(u.user)}}catch(d){console.error("Auth check failed:",d)}finally{n(!1)}}async function i(d,u,m){const x=await fetch(`${Ze}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({username:d,email:u,password:m})});if(!x.ok){const R=await x.json();throw new Error(R.error||"Registration failed")}const b=await x.json();o(b.user),localStorage.setItem("token",b.token),h.reconnect()}async function c(d,u){const m=await fetch(`${Ze}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({usernameOrEmail:d,password:u})});if(!m.ok){const b=await m.json();throw new Error(b.error||"Login failed")}const x=await m.json();o(x.user),localStorage.setItem("token",x.token),h.reconnect()}async function l(){try{await fetch(`${Ze}/api/auth/logout`,{method:"POST",credentials:"include"})}catch(d){console.error("Logout error:",d)}o(null),localStorage.removeItem("token"),h.disconnect()}return t.jsx(Nr.Provider,{value:{user:r,loading:s,login:c,register:i,logout:l},children:e})}function De(){const e=y.useContext(Nr);if(!e)throw new Error("useAuth must be used within AuthProvider");return e}function Qe({children:e}){const{user:r,loading:o}=De();return o?t.jsx("div",{className:"min-h-screen bg-dark-900 flex items-center justify-center",children:t.jsxs("div",{className:"text-center",children:[t.jsx("div",{className:"text-6xl mb-4 animate-bounce",children:"🎮"}),t.jsx("p",{className:"text-xl text-gray-400",children:"Loading..."})]})}):r?t.jsx(t.Fragment,{children:e}):t.jsx(yr,{to:"/login",replace:!0})}function he(){const{user:e,logout:r}=De(),o=Ge(),[s,n]=y.useState(!1),a=async()=>{await r(),o("/login"),n(!1)};return t.jsx("nav",{className:"fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700",children:t.jsxs("div",{className:"max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4",children:[t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsx(ue,{to:"/",className:"flex items-center space-x-2 group",children:t.jsxs("div",{className:"relative",children:[t.jsx("span",{className:"text-xl sm:text-2xl md:text-3xl font-poppins font-extrabold text-white",children:"Cards Online"}),t.jsx("div",{className:"absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-uno-red via-uno-blue to-uno-green rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"})]})}),t.jsx("div",{className:"hidden md:flex items-center space-x-6",children:e?t.jsxs(t.Fragment,{children:[t.jsx(ue,{to:"/lobby",className:"text-gray-300 hover:text-white font-medium transition-colors",children:"Lobby"}),t.jsx(ue,{to:"/friends",className:"text-gray-300 hover:text-white font-medium transition-colors",children:"Friends"}),t.jsxs("span",{className:"text-gray-300 font-medium",children:["👤 ",e.username]}),t.jsx("button",{onClick:a,className:"px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200",children:"Logout"})]}):t.jsxs(t.Fragment,{children:[t.jsx(ue,{to:"/login",className:"text-gray-300 hover:text-white font-medium transition-colors",children:"Login"}),t.jsx(ue,{to:"/register",className:"px-6 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300",children:"Sign Up"})]})}),t.jsx("button",{onClick:()=>n(!s),className:"md:hidden p-2 text-gray-300 hover:text-white","aria-label":"Toggle menu",children:t.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:s?t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"}):t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 6h16M4 12h16M4 18h16"})})})]}),s&&t.jsx("div",{className:"md:hidden mt-4 pb-4 space-y-3 border-t border-dark-700 pt-4",children:e?t.jsxs(t.Fragment,{children:[t.jsx(ue,{to:"/lobby",onClick:()=>n(!1),className:"block text-gray-300 hover:text-white font-medium transition-colors",children:"Lobby"}),t.jsx(ue,{to:"/friends",onClick:()=>n(!1),className:"block text-gray-300 hover:text-white font-medium transition-colors",children:"Friends"}),t.jsxs("div",{className:"text-gray-300 font-medium",children:["👤 ",e.username]}),t.jsx("button",{onClick:a,className:"w-full px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200",children:"Logout"})]}):t.jsxs(t.Fragment,{children:[t.jsx(ue,{to:"/login",onClick:()=>n(!1),className:"block text-gray-300 hover:text-white font-medium transition-colors",children:"Login"}),t.jsx(ue,{to:"/register",onClick:()=>n(!1),className:"block px-4 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300 text-center",children:"Sign Up"})]})})]})})}function $o(){const e=Ge(),{login:r}=De(),[o,s]=y.useState(""),[n,a]=y.useState(""),[i,c]=y.useState(""),[l,d]=y.useState(!1),u=async m=>{m.preventDefault(),c(""),d(!0);try{await r(o,n),e("/lobby")}catch(x){c(x.message||"Login failed")}finally{d(!1)}};return t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"flex items-center justify-center min-h-screen px-4 pt-20",children:t.jsx("div",{className:"w-full max-w-md",children:t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 shadow-2xl",children:[t.jsxs("div",{className:"text-center mb-8",children:[t.jsx("h1",{className:"text-4xl font-poppins font-extrabold text-white mb-2",children:"Welcome Back!"}),t.jsx("p",{className:"text-gray-400",children:"Login to play UNO with friends"})]}),i&&t.jsx("div",{className:"mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg",children:t.jsx("p",{className:"text-red-400 text-sm",children:i})}),t.jsxs("form",{onSubmit:u,className:"space-y-6",children:[t.jsxs("div",{children:[t.jsx("label",{htmlFor:"usernameOrEmail",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Username or Email"}),t.jsx("input",{id:"usernameOrEmail",type:"text",value:o,onChange:m=>s(m.target.value),placeholder:"Enter username or email",className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0})]}),t.jsxs("div",{children:[t.jsx("label",{htmlFor:"password",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Password"}),t.jsx("input",{id:"password",type:"password",value:n,onChange:m=>a(m.target.value),placeholder:"Enter password",className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0})]}),t.jsx("button",{type:"submit",disabled:l,className:"w-full py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",children:l?"Logging in...":"Login"})]}),t.jsx("div",{className:"mt-6 text-center",children:t.jsxs("p",{className:"text-gray-400",children:["Don't have an account?"," ",t.jsx(ue,{to:"/register",className:"text-uno-blue hover:text-uno-green font-semibold transition-colors",children:"Register here"})]})})]})})})]})}function zo(){const e=Ge(),{register:r}=De(),[o,s]=y.useState(""),[n,a]=y.useState(""),[i,c]=y.useState(""),[l,d]=y.useState(""),[u,m]=y.useState(""),[x,b]=y.useState(!1),[R,$]=y.useState(""),S=C=>{if(C.length<12)return"Too short";const z=[/[A-Z]/.test(C),/[a-z]/.test(C),/[0-9]/.test(C),/[^A-Za-z0-9]/.test(C)].filter(Boolean).length;return z>=4?"Strong":z>=3?"Good":"Weak"},P=async C=>{if(C.preventDefault(),m(""),i!==l){m("Passwords do not match");return}if(i.length<8){m("Password must be at least 8 characters");return}b(!0);try{await r(o,n,i),e("/lobby")}catch(z){m(z.message||"Registration failed")}finally{b(!1)}};return t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"flex items-center justify-center min-h-screen px-4 pt-20",children:t.jsx("div",{className:"w-full max-w-md",children:t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 shadow-2xl",children:[t.jsxs("div",{className:"text-center mb-8",children:[t.jsx("h1",{className:"text-4xl font-poppins font-extrabold text-white mb-2",children:"Create Account"}),t.jsx("p",{className:"text-gray-400",children:"Join the UNO community!"})]}),u&&t.jsx("div",{className:"mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg",children:t.jsx("p",{className:"text-red-400 text-sm",children:u})}),t.jsxs("form",{onSubmit:P,className:"space-y-5",children:[t.jsxs("div",{children:[t.jsx("label",{htmlFor:"username",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Username"}),t.jsx("input",{id:"username",type:"text",value:o,onChange:C=>s(C.target.value),placeholder:"Choose a username",minLength:3,maxLength:20,pattern:"[a-zA-Z0-9_-]+",title:"Only letters, numbers, - and _ allowed",className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0}),t.jsx("p",{className:"mt-1 text-xs text-gray-500",children:"3-20 characters, letters, numbers, - and _ only"})]}),t.jsxs("div",{children:[t.jsx("label",{htmlFor:"email",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Email"}),t.jsx("input",{id:"email",type:"email",value:n,onChange:C=>a(C.target.value),placeholder:"your@email.com",className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0})]}),t.jsxs("div",{children:[t.jsx("label",{htmlFor:"password",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Password"}),t.jsx("input",{id:"password",type:"password",value:i,placeholder:"At least 12 characters",minLength:12,onChange:C=>{c(C.target.value),$(S(C.target.value))},className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0}),i&&t.jsxs("p",{className:`text-xs mt-1 ${R==="Strong"?"text-green-400":R==="Good"?"text-yellow-400":"text-red-400"}`,children:["Strength: ",R]})]}),t.jsxs("div",{children:[t.jsx("label",{htmlFor:"confirmPassword",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Confirm Password"}),t.jsx("input",{id:"confirmPassword",type:"password",value:l,onChange:C=>d(C.target.value),placeholder:"Re-enter password",className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors",required:!0})]}),t.jsx("button",{type:"submit",disabled:x,className:"w-full py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",children:x?"Creating Account...":"Create Account"})]}),t.jsx("div",{className:"mt-6 text-center",children:t.jsxs("p",{className:"text-gray-400",children:["Already have an account?"," ",t.jsx(ue,{to:"/login",className:"text-uno-blue hover:text-uno-green font-semibold transition-colors",children:"Login here"})]})})]})})})]})}function Ao({className:e=""}){const r=Ge();return t.jsxs("button",{onClick:()=>r("/lobby"),className:`
        relative group
        px-16 py-6 
        text-4xl font-poppins font-extrabold text-white
        bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green
        rounded-2xl
        transform transition-all duration-300
        hover:scale-110 hover:-translate-y-2
        animate-pulse-glow
        shadow-2xl
        ${e}
      `,style:{boxShadow:`
          0 0 40px rgba(229, 62, 62, 0.5),
          0 0 80px rgba(214, 158, 46, 0.3),
          0 20px 40px rgba(0, 0, 0, 0.5)
        `},children:[t.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"}),t.jsx("span",{className:"relative z-10 drop-shadow-2xl",children:"PLAY NOW"}),t.jsx("div",{className:"absolute inset-0 rounded-2xl border-4 border-white/30 group-hover:border-white/60 transition-all duration-300"}),t.jsx("div",{className:"absolute inset-0 rounded-2xl overflow-hidden",children:t.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"})}),t.jsx("div",{className:"absolute inset-0 rounded-2xl animate-glow"})]})}function _o(){return t.jsxs("div",{className:"relative min-h-screen overflow-hidden",children:[t.jsxs("div",{className:"fixed inset-0 z-0",children:[t.jsx("div",{className:"absolute inset-0 bg-gradient-radial from-dark-800 via-dark-900 to-black"}),t.jsx("div",{className:"absolute inset-0",style:{background:"radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)"}}),t.jsx("div",{className:"absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96",style:{background:"radial-gradient(ellipse at center, rgba(255, 220, 100, 0.3) 0%, transparent 70%)",filter:"blur(60px)"}}),t.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] shadow-lamp opacity-50"})]}),t.jsx(he,{}),t.jsxs("div",{className:"relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20",children:[t.jsxs("div",{className:"text-center mb-12 animate-float",children:[t.jsx("h1",{className:"text-7xl md:text-8xl font-poppins font-extrabold text-white mb-4",children:t.jsx("span",{className:"bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green bg-clip-text text-transparent",children:"CARDS"})}),t.jsx("p",{className:"text-xl md:text-2xl text-gray-300 font-inter",children:"The Classic Card Game, Reimagined"})]}),t.jsx(Ao,{}),t.jsxs("div",{className:"mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl",children:[t.jsxs("div",{className:"text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700",children:[t.jsx("div",{className:"text-4xl mb-3",children:"🎮"}),t.jsx("h3",{className:"text-xl font-poppins font-bold text-white mb-2",children:"Real-time Multiplayer"}),t.jsx("p",{className:"text-gray-400",children:"Play with friends in real-time with smooth gameplay"})]}),t.jsxs("div",{className:"text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700",children:[t.jsx("div",{className:"text-4xl mb-3",children:"🤖"}),t.jsx("h3",{className:"text-xl font-poppins font-bold text-white mb-2",children:"AI Opponents"}),t.jsx("p",{className:"text-gray-400",children:"Practice against smart bots or fill empty slots"})]}),t.jsxs("div",{className:"text-center p-6 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700",children:[t.jsx("div",{className:"text-4xl mb-3",children:"🎯"}),t.jsx("h3",{className:"text-xl font-poppins font-bold text-white mb-2",children:"Classic Rules"}),t.jsx("p",{className:"text-gray-400",children:"All the cards and rules you know and love"})]})]})]})]})}function Cr(e){var r,o,s="";if(typeof e=="string"||typeof e=="number")s+=e;else if(typeof e=="object")if(Array.isArray(e)){var n=e.length;for(r=0;r<n;r++)e[r]&&(o=Cr(e[r]))&&(s&&(s+=" "),s+=o)}else for(o in e)e[o]&&(s&&(s+=" "),s+=o);return s}function Po(){for(var e,r,o=0,s="",n=arguments.length;o<n;o++)(e=arguments[o])&&(r=Cr(e))&&(s&&(s+=" "),s+=r);return s}const Lo=(e,r)=>{const o=new Array(e.length+r.length);for(let s=0;s<e.length;s++)o[s]=e[s];for(let s=0;s<r.length;s++)o[e.length+s]=r[s];return o},Io=(e,r)=>({classGroupId:e,validator:r}),Sr=(e=new Map,r=null,o)=>({nextPart:e,validators:r,classGroupId:o}),ct="-",er=[],Eo="arbitrary..",Oo=e=>{const r=Fo(e),{conflictingClassGroups:o,conflictingClassGroupModifiers:s}=e;return{getClassGroupId:i=>{if(i.startsWith("[")&&i.endsWith("]"))return Mo(i);const c=i.split(ct),l=c[0]===""&&c.length>1?1:0;return Rr(c,l,r)},getConflictingClassGroupIds:(i,c)=>{if(c){const l=s[i],d=o[i];return l?d?Lo(d,l):l:d||er}return o[i]||er}}},Rr=(e,r,o)=>{if(e.length-r===0)return o.classGroupId;const n=e[r],a=o.nextPart.get(n);if(a){const d=Rr(e,r+1,a);if(d)return d}const i=o.validators;if(i===null)return;const c=r===0?e.join(ct):e.slice(r).join(ct),l=i.length;for(let d=0;d<l;d++){const u=i[d];if(u.validator(c))return u.classGroupId}},Mo=e=>e.slice(1,-1).indexOf(":")===-1?void 0:(()=>{const r=e.slice(1,-1),o=r.indexOf(":"),s=r.slice(0,o);return s?Eo+s:void 0})(),Fo=e=>{const{theme:r,classGroups:o}=e;return To(o,r)},To=(e,r)=>{const o=Sr();for(const s in e){const n=e[s];Mt(n,o,s,r)}return o},Mt=(e,r,o,s)=>{const n=e.length;for(let a=0;a<n;a++){const i=e[a];Go(i,r,o,s)}},Go=(e,r,o,s)=>{if(typeof e=="string"){Do(e,r,o);return}if(typeof e=="function"){Bo(e,r,o,s);return}Wo(e,r,o,s)},Do=(e,r,o)=>{const s=e===""?r:$r(r,e);s.classGroupId=o},Bo=(e,r,o,s)=>{if(Uo(e)){Mt(e(s),r,o,s);return}r.validators===null&&(r.validators=[]),r.validators.push(Io(o,e))},Wo=(e,r,o,s)=>{const n=Object.entries(e),a=n.length;for(let i=0;i<a;i++){const[c,l]=n[i];Mt(l,$r(r,c),o,s)}},$r=(e,r)=>{let o=e;const s=r.split(ct),n=s.length;for(let a=0;a<n;a++){const i=s[a];let c=o.nextPart.get(i);c||(c=Sr(),o.nextPart.set(i,c)),o=c}return o},Uo=e=>"isThemeGetter"in e&&e.isThemeGetter===!0,qo=e=>{if(e<1)return{get:()=>{},set:()=>{}};let r=0,o=Object.create(null),s=Object.create(null);const n=(a,i)=>{o[a]=i,r++,r>e&&(r=0,s=o,o=Object.create(null))};return{get(a){let i=o[a];if(i!==void 0)return i;if((i=s[a])!==void 0)return n(a,i),i},set(a,i){a in o?o[a]=i:n(a,i)}}},zt="!",tr=":",Yo=[],rr=(e,r,o,s,n)=>({modifiers:e,hasImportantModifier:r,baseClassName:o,maybePostfixModifierPosition:s,isExternal:n}),Ho=e=>{const{prefix:r,experimentalParseClassName:o}=e;let s=n=>{const a=[];let i=0,c=0,l=0,d;const u=n.length;for(let $=0;$<u;$++){const S=n[$];if(i===0&&c===0){if(S===tr){a.push(n.slice(l,$)),l=$+1;continue}if(S==="/"){d=$;continue}}S==="["?i++:S==="]"?i--:S==="("?c++:S===")"&&c--}const m=a.length===0?n:n.slice(l);let x=m,b=!1;m.endsWith(zt)?(x=m.slice(0,-1),b=!0):m.startsWith(zt)&&(x=m.slice(1),b=!0);const R=d&&d>l?d-l:void 0;return rr(a,b,x,R)};if(r){const n=r+tr,a=s;s=i=>i.startsWith(n)?a(i.slice(n.length)):rr(Yo,!1,i,void 0,!0)}if(o){const n=s;s=a=>o({className:a,parseClassName:n})}return s},Vo=e=>{const r=new Map;return e.orderSensitiveModifiers.forEach((o,s)=>{r.set(o,1e6+s)}),o=>{const s=[];let n=[];for(let a=0;a<o.length;a++){const i=o[a],c=i[0]==="[",l=r.has(i);c||l?(n.length>0&&(n.sort(),s.push(...n),n=[]),s.push(i)):n.push(i)}return n.length>0&&(n.sort(),s.push(...n)),s}},Jo=e=>({cache:qo(e.cacheSize),parseClassName:Ho(e),sortModifiers:Vo(e),...Oo(e)}),Xo=/\s+/,Ko=(e,r)=>{const{parseClassName:o,getClassGroupId:s,getConflictingClassGroupIds:n,sortModifiers:a}=r,i=[],c=e.trim().split(Xo);let l="";for(let d=c.length-1;d>=0;d-=1){const u=c[d],{isExternal:m,modifiers:x,hasImportantModifier:b,baseClassName:R,maybePostfixModifierPosition:$}=o(u);if(m){l=u+(l.length>0?" "+l:l);continue}let S=!!$,P=s(S?R.substring(0,$):R);if(!P){if(!S){l=u+(l.length>0?" "+l:l);continue}if(P=s(R),!P){l=u+(l.length>0?" "+l:l);continue}S=!1}const C=x.length===0?"":x.length===1?x[0]:a(x).join(":"),z=b?C+zt:C,I=z+P;if(i.indexOf(I)>-1)continue;i.push(I);const g=n(P,S);for(let v=0;v<g.length;++v){const N=g[v];i.push(z+N)}l=u+(l.length>0?" "+l:l)}return l},Zo=(...e)=>{let r=0,o,s,n="";for(;r<e.length;)(o=e[r++])&&(s=zr(o))&&(n&&(n+=" "),n+=s);return n},zr=e=>{if(typeof e=="string")return e;let r,o="";for(let s=0;s<e.length;s++)e[s]&&(r=zr(e[s]))&&(o&&(o+=" "),o+=r);return o},Qo=(e,...r)=>{let o,s,n,a;const i=l=>{const d=r.reduce((u,m)=>m(u),e());return o=Jo(d),s=o.cache.get,n=o.cache.set,a=c,c(l)},c=l=>{const d=s(l);if(d)return d;const u=Ko(l,o);return n(l,u),u};return a=i,(...l)=>a(Zo(...l))},es=[],Y=e=>{const r=o=>o[e]||es;return r.isThemeGetter=!0,r},Ar=/^\[(?:(\w[\w-]*):)?(.+)\]$/i,_r=/^\((?:(\w[\w-]*):)?(.+)\)$/i,ts=/^\d+\/\d+$/,rs=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,os=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,ss=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,ns=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,as=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,Ae=e=>ts.test(e),_=e=>!!e&&!Number.isNaN(Number(e)),ve=e=>!!e&&Number.isInteger(Number(e)),yt=e=>e.endsWith("%")&&_(e.slice(0,-1)),ge=e=>rs.test(e),is=()=>!0,ls=e=>os.test(e)&&!ss.test(e),Pr=()=>!1,cs=e=>ns.test(e),ds=e=>as.test(e),ms=e=>!f(e)&&!p(e),us=e=>Be(e,Er,Pr),f=e=>Ar.test(e),je=e=>Be(e,Or,ls),kt=e=>Be(e,gs,_),or=e=>Be(e,Lr,Pr),hs=e=>Be(e,Ir,ds),et=e=>Be(e,Mr,cs),p=e=>_r.test(e),qe=e=>We(e,Or),fs=e=>We(e,bs),sr=e=>We(e,Lr),ps=e=>We(e,Er),xs=e=>We(e,Ir),tt=e=>We(e,Mr,!0),Be=(e,r,o)=>{const s=Ar.exec(e);return s?s[1]?r(s[1]):o(s[2]):!1},We=(e,r,o=!1)=>{const s=_r.exec(e);return s?s[1]?r(s[1]):o:!1},Lr=e=>e==="position"||e==="percentage",Ir=e=>e==="image"||e==="url",Er=e=>e==="length"||e==="size"||e==="bg-size",Or=e=>e==="length",gs=e=>e==="number",bs=e=>e==="family-name",Mr=e=>e==="shadow",vs=()=>{const e=Y("color"),r=Y("font"),o=Y("text"),s=Y("font-weight"),n=Y("tracking"),a=Y("leading"),i=Y("breakpoint"),c=Y("container"),l=Y("spacing"),d=Y("radius"),u=Y("shadow"),m=Y("inset-shadow"),x=Y("text-shadow"),b=Y("drop-shadow"),R=Y("blur"),$=Y("perspective"),S=Y("aspect"),P=Y("ease"),C=Y("animate"),z=()=>["auto","avoid","all","avoid-page","page","left","right","column"],I=()=>["center","top","bottom","left","right","top-left","left-top","top-right","right-top","bottom-right","right-bottom","bottom-left","left-bottom"],g=()=>[...I(),p,f],v=()=>["auto","hidden","clip","visible","scroll"],N=()=>["auto","contain","none"],w=()=>[p,f,l],G=()=>[Ae,"full","auto",...w()],L=()=>[ve,"none","subgrid",p,f],D=()=>["auto",{span:["full",ve,p,f]},ve,p,f],U=()=>[ve,"auto",p,f],ne=()=>["auto","min","max","fr",p,f],F=()=>["start","end","center","between","around","evenly","stretch","baseline","center-safe","end-safe"],re=()=>["start","end","center","stretch","center-safe","end-safe"],V=()=>["auto",...w()],J=()=>[Ae,"auto","full","dvw","dvh","lvw","lvh","svw","svh","min","max","fit",...w()],k=()=>[e,p,f],X=()=>[...I(),sr,or,{position:[p,f]}],O=()=>["no-repeat",{repeat:["","x","y","space","round"]}],ie=()=>["auto","cover","contain",ps,us,{size:[p,f]}],K=()=>[yt,qe,je],B=()=>["","none","full",d,p,f],W=()=>["",_,qe,je],le=()=>["solid","dashed","dotted","double"],ce=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],j=()=>[_,yt,sr,or],oe=()=>["","none",R,p,f],ee=()=>["none",_,p,f],de=()=>["none",_,p,f],me=()=>[_,p,f],Z=()=>[Ae,"full",...w()];return{cacheSize:500,theme:{animate:["spin","ping","pulse","bounce"],aspect:["video"],blur:[ge],breakpoint:[ge],color:[is],container:[ge],"drop-shadow":[ge],ease:["in","out","in-out"],font:[ms],"font-weight":["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],"inset-shadow":[ge],leading:["none","tight","snug","normal","relaxed","loose"],perspective:["dramatic","near","normal","midrange","distant","none"],radius:[ge],shadow:[ge],spacing:["px",_],text:[ge],"text-shadow":[ge],tracking:["tighter","tight","normal","wide","wider","widest"]},classGroups:{aspect:[{aspect:["auto","square",Ae,f,p,S]}],container:["container"],columns:[{columns:[_,f,p,c]}],"break-after":[{"break-after":z()}],"break-before":[{"break-before":z()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],sr:["sr-only","not-sr-only"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:g()}],overflow:[{overflow:v()}],"overflow-x":[{"overflow-x":v()}],"overflow-y":[{"overflow-y":v()}],overscroll:[{overscroll:N()}],"overscroll-x":[{"overscroll-x":N()}],"overscroll-y":[{"overscroll-y":N()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:G()}],"inset-x":[{"inset-x":G()}],"inset-y":[{"inset-y":G()}],start:[{start:G()}],end:[{end:G()}],top:[{top:G()}],right:[{right:G()}],bottom:[{bottom:G()}],left:[{left:G()}],visibility:["visible","invisible","collapse"],z:[{z:[ve,"auto",p,f]}],basis:[{basis:[Ae,"full","auto",c,...w()]}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["nowrap","wrap","wrap-reverse"]}],flex:[{flex:[_,Ae,"auto","initial","none",f]}],grow:[{grow:["",_,p,f]}],shrink:[{shrink:["",_,p,f]}],order:[{order:[ve,"first","last","none",p,f]}],"grid-cols":[{"grid-cols":L()}],"col-start-end":[{col:D()}],"col-start":[{"col-start":U()}],"col-end":[{"col-end":U()}],"grid-rows":[{"grid-rows":L()}],"row-start-end":[{row:D()}],"row-start":[{"row-start":U()}],"row-end":[{"row-end":U()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":ne()}],"auto-rows":[{"auto-rows":ne()}],gap:[{gap:w()}],"gap-x":[{"gap-x":w()}],"gap-y":[{"gap-y":w()}],"justify-content":[{justify:[...F(),"normal"]}],"justify-items":[{"justify-items":[...re(),"normal"]}],"justify-self":[{"justify-self":["auto",...re()]}],"align-content":[{content:["normal",...F()]}],"align-items":[{items:[...re(),{baseline:["","last"]}]}],"align-self":[{self:["auto",...re(),{baseline:["","last"]}]}],"place-content":[{"place-content":F()}],"place-items":[{"place-items":[...re(),"baseline"]}],"place-self":[{"place-self":["auto",...re()]}],p:[{p:w()}],px:[{px:w()}],py:[{py:w()}],ps:[{ps:w()}],pe:[{pe:w()}],pt:[{pt:w()}],pr:[{pr:w()}],pb:[{pb:w()}],pl:[{pl:w()}],m:[{m:V()}],mx:[{mx:V()}],my:[{my:V()}],ms:[{ms:V()}],me:[{me:V()}],mt:[{mt:V()}],mr:[{mr:V()}],mb:[{mb:V()}],ml:[{ml:V()}],"space-x":[{"space-x":w()}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":w()}],"space-y-reverse":["space-y-reverse"],size:[{size:J()}],w:[{w:[c,"screen",...J()]}],"min-w":[{"min-w":[c,"screen","none",...J()]}],"max-w":[{"max-w":[c,"screen","none","prose",{screen:[i]},...J()]}],h:[{h:["screen","lh",...J()]}],"min-h":[{"min-h":["screen","lh","none",...J()]}],"max-h":[{"max-h":["screen","lh",...J()]}],"font-size":[{text:["base",o,qe,je]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:[s,p,kt]}],"font-stretch":[{"font-stretch":["ultra-condensed","extra-condensed","condensed","semi-condensed","normal","semi-expanded","expanded","extra-expanded","ultra-expanded",yt,f]}],"font-family":[{font:[fs,f,r]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:[n,p,f]}],"line-clamp":[{"line-clamp":[_,"none",p,kt]}],leading:[{leading:[a,...w()]}],"list-image":[{"list-image":["none",p,f]}],"list-style-position":[{list:["inside","outside"]}],"list-style-type":[{list:["disc","decimal","none",p,f]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"placeholder-color":[{placeholder:k()}],"text-color":[{text:k()}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...le(),"wavy"]}],"text-decoration-thickness":[{decoration:[_,"from-font","auto",p,je]}],"text-decoration-color":[{decoration:k()}],"underline-offset":[{"underline-offset":[_,"auto",p,f]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:w()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",p,f]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],wrap:[{wrap:["break-word","anywhere","normal"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",p,f]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:X()}],"bg-repeat":[{bg:O()}],"bg-size":[{bg:ie()}],"bg-image":[{bg:["none",{linear:[{to:["t","tr","r","br","b","bl","l","tl"]},ve,p,f],radial:["",p,f],conic:[ve,p,f]},xs,hs]}],"bg-color":[{bg:k()}],"gradient-from-pos":[{from:K()}],"gradient-via-pos":[{via:K()}],"gradient-to-pos":[{to:K()}],"gradient-from":[{from:k()}],"gradient-via":[{via:k()}],"gradient-to":[{to:k()}],rounded:[{rounded:B()}],"rounded-s":[{"rounded-s":B()}],"rounded-e":[{"rounded-e":B()}],"rounded-t":[{"rounded-t":B()}],"rounded-r":[{"rounded-r":B()}],"rounded-b":[{"rounded-b":B()}],"rounded-l":[{"rounded-l":B()}],"rounded-ss":[{"rounded-ss":B()}],"rounded-se":[{"rounded-se":B()}],"rounded-ee":[{"rounded-ee":B()}],"rounded-es":[{"rounded-es":B()}],"rounded-tl":[{"rounded-tl":B()}],"rounded-tr":[{"rounded-tr":B()}],"rounded-br":[{"rounded-br":B()}],"rounded-bl":[{"rounded-bl":B()}],"border-w":[{border:W()}],"border-w-x":[{"border-x":W()}],"border-w-y":[{"border-y":W()}],"border-w-s":[{"border-s":W()}],"border-w-e":[{"border-e":W()}],"border-w-t":[{"border-t":W()}],"border-w-r":[{"border-r":W()}],"border-w-b":[{"border-b":W()}],"border-w-l":[{"border-l":W()}],"divide-x":[{"divide-x":W()}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":W()}],"divide-y-reverse":["divide-y-reverse"],"border-style":[{border:[...le(),"hidden","none"]}],"divide-style":[{divide:[...le(),"hidden","none"]}],"border-color":[{border:k()}],"border-color-x":[{"border-x":k()}],"border-color-y":[{"border-y":k()}],"border-color-s":[{"border-s":k()}],"border-color-e":[{"border-e":k()}],"border-color-t":[{"border-t":k()}],"border-color-r":[{"border-r":k()}],"border-color-b":[{"border-b":k()}],"border-color-l":[{"border-l":k()}],"divide-color":[{divide:k()}],"outline-style":[{outline:[...le(),"none","hidden"]}],"outline-offset":[{"outline-offset":[_,p,f]}],"outline-w":[{outline:["",_,qe,je]}],"outline-color":[{outline:k()}],shadow:[{shadow:["","none",u,tt,et]}],"shadow-color":[{shadow:k()}],"inset-shadow":[{"inset-shadow":["none",m,tt,et]}],"inset-shadow-color":[{"inset-shadow":k()}],"ring-w":[{ring:W()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:k()}],"ring-offset-w":[{"ring-offset":[_,je]}],"ring-offset-color":[{"ring-offset":k()}],"inset-ring-w":[{"inset-ring":W()}],"inset-ring-color":[{"inset-ring":k()}],"text-shadow":[{"text-shadow":["none",x,tt,et]}],"text-shadow-color":[{"text-shadow":k()}],opacity:[{opacity:[_,p,f]}],"mix-blend":[{"mix-blend":[...ce(),"plus-darker","plus-lighter"]}],"bg-blend":[{"bg-blend":ce()}],"mask-clip":[{"mask-clip":["border","padding","content","fill","stroke","view"]},"mask-no-clip"],"mask-composite":[{mask:["add","subtract","intersect","exclude"]}],"mask-image-linear-pos":[{"mask-linear":[_]}],"mask-image-linear-from-pos":[{"mask-linear-from":j()}],"mask-image-linear-to-pos":[{"mask-linear-to":j()}],"mask-image-linear-from-color":[{"mask-linear-from":k()}],"mask-image-linear-to-color":[{"mask-linear-to":k()}],"mask-image-t-from-pos":[{"mask-t-from":j()}],"mask-image-t-to-pos":[{"mask-t-to":j()}],"mask-image-t-from-color":[{"mask-t-from":k()}],"mask-image-t-to-color":[{"mask-t-to":k()}],"mask-image-r-from-pos":[{"mask-r-from":j()}],"mask-image-r-to-pos":[{"mask-r-to":j()}],"mask-image-r-from-color":[{"mask-r-from":k()}],"mask-image-r-to-color":[{"mask-r-to":k()}],"mask-image-b-from-pos":[{"mask-b-from":j()}],"mask-image-b-to-pos":[{"mask-b-to":j()}],"mask-image-b-from-color":[{"mask-b-from":k()}],"mask-image-b-to-color":[{"mask-b-to":k()}],"mask-image-l-from-pos":[{"mask-l-from":j()}],"mask-image-l-to-pos":[{"mask-l-to":j()}],"mask-image-l-from-color":[{"mask-l-from":k()}],"mask-image-l-to-color":[{"mask-l-to":k()}],"mask-image-x-from-pos":[{"mask-x-from":j()}],"mask-image-x-to-pos":[{"mask-x-to":j()}],"mask-image-x-from-color":[{"mask-x-from":k()}],"mask-image-x-to-color":[{"mask-x-to":k()}],"mask-image-y-from-pos":[{"mask-y-from":j()}],"mask-image-y-to-pos":[{"mask-y-to":j()}],"mask-image-y-from-color":[{"mask-y-from":k()}],"mask-image-y-to-color":[{"mask-y-to":k()}],"mask-image-radial":[{"mask-radial":[p,f]}],"mask-image-radial-from-pos":[{"mask-radial-from":j()}],"mask-image-radial-to-pos":[{"mask-radial-to":j()}],"mask-image-radial-from-color":[{"mask-radial-from":k()}],"mask-image-radial-to-color":[{"mask-radial-to":k()}],"mask-image-radial-shape":[{"mask-radial":["circle","ellipse"]}],"mask-image-radial-size":[{"mask-radial":[{closest:["side","corner"],farthest:["side","corner"]}]}],"mask-image-radial-pos":[{"mask-radial-at":I()}],"mask-image-conic-pos":[{"mask-conic":[_]}],"mask-image-conic-from-pos":[{"mask-conic-from":j()}],"mask-image-conic-to-pos":[{"mask-conic-to":j()}],"mask-image-conic-from-color":[{"mask-conic-from":k()}],"mask-image-conic-to-color":[{"mask-conic-to":k()}],"mask-mode":[{mask:["alpha","luminance","match"]}],"mask-origin":[{"mask-origin":["border","padding","content","fill","stroke","view"]}],"mask-position":[{mask:X()}],"mask-repeat":[{mask:O()}],"mask-size":[{mask:ie()}],"mask-type":[{"mask-type":["alpha","luminance"]}],"mask-image":[{mask:["none",p,f]}],filter:[{filter:["","none",p,f]}],blur:[{blur:oe()}],brightness:[{brightness:[_,p,f]}],contrast:[{contrast:[_,p,f]}],"drop-shadow":[{"drop-shadow":["","none",b,tt,et]}],"drop-shadow-color":[{"drop-shadow":k()}],grayscale:[{grayscale:["",_,p,f]}],"hue-rotate":[{"hue-rotate":[_,p,f]}],invert:[{invert:["",_,p,f]}],saturate:[{saturate:[_,p,f]}],sepia:[{sepia:["",_,p,f]}],"backdrop-filter":[{"backdrop-filter":["","none",p,f]}],"backdrop-blur":[{"backdrop-blur":oe()}],"backdrop-brightness":[{"backdrop-brightness":[_,p,f]}],"backdrop-contrast":[{"backdrop-contrast":[_,p,f]}],"backdrop-grayscale":[{"backdrop-grayscale":["",_,p,f]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[_,p,f]}],"backdrop-invert":[{"backdrop-invert":["",_,p,f]}],"backdrop-opacity":[{"backdrop-opacity":[_,p,f]}],"backdrop-saturate":[{"backdrop-saturate":[_,p,f]}],"backdrop-sepia":[{"backdrop-sepia":["",_,p,f]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":w()}],"border-spacing-x":[{"border-spacing-x":w()}],"border-spacing-y":[{"border-spacing-y":w()}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["","all","colors","opacity","shadow","transform","none",p,f]}],"transition-behavior":[{transition:["normal","discrete"]}],duration:[{duration:[_,"initial",p,f]}],ease:[{ease:["linear","initial",P,p,f]}],delay:[{delay:[_,p,f]}],animate:[{animate:["none",C,p,f]}],backface:[{backface:["hidden","visible"]}],perspective:[{perspective:[$,p,f]}],"perspective-origin":[{"perspective-origin":g()}],rotate:[{rotate:ee()}],"rotate-x":[{"rotate-x":ee()}],"rotate-y":[{"rotate-y":ee()}],"rotate-z":[{"rotate-z":ee()}],scale:[{scale:de()}],"scale-x":[{"scale-x":de()}],"scale-y":[{"scale-y":de()}],"scale-z":[{"scale-z":de()}],"scale-3d":["scale-3d"],skew:[{skew:me()}],"skew-x":[{"skew-x":me()}],"skew-y":[{"skew-y":me()}],transform:[{transform:[p,f,"","none","gpu","cpu"]}],"transform-origin":[{origin:g()}],"transform-style":[{transform:["3d","flat"]}],translate:[{translate:Z()}],"translate-x":[{"translate-x":Z()}],"translate-y":[{"translate-y":Z()}],"translate-z":[{"translate-z":Z()}],"translate-none":["translate-none"],accent:[{accent:k()}],appearance:[{appearance:["none","auto"]}],"caret-color":[{caret:k()}],"color-scheme":[{scheme:["normal","dark","light","light-dark","only-dark","only-light"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",p,f]}],"field-sizing":[{"field-sizing":["fixed","content"]}],"pointer-events":[{"pointer-events":["auto","none"]}],resize:[{resize:["none","","y","x"]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":w()}],"scroll-mx":[{"scroll-mx":w()}],"scroll-my":[{"scroll-my":w()}],"scroll-ms":[{"scroll-ms":w()}],"scroll-me":[{"scroll-me":w()}],"scroll-mt":[{"scroll-mt":w()}],"scroll-mr":[{"scroll-mr":w()}],"scroll-mb":[{"scroll-mb":w()}],"scroll-ml":[{"scroll-ml":w()}],"scroll-p":[{"scroll-p":w()}],"scroll-px":[{"scroll-px":w()}],"scroll-py":[{"scroll-py":w()}],"scroll-ps":[{"scroll-ps":w()}],"scroll-pe":[{"scroll-pe":w()}],"scroll-pt":[{"scroll-pt":w()}],"scroll-pr":[{"scroll-pr":w()}],"scroll-pb":[{"scroll-pb":w()}],"scroll-pl":[{"scroll-pl":w()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",p,f]}],fill:[{fill:["none",...k()]}],"stroke-w":[{stroke:[_,qe,je,kt]}],stroke:[{stroke:["none",...k()]}],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-x","border-w-y","border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-x","border-color-y","border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],translate:["translate-x","translate-y","translate-none"],"translate-none":["translate","translate-x","translate-y","translate-z"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]},orderSensitiveModifiers:["*","**","after","backdrop","before","details-content","file","first-letter","first-line","marker","placeholder","selection"]}},ws=Qo(vs);function Ce(...e){return ws(Po(e))}const ys={sm:"w-6 h-6 text-xs",md:"w-8 h-8 text-sm",lg:"w-10 h-10 text-base"},nr=["from-red-400 to-red-600","from-blue-400 to-blue-600","from-green-400 to-green-600","from-yellow-400 to-yellow-600","from-purple-400 to-purple-600","from-pink-400 to-pink-600","from-cyan-400 to-cyan-600","from-orange-400 to-orange-600"];function ks(e){const r=e.split("").reduce((o,s)=>o+s.charCodeAt(0),0);return nr[r%nr.length]}function Re({name:e,size:r="md",className:o,isHost:s,isReady:n}){const a=e.slice(0,2).toUpperCase(),i=ks(e);return t.jsxs("div",{className:"relative",children:[t.jsx("div",{className:Ce(ys[r],"rounded-full flex items-center justify-center font-bold text-white shadow-lg",`bg-gradient-to-br ${i}`,"border-2 border-white/30",o),children:a}),s&&t.jsx("div",{className:"absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5",children:t.jsx("span",{className:"text-xs",children:"👑"})}),n&&t.jsx("div",{className:"absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5",children:t.jsx("span",{className:"text-xs",children:"✓"})})]})}function js({roomName:e,roomCode:r,players:o,maxPlayers:s,onJoin:n}){const a=o.length>=s;return t.jsxs("div",{className:"group bg-dark-800 border-2 border-dark-700 rounded-xl p-6 hover:border-uno-blue transition-all duration-300 hover:shadow-glow-blue",children:[t.jsxs("div",{className:"flex items-start justify-between mb-4",children:[t.jsxs("div",{className:"flex-1",children:[t.jsx("h3",{className:"text-xl font-poppins font-bold text-white mb-1 group-hover:text-uno-blue transition-colors",children:e}),t.jsxs("p",{className:"text-sm text-gray-400 font-mono",children:["Code: ",t.jsx("span",{className:"text-uno-yellow",children:r})]})]}),t.jsxs("div",{className:"flex items-center space-x-1 bg-dark-700 px-3 py-1.5 rounded-full",children:[t.jsx("svg",{className:"w-4 h-4 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),t.jsxs("span",{className:"text-sm font-semibold text-white",children:[o.length,"/",s]})]})]}),t.jsxs("div",{className:"flex items-center space-x-2 mb-4",children:[o.slice(0,4).map(i=>t.jsx(Re,{name:i.name,isHost:i.isHost,isReady:i.isReady,size:"sm"},i.id)),Array.from({length:s-o.length}).map((i,c)=>t.jsx("div",{className:"w-10 h-10 rounded-full border-2 border-dashed border-dark-600 flex items-center justify-center",children:t.jsx("span",{className:"text-dark-600 text-xs",children:"?"})},`empty-${c}`))]}),t.jsx("button",{onClick:n,disabled:a,className:`
          w-full py-3 px-4 rounded-lg font-semibold
          transition-all duration-300
          ${a?"bg-dark-700 text-gray-500 cursor-not-allowed":"bg-gradient-to-r from-uno-blue to-uno-green text-white hover:shadow-glow-blue hover:scale-105"}
        `,children:a?"Room Full":"Join Room"})]})}function Ns({isOpen:e,onClose:r,onCreate:o}){const[s,n]=y.useState(""),[a,i]=y.useState(4);if(y.useEffect(()=>{e&&(n(""),i(4))},[e]),!e)return null;const c=l=>{l.preventDefault(),s.trim()&&(o(s.trim(),a),r())};return t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",onClick:r,children:t.jsxs("div",{className:"relative bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-float",onClick:l=>l.stopPropagation(),children:[t.jsx("button",{onClick:r,title:"Close modal",className:"absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-all duration-200",children:t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})}),t.jsx("h2",{className:"text-3xl font-poppins font-bold text-white mb-6",children:"Create Room"}),t.jsxs("form",{onSubmit:c,className:"space-y-6",children:[t.jsxs("div",{children:[t.jsx("label",{htmlFor:"roomName",className:"block text-sm font-semibold text-gray-300 mb-2",children:"Room Name"}),t.jsx("input",{id:"roomName",type:"text",value:s,onChange:l=>n(l.target.value),placeholder:"Enter room name...",maxLength:30,className:"w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors duration-200",required:!0}),t.jsxs("p",{className:"mt-1 text-xs text-gray-500",children:[s.length,"/30 characters"]})]}),t.jsxs("div",{children:[t.jsxs("label",{className:"block text-sm font-semibold text-gray-300 mb-3",children:["Max Players: ",t.jsx("span",{className:"text-uno-yellow",children:a})]}),t.jsxs("div",{className:"relative",children:[t.jsx("input",{type:"range",min:"2",max:"4",value:a,onChange:l=>i(Number(l.target.value)),className:"w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-uno-blue","aria-label":"Maximum number of players",style:{background:`linear-gradient(to right, #3182CE 0%, #3182CE ${(a-2)/2*100}%, #1F2937 ${(a-2)/2*100}%, #1F2937 100%)`}}),t.jsxs("div",{className:"flex justify-between mt-2 text-xs text-gray-500",children:[t.jsx("span",{children:"2"}),t.jsx("span",{children:"3"}),t.jsx("span",{children:"4"})]})]})]}),t.jsxs("div",{className:"flex space-x-3 pt-4",children:[t.jsx("button",{type:"button",onClick:r,className:"flex-1 py-3 px-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200",children:"Cancel"}),t.jsx("button",{type:"submit",disabled:!s.trim(),className:"flex-1 py-3 px-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",children:"Create Room"})]})]})]})})}const jt="uno_current_room",Cs=24*60*60,Q={setCurrentRoom(e,r,o){const s={roomId:e,roomCode:r,playerName:o,joinedAt:Date.now()},n=JSON.stringify(s);document.cookie=`${jt}=${encodeURIComponent(n)}; max-age=${Cs}; path=/; SameSite=Strict`,console.log(`[RoomCookies] ✅ Saved room: ${r} (${e})`)},getCurrentRoom(){const r=document.cookie.split(";").find(o=>o.trim().startsWith(`${jt}=`));if(!r)return console.log("[RoomCookies] No room cookie found"),null;try{const o=r.split("=")[1],s=decodeURIComponent(o),n=JSON.parse(s),a=Date.now()-n.joinedAt,i=24*60*60*1e3;return a>i?(console.log("[RoomCookies] Cookie expired, clearing..."),this.clearCurrentRoom(),null):(console.log(`[RoomCookies] Found room: ${n.roomCode} (${n.roomId})`),n)}catch(o){return console.error("[RoomCookies] Failed to parse cookie:",o),this.clearCurrentRoom(),null}},clearCurrentRoom(){document.cookie=`${jt}=; max-age=0; path=/; SameSite=Strict`,console.log("[RoomCookies] ✅ Cleared room cookie")},hasActiveRoom(){return this.getCurrentRoom()!==null},getActiveRoomId(){const e=this.getCurrentRoom();return e?e.roomId:null}};function Ss(){const e=Ge(),{user:r}=De(),[o,s]=y.useState([]),[n,a]=y.useState(!1),[i,c]=y.useState(""),[l,d]=y.useState(!1),[u,m]=y.useState(""),[x,b]=y.useState(!0),[R,$]=y.useState(!1),[S,P]=y.useState(null);y.useEffect(()=>{h.socket.connected||(console.log("[Lobby] Socket not connected, connecting..."),h.connect());const L=async()=>{const O=Q.getCurrentRoom();O?(console.log("[Lobby] Found active room in cookies:",O),h.socket.emit("check_room_exists",{roomId:O.roomId})):(console.log("[Lobby] No active room found"),b(!1))},D=()=>{console.log("[Lobby] ✅ Connected to server:",h.socket.id),d(!0),h.getRooms(),L()},U=()=>{console.log("[Lobby] Disconnected from server"),d(!1)},ne=O=>{s(O)},F=O=>{console.log("[Lobby] Room created:",O),r&&Q.setCurrentRoom(O.roomId,O.roomCode,r.username)},re=O=>{console.log("[Lobby] Joined room:",O.roomId),e(`/game/${O.roomId}`)},V=O=>{console.log("[Lobby] Server says we should reconnect to:",O.roomId),e(`/game/${O.roomId}`,{state:{reconnect:!0}})},J=O=>{console.log("[Lobby] Room exists check:",O),b(!1),O.exists?(console.log("[Lobby] ✅ Room still active, prompting user..."),P(Q.getCurrentRoom()),$(!0)):(console.log("[Lobby] ❌ Room no longer exists, clearing cookie"),Q.clearCurrentRoom())},k=O=>{console.error("[Lobby] Socket error:",O),m(O.message),setTimeout(()=>m(""),4e3)};h.socket.on("connect",D),h.socket.on("disconnect",U),h.onRoomsList(ne),h.onRoomCreated(F),h.onJoinedRoom(re),h.socket.on("should_reconnect",V),h.socket.on("room_exists",J),h.onError(k),h.socket.connected&&D();const X=setInterval(()=>{h.socket.connected&&h.getRooms()},5e3);return()=>{clearInterval(X),h.socket.off("connect",D),h.socket.off("disconnect",U),h.socket.off("should_reconnect",V),h.socket.off("room_exists",J),h.off("rooms_list"),h.off("room_created"),h.off("joined_room"),h.off("error")}},[e,r]);const C=(L,D)=>{if(Q.hasActiveRoom()){const U=Q.getCurrentRoom();m(`You're already in room "${U==null?void 0:U.roomCode}". Leave it first.`),setTimeout(()=>m(""),4e3);return}if(!l){m("Not connected to server"),setTimeout(()=>m(""),4e3);return}h.createRoom(L,D)},z=async L=>{const D=Q.getActiveRoomId();if(D&&D!==L){const F=Q.getCurrentRoom();m(`You're already in room "${F==null?void 0:F.roomCode}". Leave it first.`),setTimeout(()=>m(""),4e3);return}if(!l){m("Not connected to server"),setTimeout(()=>m(""),4e3);return}if(!r){m("Authentication required"),setTimeout(()=>m(""),4e3);return}const U=o.find(F=>F.id===L);if(!U){m("Room not found"),setTimeout(()=>m(""),4e3);return}const ne=r.username;Q.setCurrentRoom(L,U.roomCode,ne),console.log(`[Lobby] Attempting to join room ${L} as ${ne}`),h.joinRoom(L,ne)},I=()=>{S&&(console.log("[Lobby] Rejoining active room:",S.roomId),e(`/game/${S.roomId}`,{state:{reconnect:!0}}))},g=()=>{console.log("[Lobby] User abandoned active room"),Q.clearCurrentRoom(),$(!1),P(null)},v=o.filter(L=>L.roomName.toLowerCase().includes(i.toLowerCase())||L.roomCode.toLowerCase().includes(i.toLowerCase())),N=o.length,w=o.reduce((L,D)=>L+D.players.length,0),G=o.filter(L=>L.gameStarted).length;return x?t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"flex items-center justify-center min-h-screen",children:t.jsxs("div",{className:"text-center",children:[t.jsx("div",{className:"text-6xl mb-4 animate-bounce",children:"🔍"}),t.jsx("p",{className:"text-xl text-gray-400",children:"Checking for active games..."})]})})]}):R&&S?t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"flex items-center justify-center min-h-screen px-4",children:t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full text-center",children:[t.jsx("div",{className:"text-6xl mb-4",children:"🎮"}),t.jsx("h2",{className:"text-3xl font-poppins font-bold text-white mb-4",children:"Active Game Found!"}),t.jsxs("p",{className:"text-gray-400 mb-6",children:["You're still in room ",t.jsx("span",{className:"text-uno-yellow font-mono",children:S.roomCode}),". Would you like to continue or leave?"]}),t.jsxs("div",{className:"flex flex-col gap-3",children:[t.jsx("button",{onClick:I,className:"w-full py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300",children:"🎯 Rejoin Game"}),t.jsx("button",{onClick:g,className:"w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors",children:"🚪 Leave & Browse Lobby"})]})]})})]}):t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"fixed top-20 right-4 z-40",children:t.jsxs("div",{className:`flex items-center gap-2 px-4 py-2 rounded-full ${l?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`,children:[t.jsx("div",{className:`w-2 h-2 rounded-full ${l?"bg-green-400":"bg-red-400"}`}),t.jsx("span",{className:"text-sm font-medium",children:l?"Connected":"Disconnected"})]})}),u&&t.jsx("div",{className:"fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg",children:u}),t.jsxs("div",{className:"pt-24 pb-12 px-4 max-w-7xl mx-auto",children:[t.jsxs("div",{className:"mb-12",children:[t.jsx("h1",{className:"text-5xl md:text-6xl font-poppins font-extrabold text-white mb-4",children:"Game Lobby"}),t.jsx("p",{className:"text-xl text-gray-400",children:"Join an existing room or create your own"})]}),t.jsxs("div",{className:"flex flex-col md:flex-row gap-4 mb-8",children:[t.jsxs("div",{className:"flex-1 relative",children:[t.jsx("svg",{className:"absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),t.jsx("input",{type:"text",value:i,onChange:L=>c(L.target.value),placeholder:"Search rooms by name or code...",className:"w-full pl-12 pr-4 py-4 bg-dark-800 border-2 border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors duration-200"})]}),t.jsx("button",{onClick:()=>a(!0),disabled:!l,className:"px-8 py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",children:t.jsxs("span",{className:"flex items-center justify-center space-x-2",children:[t.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v16m8-8H4"})}),t.jsx("span",{children:"Create Room"})]})})]}),t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-8",children:[t.jsxs("div",{className:"bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4",children:[t.jsx("div",{className:"w-12 h-12 bg-uno-blue/20 rounded-lg flex items-center justify-center",children:t.jsx("svg",{className:"w-6 h-6 text-uno-blue",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-400 text-sm",children:"Active Rooms"}),t.jsx("p",{className:"text-2xl font-bold text-white",children:N})]})]}),t.jsxs("div",{className:"bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4",children:[t.jsx("div",{className:"w-12 h-12 bg-uno-green/20 rounded-lg flex items-center justify-center",children:t.jsx("svg",{className:"w-6 h-6 text-uno-green",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-400 text-sm",children:"Players Online"}),t.jsx("p",{className:"text-2xl font-bold text-white",children:w})]})]}),t.jsxs("div",{className:"bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4",children:[t.jsx("div",{className:"w-12 h-12 bg-uno-yellow/20 rounded-lg flex items-center justify-center",children:t.jsx("svg",{className:"w-6 h-6 text-uno-yellow",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 10V3L4 14h7v7l9-11h-7z"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-400 text-sm",children:"Games in Progress"}),t.jsx("p",{className:"text-2xl font-bold text-white",children:G})]})]})]}),l?v.length===0?t.jsxs("div",{className:"text-center py-20",children:[t.jsx("div",{className:"text-6xl mb-4",children:"🎮"}),t.jsx("h3",{className:"text-2xl font-poppins font-bold text-white mb-2",children:"No rooms found"}),t.jsx("p",{className:"text-gray-400 mb-6",children:i?"Try a different search term":"Be the first to create a room!"}),t.jsx("button",{onClick:()=>a(!0),className:"px-8 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105",children:"Create Room"})]}):t.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:v.map(L=>t.jsx(js,{roomName:L.roomName,roomCode:L.roomCode,players:L.players,maxPlayers:L.maxPlayers,onJoin:()=>z(L.id)},L.id))}):t.jsxs("div",{className:"text-center py-20",children:[t.jsx("div",{className:"text-6xl mb-4",children:"🔌"}),t.jsx("h3",{className:"text-2xl font-poppins font-bold text-white mb-2",children:"Connecting to server..."}),t.jsx("p",{className:"text-gray-400",children:"Please wait"})]})]}),t.jsx(Ns,{isOpen:n,onClose:()=>a(!1),onCreate:C})]})}function Rs({gameState:e,isMyTurn:r,currentPlayerName:o,turnTimeRemaining:s}){const[n,a]=y.useState(s||30);y.useEffect(()=>{if(!r||!s)return;a(Math.ceil(s/1e3));const c=setInterval(()=>{a(l=>Math.max(0,l-1))},1e3);return()=>clearInterval(c)},[r,s]);const i=n<=10;return t.jsx("div",{className:"px-2 sm:px-4 max-w-7xl mx-auto mb-1 sm:mb-2 md:mb-4",children:t.jsxs("div",{className:"bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4",children:[t.jsxs("div",{className:"flex-1",children:[t.jsx("h3",{className:"text-sm sm:text-base md:text-xl font-poppins font-bold text-white mb-0.5 sm:mb-1",children:r?t.jsx("span",{className:"text-uno-yellow",children:"🎯 YOUR TURN!"}):t.jsxs("span",{className:"truncate block max-w-[200px] sm:max-w-none",children:[o,"'s Turn"]})}),t.jsx("p",{className:"text-gray-400 text-[10px] sm:text-xs md:text-sm",children:e.direction===1?"→ Clockwise":"← Counter"})]}),t.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 md:gap-6",children:[r&&s&&t.jsxs("div",{className:"text-center",children:[t.jsx("p",{className:"text-[10px] sm:text-xs text-gray-400",children:"Time"}),t.jsxs("p",{className:`text-base sm:text-lg md:text-xl font-bold ${i?"text-red-500 animate-pulse":"text-white"}`,children:[n,"s"]})]}),t.jsxs("div",{className:"text-center",children:[t.jsx("p",{className:"text-[10px] sm:text-xs text-gray-400",children:"Deck"}),t.jsx("p",{className:"text-base sm:text-lg md:text-xl font-bold text-white",children:e.deckCount})]}),e.pendingDraw>0&&t.jsxs("div",{className:"text-center",children:[t.jsx("p",{className:"text-[10px] sm:text-xs text-gray-400",children:"Draw"}),t.jsxs("p",{className:"text-base sm:text-lg md:text-xl font-bold text-uno-yellow",children:["+",e.pendingDraw]})]})]})]})})}var te=function(){return te=Object.assign||function(r){for(var o,s=1,n=arguments.length;s<n;s++){o=arguments[s];for(var a in o)Object.prototype.hasOwnProperty.call(o,a)&&(r[a]=o[a])}return r},te.apply(this,arguments)};function dt(e,r,o){if(o||arguments.length===2)for(var s=0,n=r.length,a;s<n;s++)(a||!(s in r))&&(a||(a=Array.prototype.slice.call(r,0,s)),a[s]=r[s]);return e.concat(a||Array.prototype.slice.call(r))}var T="-ms-",Ve="-moz-",M="-webkit-",Fr="comm",pt="rule",Ft="decl",$s="@import",Tr="@keyframes",zs="@layer",Gr=Math.abs,Tt=String.fromCharCode,At=Object.assign;function As(e,r){return H(e,0)^45?(((r<<2^H(e,0))<<2^H(e,1))<<2^H(e,2))<<2^H(e,3):0}function Dr(e){return e.trim()}function be(e,r){return(e=r.exec(e))?e[0]:e}function A(e,r,o){return e.replace(r,o)}function st(e,r,o){return e.indexOf(r,o)}function H(e,r){return e.charCodeAt(r)|0}function Ee(e,r,o){return e.slice(r,o)}function xe(e){return e.length}function Br(e){return e.length}function He(e,r){return r.push(e),e}function _s(e,r){return e.map(r).join("")}function ar(e,r){return e.filter(function(o){return!be(o,r)})}var xt=1,Oe=1,Wr=0,ae=0,q=0,Ue="";function gt(e,r,o,s,n,a,i,c){return{value:e,root:r,parent:o,type:s,props:n,children:a,line:xt,column:Oe,length:i,return:"",siblings:c}}function we(e,r){return At(gt("",null,null,"",null,null,0,e.siblings),e,{length:-e.length},r)}function _e(e){for(;e.root;)e=we(e.root,{children:[e]});He(e,e.siblings)}function Ps(){return q}function Ls(){return q=ae>0?H(Ue,--ae):0,Oe--,q===10&&(Oe=1,xt--),q}function fe(){return q=ae<Wr?H(Ue,ae++):0,Oe++,q===10&&(Oe=1,xt++),q}function $e(){return H(Ue,ae)}function nt(){return ae}function bt(e,r){return Ee(Ue,e,r)}function _t(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function Is(e){return xt=Oe=1,Wr=xe(Ue=e),ae=0,[]}function Es(e){return Ue="",e}function Nt(e){return Dr(bt(ae-1,Pt(e===91?e+2:e===40?e+1:e)))}function Os(e){for(;(q=$e())&&q<33;)fe();return _t(e)>2||_t(q)>3?"":" "}function Ms(e,r){for(;--r&&fe()&&!(q<48||q>102||q>57&&q<65||q>70&&q<97););return bt(e,nt()+(r<6&&$e()==32&&fe()==32))}function Pt(e){for(;fe();)switch(q){case e:return ae;case 34:case 39:e!==34&&e!==39&&Pt(q);break;case 40:e===41&&Pt(e);break;case 92:fe();break}return ae}function Fs(e,r){for(;fe()&&e+q!==57;)if(e+q===84&&$e()===47)break;return"/*"+bt(r,ae-1)+"*"+Tt(e===47?e:fe())}function Ts(e){for(;!_t($e());)fe();return bt(e,ae)}function Gs(e){return Es(at("",null,null,null,[""],e=Is(e),0,[0],e))}function at(e,r,o,s,n,a,i,c,l){for(var d=0,u=0,m=i,x=0,b=0,R=0,$=1,S=1,P=1,C=0,z="",I=n,g=a,v=s,N=z;S;)switch(R=C,C=fe()){case 40:if(R!=108&&H(N,m-1)==58){st(N+=A(Nt(C),"&","&\f"),"&\f",Gr(d?c[d-1]:0))!=-1&&(P=-1);break}case 34:case 39:case 91:N+=Nt(C);break;case 9:case 10:case 13:case 32:N+=Os(R);break;case 92:N+=Ms(nt()-1,7);continue;case 47:switch($e()){case 42:case 47:He(Ds(Fs(fe(),nt()),r,o,l),l);break;default:N+="/"}break;case 123*$:c[d++]=xe(N)*P;case 125*$:case 59:case 0:switch(C){case 0:case 125:S=0;case 59+u:P==-1&&(N=A(N,/\f/g,"")),b>0&&xe(N)-m&&He(b>32?lr(N+";",s,o,m-1,l):lr(A(N," ","")+";",s,o,m-2,l),l);break;case 59:N+=";";default:if(He(v=ir(N,r,o,d,u,n,c,z,I=[],g=[],m,a),a),C===123)if(u===0)at(N,r,v,v,I,a,m,c,g);else switch(x===99&&H(N,3)===110?100:x){case 100:case 108:case 109:case 115:at(e,v,v,s&&He(ir(e,v,v,0,0,n,c,z,n,I=[],m,g),g),n,g,m,c,s?I:g);break;default:at(N,v,v,v,[""],g,0,c,g)}}d=u=b=0,$=P=1,z=N="",m=i;break;case 58:m=1+xe(N),b=R;default:if($<1){if(C==123)--$;else if(C==125&&$++==0&&Ls()==125)continue}switch(N+=Tt(C),C*$){case 38:P=u>0?1:(N+="\f",-1);break;case 44:c[d++]=(xe(N)-1)*P,P=1;break;case 64:$e()===45&&(N+=Nt(fe())),x=$e(),u=m=xe(z=N+=Ts(nt())),C++;break;case 45:R===45&&xe(N)==2&&($=0)}}return a}function ir(e,r,o,s,n,a,i,c,l,d,u,m){for(var x=n-1,b=n===0?a:[""],R=Br(b),$=0,S=0,P=0;$<s;++$)for(var C=0,z=Ee(e,x+1,x=Gr(S=i[$])),I=e;C<R;++C)(I=Dr(S>0?b[C]+" "+z:A(z,/&\f/g,b[C])))&&(l[P++]=I);return gt(e,r,o,n===0?pt:c,l,d,u,m)}function Ds(e,r,o,s){return gt(e,r,o,Fr,Tt(Ps()),Ee(e,2,-2),0,s)}function lr(e,r,o,s,n){return gt(e,r,o,Ft,Ee(e,0,s),Ee(e,s+1,-1),s,n)}function Ur(e,r,o){switch(As(e,r)){case 5103:return M+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return M+e+e;case 4789:return Ve+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return M+e+Ve+e+T+e+e;case 5936:switch(H(e,r+11)){case 114:return M+e+T+A(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return M+e+T+A(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return M+e+T+A(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return M+e+T+e+e;case 6165:return M+e+T+"flex-"+e+e;case 5187:return M+e+A(e,/(\w+).+(:[^]+)/,M+"box-$1$2"+T+"flex-$1$2")+e;case 5443:return M+e+T+"flex-item-"+A(e,/flex-|-self/g,"")+(be(e,/flex-|baseline/)?"":T+"grid-row-"+A(e,/flex-|-self/g,""))+e;case 4675:return M+e+T+"flex-line-pack"+A(e,/align-content|flex-|-self/g,"")+e;case 5548:return M+e+T+A(e,"shrink","negative")+e;case 5292:return M+e+T+A(e,"basis","preferred-size")+e;case 6060:return M+"box-"+A(e,"-grow","")+M+e+T+A(e,"grow","positive")+e;case 4554:return M+A(e,/([^-])(transform)/g,"$1"+M+"$2")+e;case 6187:return A(A(A(e,/(zoom-|grab)/,M+"$1"),/(image-set)/,M+"$1"),e,"")+e;case 5495:case 3959:return A(e,/(image-set\([^]*)/,M+"$1$`$1");case 4968:return A(A(e,/(.+:)(flex-)?(.*)/,M+"box-pack:$3"+T+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+M+e+e;case 4200:if(!be(e,/flex-|baseline/))return T+"grid-column-align"+Ee(e,r)+e;break;case 2592:case 3360:return T+A(e,"template-","")+e;case 4384:case 3616:return o&&o.some(function(s,n){return r=n,be(s.props,/grid-\w+-end/)})?~st(e+(o=o[r].value),"span",0)?e:T+A(e,"-start","")+e+T+"grid-row-span:"+(~st(o,"span",0)?be(o,/\d+/):+be(o,/\d+/)-+be(e,/\d+/))+";":T+A(e,"-start","")+e;case 4896:case 4128:return o&&o.some(function(s){return be(s.props,/grid-\w+-start/)})?e:T+A(A(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return A(e,/(.+)-inline(.+)/,M+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(xe(e)-1-r>6)switch(H(e,r+1)){case 109:if(H(e,r+4)!==45)break;case 102:return A(e,/(.+:)(.+)-([^]+)/,"$1"+M+"$2-$3$1"+Ve+(H(e,r+3)==108?"$3":"$2-$3"))+e;case 115:return~st(e,"stretch",0)?Ur(A(e,"stretch","fill-available"),r,o)+e:e}break;case 5152:case 5920:return A(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(s,n,a,i,c,l,d){return T+n+":"+a+d+(i?T+n+"-span:"+(c?l:+l-+a)+d:"")+e});case 4949:if(H(e,r+6)===121)return A(e,":",":"+M)+e;break;case 6444:switch(H(e,H(e,14)===45?18:11)){case 120:return A(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+M+(H(e,14)===45?"inline-":"")+"box$3$1"+M+"$2$3$1"+T+"$2box$3")+e;case 100:return A(e,":",":"+T)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return A(e,"scroll-","scroll-snap-")+e}return e}function mt(e,r){for(var o="",s=0;s<e.length;s++)o+=r(e[s],s,e,r)||"";return o}function Bs(e,r,o,s){switch(e.type){case zs:if(e.children.length)break;case $s:case Ft:return e.return=e.return||e.value;case Fr:return"";case Tr:return e.return=e.value+"{"+mt(e.children,s)+"}";case pt:if(!xe(e.value=e.props.join(",")))return""}return xe(o=mt(e.children,s))?e.return=e.value+"{"+o+"}":""}function Ws(e){var r=Br(e);return function(o,s,n,a){for(var i="",c=0;c<r;c++)i+=e[c](o,s,n,a)||"";return i}}function Us(e){return function(r){r.root||(r=r.return)&&e(r)}}function qs(e,r,o,s){if(e.length>-1&&!e.return)switch(e.type){case Ft:e.return=Ur(e.value,e.length,o);return;case Tr:return mt([we(e,{value:A(e.value,"@","@"+M)})],s);case pt:if(e.length)return _s(o=e.props,function(n){switch(be(n,s=/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":_e(we(e,{props:[A(n,/:(read-\w+)/,":"+Ve+"$1")]})),_e(we(e,{props:[n]})),At(e,{props:ar(o,s)});break;case"::placeholder":_e(we(e,{props:[A(n,/:(plac\w+)/,":"+M+"input-$1")]})),_e(we(e,{props:[A(n,/:(plac\w+)/,":"+Ve+"$1")]})),_e(we(e,{props:[A(n,/:(plac\w+)/,T+"input-$1")]})),_e(we(e,{props:[n]})),At(e,{props:ar(o,s)});break}return""})}}var Ys={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1},se={},Me=typeof process<"u"&&se!==void 0&&(se.REACT_APP_SC_ATTR||se.SC_ATTR)||"data-styled",qr="active",Yr="data-styled-version",vt="6.1.19",Gt=`/*!sc*/
`,ut=typeof window<"u"&&typeof document<"u",Hs=!!(typeof SC_DISABLE_SPEEDY=="boolean"?SC_DISABLE_SPEEDY:typeof process<"u"&&se!==void 0&&se.REACT_APP_SC_DISABLE_SPEEDY!==void 0&&se.REACT_APP_SC_DISABLE_SPEEDY!==""?se.REACT_APP_SC_DISABLE_SPEEDY!=="false"&&se.REACT_APP_SC_DISABLE_SPEEDY:typeof process<"u"&&se!==void 0&&se.SC_DISABLE_SPEEDY!==void 0&&se.SC_DISABLE_SPEEDY!==""&&se.SC_DISABLE_SPEEDY!=="false"&&se.SC_DISABLE_SPEEDY),wt=Object.freeze([]),Fe=Object.freeze({});function Vs(e,r,o){return o===void 0&&(o=Fe),e.theme!==o.theme&&e.theme||r||o.theme}var Hr=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","track","u","ul","use","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"]),Js=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,Xs=/(^-|-$)/g;function cr(e){return e.replace(Js,"-").replace(Xs,"")}var Ks=/(a)(d)/gi,rt=52,dr=function(e){return String.fromCharCode(e+(e>25?39:97))};function Lt(e){var r,o="";for(r=Math.abs(e);r>rt;r=r/rt|0)o=dr(r%rt)+o;return(dr(r%rt)+o).replace(Ks,"$1-$2")}var Ct,Vr=5381,Pe=function(e,r){for(var o=r.length;o;)e=33*e^r.charCodeAt(--o);return e},Jr=function(e){return Pe(Vr,e)};function Zs(e){return Lt(Jr(e)>>>0)}function Qs(e){return e.displayName||e.name||"Component"}function St(e){return typeof e=="string"&&!0}var Xr=typeof Symbol=="function"&&Symbol.for,Kr=Xr?Symbol.for("react.memo"):60115,en=Xr?Symbol.for("react.forward_ref"):60112,tn={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},rn={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},Zr={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},on=((Ct={})[en]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},Ct[Kr]=Zr,Ct);function mr(e){return("type"in(r=e)&&r.type.$$typeof)===Kr?Zr:"$$typeof"in e?on[e.$$typeof]:tn;var r}var sn=Object.defineProperty,nn=Object.getOwnPropertyNames,ur=Object.getOwnPropertySymbols,an=Object.getOwnPropertyDescriptor,ln=Object.getPrototypeOf,hr=Object.prototype;function Qr(e,r,o){if(typeof r!="string"){if(hr){var s=ln(r);s&&s!==hr&&Qr(e,s,o)}var n=nn(r);ur&&(n=n.concat(ur(r)));for(var a=mr(e),i=mr(r),c=0;c<n.length;++c){var l=n[c];if(!(l in rn||o&&o[l]||i&&l in i||a&&l in a)){var d=an(r,l);try{sn(e,l,d)}catch{}}}}return e}function Te(e){return typeof e=="function"}function Dt(e){return typeof e=="object"&&"styledComponentId"in e}function Se(e,r){return e&&r?"".concat(e," ").concat(r):e||r||""}function fr(e,r){if(e.length===0)return"";for(var o=e[0],s=1;s<e.length;s++)o+=e[s];return o}function Je(e){return e!==null&&typeof e=="object"&&e.constructor.name===Object.name&&!("props"in e&&e.$$typeof)}function It(e,r,o){if(o===void 0&&(o=!1),!o&&!Je(e)&&!Array.isArray(e))return r;if(Array.isArray(r))for(var s=0;s<r.length;s++)e[s]=It(e[s],r[s]);else if(Je(r))for(var s in r)e[s]=It(e[s],r[s]);return e}function Bt(e,r){Object.defineProperty(e,"toString",{value:r})}function Xe(e){for(var r=[],o=1;o<arguments.length;o++)r[o-1]=arguments[o];return new Error("An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#".concat(e," for more information.").concat(r.length>0?" Args: ".concat(r.join(", ")):""))}var cn=function(){function e(r){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=r}return e.prototype.indexOfGroup=function(r){for(var o=0,s=0;s<r;s++)o+=this.groupSizes[s];return o},e.prototype.insertRules=function(r,o){if(r>=this.groupSizes.length){for(var s=this.groupSizes,n=s.length,a=n;r>=a;)if((a<<=1)<0)throw Xe(16,"".concat(r));this.groupSizes=new Uint32Array(a),this.groupSizes.set(s),this.length=a;for(var i=n;i<a;i++)this.groupSizes[i]=0}for(var c=this.indexOfGroup(r+1),l=(i=0,o.length);i<l;i++)this.tag.insertRule(c,o[i])&&(this.groupSizes[r]++,c++)},e.prototype.clearGroup=function(r){if(r<this.length){var o=this.groupSizes[r],s=this.indexOfGroup(r),n=s+o;this.groupSizes[r]=0;for(var a=s;a<n;a++)this.tag.deleteRule(s)}},e.prototype.getGroup=function(r){var o="";if(r>=this.length||this.groupSizes[r]===0)return o;for(var s=this.groupSizes[r],n=this.indexOfGroup(r),a=n+s,i=n;i<a;i++)o+="".concat(this.tag.getRule(i)).concat(Gt);return o},e}(),it=new Map,ht=new Map,lt=1,ot=function(e){if(it.has(e))return it.get(e);for(;ht.has(lt);)lt++;var r=lt++;return it.set(e,r),ht.set(r,e),r},dn=function(e,r){lt=r+1,it.set(e,r),ht.set(r,e)},mn="style[".concat(Me,"][").concat(Yr,'="').concat(vt,'"]'),un=new RegExp("^".concat(Me,'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')),hn=function(e,r,o){for(var s,n=o.split(","),a=0,i=n.length;a<i;a++)(s=n[a])&&e.registerName(r,s)},fn=function(e,r){for(var o,s=((o=r.textContent)!==null&&o!==void 0?o:"").split(Gt),n=[],a=0,i=s.length;a<i;a++){var c=s[a].trim();if(c){var l=c.match(un);if(l){var d=0|parseInt(l[1],10),u=l[2];d!==0&&(dn(u,d),hn(e,u,l[3]),e.getTag().insertRules(d,n)),n.length=0}else n.push(c)}}},pr=function(e){for(var r=document.querySelectorAll(mn),o=0,s=r.length;o<s;o++){var n=r[o];n&&n.getAttribute(Me)!==qr&&(fn(e,n),n.parentNode&&n.parentNode.removeChild(n))}};function pn(){return typeof __webpack_nonce__<"u"?__webpack_nonce__:null}var eo=function(e){var r=document.head,o=e||r,s=document.createElement("style"),n=function(c){var l=Array.from(c.querySelectorAll("style[".concat(Me,"]")));return l[l.length-1]}(o),a=n!==void 0?n.nextSibling:null;s.setAttribute(Me,qr),s.setAttribute(Yr,vt);var i=pn();return i&&s.setAttribute("nonce",i),o.insertBefore(s,a),s},xn=function(){function e(r){this.element=eo(r),this.element.appendChild(document.createTextNode("")),this.sheet=function(o){if(o.sheet)return o.sheet;for(var s=document.styleSheets,n=0,a=s.length;n<a;n++){var i=s[n];if(i.ownerNode===o)return i}throw Xe(17)}(this.element),this.length=0}return e.prototype.insertRule=function(r,o){try{return this.sheet.insertRule(o,r),this.length++,!0}catch{return!1}},e.prototype.deleteRule=function(r){this.sheet.deleteRule(r),this.length--},e.prototype.getRule=function(r){var o=this.sheet.cssRules[r];return o&&o.cssText?o.cssText:""},e}(),gn=function(){function e(r){this.element=eo(r),this.nodes=this.element.childNodes,this.length=0}return e.prototype.insertRule=function(r,o){if(r<=this.length&&r>=0){var s=document.createTextNode(o);return this.element.insertBefore(s,this.nodes[r]||null),this.length++,!0}return!1},e.prototype.deleteRule=function(r){this.element.removeChild(this.nodes[r]),this.length--},e.prototype.getRule=function(r){return r<this.length?this.nodes[r].textContent:""},e}(),bn=function(){function e(r){this.rules=[],this.length=0}return e.prototype.insertRule=function(r,o){return r<=this.length&&(this.rules.splice(r,0,o),this.length++,!0)},e.prototype.deleteRule=function(r){this.rules.splice(r,1),this.length--},e.prototype.getRule=function(r){return r<this.length?this.rules[r]:""},e}(),xr=ut,vn={isServer:!ut,useCSSOMInjection:!Hs},to=function(){function e(r,o,s){r===void 0&&(r=Fe),o===void 0&&(o={});var n=this;this.options=te(te({},vn),r),this.gs=o,this.names=new Map(s),this.server=!!r.isServer,!this.server&&ut&&xr&&(xr=!1,pr(this)),Bt(this,function(){return function(a){for(var i=a.getTag(),c=i.length,l="",d=function(m){var x=function(P){return ht.get(P)}(m);if(x===void 0)return"continue";var b=a.names.get(x),R=i.getGroup(m);if(b===void 0||!b.size||R.length===0)return"continue";var $="".concat(Me,".g").concat(m,'[id="').concat(x,'"]'),S="";b!==void 0&&b.forEach(function(P){P.length>0&&(S+="".concat(P,","))}),l+="".concat(R).concat($,'{content:"').concat(S,'"}').concat(Gt)},u=0;u<c;u++)d(u);return l}(n)})}return e.registerId=function(r){return ot(r)},e.prototype.rehydrate=function(){!this.server&&ut&&pr(this)},e.prototype.reconstructWithOptions=function(r,o){return o===void 0&&(o=!0),new e(te(te({},this.options),r),this.gs,o&&this.names||void 0)},e.prototype.allocateGSInstance=function(r){return this.gs[r]=(this.gs[r]||0)+1},e.prototype.getTag=function(){return this.tag||(this.tag=(r=function(o){var s=o.useCSSOMInjection,n=o.target;return o.isServer?new bn(n):s?new xn(n):new gn(n)}(this.options),new cn(r)));var r},e.prototype.hasNameForId=function(r,o){return this.names.has(r)&&this.names.get(r).has(o)},e.prototype.registerName=function(r,o){if(ot(r),this.names.has(r))this.names.get(r).add(o);else{var s=new Set;s.add(o),this.names.set(r,s)}},e.prototype.insertRules=function(r,o,s){this.registerName(r,o),this.getTag().insertRules(ot(r),s)},e.prototype.clearNames=function(r){this.names.has(r)&&this.names.get(r).clear()},e.prototype.clearRules=function(r){this.getTag().clearGroup(ot(r)),this.clearNames(r)},e.prototype.clearTag=function(){this.tag=void 0},e}(),wn=/&/g,yn=/^\s*\/\/.*$/gm;function ro(e,r){return e.map(function(o){return o.type==="rule"&&(o.value="".concat(r," ").concat(o.value),o.value=o.value.replaceAll(",",",".concat(r," ")),o.props=o.props.map(function(s){return"".concat(r," ").concat(s)})),Array.isArray(o.children)&&o.type!=="@keyframes"&&(o.children=ro(o.children,r)),o})}function kn(e){var r,o,s,n=Fe,a=n.options,i=a===void 0?Fe:a,c=n.plugins,l=c===void 0?wt:c,d=function(x,b,R){return R.startsWith(o)&&R.endsWith(o)&&R.replaceAll(o,"").length>0?".".concat(r):x},u=l.slice();u.push(function(x){x.type===pt&&x.value.includes("&")&&(x.props[0]=x.props[0].replace(wn,o).replace(s,d))}),i.prefix&&u.push(qs),u.push(Bs);var m=function(x,b,R,$){b===void 0&&(b=""),R===void 0&&(R=""),$===void 0&&($="&"),r=$,o=b,s=new RegExp("\\".concat(o,"\\b"),"g");var S=x.replace(yn,""),P=Gs(R||b?"".concat(R," ").concat(b," { ").concat(S," }"):S);i.namespace&&(P=ro(P,i.namespace));var C=[];return mt(P,Ws(u.concat(Us(function(z){return C.push(z)})))),C};return m.hash=l.length?l.reduce(function(x,b){return b.name||Xe(15),Pe(x,b.name)},Vr).toString():"",m}var jn=new to,Et=kn(),oo=Ie.createContext({shouldForwardProp:void 0,styleSheet:jn,stylis:Et});oo.Consumer;Ie.createContext(void 0);function gr(){return y.useContext(oo)}var Nn=function(){function e(r,o){var s=this;this.inject=function(n,a){a===void 0&&(a=Et);var i=s.name+a.hash;n.hasNameForId(s.id,i)||n.insertRules(s.id,i,a(s.rules,i,"@keyframes"))},this.name=r,this.id="sc-keyframes-".concat(r),this.rules=o,Bt(this,function(){throw Xe(12,String(s.name))})}return e.prototype.getName=function(r){return r===void 0&&(r=Et),this.name+r.hash},e}(),Cn=function(e){return e>="A"&&e<="Z"};function br(e){for(var r="",o=0;o<e.length;o++){var s=e[o];if(o===1&&s==="-"&&e[0]==="-")return e;Cn(s)?r+="-"+s.toLowerCase():r+=s}return r.startsWith("ms-")?"-"+r:r}var so=function(e){return e==null||e===!1||e===""},no=function(e){var r,o,s=[];for(var n in e){var a=e[n];e.hasOwnProperty(n)&&!so(a)&&(Array.isArray(a)&&a.isCss||Te(a)?s.push("".concat(br(n),":"),a,";"):Je(a)?s.push.apply(s,dt(dt(["".concat(n," {")],no(a),!1),["}"],!1)):s.push("".concat(br(n),": ").concat((r=n,(o=a)==null||typeof o=="boolean"||o===""?"":typeof o!="number"||o===0||r in Ys||r.startsWith("--")?String(o).trim():"".concat(o,"px")),";")))}return s};function ze(e,r,o,s){if(so(e))return[];if(Dt(e))return[".".concat(e.styledComponentId)];if(Te(e)){if(!Te(a=e)||a.prototype&&a.prototype.isReactComponent||!r)return[e];var n=e(r);return ze(n,r,o,s)}var a;return e instanceof Nn?o?(e.inject(o,s),[e.getName(s)]):[e]:Je(e)?no(e):Array.isArray(e)?Array.prototype.concat.apply(wt,e.map(function(i){return ze(i,r,o,s)})):[e.toString()]}function Sn(e){for(var r=0;r<e.length;r+=1){var o=e[r];if(Te(o)&&!Dt(o))return!1}return!0}var Rn=Jr(vt),$n=function(){function e(r,o,s){this.rules=r,this.staticRulesId="",this.isStatic=(s===void 0||s.isStatic)&&Sn(r),this.componentId=o,this.baseHash=Pe(Rn,o),this.baseStyle=s,to.registerId(o)}return e.prototype.generateAndInjectStyles=function(r,o,s){var n=this.baseStyle?this.baseStyle.generateAndInjectStyles(r,o,s):"";if(this.isStatic&&!s.hash)if(this.staticRulesId&&o.hasNameForId(this.componentId,this.staticRulesId))n=Se(n,this.staticRulesId);else{var a=fr(ze(this.rules,r,o,s)),i=Lt(Pe(this.baseHash,a)>>>0);if(!o.hasNameForId(this.componentId,i)){var c=s(a,".".concat(i),void 0,this.componentId);o.insertRules(this.componentId,i,c)}n=Se(n,i),this.staticRulesId=i}else{for(var l=Pe(this.baseHash,s.hash),d="",u=0;u<this.rules.length;u++){var m=this.rules[u];if(typeof m=="string")d+=m;else if(m){var x=fr(ze(m,r,o,s));l=Pe(l,x+u),d+=x}}if(d){var b=Lt(l>>>0);o.hasNameForId(this.componentId,b)||o.insertRules(this.componentId,b,s(d,".".concat(b),void 0,this.componentId)),n=Se(n,b)}}return n},e}(),ao=Ie.createContext(void 0);ao.Consumer;var Rt={};function zn(e,r,o){var s=Dt(e),n=e,a=!St(e),i=r.attrs,c=i===void 0?wt:i,l=r.componentId,d=l===void 0?function(I,g){var v=typeof I!="string"?"sc":cr(I);Rt[v]=(Rt[v]||0)+1;var N="".concat(v,"-").concat(Zs(vt+v+Rt[v]));return g?"".concat(g,"-").concat(N):N}(r.displayName,r.parentComponentId):l,u=r.displayName,m=u===void 0?function(I){return St(I)?"styled.".concat(I):"Styled(".concat(Qs(I),")")}(e):u,x=r.displayName&&r.componentId?"".concat(cr(r.displayName),"-").concat(r.componentId):r.componentId||d,b=s&&n.attrs?n.attrs.concat(c).filter(Boolean):c,R=r.shouldForwardProp;if(s&&n.shouldForwardProp){var $=n.shouldForwardProp;if(r.shouldForwardProp){var S=r.shouldForwardProp;R=function(I,g){return $(I,g)&&S(I,g)}}else R=$}var P=new $n(o,x,s?n.componentStyle:void 0);function C(I,g){return function(v,N,w){var G=v.attrs,L=v.componentStyle,D=v.defaultProps,U=v.foldedComponentIds,ne=v.styledComponentId,F=v.target,re=Ie.useContext(ao),V=gr(),J=v.shouldForwardProp||V.shouldForwardProp,k=Vs(N,re,D)||Fe,X=function(le,ce,j){for(var oe,ee=te(te({},ce),{className:void 0,theme:j}),de=0;de<le.length;de+=1){var me=Te(oe=le[de])?oe(ee):oe;for(var Z in me)ee[Z]=Z==="className"?Se(ee[Z],me[Z]):Z==="style"?te(te({},ee[Z]),me[Z]):me[Z]}return ce.className&&(ee.className=Se(ee.className,ce.className)),ee}(G,N,k),O=X.as||F,ie={};for(var K in X)X[K]===void 0||K[0]==="$"||K==="as"||K==="theme"&&X.theme===k||(K==="forwardedAs"?ie.as=X.forwardedAs:J&&!J(K,O)||(ie[K]=X[K]));var B=function(le,ce){var j=gr(),oe=le.generateAndInjectStyles(ce,j.styleSheet,j.stylis);return oe}(L,X),W=Se(U,ne);return B&&(W+=" "+B),X.className&&(W+=" "+X.className),ie[St(O)&&!Hr.has(O)?"class":"className"]=W,w&&(ie.ref=w),y.createElement(O,ie)}(z,I,g)}C.displayName=m;var z=Ie.forwardRef(C);return z.attrs=b,z.componentStyle=P,z.displayName=m,z.shouldForwardProp=R,z.foldedComponentIds=s?Se(n.foldedComponentIds,n.styledComponentId):"",z.styledComponentId=x,z.target=s?n.target:e,Object.defineProperty(z,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(I){this._foldedDefaultProps=s?function(g){for(var v=[],N=1;N<arguments.length;N++)v[N-1]=arguments[N];for(var w=0,G=v;w<G.length;w++)It(g,G[w],!0);return g}({},n.defaultProps,I):I}}),Bt(z,function(){return".".concat(z.styledComponentId)}),a&&Qr(z,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0}),z}function vr(e,r){for(var o=[e[0]],s=0,n=r.length;s<n;s+=1)o.push(r[s],e[s+1]);return o}var wr=function(e){return Object.assign(e,{isCss:!0})};function An(e){for(var r=[],o=1;o<arguments.length;o++)r[o-1]=arguments[o];if(Te(e)||Je(e))return wr(ze(vr(wt,dt([e],r,!0))));var s=e;return r.length===0&&s.length===1&&typeof s[0]=="string"?ze(s):wr(ze(vr(s,r)))}function Ot(e,r,o){if(o===void 0&&(o=Fe),!r)throw Xe(1,r);var s=function(n){for(var a=[],i=1;i<arguments.length;i++)a[i-1]=arguments[i];return e(r,o,An.apply(void 0,dt([n],a,!1)))};return s.attrs=function(n){return Ot(e,r,te(te({},o),{attrs:Array.prototype.concat(o.attrs,n).filter(Boolean)}))},s.withConfig=function(n){return Ot(e,r,te(te({},o),n))},s}var io=function(e){return Ot(zn,e)},ye=io;Hr.forEach(function(e){ye[e]=io(e)});const _n=()=>t.jsx(Pn,{children:t.jsxs("div",{className:"card",children:[t.jsxs("div",{className:"circle small top-left",children:[t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{})]}),t.jsxs("div",{className:"circle",children:[t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{})]}),t.jsxs("div",{className:"circle small bottom-right",children:[t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{}),t.jsx("span",{})]})]})}),Pn=ye.div`
  width: 100%;
  height: 100%;

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    background: #28282B;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 6px solid #F5F5DC;
    border-radius: 5px;
    transition: 0.5s;
    overflow: hidden;
  }

  .card .circle {
    width: 70%;
    height: 85%;
    border-radius: 50%;
    transform: skew(-25deg);
    border: 4px solid white;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .card .circle.small {
    position: absolute;
    width: 15%;
    height: 20%;
    border: 2px solid white;
  }

  .card .circle.top-left {
    top: 5%;
    left: 10%;
  }

  .card .circle.bottom-right {
    bottom: 5%;
    right: 10%;
  }

  .card:hover {
    cursor: pointer;
    transform: translate(0, -5px);
  }

  .card:hover:after, .card:hover:before {
    visibility: hidden;
  }

  .card .circle span:nth-child(1) {
    background-color: #FF2400;
    border-top-left-radius: 100%;
  }

  .card .circle span:nth-child(2) {
    background-color: #1F51FF;
    border-top-right-radius: 100%;
  }

  .card .circle span:nth-child(3) {
    background-color: #FFEA00;
    border-bottom-left-radius: 100%;
  }

  .card .circle span:nth-child(4) {
    background-color: #50C878;
    border-bottom-right-radius: 100%;
  }

  .card:before {
    content: '';
    position: absolute;
    height: 130%;
    width: 8%;
    background-color: aliceblue;
    opacity: 0.14;
    animation: glider 1.8s infinite linear;
    animation-delay: 0.05s;
  }

  .card:after {
    content: '';
    position: absolute;
    height: 120%;
    width: 6%;
    background-color: aliceblue;
    opacity: 0.1;
    animation: glider 1.8s infinite linear;
  }

  @keyframes glider {
    0% {
      transform: rotate(45deg) translate(-12em, 1.2em);
    }

    100% {
      transform: rotate(45deg) translate(18em, -2.8em);
    }
  }
`,Ln={red:"#cb0323",blue:"#0055ff",green:"#1fa64a",yellow:"#f2c400"},In=({color:e="red"})=>{const r=Ln[e];return t.jsx(En,{$color:r,children:t.jsx("div",{className:"card-container",children:t.jsxs("div",{className:"card",children:[t.jsxs("div",{className:"back",children:[t.jsx("div",{className:"red"}),t.jsx("div",{className:"text",children:"UNO"})]}),t.jsxs("div",{className:"front",children:[t.jsx("div",{className:"red"}),t.jsx("div",{className:"text-center",children:t.jsxs("svg",{viewBox:"0 0 48 48",children:[t.jsx("path",{fill:"#191f1f",d:"m 14.743552,27.197424 -1.439826,8.888133 c -0.03174,0.195936 0.11777,0.374416 0.316237,0.377509 l 9.360641,0.145882 1.344371,-1.179158 c 0.564803,-0.495394 0.539089,-1.356019 0.138635,-1.809376 l -0.917385,-1.038581 3.767647,-3.479011 c 3.109084,-2.870901 1.057476,-6.709966 0.770567,-6.996569 0.756364,1.018556 1.549631,1.587648 2.726324,0.463207 l 1.018375,-0.945401 1.436079,-8.944316 a 0.2950548,0.2950548 50.057903 0 0 -0.286204,-0.341785 l -9.366392,-0.162571 -1.255655,1.143726 c -0.463935,0.42258 -0.808482,1.236447 -0.243393,1.866828 l 0.943642,1.052673 -3.60197,3.194827 c -2.434455,2.115492 -2.358322,4.879113 -0.927458,7.357441 -1.098761,-1.90311 -2.23329,-1.355064 -3.784235,0.406542 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z",transform:"rotate(180,23.962004,23.841388)"})]})}),t.jsx("div",{className:"text-top",children:t.jsxs("svg",{viewBox:"0 0 48 48",children:[t.jsx("path",{fill:"#191f1f",d:"m 14.743552,27.197424 -1.439826,8.888133 c -0.03174,0.195936 0.11777,0.374416 0.316237,0.377509 l 9.360641,0.145882 1.344371,-1.179158 c 0.564803,-0.495394 0.539089,-1.356019 0.138635,-1.809376 l -0.917385,-1.038581 3.767647,-3.479011 c 3.109084,-2.870901 1.057476,-6.709966 0.770567,-6.996569 0.756364,1.018556 1.549631,1.587648 2.726324,0.463207 l 1.018375,-0.945401 1.436079,-8.944316 a 0.2950548,0.2950548 50.057903 0 0 -0.286204,-0.341785 l -9.366392,-0.162571 -1.255655,1.143726 c -0.463935,0.42258 -0.808482,1.236447 -0.243393,1.866828 l 0.943642,1.052673 -3.60197,3.194827 c -2.434455,2.115492 -2.358322,4.879113 -0.927458,7.357441 -1.098761,-1.90311 -2.23329,-1.355064 -3.784235,0.406542 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z",transform:"rotate(180,23.962004,23.841388)"})]})}),t.jsx("div",{className:"text-bottom",children:t.jsxs("svg",{viewBox:"0 0 48 48",children:[t.jsx("path",{fill:"#191f1f",d:"m 14.743552,27.197424 -1.439826,8.888133 c -0.03174,0.195936 0.11777,0.374416 0.316237,0.377509 l 9.360641,0.145882 1.344371,-1.179158 c 0.564803,-0.495394 0.539089,-1.356019 0.138635,-1.809376 l -0.917385,-1.038581 3.767647,-3.479011 c 3.109084,-2.870901 1.057476,-6.709966 0.770567,-6.996569 0.756364,1.018556 1.549631,1.587648 2.726324,0.463207 l 1.018375,-0.945401 1.436079,-8.944316 a 0.2950548,0.2950548 50.057903 0 0 -0.286204,-0.341785 l -9.366392,-0.162571 -1.255655,1.143726 c -0.463935,0.42258 -0.808482,1.236447 -0.243393,1.866828 l 0.943642,1.052673 -3.60197,3.194827 c -2.434455,2.115492 -2.358322,4.879113 -0.927458,7.357441 -1.098761,-1.90311 -2.23329,-1.355064 -3.784235,0.406542 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z"}),t.jsx("path",{fill:"#fffffd",d:"m 25.695312,15.503906 -4.234375,3.406249 c -1.206521,1.106493 -2.943121,3.745552 -0.311967,6.603761 0.05611,0.06095 0.153722,0.06567 0.216661,0.0118 l 7.454681,-6.381181 1.91767,2.327867 a 0.20414127,0.20414127 164.89444 0 0 0.359038,-0.09691 l 1.321929,-8.09898 a 0.22245666,0.22245666 49.630561 0 0 -0.219586,-0.258293 l -8.151173,0.0013 a 0.2092881,0.2092881 114.90739 0 0 -0.159876,0.344308 z",transform:"rotate(180,23.962004,23.841388)"})]})})]})]})})})},En=ye.div`
  width: 100%;
  height: 100%;

  .card-container {
    perspective: 800px;
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fffffd;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
  }

  .back {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 5%;
    border-radius: 0.6em;
    background: #191f1f;
    overflow: hidden;
    display: none;
  }

  .red {
    position: absolute;
    background: ${({$color:e})=>e};
    inset: 0;
    border-radius: 100%;
    transform-origin: center;
    transform: scale(0.875) skewX(-22.5deg);
  }

  .back .text {
    position: absolute;
    font-size: 3em;
    font-weight: 800;
    color: #e4c713;
    transform-origin: center;
    transform: rotate(-15deg) translateX(2px);
    text-shadow:
      1px 1px #f1e8ad,
      1px 0px #f1e8ad,
      1px -1px #f1e8ad,
      0px -1px #f1e8ad,
      -1px -1px #f1e8ad,
      -1px 0px #f1e8ad,
      -1px 1px #f1e8ad,
      -6px 5px #191f1f;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 5%;
    border-radius: 0.6em;
    background: ${({$color:e})=>e};
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .front .red {
    border: 0.35em solid #fffffd;
    transform: scale(0.92, 0.875) skewX(-22.5deg);
  }

  .text-center {
    position: absolute;
    width: 60%;
    color: white;
  }

  .text-top {
    position: absolute;
    top: -5%;
    left: -8%;
    width: 35%;
    color: white;
  }

  .text-bottom {
    position: absolute;
    bottom: -5%;
    right: -8%;
    width: 35%;
    color: white;
  }
`,On={red:"#cb0323",blue:"#0055ff",green:"#1fa64a",yellow:"#f2c400"},Mn=({color:e="red"})=>{const r=On[e];return t.jsx(Fn,{$color:r,children:t.jsx("div",{className:"card-container",children:t.jsx("div",{className:"card",children:t.jsxs("div",{className:"front",children:[t.jsx("div",{className:"oval"}),t.jsxs("div",{className:"draw-stack",children:[t.jsx("div",{className:"stacked-card card-1"}),t.jsx("div",{className:"stacked-card card-2"})]}),t.jsx("div",{className:"plus-two"}),t.jsx("div",{className:"text-top",children:"+2"}),t.jsx("div",{className:"text-bottom",children:"+2"})]})})})})},Fn=ye.div`
  width: 100%;
  height: 100%;

  .card-container {
    perspective: 800px;
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fffffd;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 5%;
    border-radius: 0.6em;
    background: ${({$color:e})=>e};
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .front .oval {
    position: absolute;
    background: ${({$color:e})=>e};
    border: 0.35em solid #fffffd;
    inset: 0;
    border-radius: 100%;
    transform-origin: center;
    transform: scale(0.92, 0.875) skewX(-22.5deg);
  }

  .draw-stack {
    position: absolute;
    width: 45%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stacked-card {
    position: absolute;
    width: 70%;
    height: 85%;
    background: ${({$color:e})=>e};
    border: 3px solid #fffffd;
    border-radius: 0.3em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .stacked-card.card-1 {
    transform: rotate(-15deg) translate(-15%, -10%);
  }

  .stacked-card.card-2 {
    transform: rotate(15deg) translate(15%, 10%);
  }

  .plus-two {
    position: absolute;
    font-size: 1.8em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      2px 2px 0 #191f1f,
      -1px -1px 0 #191f1f,
      1px -1px 0 #191f1f,
      -1px 1px 0 #191f1f;
    z-index: 10;
  }

  .text-top {
    position: absolute;
    top: 5%;
    left: 8%;
    font-size: 1em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
  }

  .text-bottom {
    position: absolute;
    bottom: 5%;
    right: 8%;
    font-size: 1em;
    font-weight: 900;
    color: #fffffd;
    transform: rotate(180deg);
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
  }
`,Tn=()=>t.jsx(Gn,{children:t.jsx("div",{className:"card-container",children:t.jsx("div",{className:"card",children:t.jsxs("div",{className:"front",children:[t.jsxs("div",{className:"circle",children:[t.jsx("span",{className:"red"}),t.jsx("span",{className:"blue"}),t.jsx("span",{className:"yellow"}),t.jsx("span",{className:"green"})]}),t.jsxs("div",{className:"draw-stack",children:[t.jsx("div",{className:"stacked-card card-1"}),t.jsx("div",{className:"stacked-card card-2"}),t.jsx("div",{className:"stacked-card card-3"}),t.jsx("div",{className:"stacked-card card-4"})]}),t.jsx("div",{className:"plus-four"}),t.jsx("div",{className:"text-top",children:"+4"}),t.jsx("div",{className:"text-bottom",children:"+4"})]})})})}),Gn=ye.div`
  width: 100%;
  height: 100%;

  .card-container {
    perspective: 800px;
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: #28282B;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
    border: 6px solid #F5F5DC;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 0;
    border-radius: 0.5em;
    background: #28282B;
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .circle {
    position: absolute;
    width: 70%;
    height: 85%;
    border-radius: 50%;
    transform: skew(-25deg);
    border: 4px solid white;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }

  .circle span {
    width: 100%;
    height: 100%;
  }

  .circle .red {
    background-color: #FF2400;
    border-top-left-radius: 100%;
  }

  .circle .blue {
    background-color: #1F51FF;
    border-top-right-radius: 100%;
  }

  .circle .yellow {
    background-color: #FFEA00;
    border-bottom-left-radius: 100%;
  }

  .circle .green {
    background-color: #50C878;
    border-bottom-right-radius: 100%;
  }

  .draw-stack {
    position: absolute;
    width: 40%;
    height: 45%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
  }

  .stacked-card {
    position: absolute;
    width: 55%;
    height: 70%;
    border: 2px solid #fffffd;
    border-radius: 0.2em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .stacked-card.card-1 {
    background: #FF2400;
    transform: rotate(-25deg) translate(-30%, -20%);
    z-index: 1;
  }

  .stacked-card.card-2 {
    background: #1F51FF;
    transform: rotate(-8deg) translate(-10%, -5%);
    z-index: 2;
  }

  .stacked-card.card-3 {
    background: #FFEA00;
    transform: rotate(8deg) translate(10%, 5%);
    z-index: 3;
  }

  .stacked-card.card-4 {
    background: #50C878;
    transform: rotate(25deg) translate(30%, 20%);
    z-index: 4;
  }

  .plus-four {
    position: absolute;
    font-size: 1.4em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      2px 2px 0 #191f1f,
      -1px -1px 0 #191f1f,
      1px -1px 0 #191f1f,
      -1px 1px 0 #191f1f;
    z-index: 10;
  }

  .text-top {
    position: absolute;
    top: 5%;
    left: 8%;
    font-size: 0.9em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
    z-index: 10;
  }

  .text-bottom {
    position: absolute;
    bottom: 5%;
    right: 8%;
    font-size: 0.9em;
    font-weight: 900;
    color: #fffffd;
    transform: rotate(180deg);
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
    z-index: 10;
  }

  .card:before {
    content: '';
    position: absolute;
    height: 130%;
    width: 8%;
    background-color: aliceblue;
    opacity: 0.14;
    animation: glider 1.8s infinite linear;
    animation-delay: 0.05s;
    z-index: 20;
  }

  .card:after {
    content: '';
    position: absolute;
    height: 120%;
    width: 6%;
    background-color: aliceblue;
    opacity: 0.1;
    animation: glider 1.8s infinite linear;
    z-index: 20;
  }

  @keyframes glider {
    0% {
      transform: rotate(45deg) translate(-12em, 1.2em);
    }
    100% {
      transform: rotate(45deg) translate(18em, -2.8em);
    }
  }
`,Dn={red:"#cb0323",blue:"#0055ff",green:"#1fa64a",yellow:"#f2c400"},Bn=({color:e="red"})=>{const r=Dn[e];return t.jsx(Wn,{$color:r,children:t.jsx("div",{className:"card-container",children:t.jsx("div",{className:"card",children:t.jsxs("div",{className:"front",children:[t.jsx("div",{className:"oval"}),t.jsx("div",{className:"skip-symbol",children:t.jsxs("svg",{viewBox:"0 0 100 100",children:[t.jsx("circle",{cx:"50",cy:"50",r:"40",fill:"none",stroke:"#fffffd",strokeWidth:"8"}),t.jsx("line",{x1:"20",y1:"80",x2:"80",y2:"20",stroke:"#fffffd",strokeWidth:"8",strokeLinecap:"round"})]})}),t.jsx("div",{className:"text-top",children:t.jsxs("svg",{viewBox:"0 0 100 100",children:[t.jsx("circle",{cx:"50",cy:"50",r:"35",fill:"none",stroke:"#fffffd",strokeWidth:"10"}),t.jsx("line",{x1:"22",y1:"78",x2:"78",y2:"22",stroke:"#fffffd",strokeWidth:"10",strokeLinecap:"round"})]})}),t.jsx("div",{className:"text-bottom",children:t.jsxs("svg",{viewBox:"0 0 100 100",children:[t.jsx("circle",{cx:"50",cy:"50",r:"35",fill:"none",stroke:"#fffffd",strokeWidth:"10"}),t.jsx("line",{x1:"22",y1:"78",x2:"78",y2:"22",stroke:"#fffffd",strokeWidth:"10",strokeLinecap:"round"})]})})]})})})})},Wn=ye.div`
  width: 100%;
  height: 100%;

  .card-container {
    perspective: 800px;
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fffffd;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 5%;
    border-radius: 0.6em;
    background: ${({$color:e})=>e};
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .front .oval {
    position: absolute;
    background: ${({$color:e})=>e};
    border: 0.35em solid #fffffd;
    inset: 0;
    border-radius: 100%;
    transform-origin: center;
    transform: scale(0.92, 0.875) skewX(-22.5deg);
  }

  .skip-symbol {
    position: absolute;
    width: 55%;
    height: 55%;
    z-index: 10;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4));
  }

  .skip-symbol svg {
    width: 100%;
    height: 100%;
  }

  .text-top {
    position: absolute;
    top: 3%;
    left: 5%;
    width: 25%;
    height: 25%;
    z-index: 10;
  }

  .text-top svg {
    width: 100%;
    height: 100%;
  }

  .text-bottom {
    position: absolute;
    bottom: 3%;
    right: 5%;
    width: 25%;
    height: 25%;
    transform: rotate(180deg);
    z-index: 10;
  }

  .text-bottom svg {
    width: 100%;
    height: 100%;
  }
`,Un={red:"#cb0323",blue:"#0055ff",green:"#1fa64a",yellow:"#f2c400",wild:"#111"},pe={xs:{width:"30px",height:"46px",fontSize:"0.5rem",centerSize:"1rem",radius:"4px"},sm:{width:"60px",height:"90px",fontSize:"0.75rem",centerSize:"1.5rem",radius:"6px"},md:{width:"100px",height:"150px",fontSize:"1rem",centerSize:"2.5rem",radius:"10px"},lg:{width:"140px",height:"220px",fontSize:"1.25rem",centerSize:"3.5rem",radius:"16px"}};function Le({color:e,value:r,faceUp:o=!0,onClick:s,disabled:n=!1,className:a="",size:i="md"}){const[c,l]=y.useState(!1);if(o){const d=String(r).toLowerCase();if(e==="wild"&&d==="wild_draw4")return t.jsx(Ye,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$size:i,children:t.jsx(Tn,{})});if(e==="wild"&&d==="wild")return t.jsx(Ye,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$size:i,children:t.jsx(_n,{})});if(d==="draw2")return t.jsx(Ye,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$size:i,children:t.jsx(Mn,{color:e})});if(d==="skip")return t.jsx(Ye,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$size:i,children:t.jsx(Bn,{color:e})});if(d==="reverse")return t.jsx(Ye,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$size:i,children:t.jsx(In,{color:e})})}return t.jsx(qn,{className:a,onClick:n?void 0:s,onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),$hovered:c,$disabled:n,$faceUp:o,$size:i,children:t.jsxs("div",{className:"card",children:[t.jsxs("div",{className:"back",children:[t.jsx("div",{className:"oval"}),t.jsx("div",{className:"uno-text",children:"UNO"})]}),t.jsxs("div",{className:"front",style:{background:Un[e]},children:[t.jsx("div",{className:"oval border"}),t.jsx("div",{className:"text top",children:r}),t.jsx("div",{className:"text center",children:r}),t.jsx("div",{className:"text bottom",children:r})]})]})})}const qn=ye.div`
  perspective: 900px;
  cursor: ${({$disabled:e})=>e?"not-allowed":"pointer"};
  opacity: ${({$disabled:e})=>e?.8:1};
  pointer-events: ${({$disabled:e})=>e?"none":"auto"};
  
  width: ${({$size:e})=>pe[e].width};
  height: ${({$size:e})=>pe[e].height};

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: ${({$size:e})=>pe[e].radius};
    transform-style: preserve-3d;
    transition: transform 0.4s ease, box-shadow 0.3s ease;

    transform: ${({$faceUp:e,$hovered:r})=>`
      rotateY(${e?"180deg":"0deg"})
      translateY(${r?"-10%":"0"})
    `};

    box-shadow: ${({$hovered:e})=>e?"0 15px 30px rgba(0,0,0,0.5)":"0 5px 10px rgba(0,0,0,0.3)"};
  }

  .back,
  .front {
    position: absolute;
    inset: 0;
    border-radius: ${({$size:e})=>pe[e].radius};
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid white;
  }

  .back {
    background: #111;
  }

  .front {
    transform: rotateY(180deg);
    color: white;
  }

  .oval {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 90%;
    height: 70%;
    border-radius: 100%;
    transform: skewX(-22deg);
    background: rgba(255, 255, 255, 0.15);
  }

  .uno-text {
    font-size: ${({$size:e})=>pe[e].centerSize};
    font-weight: 900;
    color: #f2c400;
    transform: rotate(-15deg);
    text-shadow: 2px 2px 0 #000;
  }

  .text {
    position: absolute;
    font-weight: 900;
    text-shadow: -1px -1px 0 #000, 1px 1px 0 #000;
  }

  .text.top {
    top: 8%;
    left: 10%;
    font-size: ${({$size:e})=>pe[e].fontSize};
  }

  .text.center {
    font-size: ${({$size:e})=>pe[e].centerSize};
  }

  .text.bottom {
    bottom: 8%;
    right: 10%;
    font-size: ${({$size:e})=>pe[e].fontSize};
    transform: rotate(180deg);
  }
`,Ye=ye.div`
  cursor: ${({$disabled:e})=>e?"not-allowed":"pointer"};
  opacity: ${({$disabled:e})=>e?.8:1};
  pointer-events: ${({$disabled:e})=>e?"none":"auto"};
  width: ${({$size:e})=>pe[e].width};
  height: ${({$size:e})=>pe[e].height};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  transform: ${({$hovered:e})=>e?"translateY(-10%)":"translateY(0)"};
  box-shadow: ${({$hovered:e})=>e?"0 15px 30px rgba(0,0,0,0.5)":"0 5px 10px rgba(0,0,0,0.3)"};
`,Yn={red:"hsl(0, 85%, 50%)",blue:"hsl(210, 100%, 45%)",green:"hsl(145, 70%, 40%)",yellow:"hsl(45, 100%, 50%)",wild:"linear-gradient(135deg, hsl(0, 85%, 50%), hsl(210, 100%, 45%), hsl(145, 70%, 40%), hsl(45, 100%, 50%))"};function Hn({gameState:e,isMyTurn:r,onDrawCard:o}){const s=typeof window<"u"&&window.innerWidth<640;return t.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10",children:t.jsxs("div",{className:"flex items-center gap-3 sm:gap-4 md:gap-8 lg:gap-12",children:[t.jsxs("div",{className:"text-center group",children:[t.jsx("p",{className:"text-white/80 mb-1 sm:mb-2 font-heading font-semibold text-xs sm:text-xs md:text-sm tracking-wide",children:"DRAW"}),t.jsxs("button",{onClick:o,disabled:!r,className:Vn("relative transition-transform duration-200",r&&"hover:scale-105 hover:-translate-y-1 active:scale-95"),children:[t.jsx("div",{className:"hidden sm:block absolute top-1 left-1 opacity-60",children:t.jsx(Le,{color:"wild",value:"",faceUp:!1,disabled:!0,size:"sm"})}),t.jsx("div",{className:"hidden sm:block absolute top-0.5 left-0.5 opacity-80",children:t.jsx(Le,{color:"wild",value:"",faceUp:!1,disabled:!0,size:"sm"})}),t.jsx(Le,{color:"wild",value:"",faceUp:!1,disabled:!r,size:"sm",className:r?"ring-2 ring-primary/50 animate-pulse-ring":""}),t.jsx("div",{className:"absolute -bottom-1 -right-1 bg-secondary text-white text-xs sm:text-[10px] md:text-xs px-2 sm:px-2 py-0.5 rounded-full font-bold border border-border shadow-lg",children:e.deckCount})]})]}),t.jsxs("div",{className:"flex flex-col items-center gap-1 sm:gap-2 md:gap-3",children:[t.jsx("p",{className:"text-white/80 text-xs sm:text-xs md:text-sm font-heading font-semibold tracking-wide",children:"COLOR"}),t.jsx("div",{className:"w-12 h-12 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border-3 sm:border-4 border-white/40 shadow-xl animate-float",style:{background:e.currentColor?Yn[e.currentColor]:"white"}})]}),t.jsxs("div",{className:"text-center",children:[t.jsx("p",{className:"text-white/80 mb-1 sm:mb-2 font-heading font-semibold text-xs sm:text-xs md:text-sm tracking-wide",children:"DISCARD"}),t.jsxs("div",{className:"relative",children:[t.jsx("div",{className:"hidden sm:block absolute top-1 left-1 opacity-30",children:t.jsx("div",{className:"w-8 h-12 sm:w-10 sm:h-14 md:w-12 md:h-[4.5rem] rounded-lg bg-gray-700"})}),e.topCard&&t.jsx(Le,{color:e.topCard.color,value:e.topCard.value,faceUp:!0,disabled:!0,size:"sm",className:"shadow-2xl card-glow"})]})]})]})})}function Vn(...e){return e.filter(Boolean).join(" ")}function Jn({playerName:e,playerHand:r,isMyTurn:o,pendingDraw:s,onCardClick:n,onRequestHand:a}){const[i,c]=y.useState(null),l=typeof window<"u"&&window.innerWidth<640;return t.jsx("div",{className:"w-full",children:t.jsxs("div",{className:"glass-panel mx-1 sm:mx-2 md:mx-4 mb-1 sm:mb-2 md:mb-4 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 max-w-5xl lg:mx-auto",children:[t.jsxs("div",{className:"flex justify-between items-center mb-2 sm:mb-3",children:[t.jsxs("div",{className:"flex items-center gap-2 sm:gap-2 md:gap-3",children:[t.jsx(Re,{name:e,size:l?"md":"sm"}),t.jsxs("div",{children:[t.jsxs("p",{className:"font-heading font-bold text-white text-sm sm:text-sm md:text-base",children:["Your Hand",t.jsxs("span",{className:"ml-1 sm:ml-2 text-muted-foreground font-normal",children:["(",r.length,")"]})]}),o&&t.jsxs("p",{className:"text-primary text-xs sm:text-xs md:text-sm font-bold flex items-center gap-1 text-shadow-glow",children:[t.jsx("span",{className:"animate-pulse",children:"🎯"})," YOUR TURN!"]})]})]}),s>0&&t.jsxs("div",{className:"bg-destructive text-white px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-lg sm:rounded-xl font-heading font-bold text-sm sm:text-sm md:text-base animate-pulse",children:["+",s]})]}),t.jsx("div",{className:"relative overflow-x-auto pb-1 sm:pb-2 scrollbar-hide",children:t.jsx("div",{className:"flex justify-center gap-0.5 sm:gap-1 min-w-min px-1 sm:px-2",children:r.length===0?t.jsxs("div",{className:"text-center py-4 sm:py-6 px-4 sm:px-8 w-full",children:[t.jsx("p",{className:"text-muted-foreground text-sm sm:text-sm mb-2 sm:mb-3",children:"No cards in hand"}),t.jsx("button",{onClick:a,className:"px-4 sm:px-4 py-2.5 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-sm sm:text-sm font-medium transition-colors",children:"🔄 Request Hand"})]}):r.map((d,u)=>{const x=(r.length-1)/2,b=u-x,R=l?b*.5:b*2,$=Math.abs(b)*(l?1:3),S=i===u;return t.jsx("div",{className:"relative transition-all duration-200 ease-out touch-manipulation",style:{transform:`
                        rotate(${S?0:R}deg) 
                        translateY(${S?-12:$}px)
                        scale(${S?1.05:1})
                      `,marginLeft:u>0?l?"-1rem":"-0.75rem":0,zIndex:S?50:u},onMouseEnter:()=>c(u),onMouseLeave:()=>c(null),onTouchStart:()=>c(u),onTouchEnd:()=>setTimeout(()=>c(null),300),children:t.jsx(Le,{color:d.color,value:d.value,faceUp:!0,onClick:()=>n(d),disabled:!o,size:"sm",className:Ce("transition-shadow duration-200",o&&S&&"ring-2 ring-primary shadow-xl")})},d.id)})})})]})})}function Xn({player:e,isCurrentTurn:r,position:o}){const s=typeof window<"u"&&window.innerWidth<640,n=o==="top"?s?4:7:s?3:5,a=Array.from({length:Math.min(e.handCount,n)},(d,u)=>u),i={top:"top-[5%] left-1/2 -translate-x-1/2",left:"left-[5%] top-1/2 -translate-y-1/2",right:"right-[5%] top-1/2 -translate-y-1/2","top-left":"top-[18%] left-[12%]","top-right":"top-[18%] right-[12%]"},c=o==="left"||o==="right",l=s?c?5:8:c?8:12;return t.jsx("div",{className:Ce("absolute z-20",i[o]),children:t.jsxs("div",{className:Ce("flex items-center gap-2 sm:gap-3","flex-col",o==="left"&&"flex-row",o==="right"&&"flex-row-reverse"),children:[t.jsxs("div",{className:Ce("glass-panel px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2","transition-all duration-300",r&&"ring-2 ring-primary turn-indicator shadow-lg shadow-primary/30"),children:[t.jsx(Re,{name:e.name,size:s?"md":"sm"}),t.jsxs("div",{className:"text-white",children:[t.jsx("p",{className:"font-heading font-semibold text-xs sm:text-xs md:text-sm whitespace-nowrap",children:e.name}),t.jsxs("p",{className:"text-[10px] sm:text-[10px] md:text-xs text-muted-foreground",children:[e.handCount," cards"]})]}),r&&t.jsx("span",{className:"text-primary text-xs sm:text-xs animate-pulse",children:"⭐"})]}),t.jsxs("div",{className:Ce("flex relative",c?"flex-col -space-y-6 sm:-space-y-10":"flex-row"),children:[a.map((d,u)=>{const m=(u-(a.length-1)/2)*l,x=c?o==="left"?-90:90:s?m*.3:m*.5;return t.jsx("div",{style:{transform:c?`rotate(${x}deg)`:`rotate(${x}deg) translateX(${m}px)`,marginLeft:!c&&d>0?s?"-1rem":"-1.5rem":0},className:"transition-transform duration-200",children:t.jsx(Le,{color:"wild",value:"",faceUp:!1,size:"xs",disabled:!0,className:"shadow-md"})},d)}),e.handCount>n&&t.jsxs("div",{className:Ce("flex items-center justify-center","w-5 h-7 sm:w-6 sm:h-9 md:w-8 md:h-12 rounded-md","bg-secondary/90 text-white text-[8px] sm:text-[10px] md:text-xs font-bold","border border-border shadow-md",c&&(o==="left"?"-rotate-90":"rotate-90")),children:["+",e.handCount-n]})]})]})})}function Kn({isOpen:e,onClose:r,onSelectColor:o}){return e?t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4",onClick:r,children:t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm w-full",onClick:s=>s.stopPropagation(),children:[t.jsx("h3",{className:"text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-white mb-3 sm:mb-4 md:mb-6 text-center",children:"Choose a Color"}),t.jsx("div",{className:"grid grid-cols-2 gap-2 sm:gap-3 md:gap-4",children:["red","blue","green","yellow"].map(s=>t.jsx("button",{onClick:()=>o(s),className:"w-full aspect-square rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation",style:{backgroundColor:s},title:s.toUpperCase()},s))})]})}):null}function Zn({isOpen:e,winner:r,onClose:o}){return e?t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4",children:t.jsxs("div",{className:"bg-gradient-to-br from-uno-blue to-uno-green p-8 sm:p-12 rounded-2xl text-center max-w-md w-full",children:[t.jsx("div",{className:"text-6xl sm:text-8xl mb-4 sm:mb-6",children:"🎉"}),t.jsx("h2",{className:"text-3xl sm:text-5xl font-poppins font-extrabold text-white mb-3 sm:mb-4",children:"Game Over!"}),t.jsxs("p",{className:"text-2xl sm:text-3xl text-white mb-6 sm:mb-8",children:[t.jsx("strong",{children:r})," wins!"]}),t.jsx("button",{onClick:o,className:"px-6 sm:px-8 py-3 sm:py-4 bg-white text-uno-blue font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base",children:"Back to Lobby"})]})}):null}function Qn({roomId:e,gameState:r,onAddBot:o,onStartGame:s,onLeave:n}){return t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"pt-32 px-4 max-w-4xl mx-auto",children:t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-2xl p-6 sm:p-12 text-center",children:[t.jsx("h2",{className:"text-3xl sm:text-4xl font-poppins font-bold text-white mb-4",children:"Waiting Room"}),t.jsxs("p",{className:"text-lg sm:text-xl text-gray-400 mb-8",children:["Room Code:"," ",t.jsx("span",{className:"text-uno-yellow font-mono",children:e})]}),t.jsxs("div",{className:"mb-8",children:[t.jsxs("h3",{className:"text-xl sm:text-2xl font-poppins font-bold text-white mb-6",children:["Players (",r.players.length,"/4)"]}),t.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6",children:[r.players.map(a=>t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx(Re,{name:a.name,isHost:a.id===r.players[0].id,isReady:!0,size:"lg"}),t.jsx("p",{className:"mt-3 text-white font-semibold text-sm sm:text-base",children:a.name}),a.isBot&&t.jsx("span",{className:"text-xs sm:text-sm text-gray-400",children:"Bot"})]},a.id)),Array.from({length:4-r.players.length}).map((a,i)=>t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx("div",{className:"w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-dark-600 flex items-center justify-center",children:t.jsx("span",{className:"text-2xl sm:text-4xl text-dark-600",children:"?"})}),t.jsx("p",{className:"mt-3 text-gray-500 text-sm sm:text-base",children:"Waiting..."})]},`empty-${i}`))]})]}),t.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center",children:[t.jsx("button",{onClick:o,disabled:r.players.length>=4,className:"px-6 sm:px-8 py-3 sm:py-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base",children:"➕ Add Bot"}),t.jsx("button",{onClick:s,disabled:r.players.length<2,className:"px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base",children:"🚀 Start Game"}),t.jsx("button",{onClick:n,className:"px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base",children:"🚪 Leave"})]})]})})]})}function ea({isOpen:e,isReconnecting:r,canReconnect:o,onReconnect:s,onDismiss:n}){return e?t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm",children:t.jsx("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full text-center",children:r?t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"text-6xl mb-4 animate-bounce",children:"🔄"}),t.jsx("h2",{className:"text-3xl font-poppins font-bold text-white mb-4",children:"Reconnecting..."}),t.jsx("p",{className:"text-gray-400 mb-6",children:"Checking if you were in a game..."}),t.jsx("div",{className:"flex justify-center",children:t.jsx("div",{className:"w-12 h-12 border-4 border-uno-blue border-t-transparent rounded-full animate-spin"})})]}):o?t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"text-6xl mb-4",children:"🎮"}),t.jsx("h2",{className:"text-3xl font-poppins font-bold text-white mb-4",children:"Game Found!"}),t.jsx("p",{className:"text-gray-400 mb-6",children:"You were disconnected from an active game. Would you like to rejoin?"}),t.jsxs("div",{className:"flex gap-3",children:[t.jsx("button",{onClick:n,className:"flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-colors",children:"Leave Game"}),t.jsx("button",{onClick:s,className:"flex-1 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300",children:"Rejoin Game"})]})]}):t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"text-6xl mb-4",children:"🔌"}),t.jsx("h2",{className:"text-3xl font-poppins font-bold text-white mb-4",children:"Connection Lost"}),t.jsx("p",{className:"text-gray-400 mb-6",children:"You were disconnected. No active game found to rejoin."}),t.jsx("button",{onClick:n,className:"w-full py-3 bg-uno-blue hover:bg-uno-blue/80 text-white font-semibold rounded-lg transition-colors",children:"Back to Lobby"})]})})}):null}function ta(){var ce;const{roomId:e}=fo(),r=Ge(),o=po(),{user:s}=De(),[n,a]=y.useState(null),[i,c]=y.useState([]),[l,d]=y.useState(!1),[u,m]=y.useState(null),[x,b]=y.useState(!1),[R,$]=y.useState(""),[S,P]=y.useState(""),[C,z]=y.useState(!1),[I,g]=y.useState(!1),[v,N]=y.useState(!1),[w,G]=y.useState(3e4),L=(s==null?void 0:s.id)||null,D=(n==null?void 0:n.currentPlayer)===L,U=y.useRef(!1),ne=((ce=o.state)==null?void 0:ce.reconnect)===!0,F=j=>{P(j),setTimeout(()=>P(""),3e3)},re=()=>{h.socket.emit("request_hand")};y.useEffect(()=>{if(!e||!L){r("/lobby");return}console.log("[Game] 🎬 Component mounted"),h.socket.connected||h.connect();let j=null;const oe=E=>{console.log("[Game] ✅ Game state received"),a(E),j&&(clearTimeout(j),j=null)},ee=E=>{console.log("[Game] 🎮 Game started"),a(E),F("Game started! 🎮"),setTimeout(()=>re(),500)},de=E=>{console.log("[Game] ✅ Hand update:",E.hand.length,"cards"),c(E.hand)},me=E=>{const Ke=n==null?void 0:n.players.find(co=>co.id===E.playerId);Ke&&F(`${Ke.name} played ${E.card.value}`)},Z=E=>{console.log("[Game] 🏆 Game over:",E),$(E.winner),b(!0),Q.clearCurrentRoom()},Wt=E=>{if(console.error("[Game] ❌ Error:",E),E.shouldReconnect){console.log("[Game] 🔄 Switching to reconnection mode..."),h.reconnectToGame(e);return}F(E.message)},Ut=E=>{console.log("[Game] 🔄 Server says we should reconnect"),h.reconnectToGame(E.roomId)},qt=E=>{console.log("[Game] 🎮 Game restored!"),a(E.gameState),c(E.yourHand||[]),F(E.message||"Reconnected successfully")},Yt=E=>{console.log("[Game] ❌ Reconnection failed:",E.message),F("Reconnection failed. Returning to lobby..."),Q.clearCurrentRoom(),setTimeout(()=>r("/lobby"),2e3)},Ht=E=>{F(`${E.playerName} reconnected`)},Vt=E=>{const Ke=Date.now()-E.startTime;G(E.duration-Ke)},Jt=E=>{F(`⏱️ ${E.playerName}'s turn timed out!`)},Xt=E=>{F(E.message),Q.clearCurrentRoom(),setTimeout(()=>r("/lobby"),3e3)};if(h.socket.on("game_state",oe),h.socket.on("game_started",ee),h.socket.on("hand_update",de),h.socket.on("card_played",me),h.socket.on("game_over",Z),h.socket.on("error",Wt),h.socket.on("should_reconnect",Ut),h.socket.on("game_restored",qt),h.socket.on("reconnection_failed",Yt),h.socket.on("player_reconnected",Ht),h.socket.on("turn_timer_started",Vt),h.socket.on("turn_timeout",Jt),h.socket.on("room_closing",Xt),U.current){console.log("[Game] Already joined/reconnected, skipping");return}U.current=!0;const Kt=Q.getCurrentRoom(),lo=Kt&&Kt.roomId===e;return ne||lo?(console.log("[Game] 🔄 Attempting reconnection to",e),h.reconnectToGame(e),j=setTimeout(()=>{n||(console.log("[Game] ⏱️ No response, requesting state..."),h.socket.emit("request_game_state",{roomId:e}))},3e3)):(console.log("[Game] ⚠️ Fresh navigation without join - requesting state"),h.socket.emit("request_game_state",{roomId:e}),j=setTimeout(()=>{n||(console.error("[Game] ❌ No game state - returning to lobby"),F("Failed to load game"),setTimeout(()=>r("/lobby"),2e3))},5e3)),()=>{j&&clearTimeout(j),h.socket.off("game_state",oe),h.socket.off("game_started",ee),h.socket.off("hand_update",de),h.socket.off("card_played",me),h.socket.off("game_over",Z),h.socket.off("error",Wt),h.socket.off("should_reconnect",Ut),h.socket.off("game_restored",qt),h.socket.off("reconnection_failed",Yt),h.socket.off("player_reconnected",Ht),h.socket.off("turn_timer_started",Vt),h.socket.off("turn_timeout",Jt),h.socket.off("room_closing",Xt),U.current=!1}},[e,L,r]);const V=()=>{console.log("[Game] 🔄 Reconnect function called but no room ID available")},J=()=>{console.log("[Game] ❌ User dismissed reconnection"),z(!1),N(!1),g(!1),Q.clearCurrentRoom(),r("/lobby")},k=j=>{if(!D){F("It's not your turn!");return}if(n&&n.pendingDraw>0&&!["draw2","wild_draw4"].includes(j.value)){F(`You must draw ${n.pendingDraw} cards!`);return}j.color==="wild"?(m(j),d(!0)):h.playCard(j.id)},X=j=>{u&&h.playCard(u.id,j),d(!1),m(null)},O=()=>{if(!D){F("It's not your turn!");return}h.drawCard()},ie=()=>{Q.clearCurrentRoom(),h.leaveRoom(),r("/lobby")};if(C)return t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx(ea,{isOpen:C,isReconnecting:I,canReconnect:v,onReconnect:V,onDismiss:J})]});if(!n)return t.jsx("div",{className:"min-h-screen bg-dark-900 flex items-center justify-center",children:t.jsxs("div",{className:"text-center",children:[t.jsx("div",{className:"text-6xl mb-4 animate-bounce",children:"🎮"}),t.jsx("p",{className:"text-xl text-gray-400 mb-2",children:"Loading game..."})]})});const K=n.players.find(j=>j.id===n.currentPlayer),B=n.players.find(j=>j.id===L),W=n.players.filter(j=>j.id!==L),le=j=>W.length===1?"top":W.length===2?j===0?"left":"right":j===0?"left":j===1?"top":"right";return n.gameStarted?t.jsxs("div",{className:"min-h-screen bg-dark-900 flex flex-col overflow-hidden",children:[t.jsx(he,{}),S&&t.jsx("div",{className:"fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-uno-blue text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-xs sm:text-base max-w-[90vw] sm:max-w-md text-center",children:S}),t.jsx("div",{className:"pt-12 sm:pt-20",children:t.jsx(Rs,{gameState:n,isMyTurn:D,currentPlayerName:K==null?void 0:K.name,turnTimeRemaining:w})}),t.jsxs("div",{className:"relative flex-1 bg-background overflow-hidden",children:[t.jsx("div",{className:"absolute inset-0 opacity-5 sm:opacity-10",children:t.jsx("div",{className:"absolute inset-0",style:{backgroundImage:"radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",backgroundSize:"24px 24px"}})}),t.jsx("div",{className:"absolute left-1/2 top-[42%] sm:top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10",children:t.jsxs("div",{className:"relative",children:[t.jsx("div",{className:`\r
                w-[85vw] h-[32vh]\r
                sm:w-[75vw] sm:h-[50vh]\r
                md:w-[65vw] md:h-[55vh]\r
                lg:w-[55vw] lg:h-[60vh]\r
                max-w-[480px]\r
                max-h-[380px]\r
                rounded-[50%]\r
                table-felt\r
                table-border-ring\r
              `}),t.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:t.jsx(Hn,{gameState:n,isMyTurn:D,onDrawCard:O})})]})}),t.jsx("div",{className:"block",children:W.map((j,oe)=>t.jsx(Xn,{player:j,isCurrentTurn:n.currentPlayer===j.id,position:le(oe)},j.id))}),t.jsx("div",{className:"fixed bottom-0 left-0 right-0 z-30",children:t.jsx(Jn,{playerName:(B==null?void 0:B.name)||"You",playerHand:i,isMyTurn:D,pendingDraw:n.pendingDraw,onCardClick:k,onRequestHand:re})}),D&&t.jsx("div",{className:"fixed top-12 sm:top-20 left-1/2 -translate-x-1/2 z-40",children:t.jsx("div",{className:"glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border-2 border-primary/50",children:t.jsx("span",{className:"font-heading text-primary font-bold text-sm sm:text-base animate-pulse",children:"⚡ Your Turn ⚡"})})})]}),t.jsx(Kn,{isOpen:l,onClose:()=>d(!1),onSelectColor:X}),t.jsx(Zn,{isOpen:x,winner:R,onClose:ie})]}):t.jsx(Qn,{roomId:e||"",gameState:n,onAddBot:()=>h.addBot(),onStartGame:()=>h.startGame(),onLeave:ie})}const Ne="http://localhost:3001";function ra(){const[e,r]=y.useState([]),[o,s]=y.useState([]),[n,a]=y.useState([]),[i,c]=y.useState(!0),[l,d]=y.useState(""),[u,m]=y.useState(""),[x,b]=y.useState(""),[R,$]=y.useState(!1);y.useEffect(()=>{S()},[]);async function S(){try{const g=localStorage.getItem("token"),[v,N,w]=await Promise.all([fetch(`${Ne}/api/friends`,{headers:{Authorization:`Bearer ${g}`},credentials:"include"}),fetch(`${Ne}/api/friends/requests`,{headers:{Authorization:`Bearer ${g}`},credentials:"include"}),fetch(`${Ne}/api/friends/sent`,{headers:{Authorization:`Bearer ${g}`},credentials:"include"})]);if(v.ok){const G=await v.json();r(G.friends)}if(N.ok){const G=await N.json();s(G.requests)}if(w.ok){const G=await w.json();a(G.sent)}}catch(g){console.error("Failed to load friends:",g)}finally{c(!1)}}async function P(g){g.preventDefault(),m(""),b(""),$(!0);try{const v=localStorage.getItem("token"),N=await fetch(`${Ne}/api/friends/request`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v}`},credentials:"include",body:JSON.stringify({username:l})});if(!N.ok){const w=await N.json();throw new Error(w.error)}b(`Friend request sent to ${l}!`),d(""),S()}catch(v){m(v.message)}finally{$(!1)}}async function C(g){try{const v=localStorage.getItem("token");(await fetch(`${Ne}/api/friends/accept/${g}`,{method:"POST",headers:{Authorization:`Bearer ${v}`},credentials:"include"})).ok&&(b("Friend request accepted!"),S())}catch{m("Failed to accept request")}}async function z(g){try{const v=localStorage.getItem("token");await fetch(`${Ne}/api/friends/reject/${g}`,{method:"POST",headers:{Authorization:`Bearer ${v}`},credentials:"include"}),S()}catch(v){console.error("Failed to reject request:",v)}}async function I(g){if(confirm("Remove this friend?"))try{const v=localStorage.getItem("token");await fetch(`${Ne}/api/friends/${g}`,{method:"DELETE",headers:{Authorization:`Bearer ${v}`},credentials:"include"}),S()}catch(v){console.error("Failed to remove friend:",v)}}return i?t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsx("div",{className:"flex items-center justify-center min-h-screen",children:t.jsxs("div",{className:"text-center",children:[t.jsx("div",{className:"text-6xl mb-4 animate-bounce",children:"👥"}),t.jsx("p",{className:"text-xl text-gray-400",children:"Loading friends..."})]})})]}):t.jsxs("div",{className:"min-h-screen bg-dark-900",children:[t.jsx(he,{}),t.jsxs("div",{className:"pt-24 pb-12 px-4 max-w-6xl mx-auto",children:[t.jsxs("div",{className:"mb-8",children:[t.jsx("h1",{className:"text-5xl font-poppins font-extrabold text-white mb-4",children:"Friends"}),t.jsx("p",{className:"text-xl text-gray-400",children:"Connect with other UNO players"})]}),u&&t.jsx("div",{className:"mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg",children:t.jsx("p",{className:"text-red-400",children:u})}),x&&t.jsx("div",{className:"mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg",children:t.jsx("p",{className:"text-green-400",children:x})}),t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-xl p-6 mb-8",children:[t.jsx("h2",{className:"text-2xl font-poppins font-bold text-white mb-4",children:"Add Friend"}),t.jsxs("form",{onSubmit:P,className:"flex gap-3",children:[t.jsx("input",{type:"text",value:l,onChange:g=>d(g.target.value),placeholder:"Enter username...",className:"flex-1 px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue",required:!0}),t.jsx("button",{type:"submit",disabled:R,className:"px-8 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50",children:R?"Sending...":"Send Request"})]})]}),t.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[o.length>0&&t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-xl p-6",children:[t.jsxs("h2",{className:"text-2xl font-poppins font-bold text-white mb-4",children:["Friend Requests (",o.length,")"]}),t.jsx("div",{className:"space-y-3",children:o.map(g=>t.jsxs("div",{className:"bg-dark-700 rounded-lg p-4 flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(Re,{name:g.requester.username,size:"sm"}),t.jsx("span",{className:"text-white font-semibold",children:g.requester.username})]}),t.jsxs("div",{className:"flex gap-2",children:[t.jsx("button",{onClick:()=>C(g.id),className:"px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors",children:"Accept"}),t.jsx("button",{onClick:()=>z(g.id),className:"px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors",children:"Reject"})]})]},g.id))})]}),n.length>0&&t.jsxs("div",{className:"bg-dark-800 border-2 border-dark-700 rounded-xl p-6",children:[t.jsxs("h2",{className:"text-2xl font-poppins font-bold text-white mb-4",children:["Sent Requests (",n.length,")"]}),t.jsx("div",{className:"space-y-3",children:n.map(g=>t.jsxs("div",{className:"bg-dark-700 rounded-lg p-4 flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(Re,{name:g.receiver.username,size:"sm"}),t.jsx("span",{className:"text-white font-semibold",children:g.receiver.username})]}),t.jsx("span",{className:"text-gray-400 text-sm",children:"Pending..."})]},g.id))})]})]}),t.jsxs("div",{className:"mt-8 bg-dark-800 border-2 border-dark-700 rounded-xl p-6",children:[t.jsxs("h2",{className:"text-2xl font-poppins font-bold text-white mb-6",children:["Your Friends (",e.length,")"]}),e.length===0?t.jsxs("div",{className:"text-center py-12",children:[t.jsx("div",{className:"text-6xl mb-4",children:"😢"}),t.jsx("p",{className:"text-xl text-gray-400 mb-2",children:"No friends yet"}),t.jsx("p",{className:"text-gray-500",children:"Add friends to play together!"})]}):t.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:e.map(g=>t.jsxs("div",{className:"bg-dark-700 rounded-lg p-4 flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(Re,{name:g.username,size:"md"}),t.jsxs("div",{children:[t.jsx("p",{className:"text-white font-semibold",children:g.username}),t.jsx("p",{className:"text-sm text-gray-400",children:"Friend"})]})]}),t.jsx("button",{onClick:()=>I(g.id),className:"text-red-400 hover:text-red-300 transition-colors",title:"Remove friend",children:"✕"})]},g.id))})]})]})]})}function oa(){return t.jsx(Ro,{children:t.jsx(xo,{future:{v7_startTransition:!0,v7_relativeSplatPath:!0},children:t.jsxs(go,{children:[t.jsx(ke,{path:"/login",element:t.jsx($o,{})}),t.jsx(ke,{path:"/register",element:t.jsx(zo,{})}),t.jsx(ke,{path:"/",element:t.jsx(Qe,{children:t.jsx(_o,{})})}),t.jsx(ke,{path:"/lobby",element:t.jsx(Qe,{children:t.jsx(Ss,{})})}),t.jsx(ke,{path:"/friends",element:t.jsx(Qe,{children:t.jsx(ra,{})})}),t.jsx(ke,{path:"/game/:roomId",element:t.jsx(Qe,{children:t.jsx(ta,{})})}),t.jsx(ke,{path:"*",element:t.jsx(yr,{to:"/login",replace:!0})})]})})})}$t.createRoot(document.getElementById("root")).render(t.jsx(Ie.StrictMode,{children:t.jsx(oa,{})}));
//# sourceMappingURL=index-Cqzx0-f7.js.map
