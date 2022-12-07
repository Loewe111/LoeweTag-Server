/**
 * @fileoverview This file contains the interface class, which is used to communicate with the devices
 * @author Loewe_111
 * @version 1.0.0
 * @license MIT
 * @module interface 
 */


/**
 * Used to communicate with the devices
 * @param {serialport} ser - serialport object
 */
class interface {
  constructor(ser) {
    this.ser = ser
  }
  /**
   * Check if serial is connected
   * @returns {boolean} - true if serial is connected, false if not
   */
  checkSerial() {
    if (this.ser) {
      return true
    }
    return false
  }

  /**
   * Set the color of a device
   * @param {Array} colorArray - array of colors
   * @param {int} id - id of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setColor(colorArray, id) {
    if(!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(encodeMessages("color", colorArray, id)) // send color array to serial
    return true
  }

  /**
   * Set the gamestate
   * @param {int} state - gamestate
   * @param {int} id - id of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setGamestate(state, id) {
    if(!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(encodeMessage("gamestate", state, id)) // send gamestate to serial
    return true
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
   * @param {int} id - id of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   */
  setValues(values, id) {
    if(!this.checkSerial()) return false; // check if serial is connected, if not return false
    //check if all values are set
    if(values.HP == undefined || values.MHP == undefined || values.SP == undefined || values.MSP == undefined || values.ATK == undefined || values.RT == undefined || values.PTS == undefined || values.KILL == undefined) return false;

    this.ser.write(encodeMessage("values", [values.HP, values.MHP, values.SP, values.MSP, values.ATK, values.RT, values.PTS, values.KILL], id)) // send values to serial
    return true
  }

  /**
   * Send a custom message to the device
   * @param {string} type - type of message
   * @param {string} message - message
   * @param {int} id - id of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   * @deprecated should not be used for future reasons
   */
  sendMessage(type, message, id) {
    if(!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(encodeMessage(type, message, id)) // send custom message to serial
    return true
  }

  /**
   * Send multiple custom messages to the device
   * @param {string} type - type of message
   * @param {Array} messages - array of messages
   * @param {int} id - id of the device, leave undefined to send to all devices
   * @returns {boolean} - true on success
   * @deprecated should not be used for future reasons
   */
  sendMessages(type, messages, id) {
    if(!this.checkSerial()) return false; // check if serial is connected, if not return false
    this.ser.write(encodeMessages(type, messages, id)) // send custom messages to serial
    return true
  }

}

/**
 * Used to encode a message to send to every or a specific device
 * @param {string} type - type of message
 * @param {string} message - message
 * @param {int} id - id of the device, leave undefined to send to all devices
 */
function encodeMessage(type, message, id){
  if(id == undefined){
    buf = "@"+type+message+"\n"
  }else{
    buf = id+"@"+type+message+"\n"
  }
  return buf
}

/**
 * Used to encode multiple messages to send to every or a specific device
 * @param {string} type - type of message
 * @param {Array} messages - array of messages
 * @param {int} id - id of the device, leave undefined to send to all devices
*/
function encodeMessages(type, messages, id){
  if(id == undefined){
    buf = "@"+type
  }else{
    buf = id+"@"+type
  }
  for(i of messages){
    buf = buf + i + "#"
  }
  buf = buf.slice(0, -1)+"\n"
  return buf
}

module.exports = interface