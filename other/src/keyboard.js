function getKeyboard(){
    
    var excludeKeys = ['space']
    var excludeKeys = []

    var direction={
        x : 0,
        y : 0,
    }

    var keyboardHistory = []

    var keyDownMap={
        "0": false,
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
        "7": false,
        "8": false,
        "9": false,
        "none": false,
        "back": false,
        "menu": false,
        "backspace": false,
        "tab": false,
        "enter": false,
        "shift": false,
        "ctrl": false,
        "alt": false,
        "pause": false,
        "capslock": false,
        "escape": false,
        "space": false,
        "pageup": false,
        "pagedown": false,
        "end": false,
        "home": false,
        "left": false,
        "up": false,
        "right": false,
        "down": false,
        "select": false,
        "insert": false,
        "Delete": false,
        "a": false,
        "b": false,
        "c": false,
        "d": false,
        "e": false,
        "f": false,
        "g": false,
        "h": false,
        "i": false,
        "j": false,
        "k": false,
        "l": false,
        "m": false,
        "n": false,
        "o": false,
        "p": false,
        "q": false,
        "r": false,
        "s": false,
        "t": false,
        "u": false,
        "v": false,
        "w": false,
        "x": false,
        "y": false,
        "z": false,
        "num0": false,
        "num1": false,
        "num2": false,
        "num3": false,
        "num4": false,
        "num5": false,
        "num6": false,
        "num7": false,
        "num8": false,
        "num9": false,
        "*": false,
        "+": false,
        "-": false,
        "numdel": false,
        "/": false,
        "f1": false,
        "f2": false,
        "f3": false,
        "f4": false,
        "f5": false,
        "f6": false,
        "f7": false,
        "f8": false,
        "f9": false,
        "f10": false,
        "f11": false,
        "f12": false,
        "numlock": false,
        "scrolllock": false,
        ";": false,
        "semicolon": false,
        "equal": false,
        "=": false,
        ",": false,
        "comma": false,
        "dash": false,
        ".": false,
        "period": false,
        "forwardslash": false,
        "grave": false,
        "[": false,
        "openbracket": false,
        "backslash": false,
        "]": false,
        "closebracket": false,
        "quote": false,
        "dpadLeft": false,
        "dpadRight": false,
        "dpadUp": false,
        "dpadDown": false,
        "dpadCenter": false
    }
    var keyCodeMap={
        "0": "none",
        "6": "back",
        "8": "backspace",
        "9": "tab",
        "13": "enter",
        "16": "shift",
        "17": "ctrl",
        "18": "alt",
        "19": "pause",
        "20": "capslock",
        "27": "escape",
        "32": "space",
        "33": "pageup",
        "34": "pagedown",
        "35": "end",
        "36": "home",
        "37": "left",
        "38": "up",
        "39": "right",
        "40": "down",
        "41": "select",
        "45": "insert",
        "46": "Delete",
        "48": "0",
        "49": "1",
        "50": "2",
        "51": "3",
        "52": "4",
        "53": "5",
        "54": "6",
        "55": "7",
        "56": "8",
        "57": "9",
        "65": "a",
        "66": "b",
        "67": "c",
        "68": "d",
        "69": "e",
        "70": "f",
        "71": "g",
        "72": "h",
        "73": "i",
        "74": "j",
        "75": "k",
        "76": "l",
        "77": "m",
        "78": "n",
        "79": "o",
        "80": "p",
        "81": "q",
        "82": "r",
        "83": "s",
        "84": "t",
        "85": "u",
        "86": "v",
        "87": "w",
        "88": "x",
        "89": "y",
        "90": "z",
        "96": "num0",
        "97": "num1",
        "98": "num2",
        "99": "num3",
        "100": "num4",
        "101": "num5",
        "102": "num6",
        "103": "num7",
        "104": "num8",
        "105": "num9",
        "106": "*",
        "107": "+",
        "109": "-",
        "110": "numdel",
        "111": "/",
        "112": "f1",
        "113": "f2",
        "114": "f3",
        "115": "f4",
        "116": "f5",
        "117": "f6",
        "118": "f7",
        "119": "f8",
        "120": "f9",
        "121": "f10",
        "122": "f11",
        "123": "f12",
        "144": "numlock",
        "145": "scrolllock",
        "186": "semicolon",
        "187": "=",
        "188": "comma",
        "189": "dash",
        "190": "period",
        "191": "forwardslash",
        "192": "grave",
        "219": "openbracket",
        "220": "backslash",
        "221": "closebracket",
        "222": "quote",
        "1000": "dpadLeft",
        "1001": "dpadRight",
        "1003": "dpadUp",
        "1004": "dpadDown",
        "1005": "dpadCenter"
    }

    var gamepadMap={
        '0':'s',
        '1':'d',
        '2':'a',
        '3':'w',

        // '4':'L1',
        // '5':'R1',
        // '6':'L2',
        // '7':'R2',

        '6':'g',
        '7':'k',

        '4':'r',
        '5':'c',

        '8':'x',
        '9':'space',

        // '10':'L3',
        // '11':'R3',
        '10':'h',
        '11':'j',

        '12':'up',
        '13':'down',
        '14':'left',
        '15':'right',

        '16':'f5',
        // '17':'c',


    }

    function updateKeyboardHistory(){
        keyboardHistory.push(getStatus())
        if(keyboardHistory.length>60){
            keyboardHistory.shift()
        }
    }

    function getStatus(){
        var status = {}
        for(var i in keyDownMap){
            if(keyDownMap[i] && !excludeKeys.includes(i)){
                status[i] = true
            }
        }
        return status
    }

    function setStatus(status){
        for(var i in keyDownMap){
            if(status[i]){
                if(keyDownMap[i]==false){
                    onKeyDown(null,i)
                }
            }
            else{
                if(keyDownMap[i]==true){
                    onKeyUp(null,i)
                }
            }
        }
    }

    function setGamepadMap(_gamepadMap){
        gamepadMap=gamepadMap
    }

    function setStatueByGamepad(gamepad){
        var gamepadStatus=gamepad.buttons.map(button=>button.pressed)

        var status = {}
        gamepadStatus.forEach((state,index)=>{
            status[ gamepadMap[index] ] = state
        })
        setStatus(status)
    }

    function onKeyDown(keycode,_keyName){
        var keyName=_keyName || keyCodeMap[keycode]
        if(keyDownMap[keyName]){
            return
        }

        keyDownMap[keyName]=true

        switch(keyName){
            case 'right':
                direction.x=1
                break;
            case 'left':
                direction.x=-1
                break;
            case 'up':
                direction.y=1
                break;
            case 'down':
                direction.y=-1
                break;
            case 'space':
                break;
        }
    }

    function onKeyUp(keycode,_keyName){
        var keyName=_keyName || keyCodeMap[keycode]
        keyDownMap[keyName]=false

        if(keyDownMap.right)direction.x=1
        if(keyDownMap.left)direction.x=-1
        if(keyDownMap.up)direction.y=1
        if(keyDownMap.bottom)direction.bottom=-1

        if(!keyDownMap.right && !keyDownMap.left){
            direction.x=0
        }
        if(!keyDownMap.up && !keyDownMap.bottom){
            direction.y=0
        }
    }

    function checkHotKey(hotkey , historyKeyboards , frames = 0){

        var pressOn = hotkey[0] == '&'
        if(pressOn){
            hotkey = hotkey.replace('&','')
        }

        var hotkeyArr = []
        hotkey.split('+').reverse().forEach((keyName)=>{
            hotkeyArr.push({ keyName , value : true })
            hotkeyArr.push({ keyName , value : false })
        })

        if(pressOn){
            hotkeyArr.pop()
        }
        

        if(frames==0){
            frames = hotkeyArr.length * 2
        }

        historyKeyboards=historyKeyboards||keyboardHistory

        var hotkeyIndex = -1
        var matchLength = 0
        var keys = historyKeyboards.slice(-frames).reverse()


        var checkTrue = keys.some((status,index)=>{
            var keyStatus = hotkeyArr[matchLength]
            if(keyStatus.value == !!status[keyStatus.keyName]){

                if(hotkeyIndex==-1){

                    var _index=keys.slice(index).findIndex((_status)=>{
                        return _status[keyStatus.keyName] != status[keyStatus.keyName]
                    })

                    if(_index==-1){
                        hotkeyIndex = index
                    }
                    else{
                        hotkeyIndex = index+ _index-1
                    }
                }

                matchLength++
                if(matchLength == hotkeyArr.length){
                    return true
                }
            }
            return false  
        })

        if(checkTrue){
            return hotkeyIndex
        }

        return -1
    }

    function init(){
        if(init.isRun){
            return
        }
        init.isRun = true

        document.addEventListener('keydown',(e)=>{
            onKeyDown(e.keyCode)
        },true)
        document.addEventListener('keyup',(e)=>{
            onKeyUp(e.keyCode)
        },true)
    }

    return {
        onKeyDown , 
        onKeyUp , 
        init ,
        direction , 
        keyDownMap ,
        getStatus , 
        setStatus ,
        setGamepadMap ,
        setStatueByGamepad ,
        checkHotKey ,
        keyboardHistory ,
        updateKeyboardHistory
    }

}
