
async function main(){
  gamestate = await window.game.getState()

  div = document.getElementById("gamestate")
  div.innerHTML = ""
  if(gamestate.gameid != undefined){
    group = document.createElement("div")
    group.classList = "container bg-danger p-2 mt-2 mb-4 rounded"
    description = document.createElement("h6")
    title = document.createElement("h4")
    button = document.createElement("button")
    button.classList = "btn tbn-lg btn-dark"
    button.style = "float: right"

    title.innerHTML = gamemodes[gamestate.gameid].name
    description.innerHTML = "SELECTED:"
    if(gamestate.running){
      button.innerHTML = "STOP GAME"
    }else{
      button.innerHTML = "START GAME"
    }
    button.onclick = new Function("start()")

    group.appendChild(description)
    group.appendChild(title)
    title.appendChild(button)
    div.appendChild(group)
  }
}

async function setup(){
  gamemodes = await window.game.getGamemodes()

  div = document.getElementById("gamemodes")
  Object.entries(gamemodes).forEach(([key, value]) => {
    group = document.createElement("div")
    group.classList = "container bg-danger p-2 my-2 rounded"
    title = document.createElement("h3")
    description = document.createElement("p")
    version = document.createElement("span")
    version.classList = "badge bg-dark"
    button = document.createElement("button")
    button.classList = "btn tbn-lg btn-dark"
    button.style = "float: right"

    title.innerHTML = value.name
    description.innerHTML = value.description
    version.innerHTML = value.versionString
    button.innerHTML = "SELECT"
    button.onclick = new Function("select('"+key+"')")

    group.appendChild(title)
    group.appendChild(description)
    title.appendChild(button)
    group.appendChild(version)
    div.appendChild(group)
  }) 
}

async function select(gamemode){
  window.game.selectGame(gamemode)
}

async function start(){
  if(gamestate.running){
    window.game.stopGame()
  }else{
    window.game.startGame()
  }
}

setup()
main()
setInterval(main, 1000)