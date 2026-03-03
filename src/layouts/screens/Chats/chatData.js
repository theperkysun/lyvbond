export const chatUsers = [
  {
    id: "1",
    name: "Aditi Sharma",
    image: require("../../../assets/images/photomain4.jpeg"),
    lastMsg: "Hey, how are you?",
    time: "10:42 PM",
    unread: 3,
    online: true,
    messages: [
      // -------- 1 month chat history --------
      { id: "1m1", text: "Hey Aditi!", fromMe: true,  time: "2025-10-28T10:31:00" },
      { id: "1m2", text: "Long time no talk!", fromMe: true, time:"2025-10-28T10:32:00" },
      { id: "1m3", text: "Hey!! I know right 😄", fromMe:false,time:"2025-10-28T10:35:10" },

      // Week progression
      { id: "1m4", text:"How have you been?",fromMe:true,time:"2025-11-02T09:14:00" },
      { id:"1m5",text:"Pretty good, busy with work.",fromMe:false,time:"2025-11-02T09:18:00"},
      { id:"1m6",text:"Same here!",fromMe:true,time:"2025-11-02T09:19:00"},

      // more daily chats across month
      ...generateMonthMessages("Aditi Sharma")
    ],
  },

  {
    id: "2",
    name: "Neha Verma",
    image: require("../../../assets/images/photomain5.jpeg"),
    lastMsg: "I will call you later",
    time: "09:15 PM",
    unread: 1,
    online: true,
    messages: [
      { id:"2m1",text:"Good morning 🌞",fromMe:false,time:"2025-10-24T08:20" },
      { id:"2m2",text:"Morning Neha!",fromMe:true,time:"2025-10-24T08:21" },
      { id:"2m3",text:"Did you check the plan?",fromMe:true,time:"2025-10-24T08:23" },
      { id:"2m4",text:"Not yet, will tonight.",fromMe:false,time:"2025-10-24T09:15" },

      ...generateMonthMessages("Neha Verma")
    ],
  },

  {
    id: "3",
    name: "Priya Singh",
    image: require("../../../assets/images/photomain10.png"),
    lastMsg: "Okay noted",
    time: "07:58 PM",
    unread: 0,
    online: false,
    lastSeen:"2025-11-26T23:10:00",
    messages:[
      {id:"3m1",text:"How is work going Priya?",fromMe:true,time:"2025-10-22T20:40"},
      {id:"3m2",text:"Smooth, little hectic.",fromMe:false,time:"2025-10-22T20:45"},
      {id:"3m3",text:"Take care!",fromMe:true,time:"2025-10-22T21:00"},

      ...generateMonthMessages("Priya Singh")
    ]
  },

  {
    id: "4",
    name: "Ishita Rao",
    image: require("../../../assets/images/photomain6.png"),
    lastMsg: "Let's meet tomorrow",
    time: "06:12 PM",
    unread: 4,
    online:false,
    lastSeen:"2025-11-25T14:05",
    messages:[
      {id:"4m1",text:"Movie this weekend?",fromMe:true,time:"2025-10-20T18:20"},
      {id:"4m2",text:"YESSS!! ❤️",fromMe:false,time:"2025-10-20T18:22"},

      ...generateMonthMessages("Ishita Rao")
    ]
  },

  {
    id: "5",
    name: "Shruti More",
    image: require("../../../assets/images/photomain7.png"),
    lastMsg: "Nice to meet you!",
    time: "04:30 PM",
    unread:0,
    online:true,
    messages:[
      {id:"5m1",text:"Was great meeting you yesterday!",fromMe:false,time:"2025-10-29T22:12"},
      {id:"5m2",text:"Same here Shruti 😇",fromMe:true,time:"2025-10-29T22:13"},

      ...generateMonthMessages("Shruti More")
    ]
  },

  {
    id: "6",
    name: "Muskan Jain",
    image: require("../../../assets/images/photomain8.png"),
    lastMsg: "Send me details",
    time: "02:44 PM",
    unread: 2,
    online:true,
    messages:[
      {id:"6m1",text:"Hey Muskan, I mailed details ✔",fromMe:true,time:"2025-10-23T09:40"},
      {id:"6m2",text:"Got them!",fromMe:false,time:"2025-10-23T10:00"},

      ...generateMonthMessages("Muskan Jain")
    ]
  },

  {
    id: "7",
    name: "Sana Khan",
    image: require("../../../assets/images/photomain9.png"),
    lastMsg: "Sure, done.",
    time: "10:32 AM",
    unread:5,
    online:false,
    lastSeen:"2025-11-27T10:10",
    messages:[
      {id:"7m1",text:"Lets finalise date?",fromMe:true,time:"2025-10-19T08:10"},
      {id:"7m2",text:"Sure give me time slot.",fromMe:false,time:"2025-10-19T08:12"},

      ...generateMonthMessages("Sana Khan")
    ]
  },

  {
    id: "8",
    name: "Khushi Patel",
    image: require("../../../assets/images/photomain.png"),
    lastMsg: "Good Night",
    time: "Yesterday",
    unread:0,
    online:false,
    lastSeen:"2025-11-27T09:22",
    messages:[
      {id:"8m1",text:"Night Khushi 🌙",fromMe:true,time:"2025-10-30T23:10"},

      ...generateMonthMessages("Khushi Patel")
    ]
  },

  {
    id: "9",
    name: "Sneha Mehta",
    image: require("../../../assets/images/photoMain2.jpeg"),
    lastMsg: "Call me please",
    time: "Yesterday",
    unread:3,
    online:true,
    messages:[
      {id:"9m1",text:"Will call by 8PM",fromMe:true,time:"2025-10-31T14:42"},
      {id:"9m2",text:"Waiting 🙂",fromMe:false,time:"2025-10-31T14:44"},

      ...generateMonthMessages("Sneha Mehta")
    ]
  },

  {
    id: "10",
    name: "Riya Das",
    image: require("../../../assets/images/photomain3.jpeg"),
    lastMsg: "Where are you?",
    time: "Yesterday",
    unread:0,
    online:true,
    messages:[
      {id:"10m1",text:"Reached venue?",fromMe:false,time:"2025-10-15T18:05"},

      ...generateMonthMessages("Riya Das")
    ]
  },
];




// ======================================
//       CALL HISTORY — unchanged
// ======================================

// ================= FULL CALL HISTORY FOR ALL USERS ==================

export const callLogs = [

  /* ===================== 1) ADITI SHARMA — 15 CALLS ===================== */
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"outgoing",date:"25 Feb 2025",time:"09:23 PM",duration:"12m 48s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"incoming",date:"25 Feb 2025",time:"07:52 PM",duration:"08m 12s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"missed",date:"24 Feb 2025",time:"11:44 PM",duration:"Not connected"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"outgoing",date:"24 Feb 2025",time:"04:18 PM",duration:"26m 10s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"incoming",date:"24 Feb 2025",time:"01:07 PM",duration:"18m 21s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"incoming",date:"23 Feb 2025",time:"10:41 PM",duration:"05m 40s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"outgoing",date:"23 Feb 2025",time:"08:30 PM",duration:"11m 09s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"missed",date:"21 Feb 2025",time:"06:55 PM",duration:"Not connected"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"incoming",date:"20 Feb 2025",time:"03:17 PM",duration:"14m 54s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"outgoing",date:"19 Feb 2025",time:"09:32 PM",duration:"32m 33s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"incoming",date:"18 Feb 2025",time:"11:11 AM",duration:"04m 08s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"incoming",date:"17 Feb 2025",time:"06:22 PM",duration:"21m 46s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"outgoing",date:"17 Feb 2025",time:"01:54 PM",duration:"09m 29s"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"video",status:"missed",date:"16 Feb 2025",time:"10:11 AM",duration:"Not connected"},
  { userId:"1",name:"Aditi Sharma",image:require("../../../assets/images/photomain4.jpeg"),callType:"audio",status:"incoming",date:"15 Feb 2025",time:"08:42 PM",duration:"07m 15s"},


  /* ===================== 2) NEHA VERMA — 07 CALLS ===================== */
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"audio",status:"incoming",date:"24 Feb 2025",time:"09:18 PM",duration:"16m 10s"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"video",status:"missed",date:"23 Feb 2025",time:"06:12 PM",duration:"Not connected"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"audio",status:"outgoing",date:"22 Feb 2025",time:"03:42 PM",duration:"05m 40s"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"video",status:"incoming",date:"21 Feb 2025",time:"11:27 AM",duration:"19m 25s"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"audio",status:"incoming",date:"20 Feb 2025",time:"08:14 PM",duration:"08m 33s"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"video",status:"outgoing",date:"18 Feb 2025",time:"05:35 PM",duration:"13m 41s"},
  { userId:"2",name:"Neha Verma",image:require("../../../assets/images/photomain5.jpeg"),callType:"audio",status:"missed",date:"17 Feb 2025",time:"09:07 PM",duration:"Not connected"},


  /* ===================== 3) MUSKAN JAIN — 11 CALLS ===================== */
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"incoming",date:"25 Feb 2025",time:"08:22 PM",duration:"17m 27s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"video",status:"outgoing",date:"24 Feb 2025",time:"07:51 PM",duration:"09m 14s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"missed",date:"24 Feb 2025",time:"03:04 PM",duration:"Not connected"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"video",status:"incoming",date:"23 Feb 2025",time:"10:22 PM",duration:"22m 33s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"outgoing",date:"23 Feb 2025",time:"01:13 PM",duration:"11m 08s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"video",status:"incoming",date:"22 Feb 2025",time:"04:39 PM",duration:"27m 55s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"incoming",date:"21 Feb 2025",time:"12:44 PM",duration:"05m 12s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"video",status:"missed",date:"20 Feb 2025",time:"10:12 PM",duration:"Not connected"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"outgoing",date:"19 Feb 2025",time:"02:11 PM",duration:"14m 41s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"video",status:"incoming",date:"18 Feb 2025",time:"06:13 PM",duration:"32m 19s"},
  { userId:"6",name:"Muskan Jain",image:require("../../../assets/images/photomain8.png"),callType:"audio",status:"incoming",date:"17 Feb 2025",time:"11:21 AM",duration:"07m 42s"},


  /* ===================== 4) PRIYA SINGH — 05 CALLS ===================== */
  { userId:"3",name:"Priya Singh",image:require("../../../assets/images/photomain10.png"),callType:"video",status:"incoming",date:"24 Feb 2025",time:"08:29 PM",duration:"09m 14s"},
  { userId:"3",name:"Priya Singh",image:require("../../../assets/images/photomain10.png"),callType:"audio",status:"missed",date:"23 Feb 2025",time:"03:12 PM",duration:"Not connected"},
  { userId:"3",name:"Priya Singh",image:require("../../../assets/images/photomain10.png"),callType:"video",status:"outgoing",date:"22 Feb 2025",time:"01:42 PM",duration:"18m 04s"},
  { userId:"3",name:"Priya Singh",image:require("../../../assets/images/photomain10.png"),callType:"audio",status:"incoming",date:"20 Feb 2025",time:"10:07 AM",duration:"06m 19s"},
  { userId:"3",name:"Priya Singh",image:require("../../../assets/images/photomain10.png"),callType:"audio",status:"incoming",date:"19 Feb 2025",time:"05:55 PM",duration:"13m 11s"},

];





// ===================================================
//  UTILITY → auto generate long 30-day chat history
// ===================================================
function generateMonthMessages(name){
  const msgs = [];
  let timeBase = new Date("2025-10-28T12:00"); // starting from past date

  const sentences = [
    `Hi ${name}`, "What are you doing?", "Had lunch?", "Tell me more!",
    "I will message later.", "Cool 😀", "Busy right now!", "Call me?",
    "Let's meet soon!", "How was your day?", "Sounds good.",
    "Haha nice!", "Really?? 😂", "Interesting...", "Talk tomorrow!",
    "Good night 🌙", "Good morning ☀", "On the way!", "I'm outside.",
    "Eating dinner.", "Working now.", "Free after 6PM.", "I'm home.",
    "Text me later!", "Sure!", "Okay", "Noted ✔"
  ];

  for(let i=0;i<35;i++){
    const me = Math.random()>0.5;
    timeBase = new Date(timeBase.getTime() + (3600*1000 * (1 + Math.random()*8)));

    msgs.push({
      id: `${name}-auto-${i}`,
      text: sentences[Math.floor(Math.random()*sentences.length)],
      fromMe: me,
      time: timeBase.toISOString()
    });
  }

  return msgs;
}
