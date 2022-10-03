serialConnected = false
serialPort = undefined

async function setup(){
  serialState = await window.serial.getState()
  serialConnected = serialState.isOpen
  serialPort = serialState.path
  if(serialConnected){
    document.getElementById("serial-dropdown").innerHTML = serialPort
    document.getElementById("serial-connect").innerHTML = "DISCONNECT"
    document.getElementById("serial-connect").classList.remove("disabled")
  }
}

async function main(){

  if(serialConnected){
    deviceList = await window.devices.getDevices()
    table = document.getElementById("device-table");
    table.innerHTML = ""
    for([key, value] of Object.entries(deviceList)) {
      row = table.insertRow(-1)
      row.insertCell(-1).innerHTML = key
      row.insertCell(-1).innerHTML = value.type
      row.insertCell(-1).innerHTML = value.teamId
      row.insertCell(-1).innerHTML = value.firmware
    }
  }else{
    serialDeviceList = await window.serial.getDevices()
    list = document.getElementById("serial-devices")
    if(serialDeviceList.length != 0){
      list.innerHTML = ""
      for(i in serialDeviceList){
        li = document.createElement("li")
        button = document.createElement("button")
        button.innerHTML = serialDeviceList[i].friendlyName
        button.classList = ["dropdown-item"]
        button.onclick = new Function("selectPort("+i+")")
        li.appendChild(button);
        list.appendChild(li);
      }
    }
  }
  serialState = await window.serial.getState()
  serialConnected = serialState.isOpen
}

async function selectPort(port){
  serialPort = serialDeviceList[port].path
  document.getElementById("serial-connect").classList.remove("disabled")
  document.getElementById("serial-dropdown").innerHTML = serialPort
}

async function connectSerial(){
  if(serialConnected){
    await window.serial.disconnect()
    document.getElementById("serial-connect").innerHTML = "CONNECT"
  }else{
    await window.serial.connectTo(serialPort)
    document.getElementById("serial-connect").innerHTML = "DISCONNECT"
  }
}


// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Should not be used, but here if needed

main()
setup()
setInterval(main, 1000)