serialConnected = false;
serialPort = undefined;

deviceTypes = {
  unknown: "Unknown",
  0: '<i class="fa-solid fa-satellite-dish"></i> LoeweTag Link',
  1: '<i class="fa-solid fa-gun"></i> Pistol',
}

deviceStatus = {
  0: '<i class="fa-solid fa-plug-circle-xmark"></i> Disconnected',
  1: '<i class="fa-solid fa-plug"></i> Connected',
}

async function setup() {
  serialState = await window.serial.getState();
  serialConnected = serialState.isOpen;
  serialPort = serialState.path;
  if (serialConnected) {
    document.getElementById("serial-dropdown").innerHTML = serialPort;
    document.getElementById("serial-connect").innerHTML = "DISCONNECT";
    document.getElementById("serial-connect").classList.remove("disabled");
  }
  main();
}

async function main() {
  if (serialConnected) {
    deviceList = await window.devices.getDevices();
    // Sort devices by type
    table = document.getElementById("device-table");
    table.innerHTML = "";
    for ([key, value] of Object.entries(deviceList).sort((a, b) => a[1].type - b[1].type)) {
      row = table.insertRow(-1);
      row.insertCell(-1).innerHTML = key;
      // row.insertCell(-1).innerHTML = value.id == 0 ? "" : value.id;
      row.insertCell(-1).innerHTML = `<span class="tooltip-text">${value.type}</span> ${(deviceTypes[value.type] || deviceTypes.unknown)}`;
      // row.insertCell(-1).innerHTML = value.teamId
      row.insertCell(-1).innerHTML = deviceStatus[value.status];
      actions = row.insertCell(-1);
      actions.classList = "actions";
      if (value.type != "master") {
        button = document.createElement("button");
        button.innerHTML = '<i class="fa-solid fa-compass"></i> Locate';
        button.classList = ["btn btn-sm btn-primary btn-symbol"];
        button.onclick = new Function("window.devices.locateDevice(\"" + key + "\")");
        actions.appendChild(button);
      }
    }
  } else {
    serialDeviceList = await window.serial.getDevices();
    list = document.getElementById("serial-devices");
    if (serialDeviceList.length != 0) {
      list.innerHTML = "";
      for (i in serialDeviceList) {
        li = document.createElement("li");
        button = document.createElement("button");
        button.innerHTML = serialDeviceList[i].friendlyName;
        button.classList = ["dropdown-item"];
        button.onclick = new Function("selectPort(" + i + ")");
        li.appendChild(button);
        list.appendChild(li);
      }
    }
  }
  serialState = await window.serial.getState();
  serialConnected = serialState.isOpen;
}

async function selectPort(port) {
  serialPort = serialDeviceList[port].path;
  document.getElementById("serial-connect").classList.remove("disabled");
  document.getElementById("serial-dropdown").innerHTML = serialPort;
}

async function connectSerial() {
  if (serialConnected) {
    await window.serial.disconnect();
    document.getElementById("serial-connect").innerHTML = "CONNECT";
  } else {
    await window.serial.connectTo(serialPort);
    document.getElementById("serial-connect").innerHTML = "DISCONNECT";
  }
}

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Should not be used, but here if needed

setup();
setInterval(main, 1000);
