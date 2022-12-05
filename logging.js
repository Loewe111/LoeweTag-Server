// Module for logging

// Logging Levels:
// 4: DEBUG, INFO, WARN, ERROR
// 3: INFO, WARN, ERROR
// 2: WARN, ERROR
// 1: ERROR
// 0: DISABLED

class Logging{ //
    constructor(level){
        this.level = level
    }
    debug (msg){
        if(this.level > 3){ //If level is 4, log debug messages
            if(typeof msg == "string"){ //If message is a string, log it, if not, log it as JSON
                console.error("[DEBUG] "+String(msg))
            }else{
                console.error("[DEBUG] "+JSON.stringify(msg))
            }
        }
    }
    info (msg){
        if(this.level > 2){ //If level is 4 or 3, log info messages
            if(typeof msg == "string"){
                console.error("[ INFO] "+String(msg))
            }else{
                console.error("[ INFO] "+JSON.stringify(msg))
            }
        }
    }
    warn (msg){
        if(this.level > 1){ //If level is 4, 3, or 2, log warn messages
            if(typeof msg == "string"){
                console.error("[ WARN] "+String(msg))
            }else{
                console.error("[ WARN] "+JSON.stringify(msg))
            }
        }
    }
    error (msg){
        if(this.level > 0){ //If level is 4, 3, 2, or 1, log error messages
            if(typeof msg == "string"){
                console.error("[ERROR] "+String(msg))
            }else{
                console.error("[ERROR] "+JSON.stringify(msg))
            }
        }
    }
}

module.exports = Logging //Export Logging class