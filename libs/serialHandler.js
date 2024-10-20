class serialHandler {
  constructor(callback) {
    this.port = null;
    this.callback = callback;
    this.dataBuffer = [];
    this.isReading = false;
  }

  message_types = { // enum message_type_t
    "MESSAGE_PING": 0x00,
    "MESSAGE_DEVICE_INFORMATION": 0x01,
    "MESSAGE_SET_GAMESTATE": 0x02,
    "MESSAGE_INIT_MASTER": 0x03,
    "MESSAGE_SET_COLOR": 0x10,
    "MESSAGE_SET_WEAPON": 0x11,
    "MESSAGE_SET_HEALTH": 0x12,
    "MESSAGE_HIT": 0x20,
    "MESSAGE_DEVICES_LIST": 0x21,
    "MESSAGE_REQUEST_INFO": 0x22,
  }

  // Structs:
  device(id, type, status) {
    return { id: id, type: type, status: status };
  }
  pistol_weapon(reloadType, reloadTime, power, active, beam=0) {
    return { reloadType: reloadType, reloadTime: reloadTime, power: power, active: active, beam: beam };
  }

  // Functions:
  uint16_from_buffer(buffer, offset) {
    return buffer[offset] + (buffer[offset + 1] << 8);
  }
  bytes_from_uint16(value) {
    return [value & 0xFF, value >> 8];
  }

  escape_buffer(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i] == 0x7F || data[i] == 0x7A || data[i] == 0x7B) {
        data.splice(i, 0, 0x7F);
        data[i + 1] ^= 0x20;
      }
    }
    return data;
  }

  unescape_buffer(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i] == 0x7F) {
        data[i] = data[i + 1] ^ 0x20;
        data.splice(i + 1, 1);
      }
    }
    return data;
  }

  dataHandler(data) { // data is a buffer
    data.forEach((byte) => {
      if (byte == 0x7A) {
        this.isReading = true;
        this.dataBuffer = [];
      } else if (byte == 0x7B) {
        this.isReading = false;
        this.dataBuffer = this.unescape_buffer(this.dataBuffer);   // unescape buffer
        this.message(this.dataBuffer);
      } else if (this.isReading) {
        this.dataBuffer.push(byte);
      } else {
        // print char
        process.stdout.write(String.fromCharCode(byte));
      }
    });
  }

  message(buffer) {
    let type = buffer[0];
    console.log("rx")
    console.log(type);
    if (type == this.message_types["MESSAGE_HIT"]) {
      this.callback(type, { 
        target: this.uint16_from_buffer(buffer, 1),
        shooter: this.uint16_from_buffer(buffer, 3),
      });
    } else if (type == this.message_types["MESSAGE_DEVICES_LIST"]) {
      devices = [];
      for (let i = 1; i < buffer.length; i += 4) {
        devices.push(this.device(this.uint16_from_buffer(buffer, i), buffer[i + 2], buffer[i + 3]));
      }
      console.log(devices);
      this.callback(type, devices);
    } else if (type == this.message_types["MESSAGE_REQUEST_INFO"]) {
      this.callback(type, {
        id: this.uint16_from_buffer(buffer, 1),
        reason: buffer[3],
      });
    }
  }

  send(type, data, target = 0xFFFF) {
    let buffer = [];
    buffer.push(...this.bytes_from_uint16(target))
    buffer.push(type);
    if (type == this.message_types["MESSAGE_SET_GAMESTATE"]) {
      buffer.push(data.state);
    } else if (type == this.message_types["MESSAGE_SET_COLOR"]) {
      buffer.push(data.r, data.g, data.b);
    } else if (type == this.message_types["MESSAGE_SET_WEAPON"]) {
      buffer.push(data.reloadType, ...this.bytes_from_uint16(data.reloadTime), ...this.bytes_from_uint16(data.power), data.active ? 0x01 : 0x00, data.beam);
    } else if (type == this.message_types["MESSAGE_SET_HEALTH"]) {
      buffer.push(data.health, data.maxHealth);
    }
    buffer = this.escape_buffer(buffer);
    buffer.unshift(0x7A);
    buffer.push(0x7B);
    this.port.write(buffer);
    console.log("tx");
    console.log(buffer);
  }
}

module.exports = serialHandler;