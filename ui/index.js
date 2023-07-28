serialConnected = false;
serialPort = undefined;

deviceTypes = {
  master: "LoeweTag Link",
  pistol: "Pistol",
  unknown: "Unknown",
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
    table = document.getElementById("device-table");
    table.innerHTML = "";
    for ([key, value] of Object.entries(deviceList)) {
      row = table.insertRow(-1);
      row.insertCell(-1).innerHTML = key;
      row.insertCell(-1).innerHTML = value.id == 0 ? "" : value.id;
      row.insertCell(-1).innerHTML = (deviceTypes[value.type] || deviceTypes.unknown) + ` <span class="tooltip-text">${value.type}</span>`;
      // row.insertCell(-1).innerHTML = value.teamId
      row.insertCell(-1).innerHTML = value.firmware;
      actions = row.insertCell(-1);
      actions.classList = "actions";
      if (value.type != "master") {
        button = document.createElement("button");
        button.innerHTML = '<span class="material-symbols-rounded">my_location</span>  Locate';
        button.classList = ["btn btn-sm btn-primary"];
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
