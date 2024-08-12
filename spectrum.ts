const spectrumUpgrades = [
    {
        "price":1,
        "description":"Click Multi Effects Auto",
        "c":0,
        info:function(game:Game){
            const player = game.player
            return "Current CM: " + Math.max(Math.log10(player.CM), 1).toFixed(1) + "x";
        }
    },
    {
        c:1,
        "price":1,
        "description":"Double Output of All Bars"
    },
    {
        "price":3,"description":"Double Bar Gain (R&G)",
        c:2,
        info:function(game:Game){
            const player = game.player
            return "Base Bar Increase: " + (2 + player.spectrumLevel[2] * 2) + "/256";
        }
    },
    {
        c:3,
        "price":5,
        "description":"Click Multi only Resets on Spectrum"
    },
    {
        c:4,
        "price":5,
        "description":"Auto Buy Max Red Level Every 2.00s"
    },
    {
        c:5,
        "price":7,
        "description":"Auto Buy Max Green Level Every 2.00s"
    },
    {
        c:6,
        "price":10,
        "description":"Start with Blue Unlocked"
    },
    {
        "price":30,
        c:7,
        "description":"Bar Gain Upgrades Scale per 10",
        "info":function(game:Game){
            const player = game.player
            return "Current Multi per 10: " + (player.spectrumLevel[7] + 1) + "x";
        }
        

    },
    {
        "price":50,
        c:8,
        "description":"Increase Bonus per 10",
        "info":function(game:Game){
            const player = game.player
            return "Current Multi per 10: " + (1.15 + player.spectrumLevel[8] * 0.15).toFixed(2-player.spectrumLevel[8]) + "x";
        }
    },
    {
        c:9,
        "price":75,
        "description":"Auto Buy Max Blue Upgrades Every 2.00s"
    },
    {
        "price":300,
        "description":"Decrease Price Scaling (R&G)",
        c:10,
        "info":function(game:Game){
            return "R&G cost " + ((1 - game.PD) * 100) + "% less";
        }
    },
    {
        "price":500,
        "description":"Auto Bonus Based on Red Lvl",
        c:11,
        "info":function(game:Game){
            const player = game.player
            return "Current Multi: " + formatNum(player, player.level.red,0) + "x";
        }
    },
    {
        "price":1500,
        "description":"Auto Bonus Based on Spectrum",
        c:12,
        info:function(game:Game){
            const player = game.player
            return "Current Multi: " + formatNum(player, Log.max(Log.floor(player.spectrum),1), 0) + "x";
        }
    },
    {"price":2500,"description":"Better Spectrum Gain Formula", c:13},
    {
        "price":25000,
        "description":"Switch to GPU Rendering",
        c:14,
        info:function(game:Game){
            const player = game.player
            return  "Base Core Count: " + (player.spectrumLevel[14] == 1 ? 8 : 1);
        }
    },
    {
        "price":100000,
        "description":"Your Prism can Create Spectrum Bars",
        c:15
    },
    {
        "price":1e10,
        "description":"Increase Blue = Product of Increase R&G",
        c:16,
        info:function(game:Game){
            const player = game.player
            return "Increase Blue: ~" + formatNum(player, Log.round(Log.div(game.IB,256)));
        }
    },
    {
        "price":1e13,
        "description":"Price Reduction for First 3 Blue Upgrades Based on R&G Lvls",
        c:17
    },
    {
        "price":1e25,
        "description":"Potencies Effect on Black Bars is Massivly Increased Every 7 Potency",
        c:18
    },
    {
        "price":1e35,
        "description":"Adv. Spec Gain is Squared for Spectrum and Cubed for Specced",
        c:19
    },
    {
        "price":1e50,
        "description":"Black Will be Used to Purchase Red and Green Upgrades When Needed",
        c:20
    }
]

for(let i=0; i<spectrumUpgrades.length; i++){
    let x = spectrumUpgrades[i]
    if("c" in x){
        if(i!==x.c){
            throw Error("temporary check failed")
        }
    }
}

function renderSpectrum(game:Game){
    const player = game.player
    for (let i = 0; i < player.spectrumLevel.length ; i++) {
        const spectrumItem = spectrumUpgrades[i]
        if (i != 5 && i != 4 && i != 9){ //TODO the reason this is skipped is because auto buyers are configred differently
            if(spectrumItem.info){
                game.domBindings.spectrumTable.divs[i].info.innerHTML = spectrumItem.info(game)
            }
        }
        game.domBindings.spectrumTable.divs[i].price.innerHTML = "Price: " + formatNum(player, spectrumUpgrades[i].price, 0) + " Spectrum ";
        if (player.spectrumLevel[i] === 1){
            game.domBindings.spectrumTable.divs[i].rowDiv.classList.add("bought");
        }
        else {
            game.domBindings.spectrumTable.divs[i].rowDiv.classList.remove("bought");
        }
    }
}