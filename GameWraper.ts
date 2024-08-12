class AutoBuyer{ //TODO need to unify this with other spectrum upgrades
    g:GameWraper
    index:4|5|9
    color:"red"|"green"|"blue"
    constructor(g:GameWraper, spectrumIndex:4|5|9, color:"red"|"green"|"blue"){
        this.g=g
        this.index = spectrumIndex
        this.color=color
    }
    interval(){
        return this.g.wraps.ABInt[this.color]
    }
    isOn(){
        return this.g.wraps.player.AB[this.color]
    }
    purchased(){
        return this.g.wraps.player.spectrumLevel[this.index]
    }

    run(){
        if(this.purchased() && this.isOn() && this.g.wraps.ABcount % this.interval() < 10){ //TODO fixme this both assumes the auto buyer loop does not lag And the loop is too slow for later AB upgrades
            if(this.color!=="blue"){
                while(buyUpgrade(this.g.wraps, this.color)){
                    //TODO this do nothing is dangerious 
                }
            }else{
                for (let i = 0; i < 4; i++){
                    while (buyBlueUpgrade(this.g.wraps, i)){
                        //TODO this do nothing is dangerious 
                    }
                }
            }
            
        }
    }

    toggle(){//toggles auto buyers
        const autoBuysOn = this.g.wraps.player.AB
        autoBuysOn[this.color] = !autoBuysOn[this.color]
        this.info()
    }

    info(){
        const element = this.g.wraps.domBindings.spectrumTable.divs[this.index].info
        if(!this.purchased()){
            element.innerHTML =  "Buy Red Yourself!";
            return
        }
        element.innerHTML = ""
        const div = document.createElement("div")
        div.onclick = ()=>{
            this.toggle()
        }
        div.className="button"
        div.style.height = "100%"
        div.style.width="50%"
        div.style.backgroundColor = (this.isOn() ? "green" : "red")
        div.textContent = this.isOn() ? "On" : "Off"
        element.appendChild(div)
    }
}


class GameWraper{
    wraps:Game
    autoBuyers
    constructor(w:Game){
        this.wraps = w
        this.autoBuyers = [
            new AutoBuyer(this, 4, "red"),
            new AutoBuyer(this, 5, "green"),
            new AutoBuyer(this, 9, "blue")
        ]
    }
    runAutoBuyers(){
        const game = this.wraps
        game.ABcount += 10;
        for(let ab of this.autoBuyers){//TODO find out what p3 is isON===is on and purchased?
            if(ab.isOn()){
                this.wraps.p3 = false;
            }
        }
        for(let ab of this.autoBuyers){
            ab.run()
        }
    }

}