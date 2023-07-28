/**
 * @fileoverview This file contains the interface class, which is used to communicate with the devices
 * @author Loewe_111
 * @version 1.0.0
 * @license MIT
 * @module link
 */

/**
 * Used to communicate with the devices
 * @param {serialport} ser - serialport object
 */
class Link {
  constructor(ser) {
    this.ser = ser;
  }
  /**
   * Check if serial is connected
   * @returns {boolean} - true if serial is connected, false if not
   */
  checkSerial() {
    if (this.ser) {
      return true;
    }
    return false;
  }

  /**
   * Set the color of a device
   * @param {Array} colorArray - array of colors
   * @param {String} ip - ip of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setColor(colorArray, ip) {
    if (!this.checkSerial()) return false; // check if serial is connected, if not return false
    ip = getIP(ip);
    this.ser.write(getSendCommand(ip, {
      type: "color",
      color: colorArray
    })); // send color to serial
    return true;
  }

  /**
   * Set the gamestate
   * @param {int} state - gamestate
   * @param {String} ip - ip of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setGamestate(state, ip) {
    if (!this.checkSerial()) return false; // check if serial is connected, if not return false
    ip = getIP(ip);
    this.ser.write(getSendCommand(ip, {
      type: "gamestate",
      state: state
    })); // send gamestate to serial
    return true;
  }

  /**
   * Set the values of a device
   * @param {Object} values - Object of values
   * @param {int} values.HP - Health of the player
   * @param {int} values.MHP - Max Health of the player
   * @param {int} values.SP - Shield of the player
   * @param {int} values.MSP - Max Shield of the player
   * @param {int} values.ATK - Attack of the player
   * @param {int} values.RT - Reload Time of the player
   * @param {int} values.PTS - Points of the player
   * @param {int} values.KILL - Kills of the player
   *
   * @param {String} ip - ip of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setValues(values, ip) {
    if (!this.checkSerial()) return false; // check if serial is connected, if not return false
    ip = getIP(ip);
    //check if all values are set
    if (
      values.HP == undefined ||
      values.MHP == undefined ||
      values.SP == undefined ||
      values.MSP == undefined ||
      values.ATK == undefined ||
      values.RT == undefined ||
      values.PTS == undefined ||
      values.KILL == undefined
    )
      return false;

    this.ser.write(getSendCommand(ip, {
      type: "vars",
      HP:   values.HP,
      MHP:  values.MHP,
      SP:   values.SP,
      MSP:  values.MSP,
      ATK:  values.ATK,
      RT:   values.RT,
      PTS:  values.PTS,
      KILL: values.KILL,
    })); // send values to serial
    return true;
  }

  /**
   * Request Connected Devices
   */
  getDevices() {
    if (!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(JSON.stringify({
      type: "get_devices"
    }) + "\n"); // send get_devices command to serial
    return true;
  }

  /**
   * Request device info
   */
  getInformation() {
    if (!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(JSON.stringify({
      type: "information"
    }) + "\n"); // send get_info command to serial
    return true;
  }
}

/**
 * Generate a command to send to the device
 * @param {string} ip Ip of the receiving device
 * @param {Object} sendData Data to send
 * @returns {String} JSON Command to send
 */
function getSendCommand(ip, sendData) {
  return JSON.stringify({
    type: "send",
    ip: ip,
    content: JSON.stringify(sendData)
  }) + "\n";
}

/**
 * Returns the ip of the device or 255.255.255.255 if ip is undefined (broadcast)
 * @param {String} ip input ip
 * @returns {String} output ip
 */
function getIP(ip) {
  return ip ? ip : "255.255.255.255";
}

module.exports = Link;
