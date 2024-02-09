/* For index.html */

// TODO: If a user clicks to create a chat, create an auth key for them
// and save it. Redirect the user to /chat/<chat_id>
const api_key = WATCH_PARTY_API_KEY
const user_id = WATCH_PARTY_USER_ID
function createChat() {

}

/* For chat.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.
const ALL_MESSAGES_URL = '/api/room/messages'
const POST_MESSAGE = '/api/room/post'
const UPDATE_USERNAME = '/api/update/username'
const UPDATE_PASSWORD = '/api/update/password'
const UPDATE_ROOM = '/api/update/room'
var prevNoMsgs = 0
var max_id = 0

let getAllMsgsRequest = {
    room_id: 0,
    maxId: 0
};

let postRequest = {
  room_id: 0,
  body: ''
};

let postUpdateNameRequest = {
  user_name: ''
};

let postUpdatePassRequest = {
  password: ''
};

let postUpdateRoomRequest = {
  name: '',
  room_id: 0
};


async function updateUsername(name) {
  postUpdateNameRequest.user_name = name;
  postMsg = await createUrl(UPDATE_USERNAME, postUpdateNameRequest, 'POST');
  // document.cookie = "user_id=" + name;
  return;
}

async function updatePassword(pass) {
  postUpdatePassRequest.password = pass;
  postMsg = await createUrl(UPDATE_PASSWORD, postUpdatePassRequest, 'POST')
  // document.cookie = "user_password=" + pass;
  return;
}

function toggleEditMode() {
  event.preventDefault();

  document.querySelector('.display').classList.add('hide');
  document.querySelector('.edit').classList.remove('hide');
}

async function saveRoomName(room_id, n) {
  console.log(n);
  postUpdateRoomRequest.name = n;
  postUpdateRoomRequest.room_id = room_id;
  var response = await createUrl(UPDATE_ROOM, postUpdateRoomRequest, 'POST');
  document.querySelector('.roomName').textContent = n;
  document.querySelector('.edit').classList.add('hide');
  document.querySelector('.display').classList.remove('hide');
}

async function createUrl(endPoint, requestBody, endType){
  let url = endPoint + "?" + Object.keys(requestBody).map((key) => key+"="+encodeURIComponent(requestBody[key])).join("&");

  let urlHeaders = new Headers();
  urlHeaders.append("Api-Key", api_key);
  urlHeaders.append("Accept", "application/json");
  urlHeaders.append("Content-Type", "application/json");
  urlHeaders.append("User-Id", user_id);
  if(endPoint == UPDATE_PASSWORD){
    urlHeaders.append("Password", Object.keys(requestBody).map((key) => requestBody[key]).join(''));
    url = endPoint;
  }

  const myInit = {
    method: endType,
    headers: urlHeaders,
  };
  data = await fetch(url, myInit);
  jsonForm = await data.json();
  return jsonForm
}

async function postMessage(room_id, body) {
  console.log(body);
  postRequest.room_id = room_id;
  postRequest.body = body;
  postMsg = await createUrl(POST_MESSAGE, postRequest, 'POST')
  document.getElementById("commentForm").reset();
  return;
}

async function getMessages(room_id) {
  getAllMsgsRequest.room_id = room_id;
  getAllMsgsRequest.maxId = max_id;
  let messages = await createUrl(ALL_MESSAGES_URL, getAllMsgsRequest, 'GET')
  let messagesDiv = document.body.querySelector(".messages");
  let child = messagesDiv.lastElementChild;
  while (child) {
    messagesDiv.removeChild(child);
    child = messagesDiv.lastElementChild;
  }

  Object.keys(messages).forEach(key => {
    let message = document.createElement("message");
    let author = document.createElement("author");
    author.innerHTML = messages[key].name;
    let content = document.createElement("content");
    content.innerHTML = messages[key].body;
    message.appendChild(author);
    message.appendChild(content);
    messagesDiv.append(message);
  });
  
  max_id = messagesDiv.max_id;
  return;
}

async function startMessagePolling(room_id) {
  setInterval(async () => {
    await getMessages(room_id);
  }, 100);
  return;
}
