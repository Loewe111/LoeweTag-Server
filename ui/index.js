connected = true

async function main(){

  if(connected){
    deviceList = await window.devices.getDevices()
    table = document.getElementById("device-table");
    table.innerHTML = ""
    for([key, value] of Object.entries(deviceList)) {
      row = table.insertRow(-1)
      row.insertCell(-1).innerHTML = key
      row.insertCell(-1).innerHTML = value.type
      row.insertCell(-1).innerHTML = value.teamId
      row.insertCell(-1).innerHTML = value.firmwareString
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
}

async function selectPort(port){
  await window.serial.connectTo(serialDeviceList[port].path)
}

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Should not be used, but here if needed

// main()
setInterval(main, 1000)