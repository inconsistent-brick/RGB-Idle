//TODO errors should probably be really obvious and in people's face
const v = 1.12;
const BAR_KEYS:Array<"red"|"green"|"blue"> = ["red", "green", "blue"]
const PLAYER_MONEY_KEYS:Array<"red"|"green"|"blue"> = BAR_KEYS

type ZEROType = 0|num
interface ResetPlayer{
    version: typeof v,
    money:{red:ZEROType, green:ZEROType, blue:ZEROType},
    level: { red: number, green: number, blue: [number,number,number,number]},
    unlock: boolean,
    spliced: { red: number|num, green: number|num, blue: number|num },
    spectrum: ZEROType,
    specced: number,
    spectrumLevel: Array<number>,
    options:{ fast: boolean, fps: number, notation: "Default"|"Scientific" },
    spectrumTimer:number,
    wastedTime:number,
    sleepingTime:number,
    previousSpectrums:Array<{time:number, amount:ZEROType}>,
    lastUpdate:number,
    prism: {
        active: boolean,
        potency: { points: 0, total: 0, red: number, green: number, blue: number },
        specbar: { red: boolean, green: boolean, blue: boolean },
        potencyEff: { red: number|num, green: number|num, blue: number|num }, 
        cost: number,
   },
   specbar: { red: boolean, green: boolean, blue: boolean},
   black: num,
   AB:{ red: boolean, green: boolean, blue: boolean },
   CM:number,
   progress:Array<number>,
   advSpec:{unlock: boolean, multi: number, max: number, reduce: number, time: number, active: boolean, gain: ZEROType, SR: ZEROType},
   potencyEff: {red:number|num, green:number|num, blue:number|num},
}

const resetplayer:ResetPlayer = {
    version:v,
    money: { red: 0, green:0, blue:0 },
    level: { red: 0, green: 0, blue: [0,0,0,0]},
    unlock: false,
    spliced: { red: 0, green: 0, blue: 0 },
    spectrum: 0,
    specced: 0,
    spectrumLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1,-1,-1],
    options: { fast: false, fps: 50, notation: "Default" },
    spectrumTimer: 0,
    wastedTime: 0,
    sleepingTime:0,
    previousSpectrums: [{ time: 0, amount:0}, { time: 0, amount:0}, { time: 0, amount: 0}, { time: 0, amount: 0}, { time: 0, amount: 0}],
    lastUpdate: Date.now(),
    prism: {
         active: false,
         potency: { points: 0, total: 0, red: -1, green: -1, blue: -1 },
         specbar: { red: false, green: false, blue: false },
         potencyEff: { red: 1 / 256, green: 1 / 256, blue: 1 / 256 }, 
         cost: 0,
    },
    specbar: { red: false, green: false, blue: false},
    black: new num(0),
    AB: { red: true, green: true, blue: true },
    CM: 1,
    progress: [],
    advSpec: { unlock: false, multi: 1, max: 50, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 },
    potencyEff: {red:1/256, green:1/256,blue:1/256},
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



type barJSON = {
    width:number|num,
    color:[number, number, number]
}
class bar{
    element:HTMLElement
    name:"red"|"green"|"blue"
    color:[number, number, number]
    width:number|num
    mouse:number
    constructor(n:"red"|"green"|"blue",r:number,g:number,b:number,elemid:string){
        this.name = n;
        this.color = [r, g, b];
        this.width = 0;
        const element = document.getElementById(elemid);
        if(element===null){
            throw Error("failure to init bar with id "+elemid)
        }
        this.element = element
        this.mouse = 0;    
    }
    draw(game:Game, dif:number) {
        const player = game.player
        if (this.mouse == 1) {
            player.CM += 5 * (dif / 1000);
            increase(game, Log.multi(Log.multi(game.click, 50), (dif / 1000)),dif);
        } else if (this.name == "red" && player.CM > 1 && player.spectrumLevel[3] === 0) {
            player.CM -= 7.5 * (dif / 1000);
            player.CM = Math.max(player.CM, 1);
        }
        let getParm1
        if(this.name==="red"){
            getParm1 = Log.multi(
                Log.add(Log.div(game.auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? game.click : 0)), game.IR)
        }else if(this.name==="green"){
            getParm1 = Log.div(Log.multi(Log.multi(Log.add(Log.div(game.auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? game.click : 0)), game.IR), game.IG), 256)
        }else{
            getParm1 = Log.div(Log.multi(Log.multi(Log.multi(Log.add(Log.div(game.auto, 1000 / player.options.fps), (player.bars.red.mouse === 1 ? game.click : 0)), game.IR), game.IG), game.IB), 65536)
        }
        if (Log.get(getParm1, "log") > Math.log10(32)){
            this.element.style.width = "100%";
        }
        else{
            this.element.style.width = Log.get(Log.div(this.width,2.56),"num") + "%";
        }
        this.element.style.background = RGBstring(this.color);
    }
    setup(game:Game) {
        const temp = this.name;
        const partentNode = this.element.parentElement
        if(partentNode===null){
            throw Error("failure to init par parent")
        }
        partentNode.onmousedown = function () { press(game, temp, 1) };
        partentNode.onmouseup = function () { press(game, temp, 0) };
        partentNode.onmouseleave = function () { press(game,temp, 0) };
        partentNode.ontouchstart = function () { press(game,temp, 1) };
        (partentNode as any).ontouchstop = function () { press(game,temp, 0) };
        partentNode.ontouchcancel = function () { press(game,temp, 0) };
    }
    toJSON(){
        return { width: this.width, color: this.color }
    }
}


class Game{
    p3 = true;
    p10 = 0;
    ABInt = {red:2000,green:2000,blue:2000};
    Cores:number|num = 1;
    Clock:number|num = 1;
    RUM = 1;

    tab:"RGB"|"Spectrum"|"Settings"|"Stats"|"Upgrades" = "RGB";
    subtab = {spectrum:"Upgrades" as const}
    price = { red: 5 as number|num, green: 5  as number|num, blue: [0 as 0|num, 0 as 0|num, 0 as 0|num, 0 as 0|num] };
    income = {red:0 as 0|num, green:0 as 0|num, blue: 0 as 0|num};
    click:number|num = 5;
    auto:number|num = 0;
    IG:num|0 = 0;
    IR:num|0 = 0;
    IB:number|num = 8;
    RSS = 0;
    PD = 0;
    BPD:number|num = 0;
    SR:num|0 = 0;
    SR5:num|0 = 0;
    SpecPrice = [1, 1, 3, 5, 5, 7, 10, 30, 50, 75, 300, 500, 1500, 2500, 25000, 100000, 1e10, 1e13, 1e25, 1e35, 1e50];
    ABcount = 0 

    mixCost:number|undefined|num;
    blackBar:boolean|undefined;
    colorBar:boolean|undefined;

    player:InitPlayer
    domBindings:DomBindings

    mainLoop:number
    ABLoop:number
    autoSave:number
    constructor(){
        let player = {
            ...resetplayer,
            bars:{ red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") }
        }
        player.bars.red.setup(this);
        let loadedSave = load();
        this.domBindings = doBinds(this)
        if (loadedSave != false) {
            if (loadedSave.version >= 1){
                 player = Object.assign(player, loadedSave)
            }
            if (player.version < 1.1) {
                for (var i = 0; i < 3; i++){
                    player.spectrumLevel.push(-1);
                }
                player.AB = { red: true, green: true, blue: true };
                player.CM = 1;
                player.black = new num(0);
                player.progress = [];
                player.potencyEff = { red: 1 / 256, green: 1 / 256, blue: 1 / 256 };
                player.prism = {
                    active: false,
                    potency :{red:-1, green:-1, blue:-1, total:0, points:0}, 
                    potencyEff: { red: 1 / 256, green: 1 / 256, blue: 1 / 256 },
                    specbar:{ red: false, green: false, blue: false },
                    cost: 0
                };
                while (player.spectrumLevel.length > 18){
                    player.spectrumLevel.splice(length - 1, 1);
                }
                player.advSpec = { unlock: false, multi: 1, max: 50, reduce: 0.1, time: 0, active: false, gain: 0, SR: 0 };
            }
            if (player.version < 1.11){
                player.prism.cost = 0;
            }
            if (player.version < 1.12) {
                player.sleepingTime = 0;
                player.wastedTime = 0;
                alert("RGB Idle has updated, hope you enjoy the new stuff! \n Current Version: 1.12");
            }
            while (player.spectrumLevel.length < 21){
                player.spectrumLevel.push(-1);
            }
            if (player.unlock){
                document.getElementById("blueDiv")!.classList.remove("hidden");
            }
            else{
                document.getElementById("blueDiv")!.classList.add("hidden");
            }
            if (SumOf(player.spectrumLevel) >= 9){
                document.getElementsByClassName("switch")[5].classList.remove("hidden");
            }
            if (player.prism.active){
                document.getElementById("newupgrades")!.classList.remove("hidden");
            }
            else{
                document.getElementById("newupgrades")!.classList.add("hidden");
            }
            if (SumOf(player.spectrumLevel) >= 12) {
                (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[5].classList.remove("hidden");
                document.getElementById("newupgrades")!.classList.add("hidden")
            } else {
                (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[5].classList.add("hidden");
            }
            if (player.prism.cost > 0){
                (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[6].classList.remove("hidden");
            }else{
                (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[6].classList.add("hidden");
            }
            if (player.prism.active){
                document.getElementById("blackCountRGB")!.classList.remove("hidden");
            }else{
                document.getElementById("blackCountRGB")!.classList.add("hidden");
            }
            if (player.specced > 0){
                document.getElementById("spectrumCountRGB")!.classList.remove("hidden");
            }else{
                document.getElementById("spectrumCountRGB")!.classList.add("hidden");
            }
            if (player.advSpec.unlock){
                document.getElementById("advSpectrumReset")!.classList.remove("hidden");
            }else{
                 document.getElementById("advSpectrumReset")!.classList.add("hidden");
            }
            (document.getElementById("advSpectrumReset")!.childNodes[1].childNodes[0] as HTMLInputElement).value = (player.advSpec.multi satisfies number) + ""
            this.player = player
            updateStats(this);
            CalcSRgain(this);
            SUInfo((document.getElementById("spectrumButton" + 4)!.childNodes[1] as HTMLElement), this, 4);
            SUInfo((document.getElementById("spectrumButton" + 5)!.childNodes[1] as HTMLElement), this, 5);
            SUInfo((document.getElementById("spectrumButton" + 9)!.childNodes[1] as HTMLElement), this, 9);
            (document.getElementById("spectrumButton" + 4)!.childNodes[0] as HTMLElement).innerHTML = "Auto Buy Max Red Level Every " + formatNum(player, 2 / (player.progress.includes(4) ? 8 : 1)) + "s";
            (document.getElementById("spectrumButton" + 5)!.childNodes[0] as HTMLElement).innerHTML = "Auto Buy Max Green Level Every " + formatNum(player, 2 / (player.progress.includes(4) ? 8 : 1)) + "s";
            (document.getElementById("spectrumButton" + 9)!.childNodes[0] as HTMLElement).innerHTML = "Auto Buy Max Blue Upgrades Every " + formatNum(player, 2 / (player.progress.includes(4) ? 8 : 1)) + "s";
            this.ABInt = { red: 2000 / (player.progress.includes(4) ? 8 : 1), green: 2000 / (player.progress.includes(4) ? 8 : 1), blue: 2000 / (player.progress.includes(4) ? 8 : 1)};
            player.CM = Math.max(player.CM, 1);
            const dom = this.domBindings
            let btn = dom.potencyBtn;
            if (player.prism.potency.total > 0) {
                (btn.childNodes[0] as HTMLElement).innerHTML = "You have " + formatNum(player, player.prism.potency.points,0) + " potency, out of a total of " + formatNum(player, player.prism.potency.total,0);
                (btn.childNodes[2] as HTMLElement).innerHTML = "Increase potency for " + formatNum(player, Math.pow(10, player.prism.potency.total/2 + 3), 0) + " Spectrum";
            } else {
                (btn.childNodes[0] as HTMLElement).innerHTML = "Escape the loss of power. Remove your negative potency.";
                (btn.childNodes[2] as HTMLElement).innerHTML = "This requires you to channel 100 spectrum.";
            }
    
            let names = ["red" as const, "green" as const, "blue" as const]
            for (let i = 0; i < 3; i++) {
                let pot = document.getElementById(names[i] + "pot") as HTMLElement
                if (Log.get(player.prism.potencyEff[names[i]], "l") === Log.get(player.potencyEff[names[i]],"l")){
                     pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, player.prism.potency[names[i]], 0);
                }
                else{
                    pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, Log.log(player.potencyEff[names[i]],256),0) + "(" + formatNum(player, player.prism.potency[names[i]],0) + ")";
                }
            }
    
    
            //Should always be the last thing to happen
            let dif = Date.now() - player.lastUpdate;
            player.lastUpdate = Date.now();
            simulateTime(this, dif);
        }
        player.version = v;
        this.player = player
        for (let i = 0; i < BAR_KEYS.length ; i++){
            player.bars[BAR_KEYS[i]].draw(this, 0);
        }
        this.autoSave = setInterval(()=>save(this.player), 30000);
        this.mainLoop = setInterval(()=>this.gameLoop(), 1000 / player.options.fps);
        this.ABLoop = setInterval(()=>this.autoBuyer(), 10);
        setupKeyListeners(this)

    }
    destroy(){
        clearInterval(this.mainLoop)
        clearInterval(this.ABLoop)
        clearInterval(this.autoSave)
    }
    autoBuyer() {
        this.ABcount += 10;
        const player = this.player
        if (player.AB.red || player.AB.green || player.AB.blue){
            this.p3 = false;
        }
        if (player.spectrumLevel[4] == 1 && player.AB.red && this.ABcount% this.ABInt.red < 10){
             while (buyUpgrade(this, "red")){
                //TODO this do nothing is dangerious 
             }
        }
        if (player.spectrumLevel[5] == 1 && player.AB.green && this.ABcount % this.ABInt.green < 10){
             while (buyUpgrade(this, "green")){
                //TODO this do nothing is dangerious 
             }
        }
        if (player.spectrumLevel[9] == 1 && player.AB.blue && this.ABcount % this.ABInt.blue < 10){
            for (var i = 0; i < 4; i++){
                while (buyUpgrade(this, "blue", i)){
                    //TODO this do nothing is dangerious 
                }
            }
        }
    }
    gameLoop() {
        const player = this.player
        var dif = Date.now() - player.lastUpdate;
        player.lastUpdate = Date.now();
        player.spectrumTimer += dif;
        player.wastedTime += dif;
        if (Date.now() % (player.advSpec.unlock ? 1000 : 60000) < dif) {
            CalcSRgain(this);
        }
        updateStats(this)
        increase(this, Log.multi(this.auto, (dif / 1000)), dif);
        for (let i = 0; i < BAR_KEYS.length ; i++){
            player.bars[BAR_KEYS[i]].draw(this, dif);
        }
        if (player.level.green >= 1 && !player.unlock){
            this.domBindings.unlockBtn.classList.remove("hidden");
        }
        if (SumOf(player.spectrumLevel) >= 9){
            document.getElementsByClassName("switch")[5].classList.remove("hidden");
        }
        if (player.prism.active){
            document.getElementsByClassName("switch")[6].classList.remove("hidden");
        }
        if (player.level.blue[3] >= 1){
            document.getElementById("spectrumDiv")!.classList.remove("hidden");
        }
        if (Log.gte(player.money.blue, 1)){
             document.getElementsByClassName("switch")[1].classList.remove("hidden");
        }
        if (player.specced > 0) {
            document.getElementsByClassName("switch")[1].classList.remove("hidden");
            document.getElementsByClassName("switch")[3].classList.remove("hidden");
            document.getElementById("tabSpectrum")!.children[1].classList.add("hidden");
            document.getElementById("tabSpectrum")!.children[3].classList.remove("hidden");
        }
        if (player.black.gt({val:128, typ:"log"}) && SumOf(player.spectrumLevel) === 9) {
            (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[5].classList.remove("hidden");
            for (var i = 15; i < 18; i++){
                player.spectrumLevel[i] = 0;
            }
            document.getElementById("newupgrades")!.classList.add("hidden");
        } 
        render[this.tab](this);
        if (this.tab == "Spectrum"){
            render[this.subtab.spectrum](this);
        }
    }

    incomeBarDisplay(name:"red"|"green"|"blue") {
        const player = this.player
        const elem = document.getElementById(name + "Bar");
        if(elem===null){
            throw new Error("failure to dispaly income bar on element")
        }
        if (player.prism.active) {
            var c = ["R","G","B"]
            var show = [1, 1, 1];
            for (var i = 0; i < 3; i++) if (player.bars[name].color[i] === 0) show[i] = 0;
            if (SumOf(show) === 0){
                elem.innerHTML = "~" + formatNum(player, displayIncome(this, name, "black")) + " Black/s";
            }
            else if (SumOf(show) == 3 && player.specbar[name]){
                 elem.innerHTML = formatNum(player, displayIncome(this, name, "spectrum")) + " Spec/s";
            }
            else if (SumOf(show) == 1 && !player.progress.includes(8)){
                 elem.innerHTML = formatNum(player, displayIncome(this, name, show.indexOf(1) as 0|1|2)) + "/s";
            }else {
                elem.innerHTML = "";
                for (var i = 0; i < 3; i++) {
                    var temp = document.createElement("div");
                    temp.style.fontSize = (1 / SumOf(show)) + "em";
                    temp.innerHTML = c[i] + ": " + formatNum(player, displayIncome(this, name, i as 0|1|2)) + "/s";
                    let tempb:null|HTMLDivElement = null
                    if (SumOf(show) == 1 && player.progress.includes(8)) {
                        temp.style.fontSize = "0.5em";
                        if (i == 2) {
                            tempb = document.createElement("div");
                            tempb.innerHTML = "Black: " + formatNum(player, displayIncome(this, name, "miniBlack")) + "/s";
                            tempb.style.fontSize = "0.5em";
                        }
                    }
                    if (show[i]) elem.appendChild(temp);
                    if(tempb){
                        elem.appendChild(tempb);
                    }
                }
            }
        }else{
            elem.innerHTML = formatNum(player, displayIncome(this, name)) + "/s";
        }
    }
}

let didInit = false
function init() {
    if(didInit){
        throw Error("multiple init")
    }
    didInit = true
    new Game()
}








const render = {
    Prism: function (game:Game) {
        const player = game.player
        document.getElementById("blackCount")!.innerHTML = "You have " + formatNum(player, player.black) + " Blackness";
        game.mixCost = 1;
        game.blackBar = false;
        game.colorBar = false;
        if (player.prism.active && player.progress.includes(1)){
            document.getElementById("potencydiv")!.classList.remove("hidden");
        }
        if (player.spectrumLevel[15] === 1){
            document.getElementById("specpot")!.classList.remove("hidden");
        }
        if (player.specbar.red || player.specbar.green || player.specbar.blue){
             document.getElementById("costReset")!.classList.remove("hidden");
        }
        else{
            document.getElementById("costReset")!.classList.add("hidden");
        }
        function suffix(num:number) {
            let ret:number|string = num;
            if (num % 10 === 1){
                ret = ret + "st";
            }else if (num % 10 === 2){
                ret = ret + "nd";
            }else if (num % 10 === 3){
                ret = ret + "rd";
            }else{
                ret = ret + "th";
            }
            return ret;
        }
        if (SumOf(player.bars.red.color) + SumOf(player.bars.green.color) + SumOf(player.bars.blue.color) === 255 * 9) {
            if (player.prism.cost === 0){
                document.getElementById("blackCostInfo")!.innerHTML = "You are now ready to move on to a better prism! Pressing this button will reset you back to 1st prism, however you will retain log2(spectrum).";
            }
            else{
                document.getElementById("blackCostInfo")!.innerHTML = "Destroy your prism for the " + suffix(player.prism.cost + 1) + " time and move forth to an even greater one! Pressing this button will reset you back to 1st prism, however you will retain log2(spectrum).";
            }
            document.getElementById("costReset")!.style.borderColor = "white";
            document.getElementById("costReset")!.style.borderWidth = "5";
        } else {
            document.getElementById("blackCostInfo")!.innerHTML = "Before you may destroy your " + suffix(player.prism.cost + 1) + " prism you must first conquer it using the power of the light. Get all bars to be completly white to fully overpower the darkness within the prism.";
            document.getElementById("costReset")!.style.borderColor = "black";
        }
        for (var i = 0; i < 3; i++) {
            let temp = BAR_KEYS[i];
            let row = document.getElementById(temp + "Prism") as HTMLTableRowElement
            let PVal = [[128, 32, 0], [64, 0, 16], [0, 0, 0]];
            if (!player.prism.active){
                for (let j = 0; j < 5; j += 2){
                    (row.cells[2].childNodes[j] as HTMLInputElement).value = PVal[i][j / 2]+"";
                }
            }
            if (player.prism.specbar[temp]){
                for (let j = 0; j < 5; j += 2){
                    (row.cells[2].childNodes[j] as HTMLInputElement).value = 255 + ""
                }
            }
            (row.cells[1].childNodes[0] as HTMLElement).style.backgroundColor = "rgb(" + Math.floor(parseFloat((row.cells[2].childNodes[0] as HTMLInputElement).value)) + "," + Math.floor(parseFloat((row.cells[2].childNodes[2] as HTMLInputElement).value)) + "," + Math.floor(parseFloat((row.cells[2].childNodes[4] as HTMLInputElement).value)) + ")";
            let colors = ["Red: ", "Green: ", "Blue: "]
            const isZero = (v:string) => {
                return !v || parseFloat(v)===0

            }
            if (
                isZero((row.cells[2].childNodes[0] as HTMLInputElement).value)&&
                isZero((row.cells[2].childNodes[2] as HTMLInputElement).value)&&
                isZero((row.cells[2].childNodes[4] as HTMLInputElement).value)
            ) {
                row.cells[3].innerHTML = "Black: <sup>" + formatNum(player, Log.multi(Log.multi(Log.multi(player.spectrum, player.spectrumLevel[18] === 1 ? Log.pow(player.prism.potencyEff[temp], Log.add(1,Log.floor(Log.div(player.prism.potency[temp],7)))) : player.prism.potencyEff[temp]), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? game.Cores : 1)), 0) + "</sup>&frasl;<sub> " + formatNum(player, Log.max(Log.root(Log.multi(player.black, 1e100), 1 + Math.min(player.prism.cost / 10,0.5)), 1e100)) + "</sub>";
                game.blackBar = true;
            } else if (player.prism.specbar[temp]) {
                if (player.progress.includes(14)) row.cells[3].innerHTML = "Spectrum: " + formatNum(player, Math.pow(16, Math.floor(player.prism.potency[temp] / 5)), 0) + "x log<sub>10</sub>(prod)";
                else row.cells[3].innerHTML = "Spectrum: log<sub>10</sub>(prod)";
            }else {
                row.cells[3].innerHTML = "<span></span><br><span></span><br><span></span>";
                let tempcount = 0;
                for (let j = 0; j < 5; j += 2) {
                    (row.cells[3].childNodes[j] as HTMLElement).innerHTML = colors[j / 2] + formatNum(player, getColorPotency(player, PLAYER_MONEY_KEYS[i], Math.floor(parseInt((row.cells[2].childNodes[j] as HTMLInputElement).value)),true), player.prism.potency[temp] === -1 ? 6 : 2);
                    if ((row.cells[2].childNodes[j] as HTMLInputElement).valueAsNumber === 0){
                         tempcount++;
                    }
                }
                if (tempcount == 2){
                    game.blackBar = true;
                }
                game.colorBar = true;
            }
            if (player.prism.active) {
                if (player.prism.cost < 5){
                    game.mixCost = Log.multi(game.mixCost, Log.pow(1.3 * (player.prism.cost / 2 + 1), Log.add(Log.add(Math.floor(parseInt((row.cells[2].childNodes[0] as HTMLInputElement).value)), Log.pow(Math.floor(parseInt((row.cells[2].childNodes[2] as HTMLInputElement).value)), 1.05)), Log.pow(Math.floor(parseInt((row.cells[2].childNodes[4] as HTMLInputElement).value)), 1.1))));
                }
                else{
                    game.mixCost = Log.multi(game.mixCost, Log.pow(1.3 * player.prism.cost , Log.add(Log.add(Math.floor(parseInt((row.cells[2].childNodes[0] as HTMLInputElement).value)), Log.pow(Math.floor(parseInt((row.cells[2].childNodes[2] as HTMLInputElement).value)), 1.05)), Log.pow(Math.floor(parseInt((row.cells[2].childNodes[4] as HTMLInputElement).value)), 1.1))));
                }
            }

            let node = document.getElementById("specpot")!.childNodes[i * 2 + 1] as HTMLElement;
            if (player.prism.specbar[temp]) {
                node.innerHTML = "Click here to make this color bar!";
                node.style.backgroundColor = "gold";
            } else {
                node.style.backgroundColor = "white";
                if ((row.cells[2].childNodes[0] as HTMLInputElement).valueAsNumber === 255 && (row.cells[2].childNodes[2] as HTMLInputElement).valueAsNumber === 255 && (row.cells[2].childNodes[4] as HTMLInputElement).valueAsNumber === 255) {
                    if (player.prism.potency[temp] >= 5) {
                        node.innerHTML = "Click here to make this Spectrum bar!";
                    }
                    else node.innerHTML = "You need 5 potency to make a Spectrum bar.";
                } else {
                    node.innerHTML = "You must first make the bar white.";
                }
            }
        }
        game.mixCost = Log.sub(game.mixCost, 1);
        if (player.prism.active) {
            game.domBindings.mixButton.innerHTML = "Create a New Color Mix<br>This will cost: " + formatNum(player, game.mixCost, 2) + " Blackness";
        }
        else{
            game.domBindings.mixButton.innerHTML = "Activate the Prism and Embrace its Power!";
        }
    },
    Upgrades : function(game:Game){
        const player = game.player
        for (let i = 0; i < player.spectrumLevel.length ; i++) {
            if (i != 5 && i != 4 && i != 9){
                SUInfo(document.getElementById("spectrumButton" + i)!.children[1], game, i);
            }
            document.getElementById("spectrumButton" + i)!.children[2].innerHTML = "Price: " + formatNum(player, game.SpecPrice[i], 0) + " Spectrum ";
            if (player.spectrumLevel[i] == 1) document.getElementById("spectrumButton" + i)!.classList.add("bought");
            else document.getElementById("spectrumButton" + i)!.classList.remove("bought");
        }
    },
    RGB : function (game:Game) {
        const player = game.player
        for (let i = 0; i < PLAYER_MONEY_KEYS.length; i++) {
            const tempKey = PLAYER_MONEY_KEYS[i];
            /*if (player.inf[tempKey] > 0) {
                document.getElementById(tempKey + "Count").innerHTML = "";
                elem1 = document.createElement("span");
                elem1.innerHTML = formatNum(player.inf[tempKey], 0) + "\' + ";
                elem1.style.fontSize = "0.75em";
                elem2 = document.createElement("span");
                elem2.style.fontSize = "0.5em";
                elem2.style.display = "inline-block";
                elem2.innerHTML = formatNum(player.money[tempKey]);
                document.getElementById(tempKey + "Count").appendChild(elem1);
                document.getElementById(tempKey + "Count").appendChild(elem2);
            }*/
            document.getElementById(tempKey + "Count")!.innerHTML = formatNum(player, player.money[tempKey]);
            if (
                Log.get(
                    (tempKey == "red" ? Log.multi(Log.add(Log.div(game.auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? game.click : 0), game.IR) :
                    (tempKey == "green" ? Log.div(Log.multi(Log.multi(Log.add(Log.div(game.auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? game.click : 0), game.IR), game.IG), 256) :
                    Log.div(Log.multi(Log.multi(Log.multi(Log.add(Log.div(game.auto, 1000 / player.options.fps), player.bars.red.mouse === 1 ? game.click : 0), game.IR), game.IG), game.IB), 65536))
                ), "log") > Math.log10(32)
            ){
                game.incomeBarDisplay(tempKey);
            }else{
                 document.getElementById(tempKey + "Bar")!.innerHTML = "";
            }
            (document.getElementById(tempKey + "Splice")!.childNodes[0] as HTMLElement).innerHTML = "Splice " + player.level.blue[3] * 10 + "% " + tempKey + " into a spectrum";
            (document.getElementById(tempKey + "Splice")!.childNodes[1] as HTMLElement).innerHTML = "Spliced " + tempKey + ": " + formatNum(player, player.spliced[tempKey]);
            if (tempKey == "blue") {
                for (var j = 0; j < 4; j++) {
                    if (j == 0 && player.progress.includes(7)){
                        (document.getElementById(tempKey + "Button" + j)!.childNodes[1] as HTMLElement).innerHTML = "Level: " + formatNum(player, player.level[tempKey][j], 0) + "+" + Math.min(Math.floor(player.spectrumTimer / 360000), 10)
                    }
                    else{
                         (document.getElementById(tempKey + "Button" + j)!.childNodes[1] as HTMLElement).innerHTML = "Level: " + formatNum(player, player.level[tempKey][j], 0);
                    }
                    (document.getElementById(tempKey + "Button" + j)!.childNodes[2] as HTMLElement).innerHTML = "Price: " + formatNum(player, game.price[tempKey][j]) + " " + tempKey;
                    switch (j) {
                        case 0: 
                            (document.getElementById(tempKey + "Button" + j)!.childNodes[3] as HTMLElement).innerHTML = "Current speed: " + formatNum(player, game.Clock, 0, "Hz");
                            break
                        case 1: //TODO case 1 & 2 seem near identical with IG and IR swapped
                            let setHtml = "Current fill: ";
                            if(Log.get(Log.div(game.IR, 256),"l") >= 2){
                                setHtml+= "~" + formatNum(player, Log.floor(Log.div(game.IR, 256)), 0)
                            }else{
                                if( (Log.get(Log.div(game.IR, 256),"n") as number) >= 1){
                                    setHtml+= formatNum(player, Log.floor(Log.div(game.IR, 256)), 0) + " & "
                                }
                                
                                setHtml += formatNum(player, Log.mod(game.IR, 256), 0) + "/256"
                            }
                            (document.getElementById(tempKey + "Button" + j)!.childNodes[3] as HTMLElement).innerHTML = setHtml
                            break
                        case 2: 
                            let setHtml2 = "Current fill: "
                            if(Log.get(Log.div(game.IG, 256),"l") >= 2){
                                setHtml2+=formatNum(player, Log.floor(Log.div(game.IG, 256)), 0)
                            }else{
                                if(Log.get(Log.div(game.IG, 256),"n") as number >= 1){
                                    setHtml2+= formatNum(player, Log.floor(Log.div(game.IG, 256)), 0) + " & "
                                }
                                setHtml2+=  formatNum(player, Log.mod(game.IG , 256), 0) + "/256"
                            }
                            (document.getElementById(tempKey + "Button" + j)!.childNodes[3] as HTMLElement).innerHTML = setHtml2
                            break
                        case 3: 
                            (document.getElementById(tempKey + "Button" + j)!.childNodes[3] as HTMLElement).innerHTML = "Core Count: " + formatNum(player, game.Cores, 0);
                            break
                    }
                }
            } else {
                    (document.getElementById(tempKey + "Button")!.childNodes[0] as HTMLElement).innerHTML = tempKey == "red" ? "Increase Click Strength" : "Increase Auto Strength";
                    document.getElementById(tempKey + "Button")!.style.width = "";
                    (document.getElementById(tempKey + "Button")!.childNodes[2] as HTMLElement).innerHTML = "Price: " + formatNum(player, game.price[tempKey]) + " " + tempKey;
                    (document.getElementById(tempKey + "Button")!.childNodes[1] as HTMLElement).innerHTML = "Level: " + formatNum(player, player.level[tempKey], 0);
            }
        }
        document.getElementById("spectrumCountRGB")!.innerHTML = formatNum(player, player.spectrum, 0) + " Spectrum";
        document.getElementById("blackCountRGB")!.innerHTML = formatNum(player, player.black) + " Black";
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 5; j += 2){
                ((document.getElementById(PLAYER_MONEY_KEYS[i] + "Prism") as HTMLTableRowElement).cells[2].childNodes[j] as HTMLInputElement).value = (player.bars[PLAYER_MONEY_KEYS[i]].color[j / 2] satisfies number) + "";
            }
        }
    },
    Spectrum: function (game:Game) {
        const player = game.player
        document.getElementById("spectrumCount")!.innerHTML = "You have " + formatNum(player, player.spectrum, 0) + " Spectrum";
    },
    Settings: function (game:Game) {
        const player = game.player
        document.getElementsByClassName("setting")[4].children[1].innerHTML = player.options.fast ? "On" : "Off";
        document.getElementsByClassName("setting")[5].children[1].innerHTML = (player.options.fps satisfies number)+ "";
        document.getElementsByClassName("setting")[6].children[1].innerHTML = "<b>" + player.options.notation + "</b>";
    },
    Stats: function (game:Game) {
        const player = game.player
        const table = document.getElementById("last5") as HTMLTableElement;
        for (let i = 0; i < table.rows.length; i++) {
            if (player.previousSpectrums[i].time != 0){
                table.rows[i].cells[0].innerHTML = (i == 0 ? "Your last Spectrum" : "Your Spectrum " + (i + 1) + " Spectrums ago") + " took " + (player.previousSpectrums[i].time >= 3600000 ? Math.floor(player.previousSpectrums[i].time / 3600000) + " hours and " + Math.floor((player.previousSpectrums[i].time % 3600000) / 60000) + " minutes" : (player.previousSpectrums[i].time >= 60000 ? Math.floor(player.previousSpectrums[i].time / 60000) + " minutes and " + Math.floor((player.previousSpectrums[i].time % 60000) / 1000) + " seconds" : (player.previousSpectrums[i].time >= 10000 ? Math.floor(player.previousSpectrums[i].time / 1000) + " seconds" : (player.previousSpectrums[i].time > 0 ? player.previousSpectrums[i].time + " millis" : 0)))) + " and earned you " + formatNum(player, player.previousSpectrums[i].amount, 0) + " Spectrum";
            }
        }
        if (player.progress.includes(16)){
            document.getElementById("specstat")!.innerHTML = "Times specced is  currently " + formatNum(player, player.specced, 0) + ". This multiplies your spectrum gain by " + formatNum(player, 1 + player.specced / 100, 2) +"x and your spectrum bar gain by " +formatNum(player, Math.sqrt(player.specced),2)+"x.";
        }
        else{
            document.getElementById("specstat")!.innerHTML = "Times specced is  currently " + formatNum(player, player.specced,0) + ". This multiplies your spectrum gain by " + formatNum(player, 1 + player.specced / 100,2) + "x.";
        }
        let ret = "You have wasted " + formatTime(player.wastedTime + player.sleepingTime) + " playing this broken game.<br>"; //TODO replace broken with fixed eventually
        if (player.sleepingTime < 60000){
            ret += " FYI it is not healthly to play this game 24/7 you should take a break seeing as you haven\"t done so yet!";
        }else if (player.sleepingTime > 3.154e12){//TODO calling out a specific player is probably a bit silly here. I don't get this in joke make it generic
             ret += " Hey Philipe I am on to you, don\"t even try to hide it! You used simulateTime a bit to much there.";
        }else if (player.sleepingTime + player.wastedTime > 3.154e+10){ //TODO again who?
             ret += " You either love my game or you're Hunter, I can't tell which one.";
        }else if (player.sleepingTime > player.wastedTime * 100){
            ret += " Hello is anybody there? Wait if you are ready this pls stop sleeping so much! You are sleeping " + (player.sleepingTime / player.wastedTime).toFixed(1) + "x more then you are playing my game. I need more attention!";
        }else if(player.sleepingTime > player.wastedTime){
             ret += " Luckily you've spent " + (player.sleepingTime/(player.wastedTime + player.sleepingTime) * 100).toFixed(1) + "% of that time sleeping(or other IRL things).";
        }else if(player.sleepingTime < player.wastedTime){
             ret += "Your insane, or you really like my game... You have been online " + (player.wastedTime/(player.wastedTime + player.sleepingTime) * 100).toFixed(1) + "% of the time you have spent playing this game.";
        }else if (Math.floor(player.sleepingTime%60000) === Math.floor(player.wastedTime%60000)){ //TODO I think this check is done wrong. it would require a milisecond match like this.
             ret += "How is this possible you have been online for the same amount of minutes you've been offline. This is an anomally!";
        }
        ret += "<br> Time online: " + formatTime(player.wastedTime) + "<br> Time offline: "+ formatTime(player.sleepingTime);
        document.getElementById("timestat")!.innerHTML = ret;
    },
    Progress: function (game:Game) {
        const player = game.player
        const rows = (document.getElementById("achieves") as HTMLTableElement).rows;
        for (let i = 0; i < 14; i++){
             rows[i].style.backgroundColor = "";
        }
        for (let i = 0; i < player.progress.length; i++){
             rows[player.progress[i]-1].style.backgroundColor = "green";
        }
    },
}

function pCheck(game:Game, num:1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17) {
    const player = game.player
    if (!player.prism.active){
        return;
    }
    switch(num){
        case 1:
            if (player.prism.active && !player.progress.includes(1)) {
                player.progress.push(1);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 2:
            if (!player.progress.includes(2) && !player.advSpec.unlock) {
                player.progress.push(2);
                player.advSpec.unlock = true;
                document.getElementById("advSpectrumReset")!.classList.remove("hidden");
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 3:
            if (!player.progress.includes(3) && Log.get(player.black, "log") >= 50) {
                player.progress.push(3);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 4:
            if (game.p3 && Log.get(player.black,"l") >= 3 && !player.progress.includes(4)) {
                player.progress.push(4);
                document.getElementById("spectrumButton" + 4)!.children[0].innerHTML = "Auto Buy Max Red Level Every " + 0.25 + "s";
                document.getElementById("spectrumButton" + 5)!.children[0].innerHTML = "Auto Buy Max Green Level Every " + 0.25 + "s";
                document.getElementById("spectrumButton" + 9)!.children[0].innerHTML = "Auto Buy Max Blue Upgrades Every " + 0.25 + "s";
                game.ABInt = { red: 2000 / 8, green: 2000 / 8, blue: 2000 / 8 };
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 5:
            if (Math.floor(Log.get(player.spliced.red, "l")) === 128 && Math.floor(Log.get(player.spliced.green, "l")) == 128 && Math.floor(Log.get(player.spliced.blue, "l")) == 128 && !player.progress.includes(5)) {
                player.progress.push(5);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 6:
            if (Log.get(player.money.blue, "l") >= 64 && player.level.blue[3] === 0 && !player.progress.includes(6)) {
                player.progress.push(6);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 7:
            if (!player.progress.includes(7)) {
                player.progress.push(7);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 8:
            if (player.bars.red.color[0] == 255 && player.bars.green.color[1] == 255 && player.bars.blue.color[2] == 255 && !player.progress.includes(8)) {
                player.progress.push(8);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 9:
            if (Log.get(Log.div(player.previousSpectrums[0].amount, (player.previousSpectrums[0].time / 1000)), "num") as number >= 1000000 && !player.progress.includes(9)) {
                player.progress.push(9);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 10:
            if (!player.progress.includes(10)) {
                if (game.p10 === 9) {
                    pop(game, game.domBindings.popupDivs.progressFinish);
                    player.progress.push(10);
                } else {
                    let names = ["red","green","blue"];
                    let pColor = [SumOf(player.bars.red.color),SumOf(player.bars.green.color),SumOf(player.bars.blue.color)];
                    let nColor = [];
                    for(let i = 0 ; i < 3; i++){
                        const row = document.getElementById(names[i] + "Prism") as HTMLTableRowElement;
                        let ret = [];
                        for(let j = 0; j < 5; j+=2){
                            ret.push(Math.floor(parseFloat((row.cells[2].childNodes[j] as HTMLInputElement).value)))
                        }
                        nColor.push(SumOf(ret));
                    }
                    if (
                        (nColor.every(function (val) { return val === 0 }) && pColor.every(function (val) { return val > 0 })) ||
                        (pColor.every(function (val) { return val === 0 }) && nColor.every(function (val) { return val > 0 }))
                    ){
                        game.p10++;
                    }
                    else{
                        game.p10 = 0;
                    }
                }
            }
            return
        case 11:
            if (!player.progress.includes(11)) {
                let b:num|number = 0;
                let w:num|number = 0;
                for (var i = 0; i < BAR_KEYS.length; i++) {
                    if (player.specbar[BAR_KEYS[i]]) {
                        w = Log.add(w, displayIncome(game, BAR_KEYS[i],"spectrum"));
                    }
                }
                for (var i = 0; i < BAR_KEYS.length; i++) {
                    if (SumOf(player.bars[BAR_KEYS[i]].color) === 0) b = Log.add(b, displayIncome(game, BAR_KEYS[i], "black"));
                    if (player.bars[BAR_KEYS[i]].color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) b = Log.add(displayIncome(game, BAR_KEYS[i], "miniBlack"), b);
                }
                if (Log.get(w, "l") > Log.get(b, "l")) {
                    player.progress.push(11);
                    pop(game, game.domBindings.popupDivs.progressFinish);
                }
            }
            return
        case 12:
            if (!player.progress.includes(12) && Log.get(player.money.green, "n") === 0 && player.level.green === 0 && player.level.red >= 1000) {
                player.progress.push(12);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 13:
            if (!player.progress.includes(13) && Log.get(player.black, "l") >= 256) {
                player.progress.push(13);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 14:
            if (!player.progress.includes(14) && player.specbar.red && player.specbar.green && player.specbar.blue) {
                player.progress.push(14);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 15:
            if (!player.progress.includes(15) && player.prism.cost > 0) {
                player.progress.push(15);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 16:
            if (!player.progress.includes(16) && player.specced >= 10000) {
                player.progress.push(16);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
            return
        case 17:
            if (!player.progress.includes(17) && player.advSpec.time >= 3.6e6) {
                player.progress.push(17);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
    }          
}

function press(game:Game, _:unknown, num:number) {
    const player = game.player
    player.bars.red.mouse = num;
}

function increase(game:Game, amnt:num|number, dif:num|number) {
    const player = game.player
    let next = Log.multi(amnt, game.IR);
    let specGain:number|num = 0;
    let tspec = player.spectrum;
    for (let i = 0; i < (player.unlock ? 3 : 2) ; i++) {
        const temp = player.bars[BAR_KEYS[i]];
        temp.width = Log.add(temp.width, next);
        if (player.specbar[temp.name]) {
            player.spectrum = Log.add(player.spectrum, getSpec(game, temp.name, Log.div(temp.width, 256), dif ));
            specGain = Log.add(specGain,getSpec(game,temp.name, Log.div(temp.width, 256), dif));
        } else {
            player.money.red = Log.add(player.money.red, Log.multi((player.prism.active ? getColorPotency(player, temp.name, temp.color[0]) : (player.spectrumLevel[1] + 1) * temp.color[0] / 255), Log.floor(Log.div(temp.width, 256))));
            player.money.green = Log.add(player.money.green, Log.multi((player.prism.active ? getColorPotency(player, temp.name, temp.color[1]) : (player.spectrumLevel[1] + 1) * temp.color[1]/255), Log.floor(Log.div(temp.width, 256))));
            player.money.blue = Log.add(player.money.blue, Log.multi((player.prism.active ? getColorPotency(player, temp.name, temp.color[2]) : (player.spectrumLevel[1] + 1) * temp.color[2]/255), Log.floor(Log.div(temp.width, 256))));
            if (temp.color[0] + temp.color[1] + temp.color[2] == 0) player.black = getBlack(game, temp.name, dif, Log.div(temp.width,256), specGain,tspec)
            if (temp.color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) player.black = getBlack(game, temp.name, dif, Log.div(temp.width, 256), specGain, tspec,true);
        }
        next = Log.multi(Log.floor(Log.div(temp.width, 256)), (temp.name == "red" ? game.IG : game.IB));
        temp.width = Log.mod(temp.width, 256);
    }
    pCheck(game, 13);
    pCheck(game, 11);
    pCheck(game, 12);
    pCheck(game, 6);
   /* if (player.money.red > 2.56e256) player.money.red = 2.56e256;
    if (player.money.green > 2.56e256) player.money.green = 2.56e256;
    if (player.money.blue > 2.56e256) player.money.blue = 2.56e256;
    if (!player.pop) pCheck(12);
    if (player.money.blue.get("num") == 2.56e256 && player.money.green == 2.56e256 && player.money.red == 2.56e256 && player.pop == false)pop(1);
    else {
        for (var i = 0; i < 3 ; i++) if (player.money[BAR_KEYS[i]] == 2.56e256) {
            if (player.reduction[BAR_KEYS[i]] > 0) reduceProd(BAR_KEYS[i]);
            else document.getElementById(BAR_KEYS[i] + "Reduce").classList.remove("hidden");
        } else document.getElementById(BAR_KEYS[i] + "Reduce").classList.add("hidden");
    }*/
}

function RGBstring(color:[number, number, number]) {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function prismUpgrade(game:Game, type:"cost"|"specbar"|"potency"|"add"|"sub", name?:"red"|"green"|"blue") {
    const player = game.player
    function updatePotency(all?:boolean) {
        let btn = document.getElementById("potencyBtn") as HTMLDivElement;
        
        (btn.childNodes[0] as HTMLElement).innerHTML = "You have " + formatNum(player, player.prism.potency.points,0) + " potency, out of a total of " + formatNum(player, player.prism.potency.total,0);
        (btn.childNodes[2] as HTMLElement).innerHTML = "Increase potency by 2 for " + formatNum(player, Log.pow(10, player.prism.potency.total/2 + 3),0) + " Spectrum";

        if (name) {
            let pot = document.getElementById(name + "pot") as HTMLElement;
            player.prism.potencyEff[name] = Log.pow(256, player.prism.potency[name]);
            if (Log.get(player.prism.potencyEff[name],"l") === Log.get(player.potencyEff[name],"l")){
                pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, player.prism.potency[name],0);
            }else{
                pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, Log.log(player.potencyEff[name],256),0) + "(" + formatNum(player, player.prism.potency[name],0) + ")";
            }
        }
        if (all) {
            const names = ["red" as const,"green"  as const,"blue"  as const]
            for (let i = 0; i < 3; i++) {
                let pot = document.getElementById(names[i] + "pot");
                if(pot===null){
                    throw new Error("no potency found")
                }
                player.prism.potencyEff[names[i]] = Log.pow(256, player.prism.potency[names[i]]);
                if (Log.get(player.prism.potencyEff[names[i]], "l") === Log.get(player.potencyEff[names[i]], "l")){
                    pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, player.prism.potency[names[i]], 0);
                }
                else{
                    pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, Log.log(player.potencyEff[names[i]], 256), 0) + "(" + formatNum(player, player.prism.potency[names[i]], 0) + ")";
                }
            }
        }
    }
    switch (type) {
        case "cost":
            if (SumOf(player.bars.red.color) + SumOf(player.bars.green.color) + SumOf(player.bars.blue.color) === 255 * 9) {
                reset(game, 1);
                player.spectrum = Log.log(player.spectrum, 2);
                player.black = new num(0);
                player.prism = { active: true, potency: { points: 0, total: 0, red: -1, green: -1, blue: -1 }, specbar: { red: false, green: false, blue: false }, potencyEff: { red: 1 / 256, green: 1 / 256, blue: 1 / 256 }, cost: player.prism.cost + 1 };
                player.potencyEff = { red: 1 / 256, green: 1 / 256, blue: 1 / 256 };
                player.specbar = { red: false, green: false, blue: false };
                player.bars.red.color = [128, 32, 0];
                player.bars.green.color = [64, 0, 16];
                player.bars.blue.color = [0, 0, 0];
                updatePotency(true);

                pCheck(game, 15);
                if (player.prism.cost === 1) {
                    (document.getElementById("spectrumButton0")!.parentElement!.parentElement!.parentElement as HTMLTableElement).rows[6].classList.remove("hidden");
                    for (var i = 18; i < 21; i++){
                        player.spectrumLevel[i] = 0;
                    }
                }
            }
            return
        case "specbar":
            let row = document.getElementById(name + "Prism") as HTMLTableRowElement
            if (
                (row.cells[2].childNodes[0] as HTMLInputElement).valueAsNumber === 255 &&
                (row.cells[2].childNodes[2] as HTMLInputElement).valueAsNumber === 255 &&
                (row.cells[2].childNodes[4] as HTMLInputElement).valueAsNumber === 255 &&
                player.spectrumLevel[15] === 1 &&
                name && player.prism.potency[name] >= 5
            ) {
                player.prism.specbar[name] = !player.prism.specbar[name];
            }
            return
        case "potency":
            if (player.prism.potency.red === -1 && player.prism.potency.green === -1 && player.prism.potency.blue === -1 && Log.get(player.spectrum, "num") as number >= 100) {
                player.spectrum = Log.sub(player.spectrum, 100);
                let names = ["red" as const,"green" as const,"blue"  as const]
                for (let i = 0; i < 3; i++) {
                    player.prism.potency[names[i]] = 0;
                    player.prism.potencyEff[names[i]] = Math.pow(256, player.prism.potency[names[i]]);
                }
                pCheck(game, 2);
                updatePotency(true);
            }else if (Log.get(player.spectrum, "num") as number >= Math.pow(10, player.prism.potency.total/2 + 3)) {
                player.spectrum = Log.sub(player.spectrum, Math.pow(10, player.prism.potency.total/2 + 3));
                player.prism.potency.points += 2;
                player.prism.potency.total += 2;
                updatePotency();
            }
                return
        case "add":
            if (player.prism.potency.points > 0) {
                player.prism.potency.points--;
                if(!name){
                    throw Error("increasing nothing?")
                }
                player.prism.potency[name]++;
            }
            updatePotency();
            return
        case "sub":
            
            if (name && player.prism.specbar[name] && player.prism.potency[name] <= 5){
                return;
            }
            if (name && player.prism.potency[name] > 0) {
                player.prism.potency[name]--;
                player.prism.potency.points++;
            }
            updatePotency();
            return
    }
}

function buyUpgrade(game:Game, name:"spectrum"|"blue"|"red"|"green", Bindex?:number) {
    const player = game.player
    if (name === "spectrum") {
        if(typeof Bindex!=="number"){
            throw Error("no index")
        }
        if (Log.get(player.spectrum,"log") as number >= Math.log10(game.SpecPrice[Bindex]) && player.spectrumLevel[Bindex] < 1) {
            if(Bindex === 6) {
                player.unlock = true;
                document.getElementById("blueDiv")!.classList.remove("hidden");
            }
            if (Bindex === 5 || Bindex === 4 || Bindex === 9) {
                SUInfo((document.getElementById("spectrumButton" + Bindex)!.childNodes[1] as HTMLElement), game, Bindex);
            }
            player.spectrum = Log.sub(player.spectrum, game.SpecPrice[Bindex]);
            player.spectrumLevel[Bindex]++;
            updateStats(game);
            return true;
        }
    } else if (name === "blue") {
        if(typeof Bindex!=="number"){
            throw Error("no index")
        }
        if (Log.get(player.money[name], "log") >= Log.get(game.price[name][Bindex], "log")) {
            player.money[name] = Log.sub(player.money[name], game.price[name][Bindex])
            player.level[name][Bindex]++;
            updateStats(game);
            if (Bindex == 3 && player.progress.includes(6)){
                CalcSRgain(game);
            }
            return true;
        }
    } else {
        if (Log.get(player.money[name], "log") >= Log.get(game.price[name], "log")) {
            player.money[name] = Log.sub(player.money[name], game.price[name])
            player.level[name]++;
            updateStats(game);
            if (player.level[name] % 100 === 0){
                CalcSRgain(game);
            }
            return true;
        } else if (player.spectrumLevel[20] === 1 && Log.get(player.black, "log") >= Log.get(game.price[name], "log")) {
            player.black = Log.sub(player.black, game.price[name])
            player.level[name]++;
            updateStats(game);
            if (player.level[name] % 100 === 0){
                 CalcSRgain(game);
            }
            return true;
        }
    }
}

function SUABInfo(element:Element, game:Game, color:"red"|"green"|"blue"){
    const player = game.player
    element.innerHTML = ""
    const div = document.createElement("div")
    div.onclick = function(){
        ToggleAB(game, color)
    }
    div.className="button"
    div.style.height = "100%"
    div.style.width="50%"
    div.style.backgroundColor = (player.AB[color] ? "green" : "red")
    div.textContent = player.AB[color] ? "On" : "Off"
    element.appendChild(div)
    return                 


}
//I think this stands for spectrum upgrade info
function SUInfo(element:Element, game:Game, num:number):void{
    const player = game.player
    switch(num){
        case 0:
            element.innerHTML = "Current CM: " + Math.max(Math.log10(player.CM), 1).toFixed(1) + "x";
            return
        case 2:
            element.innerHTML =  "Base Bar Increase: " + (2 + player.spectrumLevel[2] * 2) + "/256";
            return
        case 4:
            if(player.spectrumLevel[4] == 1){
                SUABInfo(element, game, "red")
                return                 
            }
            element.innerHTML =  "Buy Red Yourself!";
            return
        case 5:
            if(player.spectrumLevel[5] == 1){
                SUABInfo(element, game, "green")
                return 
            }
            element.innerHTML = "Buy Green Yourself!";
            return
        case 7:
            element.innerHTML = "Current Multi per 10: " + (player.spectrumLevel[7] + 1) + "x";
            return
        case 8:
            element.innerHTML = "Current Multi per 10: " + (1.15 + player.spectrumLevel[8] * 0.15).toFixed(2-player.spectrumLevel[8]) + "x";
            return
        case 9:
            if(player.spectrumLevel[9] == 1){
                SUABInfo(element, game, "blue")
            }
            element.innerHTML = "Buy Blue Yourself!";
            return
        case 10:
            element.innerHTML = "R&G cost " + ((1 - game.PD) * 100) + "% less";
            return
        case 11:
            element.innerHTML = "Current Multi: " + formatNum(player, player.level.red,0) + "x";
            return
        case 12:
            element.innerHTML = "Current Multi: " + formatNum(player, Log.max(Log.floor(player.spectrum),1), 0) + "x";
            return
        case 14:
            element.innerHTML = "Base Core Count: " + (player.spectrumLevel[14] == 1 ? 8 : 1);
            return
        case 16:
            element.innerHTML = "Increase Blue: ~" + formatNum(player, Log.round(Log.div(game.IB,256)));
            return
        default:
            element.innerHTML = "";
            return
    }
}

function updateStats(game:Game) { //TODO ew wire this in a sane manner All of these are chached derived values
    const player = game.player
    game.PD = player.spectrumLevel[10] == 1 ? 0.5 : 1;
    if (player.spectrumLevel[2] == 1) {
        game.IR =  Log.multi(Log.add(4, Log.multi(4, player.level.blue[1])),(player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[1],10))),1) : 1));
        game.IG = Log.multi(Log.add(4, Log.multi(4, player.level.blue[2])),(player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2,Log.ceil(Log.div(player.level.blue[2],10))),1) : 1));
    } else {
        game.IR = Log.multi(Log.add(2, Log.multi(2, player.level.blue[1])), (player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[1], 10))), 1) : 1));
        game.IG = Log.multi(Log.add(2, Log.multi(2, player.level.blue[2])), (player.spectrumLevel[7] == 1 ? Log.max(Log.multi(2, Log.ceil(Log.div(player.level.blue[2], 10))), 1) : 1));
    }
    if (player.spectrumLevel[16] == 1){
        game.IB = Log.multi(game.IR, game.IG);
    }else{
        game.IB = 8;
    }
    if (player.spectrumLevel[17] == 1){
        game.BPD = Log.floor(Log.root(Log.div(Log.add(player.level.red, player.level.green), 100), 1.75))
    }else{
        game.BPD = 0;
    }
    game.Cores = Log.multi(Log.pow(2, player.level.blue[3]), (player.spectrumLevel[14] == 1 ? 8 : 1));
    game.Clock = Log.pow(2, Log.floor(Log.log(Log.pow(Log.add(2 , Log.log(game.Cores,6)), Log.add(player.level.blue[0], (player.progress.includes(7) ? Math.min(Math.floor(player.spectrumTimer / 360000), 10) : 0))), 2)));
    game.click = Log.multi(Log.multi(Log.add(2,Log.div(player.level.red, 2)), Log.pow((1.15 + player.spectrumLevel[8] * 0.15), Log.floor(Log.div(player.level.red, 10)))), Math.log10(Math.max(player.CM,1)));
    game.auto = Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(player.level.green, 16), Log.pow(Log.add(1.15 ,Log.multi( player.spectrumLevel[8], 0.15)), Log.floor(Log.div(player.level.green, 10)))), game.Clock),(player.spectrumLevel[0] == 1 ? Math.max(Math.log10(player.CM), 1) : 1)), (player.spectrumLevel[11] == 1 ? player.level.red : 1)), (player.spectrumLevel[12] == 1 ? Log.max(Log.floor(player.spectrum), 1) : 1)),player.progress.includes(10) ? Log.max(Log.log10(player.black),1):1);
    game.price.red = Log.multi(5 , Log.pow(Log.add(1,Log.multi(Log.multi(0.1, Log.pow(1.05, Math.max((player.level.red / 100)-1,0))), game.PD)), player.level.red));
    game.price.green = Log.multi(5, Log.pow(Log.add(1,Log.multi(Log.multi(0.05, Log.pow(1.05, Math.max((player.level.green / 100)-1,0))), game.PD)), player.level.green));
    game.price.blue[0] = Log.pow(Log.multi(16, Log.add(Log.max(Log.div(Log.sub(player.level.blue[0], Log.add(1000, game.BPD)), Log.add(1000, game.BPD)), 0), 1)), Log.max(Log.sub(player.level.blue[0], game.BPD), 0));
    game.price.blue[1] = Log.multi(4, Log.pow(2, Log.max(Log.sub(player.level.blue[1],game.BPD),0)));
    game.price.blue[2] = Log.multi(8, Log.pow(2, Log.max(Log.sub(player.level.blue[2],game.BPD),0)));
    game.price.blue[3] = Log.multi(1048576, Log.pow(Log.pow(512, Log.max(Log.floor(Log.multi(Log.max(Log.sub(player.level.blue[3], 4), 0),Log.add(1.25,Log.multi(Log.max(Log.sub(Log.floor(Log.div(player.level.blue[3],5)),1),0),0.075)))), 1)), player.level.blue[3]));
    if (player.bars.red.mouse == 1){
        game.income.red = Log.div(Log.multi(Log.add(game.auto, Log.multi(game.click, 50)), game.IR), 256);
    }else{
        game.income.red = Log.div(Log.multi(game.auto, game.IR), 256);
    }
    game.income.green = Log.div(Log.multi(game.income.red, game.IG), 256);
    game.income.blue = Log.div(Log.multi(game.income.green, game.IB), 256);
}

function CalcSRgain(game:Game) {
    const player = game.player
    if (player.progress.includes(5)) {
        game.SR5 = Log.add(player.spliced.red, Log.multi(player.money.red, player.level.blue[3] / 10));
        game.SR5 = Log.multi(game.SR5, Log.add(player.spliced.green, Log.multi(player.money.green, player.level.blue[3] / 10)));
        game.SR5 = Log.multi(game.SR5, Log.add(player.spliced.blue, Log.multi(player.money.blue, player.level.blue[3] / 10)));
        game.SR5 = Log.max(game.SR5, 0);
        game.SR5 = Log.div(game.SR5, 16777216);
        if (player.spectrumLevel[13]){
            game.SR5 = Log.pow(game.SR5, Log.div(game.Cores, 256))
        }
        game.SR5 = Log.root(game.SR5, 3);
        game.SR5 = Log.max(Log.log(game.SR5, 1000), 0);
        game.SR5 = Log.multi(game.SR5, Log.add(Log.div(player.specced, 100), 1));
        game.SR5 = Log.multi(game.SR5, Log.add(Log.div(Log.add(Log.floor(Log.div(player.level.green, 100)), Log.floor(Log.div(player.level.red, 100))), 10), 1));
        if (player.progress.includes(6)){
            game.SR5 = Log.multi(game.SR5, Log.add(1, Log.div(player.level.blue[3], 10)));
        }
        if (player.progress.includes(9)){
            game.SR5 = Log.multi(game.SR5, Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1))));
        }
        game.SR5 = Log.max(Log.sub(game.SR5, 1), 0);
    }
    game.SR = Log.max(Log.multi(Log.multi(player.spliced.red, player.spliced.green), player.spliced.blue), 0);
    game.SR = Log.div(game.SR, 16777216);
    if (player.spectrumLevel[13]){
        game.SR = Log.pow(game.SR, Log.div(game.Cores, 256))
    }
    game.SR = Log.root(game.SR,3);
    game.SR = Log.max(Log.log(game.SR,1000), 0);
    game.SR = Log.multi(game.SR, Log.add(Log.div(player.specced, 100), 1));
    game.SR = Log.multi(game.SR, Log.add(Log.div(Log.add(Log.floor(Log.div(player.level.green, 100)), Log.floor(Log.div(player.level.red, 100))), 10), 1));
    if (player.progress.includes(6)){
        game.SR = Log.multi(game.SR, Log.add(1, Log.div(player.level.blue[3], 10)));
    }
    if (player.progress.includes(9)){
        game.SR = Log.multi(game.SR, Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1))));
    }
    game.SR = Log.max(Log.sub(game.SR, 1),0);
    const dom = game.domBindings;
    (dom.spectrumReset.childNodes[0] as HTMLElement).innerHTML = "Reset all progress and gain";
    if (player.progress.includes(5) && Log.get(game.SR5,"l") > Log.get(Log.multi(game.SR,1.05),"l")){
            (dom.spectrumReset.childNodes[1] as HTMLElement).innerHTML = "<b>" + formatNum(player, Log.floor(game.SR), 0) + "(" + formatNum(player, Log.floor(game.SR5), 0) + ") Spectrum</b>";
    }
    else{
        (dom.spectrumReset.childNodes[1] as HTMLElement).innerHTML = "<b>" + formatNum(player, Log.floor(game.SR), 0) + " Spectrum</b>";
    }
    if (Log.get(game.SR, "l") >= 3 || (player.progress.includes(5) && Log.get(game.SR5, "l") >= 3 )) {
        if (player.progress.includes(5)){
            (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = formatNum(player, Log.get(Log.div(game.SR5, player.spectrumTimer / 60000), "num") as num|number) + "/min";
        }
        else{
            (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = formatNum(player, Log.get(Log.div(game.SR, player.spectrumTimer / 60000), "num") as num|number) + "/min";
        }
    } else{
        (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = formatNum(player, Log.multi(Log.mod(game.SR, 1), 100)) + "% towards next";
    }
    if (player.advSpec.unlock) {
        var prevmulti = player.advSpec.multi;
        player.advSpec.multi = parseInt((document.getElementById("advSpectrumReset")!.childNodes[1].childNodes[0] as HTMLInputElement).value);
        if (player.advSpec.active && player.advSpec.multi != prevmulti) {
            if (player.advSpec.multi == 1){
                player.advSpec.active = false;
            }
            player.advSpec.time *= player.advSpec.multi / prevmulti;
        }
        let num = (player.advSpec.active ? player.advSpec.SR : game.SR);
        player.advSpec.gain = 0;
        for (var i = 0; i < player.advSpec.multi; i++) {
            player.advSpec.gain = Log.add(player.advSpec.gain,num);
            if(i%10 === 0){
                num = Log.multi(num, 1-player.advSpec.reduce);
            }
        }
        player.advSpec.gain = Log.floor(player.advSpec.gain);
        if (player.progress.includes(17)){
            player.advSpec.gain = Log.multi(player.advSpec.gain, 4);
        }
        if (player.spectrumLevel[19] === 1){
            player.advSpec.gain = Log.pow(player.advSpec.gain, 2)
        }
        if (player.advSpec.multi > 1) {
            (dom.spectrumReset.childNodes[0] as HTMLElement).innerHTML = "<b>Start Advanced Spectrum</b>";
            (dom.spectrumReset.childNodes[1] as HTMLElement).innerHTML = "";
            (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = formatTime(player.spectrumTimer * player.advSpec.multi) as string
            if (player.advSpec.active) {
                (dom.spectrumReset.childNodes[0] as HTMLElement).innerHTML = "<b>Advanced Spectrum Finishes in</b>";
                (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = formatTime(player.advSpec.time - player.spectrumTimer) as string;
                if (player.advSpec.time <= player.spectrumTimer) {
                    (dom.spectrumReset.childNodes[0] as HTMLElement).innerHTML = "Reset all progress and gain";
                    (dom.spectrumReset.childNodes[1] as HTMLElement).innerHTML = "<b>" + formatNum(player, player.advSpec.gain, 0) + " Spectrum</b>";
                    (dom.spectrumReset.childNodes[2] as HTMLElement).innerHTML = "Adv spectrum complete!";
                    (document.getElementById("advSpectrumReset")!.childNodes[1].childNodes[0] as HTMLInputElement).value = (player.advSpec.multi satisfies number) + "";
                }
            }
        }
        (document.getElementById("advSpectrumReset")!.childNodes[2] as HTMLElement).innerHTML = formatNum(player, player.advSpec.gain, 0) + " Spectrum";
    }
   
}

function formatNum(player:InitPlayer, num:number|num|string, dp?:number, type?:"Hz") {
    if (typeof num !== "number") {
        if (typeof num!=="string" && num.typ === "num") {
            num = Log.get(num,"num");
        }else {
            let suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
            num = Log.get(num,"log");
            let m = Math.pow(10, num % 1)
            let e = Math.floor(num);
            if(type === "Hz") e -= 9;
            let ret;
            if (num < 1000) ret =  m.toFixed(1) + "e" + e;
            else if (num < 100000) ret = m.toFixed(0) + "e" + e;
            else if (num < 1000000) ret = "e" + e;
            else if (num < 1e36) ret = "e" + (e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))).toFixed(3 - Math.floor(Math.log10(e / Math.pow(1000, Math.floor(Math.log(e) / Math.log(1000)))))) + suffix[Math.floor(Math.log(e) / Math.log(1000)) - 1];
            else ret = "Too Big";
            if (type === "Hz") ret += "Hz"
            return ret;
        }
    }
    if (dp == undefined) dp = 2;
    const suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
            if(typeof num!=="number"){
            throw Error("invalid num form")
        }
    if (type == "Hz") {
        const createSuffix = (num:number) =>{
            const smallHz = ["n", "&mu;", "m", ""]
            const preHz = ["","k", "M", "G", "T", "P", "E", "Z", "Y", "N"]
            if (num < 3){
                 return smallHz[num] + "Hz";
            }
            num -= 3;
            if (num < 10){
                return preHz[num] + "Hz";
            }
            if (num < 20){
                return "X" + preHz[num%10] + "Hz";
            }
            if (num == 20){
                return "bXHz";
            }
            const pre2 = ["b", "t", "q","Q","s","S","O","N","D"];
            return pre2[Math.floor((num - 20) / 10)] + "X" + preHz[(num % 10)] + "Hz";
        }   

        return num / Math.pow(1024, Math.floor(Math.log(num) / Math.log(1024))) + createSuffix(Math.floor(Math.log(num) / Math.log(1024)));
    } else if (num < 10000) {
        if (num === 0) return num.toFixed(0);
        let maxdp = Math.floor(Math.log10(num) * -1)+1;
        let mindp = Math.max(dp - Math.floor(Math.log10(num)),0);
        if (maxdp >= 2) return num.toFixed(maxdp);
        return num.toFixed(Math.min(dp, mindp));
    }else if (num < 1e36 && player.options.notation == "Default"){
         return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    }
    else{
        return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" + Math.floor(Math.log10(num));
    }
}

function unlockBlue(player:InitPlayer, domBindings:DomBindings) {
    if (Log.get(player.money.green,"n") as number >= 50) {
        player.money.green = Log.sub(player.money.green,50);
        player.unlock = true;
        domBindings.unlockBtn.classList.add("hidden");
        document.getElementById("blueDiv")!.classList.remove("hidden");
    }
}

function exportSave(game:Game){
    let temp = document.createElement("textarea");
    temp.value = btoa(savePlayer(game.player));
    document.getElementById("tabSettings")!.appendChild(temp);
    temp.select()
    document.execCommand("copy")//TODO: depricated method of putting stuff on clipboard, this is probably too much access to ask for?
    temp.parentNode!.removeChild(temp);
    pop(game, game.domBindings.popupDivs.saveCopy)
}

function save(player:InitPlayer, name?:"reset") {
    if (name === "reset"){
        localStorage.setItem("RGBsave", btoa(savePlayer(player)));
    }
    else {
        localStorage.setItem("RGBsave", btoa(savePlayer(player)));
    }
    console.log("Saved");
}

type InitPlayer = typeof resetplayer & {
    bars: {red: bar, green:bar, blue:bar}
}


function loadImport(){
    const temp = prompt("Enter your save:", "");
    if (temp) {
        try {
            if(!validate(loadPlayer(atob(temp)), PlayerValidator)){
                throw Error("failure to load player")
            }
            if (typeof (loadPlayer(atob(temp))) === "object") {
                localStorage.setItem("RGBsave", temp);
                document.location.reload();
            }
        } catch (e) {
            alert("Invalid save file!")
        }
    }
}

function load() {
    if (localStorage.getItem("RGBsave") !== null) {
        const saveValue = localStorage.getItem("RGBsave")
        let temp = loadPlayer(saveValue?atob(saveValue):"null");
        let names = ["red" as const,"green"  as const ,"blue"  as const];
        for (let i = 0; i < 3; i++){
            let barWidth = temp.bars[names[i]].width
            if (typeof barWidth==="number" && isNaN(barWidth)) {
                console.log(temp.bars[names[i]].width)
                temp.bars[names[i]].width = 0;
            } else {
                temp.bars[names[i]].width = temp.bars[names[i]].width;
            }
        }
        return temp;
    } else{
        return false;
    }
}

function reset(game:Game, type:number, force?:boolean) {
    const player = game.player
    if (type >= 1) {
        if (player.progress.includes(5)) {
            spliceColor(game, "red");
            spliceColor(game,"green");
            spliceColor(game,"blue");
        }
        CalcSRgain(game);
        if (Log.get(game.SR, "log") >= 0 || force) {
            if (player.advSpec.multi > 1 && !force) {
                if (player.advSpec.active) {
                    if (player.advSpec.time <= player.spectrumTimer) {
                        pCheck(game, 17);
                        player.advSpec.active = false;
                        if (player.progress.includes(17)) player.advSpec.multi *= 4;
                        if (player.spectrumLevel[19] === 1) player.specced += Math.pow(player.advSpec.multi, 3);
                        else player.specced += player.advSpec.multi;
                        player.advSpec.multi = 1;
                        if (player.spectrumLevel[19] === 1) player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
                        else player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
                    if (!force) player.previousSpectrums = [{ time: player.spectrumTimer, amount: player.advSpec.gain }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
                }else return
                } else {
                    player.advSpec.SR = game.SR;
                    player.advSpec.time = player.spectrumTimer * (player.advSpec.multi + 1);
                    player.advSpec.active = true;
                    return
                }
            } else {
                player.spectrum = Log.add(player.spectrum,Log.floor(game.SR));
                if(!force)player.previousSpectrums = [{ time: player.spectrumTimer, amount: game.SR }, player.previousSpectrums[0], player.previousSpectrums[1], player.previousSpectrums[2], player.previousSpectrums[3]];
                player.specced += 1;
            }
            if (player.advSpec.active && force) {
                pCheck(game, 17);
                player.advSpec.active = false;
                if (player.progress.includes(17)) player.advSpec.multi *= 4;
                if (player.spectrumLevel[19] === 1) player.specced += Math.pow(player.advSpec.multi, 3);
                else player.specced += player.advSpec.multi;
                player.advSpec.multi = 1;
                if (player.spectrumLevel[19] === 1) player.spectrum = Log.add(player.spectrum, Log.pow(player.advSpec.gain, 2));
                else player.spectrum = Log.add(player.spectrum, player.advSpec.gain);
            }
            if (player.specced == 0) document.getElementById("spectrumCountRGB")!.classList.remove("hidden");
            pCheck(game, 16);
            for (var i = 0; i < 3; i++){
                player.bars[PLAYER_MONEY_KEYS[i]].width = 0;
            }
            player.money = { red: 0, green: 0, blue: 0 };
            player.level = { red: 0, green: 0, blue: [0, 0, 0, 0] };
            player.unlock = player.spectrumLevel[6] == 1;
            player.spliced = { red: 0, green: 0, blue: 0 };
            player.spectrumTimer = 0;
            if (!player.unlock) {
                game.domBindings.unlockBtn.classList.add("hidden");
                document.getElementById("blueDiv")!.classList.add("hidden");
            }
            document.getElementById("spectrumDiv")!.classList.add("hidden");
            player.CM = 1;
            updateStats(game);
            CalcSRgain(game);
            pCheck(game, 9);
            if (!force){
                pCheck(game, 1);
            }
        }
    } else {
        save({
            ...resetplayer,
            bars: { red: new bar("red", 255, 0, 0, "redBar"), green: new bar("green", 0, 255, 0, "greenBar"), blue: new bar("blue", 0, 0, 255, "blueBar") }
        }, "reset");
        document.location.reload();
    }
}

function flip(game:Game, option:keyof InitPlayer["options"]) {
    const player = game.player
    if (option === "fps") {
        var temp = [10, 20, 40, 50];
        player.options.fps = temp[(temp.indexOf(player.options.fps) + 1) % 4];
        const frameTime = 1000 / player.options.fps;
        if(game.mainLoop!==null){
            clearInterval(game.mainLoop);
        }
        game.mainLoop = setInterval(game.gameLoop,frameTime)
    }else if(option === "notation"){
        const temp = ["Default" as const, "Scientific" as const];
        player.options.notation = temp[(temp.indexOf(player.options.notation) + 1) % 2];
    }else{
        player.options[option] = !player.options[option]
    }
}

function mix(game:Game, PC?:unknown) {
    const player = game.player
    if (!player.prism.active) {
        if (PC == undefined) {
            //pop(game, 10); //FIXME what message was this indended to be
            return;
        } else {
            if (PC) {
                reset(game, 1, true);
                player.spectrum = new num(0);
                document.getElementById("blackCountRGB")!.classList.remove("hidden");
                document.getElementById("newupgrades")!.classList.add("hidden");
                player.prism.active = true;
                game.mixCost = 0;
            } else{
                return
            }
        }
    }
    if(!game.blackBar && !player.progress.includes(13)){
         if (!confirm("You are about to create a prism that has no way of creating blackness!\n Are you sure you want to do this?")){
            return;
        }
    }
    if (!game.colorBar){
         if (!confirm("You are about to create a prism that has no production for colors (This means you can't fesibly make black for next prism)!\n Are you sure you want to do this?")){
            return;
         }
    }
    if(game.mixCost===undefined){
        throw Error("mix cost not defined")
    }
    if (Log.get(player.black ,"log") >= Log.get(game.mixCost,"log")) {
        pCheck(game, 3);
        pCheck(game, 4);
        mixReset();
        if (player.progress.includes(13)){
            player.black = Log.sub(player.black, game.mixCost);
        }
        else{
             player.black = new num(0);
        }
    } else if (
        Log.get(player.spectrum,"log") >= Log.get(Log.div(game.mixCost, Log.max(player.black,1)),"log") 
        && confirm(
            "Do you want to pay the missing blackness using Spectrum? \nThis will cost " +
            formatNum(player, Log.div(game.mixCost, Log.max(player.black,1)), 0) +
            " Spectrum. This will leave with "+
            formatNum(player, Log.sub(player.spectrum, Log.div(game.mixCost, Log.max(player.black,1))),0)
            +" Spectrum."
        )
    ) {
        pCheck(game, 3);
        pCheck(game, 4);
        player.spectrum = Log.sub(player.spectrum, Log.div(game.mixCost, Log.max(player.black, 1)));
        mixReset();
        player.black = new num(0);
    }
    function mixReset() {
        let csum = 0;
        game.p3 = true;
        pCheck(game, 10);
        player.specbar = Object.assign(player.specbar, player.prism.specbar);
        player.potencyEff = Object.assign(player.potencyEff, player.prism.potencyEff);
            for (let i = 0; i < 3; i++) {
                var temp = PLAYER_MONEY_KEYS[i];
                var row = document.getElementById(temp + "Prism") as HTMLTableRowElement;
                let pot = document.getElementById(temp + "pot") as HTMLElement;
                player.prism.potencyEff[temp] = Log.pow(256, player.prism.potency[temp]);
                if (Log.get(player.prism.potencyEff[temp],"l") === Log.get(player.potencyEff[temp],"l")){
                     pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, player.prism.potency[temp],0);
                }
                else{
                    pot.getElementsByClassName("amnt")[0].innerHTML = formatNum(player, Log.log(player.potencyEff[temp],256),0) + "(" + formatNum(player, player.prism.potency[temp],0) + ")";
                }
                player.potencyEff[temp] = Log.pow(256, player.prism.potency[temp]);
                player.bars[temp].color = [
                    Math.floor((row.cells[2].childNodes[0] as HTMLInputElement).valueAsNumber),
                    Math.floor((row.cells[2].childNodes[2] as HTMLInputElement).valueAsNumber),
                    Math.floor((row.cells[2].childNodes[4] as HTMLInputElement).valueAsNumber)
                ];
                csum += SumOf(player.bars[temp].color);
                switchTab(game, "RGB", 0);
                reset(game, 1, true);
            }
            pCheck(game, 14);
            pCheck(game, 8);
        }
}


function switchTab(game:Game, name:"RGB"|"Spectrum"|"Settings"|"Stats"|"Upgrades"|"Progress"|"Prism", _:number, sub?:"spectrum") {
    if (sub == undefined){
        game.tab = name as any;
    }else{
        game.subtab[sub] = name as any;//TODO fix this signature
    }
    for (let i = 0; i < document.getElementsByClassName("tab").length; i++) {
        document.getElementsByClassName("tab")[i].classList.add("hidden");
        document.getElementsByClassName("switch")[i].classList.remove("active");
        if ("tab" + game.tab === document.getElementsByClassName("tab")[i].id || "tab" + game.subtab.spectrum === document.getElementsByClassName("tab")[i].id){
            document.getElementsByClassName("tab")[i].classList.remove("hidden");
        }
        if (game.tab === document.getElementsByClassName("switch")[i].innerHTML || game.subtab.spectrum === document.getElementsByClassName("switch")[i].innerHTML){
            document.getElementsByClassName("switch")[i].classList.add("active");
        }
    }
}

function displayIncome(game:Game, name:"red"|"green"|"blue", index?:0|1|2|"black"|"miniBlack"|"spectrum") {
    let num:0|num = 0;
    const player = game.player
    if (player.prism.active) {
        if (index === "black"){
            num = Log.max(Log.sub(getBlack(game, name, 1000, Log.div(game.income[name],100), 0, player.spectrum), player.black),0);
        }else if (index === "miniBlack"){
            num = Log.max(Log.sub(getBlack(game, name, 1000, Log.div(game.income[name], 100), 0, player.spectrum, true), player.black), 0);
        }else if (index === "spectrum"){
            num = getSpec(game, name, game.income[name],1000);
        }else{
            num = Log.multi(game.income[name],getColorPotency(player,name,player.bars[name].color[index as number]));
        }
    }else{
        num = Log.multi(game.income[name], (player.spectrumLevel[1]+1));
    }
    return(num)
}

function spliceColor(game:Game, name:"red"|"green"|"blue") {
    const player = game.player
    if (player.level.blue[3] === 0){
        return;
    }
    player.spliced[name] = Log.add(player.spliced[name], Log.multi(player.money[name], player.level.blue[3] / 10));
    if (player.level.blue[3] >= 10) player.money[name] = 0;
    else player.money[name] =Log.sub(player.money[name],Log.multi(player.money[name], Math.min(player.level.blue[3] / 10, 1)));
    if (Log.lt(player.spliced[name], 0)){
        player.spliced[name] = 0;
    }
    CalcSRgain(game);
    pCheck(game, 5);
}

function SumOf(arr:Array<number>) {
    return arr.reduce((acc, num) => acc + num);
}

function ToggleAB(game:Game, name:"all"|"red"|"green"|"blue"){//toggles auto buyers
    const player = game.player
    if (name == "all") {
        player.AB.red = !player.AB.red;
        player.AB.green = !player.AB.green;
        player.AB.blue = !player.AB.blue;
    } else{
        player.AB[name] = !player.AB[name];
    }
    SUInfo((document.getElementById("spectrumButton" + 4)!.childNodes[1] as HTMLElement), game, 4);
    SUInfo((document.getElementById("spectrumButton" + 5)!.childNodes[1] as HTMLElement), game, 5);
    SUInfo((document.getElementById("spectrumButton" + 9)!.childNodes[1] as HTMLElement), game, 9);
}

function pop(game:Game, div:HTMLElement) {
    div.style.visibility = "visible";
    document.body.onmousemove = function (event) {
        div.style.top = event.clientY + "px";
        div.style.left ="calc(" + event.clientX + "px - 12.5%)";
    };
    let open = true
    function close(){
        if(!open){
            return
        }
        open = false
        if(closeTimeout!==null){
            window.clearTimeout(closeTimeout)
        }
        window.removeEventListener("keydown", handleEsc);

        div.style.visibility = "hidden";
        if(div === game.domBindings.popupDivs.prismRise){//TODO this is very very weird
            mix(game, true);
        }else if(div === game.domBindings.popupDivs.limit){//TODO this is very very weird
            throw Error("code path would hit undefined method reduceProd")
            //reduceProd("red");
            //reduceProd("green");
            //reduceProd("blue");
            //player.pop = true;
        }
        document.body.onclick = null;
        document.body.onmousemove = null;
        window.removeEventListener("keydown", handleEsc);        
    }
    let closeTimeout:null|number = setTimeout(function(){
        document.body.onclick = function () { 
            close()
        }
    },200)
    function handleEsc(event:KeyboardEvent) {
        let key = event.keyCode || event.which;
        if (key === 27) {
            close()
        }
    }
    window.addEventListener("keydown",handleEsc)
}

let RemoveExistingListeners:null|(()=>void) = null
function setupKeyListeners(game:Game){
    if(RemoveExistingListeners){
        RemoveExistingListeners()
    }
    const keyPressHandler = function(event:KeyboardEvent) {
        const key = event.keyCode || event.which; //TODO this is depricated, also really hard to figure out which key is which
        if (key == 114) {
            while (buyUpgrade(game, "red")){
                //TODO: this looks like a ui freezing hazard
            }
            game.p3 = false;
        }
        if (key == 103) {
            while (buyUpgrade(game, "green")){
                //TODO: this looks like a ui freezing hazard
            }
            game.p3 = false;
        }
        if (key >= 49 && key <= 52) {
            while (buyUpgrade(game, "blue", key % 49)){
                //TODO: this looks like a ui freezing hazard
            }
            game.p3 = false;
        }
        if (key == 109) {
            while (buyUpgrade(game, "green")){
                //TODO: this looks like a ui freezing hazard
            }
            while (buyUpgrade(game, "red")){
                //TODO: this looks like a ui freezing hazard
            }
            for (var i = 0; i < 4; i++){
                while (buyUpgrade(game, "blue", i)){
                    //TODO: this looks like a ui freezing hazard
                }
            }
            game.p3 = false;
        }
    }
    window.addEventListener("keypress", keyPressHandler, false)
    const keyDownHandler = function (event:KeyboardEvent) {
        var key = event.keyCode || event.which; //TODO this is depricated, also really hard to figure out which key is which
        if (key == 32) {
            press(game, "red",1)
        }
        if (key == 65){
            ToggleAB(game, "all");
        }
    }
    window.addEventListener("keydown", keyDownHandler, false)
    const keyUpListener = function (event:KeyboardEvent) {
        var key = event.keyCode || event.which;//TODO this is depricated, also really hard to figure out which key is which
        if (key == 32) {
            press(game, "red", 0)
        }
    }
    window.addEventListener("keyup", keyUpListener, false)

    RemoveExistingListeners = function(){
        window.removeEventListener("keypress", keyPressHandler)
        window.removeEventListener("keydown", keyDownHandler)
        window.removeEventListener("keyup", keyUpListener)
    }
}



function simulateTime(game:Game, timeIn:number) {
    const player = game.player
    console.log("You were offline for " + formatTime(timeIn));
    player.spectrumTimer += timeIn;
    player.sleepingTime += timeIn;
    let time:number|num = timeIn
    let bprod:Array<num|0> = [Log.div(Log.multi(game.auto, game.IR), 256), Log.div(Log.multi(Log.multi(game.auto, game.IR), game.IG), 65536), Log.div(Log.multi(Log.multi(Log.multi(game.auto, game.IR), game.IG), game.IB), 16777216)];
    if (!player.unlock){
        bprod[2] = 0;
    }
    const color = { red: [player.bars.red.color[0], player.bars.green.color[0], player.bars.blue.color[0]], green: [player.bars.red.color[1], player.bars.green.color[1], player.bars.blue.color[1]], blue: [player.bars.red.color[2], player.bars.green.color[2], player.bars.blue.color[2]] };
    const names = ["red" as const, "green" as const, "blue" as const]; 
    const prod = { red: 0 as number|num, green: 0 as number|num, blue: 0 as number|num, spec: 0 as 0|num }
    for (let i = 0; i < names.length; i++) {
        if (player.specbar[names[i]]) {
            prod.spec = Log.add(prod.spec, getSpec(game, names[i], bprod[i], 1000));
            for (let j = 0; j < names.length; j++){
                color[names[j]][i] = 0;
            }
        }
    }
    for (let i = 0; i < names.length; i++) {
        prod[names[i]] = color[names[i]].reduce(function (acc:number|num, val, j) {
            return Log.add(acc, Log.multi(bprod[j], (player.prism.active ? getColorPotency(player,names[j], val) : (player.spectrumLevel[1] + 1) * val / 255)))
        }, 0);
    }
    for (let i = 0; i < names.length; i++) {
        if (SumOf(player.bars[names[i]].color) === 0) player.black = getBlack(game, names[i], time, Log.div(bprod[i],1000), prod.spec, player.spectrum);
        if (player.bars[names[i]].color.filter(function (item) { return item === 0 }).length == 2 && player.progress.includes(8)) player.black = getBlack(game, names[i], time, Log.div(bprod[i],1000), prod.spec, player.spectrum, true);
    }
    while (Log.gt(Log.get(time,"n"), 0)) {
        
        let nextRed = Log.div(Log.sub(game.price.red, player.money.red), prod.red);
        let nextGreen = Log.div(Log.sub(game.price.green, player.money.green), prod.green);
        let nextBlue = Log.min(
            Log.min(
                Log.div(Log.sub(game.price.blue[0], player.money.blue), prod.blue),
                Log.min(
                    Log.div(Log.sub(game.price.blue[1], player.money.blue), prod.blue),
                    Log.div(Log.sub(game.price.blue[2], player.money.blue), prod.blue)//previously a bug prevented this from being concidered
                )
            ),
            Log.div(Log.sub(game.price.blue[3], player.money.blue), prod.blue)
        );
        let nextUp:number|num = time;
        if (player.AB.red && player.spectrumLevel[9]){
            nextUp = Log.min(nextUp, nextRed);
        }
        if (player.AB.green && player.spectrumLevel[9]){
            nextUp = Log.min(nextUp, nextGreen);
        }
        if (player.AB.blue && player.spectrumLevel[9]){
            nextUp = Log.min(nextUp, nextBlue);
        }
        let nextTime = Log.floor(Log.max(Log.div(time, 100), 5000));

        if (Log.get(nextTime,"l") > Log.get(nextUp, "l")) {
            player.money.red = Log.add(player.money.red, Log.div(Log.multi(prod.red, Log.min(nextTime, time)), 1000));
            player.money.green = Log.add(player.money.green, Log.div(Log.multi(prod.green, Log.min(nextTime, time)), 1000));
            player.money.blue = Log.add(player.money.blue, Log.div(Log.multi(prod.blue, Log.min(nextTime, time)), 1000));
            player.spectrum = Log.add(player.spectrum, Log.div(Log.multi(prod.spec, Log.min(nextTime, time)), 1000));
            time = Log.sub(time, Log.min(nextTime, time));
            
        } else {
            player.money.red = Log.add(player.money.red, Log.div(Log.multi(prod.red, Log.min(nextUp, time)), 1000));
            player.money.green = Log.add(player.money.green, Log.div(Log.multi(prod.green, Log.min(nextUp, time)), 1000));
            player.money.blue = Log.add(player.money.blue, Log.div(Log.multi(prod.blue, Log.min(nextUp, time)), 1000));
            player.spectrum = Log.add(player.spectrum, Log.div(Log.multi(prod.spec, Log.min(nextUp, time)), 1000));
            time = Log.sub(time,Log.min(nextUp, time));
        }
        if(player.AB.red && player.spectrumLevel[4]){
            while (buyUpgrade(game, "red")){
                //TODO this loop looks like it could cause the ui to freeze
            }
        }
        if (player.AB.green && player.spectrumLevel[5]){
            while (buyUpgrade(game, "green")){
                  //TODO this loop looks like it could cause the ui to freeze
            }
        }
        if (player.AB.blue && player.spectrumLevel[9]){
            for (var i = 0; i < 4; i++){
                while (buyUpgrade(game, "blue", i)){}
            }
        }
        updateStats(game);
        prod.spec = 0;
        let bprod = [Log.div(Log.multi(game.auto, game.IR), 256), Log.div(Log.multi(Log.multi(game.auto, game.IR), game.IG), 65536), Log.div(Log.multi(Log.multi(Log.multi(game.auto, game.IR), game.IG),game.IB), 16777216)];
        for (let i = 0; i < names.length; i++) {
            if (player.specbar[names[i]]) {
                prod.spec = Log.add(prod.spec, getSpec(game, names[i], bprod[i], 1000));
                for (let j = 0; j < names.length; j++) color[names[j]][i] = 0;
            }
        }
        for (let i = 0; i < names.length; i++) {
            prod[names[i]] = color[names[i]].reduce(function (acc:number|num, val, i) {
                 return Log.add(acc, Log.multi(bprod[i], (player.prism.active ? getColorPotency(player,names[i], val) : (player.spectrumLevel[1] + 1)))) 
            }, 0);
        }
    }
    console.log("Finished simulating offline time!");
}

function formatTime(num:number) {
    if (num >= 1.728e+8){
         return Math.floor(num / 8.64e+7) + " days and " + Math.floor((num % 8.64e+7) / 3600000) + " hours";
    }
    //TODO this one liner makes me sad.
    return (num >= 3600000 ? Math.floor(num / 3600000) + " hours and " + Math.floor((num % 3600000) / 60000) + " mins" : (num >= 60000 ? Math.floor(num / 60000) + " mins and " + Math.floor((num % 60000) / 1000) + " secs" : (num >= 10000 ? Math.floor(num / 1000) + " secs" : (num > 0 ? Math.round(num) + " millis" : 0))));
}

function getSpec(game:Game, name:"red"|"green"|"blue", prod:number|num, time:number|num) {
    let timeRatio = Log.div(time, 1000);
    const player = game.player
    
    let blackMulti:number|num = 1;
    if (player.progress.includes(11)){
        blackMulti = Log.max(Log.sqrt(Log.max(Log.log10(player.black),0)), 1);
    }
    let logprod = Log.floor(Log.max(Log.pow(Log.log(Log.multi(prod,10), 10),Log.log(game.Cores, 128)), 0));
    let coreMulti:number|num = 1;
    if (player.progress.includes(6)){
        coreMulti = Log.add(1, Log.div(player.level.blue[3], 10));
    }
    let timeMulti:number|num = 1;
    if (player.progress.includes(9)){
        timeMulti = Log.add(1, Log.log10(Log.max(Log.div(player.spectrumTimer, 60000), 1)));
    }
    let potMulti:number|num = 1;
    if (player.progress.includes(14)){
        potMulti = Log.pow(16, (Log.floor(Log.div(Log.log(player.potencyEff[name], 256), 5))));
    }
    let specMulti:number|num = 1;
    if (player.progress.includes(16)){
        specMulti = Log.sqrt(player.specced);
    }
    return Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(Log.multi(blackMulti, logprod), coreMulti), timeMulti), potMulti), timeRatio),specMulti);
}

function getBlack(game:Game, name:"red"|"green"|"blue", time:number|num, prod:number|num, specprod:number|num, spectrum:number|num, mini?:boolean) {
    const player = game.player
    let A = Math.pow(2,1/(1 + Math.min(player.prism.cost/10,0.5)));
    if (mini){
        A = 3;
    }
    let mults;
    if(player.spectrumLevel[18] === 1) {
        mults = Log.max(Log.multi(Log.multi(Log.multi(prod, Log.pow(player.potencyEff[name],Log.add(1,Log.floor(Log.div(Log.log(player.potencyEff[name],256),7))))), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? game.Cores : 1)), 0);
    }else{ 
        mults = Log.max(Log.multi(Log.multi(Log.multi(prod, player.potencyEff[name]), (player.spectrumLevel[1] + 1)), (player.progress.includes(3) ? game.Cores : 1)), 0);
    }
    let blackThreshold = 1e100;
    let ret = Log.root(Log.add(Log.div(Log.multi(Log.multi(mults, time), Log.add(Log.multi(specprod, time), Log.multi(2, spectrum))),blackThreshold), Log.pow(player.black, A)), A);
    if (Log.get(ret, "l") < -2){
        return new num(0);
    }
    return ret;
}

function getColorPotency(player:InitPlayer, name:"red"|"green"|"blue", color:number, prism?:boolean) {
    let potency = player.potencyEff[name];
    if (prism) potency = player.prism.potencyEff[name];
    let multi = (player.spectrumLevel[1] + 1);
    color = (color / 255) * (player.prism.cost/2 + 1);
    if(Log.lt(Log.get(potency,"n"), 1)){
        return color / 512;
    }
    let ret = Log.sub(Log.pow(Log.multi(potency , multi), color),1);
    if (player.progress.includes(12)) {
        if (prism){
            ret = Log.multi(
                ret,
                Log.pow(256,
                    [
                        ((document.getElementById(name + "Prism") as HTMLTableRowElement).cells[2].childNodes[0] as HTMLInputElement).valueAsNumber,
                        ((document.getElementById(name + "Prism") as HTMLTableRowElement).cells[2].childNodes[2] as HTMLInputElement).valueAsNumber,
                        ((document.getElementById(name + "Prism") as HTMLTableRowElement).cells[2].childNodes[4] as HTMLInputElement).valueAsNumber
                    ].filter(function (item) { return item === 0 }).length
                )
            );
        }else{
             ret = Log.multi(ret,Log.pow(256, player.bars[name].color.filter(function (item) { return item === 0 }).length));
        }
    }
    return ret;
}


if(document.readyState==="complete"){
    init()
}else{
    document.onreadystatechange = function(){
        if(document.readyState==="complete"){
            init()
        }
    }
}
