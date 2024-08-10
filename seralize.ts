type vfunc<T> = (x:unknown) => x is T

function isZeroType(x:unknown):x is ZEROType{
    return x==0 || x instanceof num
}
function isBool(x:unknown):x is boolean{
    return typeof x==="boolean"
}
function isNumber(x:unknown):x is number{
    return typeof x==="number"
}
function isNum(x:unknown):x is num{
    return x instanceof num
}
function isTuple4Number(x:unknown):x is [number,number,number,number]{
    if(!isArrayOf(x, isNumber)){
        return false
    }
    if(x.length!==4){
        return false
    }
    return true
}
function isArrayOf<T>(x:unknown, fn:vfunc<T>): x is Array<T>{
    if(!Array.isArray(x)){
        return false
    }
    for(let item of x){
        if(!fn(item)){
            return false
        }
    }
    return true
}
function numberOrNum(x:unknown):x is number|num{
    return isNumber(x)||x instanceof num
}
function isZero(x:unknown):x is 0{
    return x===0
}
function isNumArray(x:unknown):x is Array<number>{
    return isArrayOf(x, isNumber)
}
type ObjectValidator<T> = {[P in keyof T]:vfunc<T[P]>|ObjectValidator<T[P]>}

function isPerviousSpectrum(item:unknown):item is {time:number, amount:ZEROType}{
    return validate(item as {time:number, amount:ZEROType}, {time:isNumber, amount:isZeroType})
}

function _subValidate<T>(item:T, validator:ObjectValidator<T>|vfunc<T>, path:string, erors:Array<string>){
    if(typeof validator==="function"){
        if(!validator(item)){
            erors.push(`${path}=${item} fails validation ${validator.name}`)
        }
    }else{
        for(let key in validator){
            _subValidate(item[key], validator[key], path+"."+key, erors);
        }
    }
}
function isBar(item:unknown):item is bar{
    return item instanceof bar
}
function validate<T>(item:T, validator:ObjectValidator<T>){
    const errors:Array<string> = []
    _subValidate(item, validator, "obj", errors)
    if(errors.length){
        console.log(errors)
        return false
    }
    return true
}

const PlayerValidator:ObjectValidator<InitPlayer> = {
    version: function(x){
        return x === v
    },
    money:{red:isZeroType, green:isZeroType, blue:isZeroType},
    level: { red: isNumber, green: isNumber, blue: isTuple4Number},
    unlock: isBool,
    spliced: { red: numberOrNum, green: numberOrNum, blue: numberOrNum },
    spectrum: isZeroType,
    specced: isNumber,
    spectrumLevel: isNumArray,
    options:{ fast: isBool, fps: isNumber, notation: (x)=>x==="Default"||x==="Scientific" },
    spectrumTimer:isNumber,
    wastedTime:isNumber,
    sleepingTime:isNumber,
    previousSpectrums:(x)=>isArrayOf(x, (item)=>isPerviousSpectrum(item)),
    lastUpdate:isNumber,
    prism: {
        active: isBool,
        potency: { points: isZero, total: isZero, red: isNumber, green: isNumber, blue: isNumber },
        specbar: { red: isBool, green: isBool, blue: isBool },
        potencyEff: { red: numberOrNum, green: numberOrNum, blue: numberOrNum }, 
        cost: isNumber,
    },
    specbar: { red: isBool, green: isBool, blue: isBool},
    black: isNum,
    AB:{ red: isBool, green: isBool, blue: isBool },
    CM:isNumber,
    progress:isNumArray,
    advSpec:{unlock: isBool, multi: isNumber, max: isNumber, reduce: isNumber, time: isNumber, active: isBool, gain: isZeroType, SR: isZeroType},
    potencyEff: {red:numberOrNum, green:numberOrNum, blue:numberOrNum},
    bars:{red:isBar, green:isBar, blue:isBar}

}

function savePlayer(player:InitPlayer){
    return JSON.stringify(player, function(_, value){
        if(value instanceof num || value instanceof bar){
            return value.toJSON()
        }
        if(value instanceof Game){
            throw Error()
        }
        return value
    })
}
function loadPlayer(data:string):InitPlayer{
    const player = JSON.parse(data, function(key, value){
        if(typeof value==="object" && Object.keys(value).length===2){//TODO not sure if this instanceof check is required or not
            if(!(value instanceof num) && value.typ && typeof value.val==="number"){
                return deserlNum(value)
            }else if(!(value instanceof bar) && (typeof (value as barJSON).width==="number" || (value as barJSON).width instanceof num) && Array.isArray((value as barJSON).color) && (value as barJSON).color.length===3){
                const v = value as barJSON
                if(key==="red"||key==="green"||key==="blue"){
                    const nb = new bar(key, v.color[0], v.color[1], v.color[2], key+"Bar")
                    nb.width = v.width
                    return nb
                }
            }
        }
        return value
    })
    if(!validate(player, PlayerValidator)){
        throw Error("failure to load player")
    }
    return player
}
