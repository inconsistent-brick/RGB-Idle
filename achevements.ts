const achievements:Array<{name:string, requirements:string, reward:string, check:(game:Game)=>void, draw:(game:Game)=>void, mount:(to:HTMLElement)=>void, c:number}>  = [
    {//0
        "name":"And we're back!",
        "requirements":"Reach spectrum once again!",
        "reward":"Unlock Potency Upgrades",
        doAquire:function(){
            return true
        },
        c:1
    },
    {//1
        "name":"\"Grinding ain't fun!\" - Hunter",
        "requirements":"Buy your first potency upgrade. ^^Unlocked here^^",
        "reward":"Advanced spectrum options(yay, long runs)",
        doAquire:function(game:Game){
            const player = game.player
            if(!player.advSpec.unlock){
                player.advSpec.unlock = true;
                game.domBindings.advSpectrumReset.classList.remove("hidden");
                return true
            }
            return false
        },
        c:2
    },
    {//2
        "name":"Darkness I embrace you!",
        "requirements":"Do a 3 black bar prism when having over 1e50 black",
        "reward":"Black gain is multiplied by core count",
        doAquire:function(game:Game){
            const player = game.player
            return Log.get(player.black, "log") >= 50
        },
        c:3
    },
    {//3
        "name":"Guess I'll have to do it myself!",
        "requirements":"Prism with 1000 or more blackness without autobuyers or hotkeys",
        "reward":"Divides autobuyer interval by 8",
        doAquire(game:Game){
            const player = game.player
            if (game.p3 && Log.get(player.black,"l") >= 3) {
                game.domBindings.spectrumTable.divs[4].description.textContent = "Auto Buy Max Red Level Every " + 0.25 + "s";
                game.domBindings.spectrumTable.divs[5].description.textContent = "Auto Buy Max Green Level Every " + 0.25 + "s";
                game.domBindings.spectrumTable.divs[9].description.textContent = "Auto Buy Max Blue Upgrades Every " + 0.25 + "s";
                game.ABInt = { red: 2000 / 8, green: 2000 / 8, blue: 2000 / 8 };
                return true
            }
            return false
        },
        c:4
    },
    {//4
        "name":"Ooh, half way there!",
        "requirements":"Get all spliced color to have an exponent of exactly 128",
        "reward":"Auto splice each color once when you click the spectrum button",
        doAquire:function(game:Game){
            const player = game.player
            return Math.floor(Log.get(player.spliced.red, "l")) === 128 && 
                Math.floor(Log.get(player.spliced.green, "l")) == 128 && 
                Math.floor(Log.get(player.spliced.blue, "l")) == 128
            
        },
        c:5
    },
    {//5
        "name":"Cores... who needs those!",
        "requirements":"Reach e64 blue without buying a single core upgrade",
        "reward":"Spectrum gain is increase by 10% per core upgrade",
        doAquire:function(game:Game){
            const player = game.player
            return Log.get(player.money.blue, "l") >= 64 && player.level.blue[3] === 0
        },
        c:6
    },
    {//6
        "name":"Tick tock, tick tock...",
        "requirements":"You have to do something import...ant",
        "reward":"Get a free clock speed upgrade every 6 mins(capped at 10)",
        doAquire:function(){
            return true
        },
        c:7
    },
    {//7
        "name":"Back to my roots!",
        "requirements":"Create the same old Red, Green and Blue bars as initially",
        "reward":"Bars made of only 1 color produce a tiny bit of black",
        doAquire:function(game:Game){
            const bars = game.player.bars
            return (
                bars.red.color[0] === 255 && 
                bars.green.color[1] === 255 &&
                bars.blue.color[2] === 255
            )
        },
        c:8
    },
    {//8
        "name":"Light flashes by you!",
        "requirements":"A spectrum that creates over 1M Spectrum/sec",
        "reward":"Spectrum gain is multiplied by log10(mins)",
        doAquire:function(game:Game){
            const player = game.player
            return Log.div(player.previousSpectrums[0].amount, (player.previousSpectrums[0].time / 1000)).gte({typ:"num", val:1000000})
        },
        c:9
    },
    {//9
        "name":"\"It's not a phase, mom!\" - Boo",
        "requirements":"Switch between colored and black bars for 10 consecutive prisms",
        "reward":"Prod is increased by log10(black)",
        doAquire:function(game:Game){
            const player = game.player
            if (game.p10 === 9) {
                return true
            }
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
            return false
        },
        c:10
    },
    {//10
        "name":"The light always wins!",
        "requirements":"Have your spectrum per second be higher than your black per second",
        "reward":"Spectrum bars are multiplied by log10(black)",
        doAquire:function(game:Game){ //TODO this can't be the best way to get black per second
            const player = game.player
            let b:num = new num(0);
            let w:num = new num(0);
            for (let i = 0; i < BAR_KEYS.length; i++) {
                if (player.specbar[BAR_KEYS[i]]) {
                    w = w.add(displayIncome(game, BAR_KEYS[i],"spectrum"))
                }
            }
            const backToMyRoots = player.progress.includes(8) //(causes a tiny bit of black to be produced)
            for (let i = 0; i < BAR_KEYS.length; i++) {
                if (SumOf(player.bars[BAR_KEYS[i]].color) === 0){
                    b = b.add(displayIncome(game, BAR_KEYS[i], "black"))
                }
                if (
                    player.bars[BAR_KEYS[i]].color.filter(function (item) { return item === 0 }).length === 2 &&
                    backToMyRoots
                ){ // Back to my roots (causes a tiny bit of black to be produced)
                     b = b.add(displayIncome(game, BAR_KEYS[i], "miniBlack"))
                }
            }
            return w.gt(b)
        },
        c:11
    },
    {//11
        "name":"\"The best color\" - Omsi",
        "requirements":"Get 1000 red lvls without producing any green",
        "reward":"Bars produce more based on how little of other colors the bar contains",
        doAquire:function(game:Game){
            const player = game.player
            return Log.get(player.money.green, "n") === 0 && player.level.green === 0 && player.level.red >= 1000
        },
        c:12
    },
    {//12
        "name":"My soul has been devoured!",
        "requirements":"Exceed e256 Blackness",
        "reward":"Blackness is not reset on prism creation",
        doAquire:function(game:Game){
            const player = game.player
            return Log.get(player.black, "l") >= 256
        },
        c:13
    },
    {//13
        "name":"Gimme MOAR spectrum",
        "requirements":"Create a prism with 3 spectrum bars",
        "reward":"Every 5 potency now increase spectrum bars gain by 16x",
        doAquire:function(game:Game){
            const player = game.player
            return player.specbar.red && player.specbar.green && player.specbar.blue
        },
        c:14
    },
    {//14
        "name":"\"YOU BROKE IT!!! again...\" - Philipe",
        "requirements":"Break your first prism",
        "reward":"Blackness denominator is reduced based on amount of broken prisms",
        doAquire:function(game:Game){
            const player = game.player
            return player.prism.cost > 0
        },
        c:15
    },
    {//15
        "name":"Look at my insane specs",
        "requirements":"Reach 10k specced stat",
        "reward":"Specced multi effects spectrum bars with reduced effect.",
        doAquire:function(game:Game){
            const player = game.player
            return player.specced >= 10000
        },
        c:16
    },
    {//16
        "name":"Am I playing RG?",
        "requirements":"Finish an Adv. spectrum that lasts over 1 hour",
        "reward":"Adv. spec are 4x as strong(specced and spectrum)",
        doAquire:function(game:Game){
            const player = game.player
            return player.advSpec.time >= 3.6e6
        },
        c:17
    }
].map(function(item, index){
    const row = document.createElement("td")
    const description = document.createElement("td")
    const requirements = document.createElement("td")
    const reward = document.createElement("td")
    description.textContent = item.name
    requirements.textContent = item.requirements
    reward.textContent = item.requirements
    row.appendChild(description)
    row.appendChild(requirements)
    row.appendChild(reward)

    const pValue = index+1
    return {
        ...item,
        check:function(game:Game){
            const player = game.player
            if(!player.prism.active || player.progress.includes(pValue)){ // no upgrade can be aquired before prism, or if it's already aquired
                return
            }
            if(this.doAquire(game)){
                player.progress.push(pValue);
                pop(game, game.domBindings.popupDivs.progressFinish);
            }
        },
        mount:function(item:HTMLElement){
            item.appendChild(row)
        },
        draw(game:Game){
            if(game.player.progress.includes(pValue)){
                row.style.backgroundColor = "green";
            }{
                row.style.backgroundColor = ""
            }
        }
    }
})

for(let i=0; i<achievements.length; i++){
    let item = achievements[i]
    if(item.c!==i+1){
        throw Error("temp check fails")
    }
}

function pCheck(game:Game, a:number){
    achievements[a-1].check(game)   
}