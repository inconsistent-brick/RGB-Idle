function getElement(id:string):HTMLElement{
    const element = document.getElementById(id)
    if(element===null){
        throw Error("unable to find #"+id)
    }
    return element
}
function getElementWithTag(id:string, tag:string):HTMLElement{
    const element = getElement(id)
    if(element.tagName!==tag){
        throw Error("#"+id+" expected "+tag+" got "+element.tagName)
    }
    return element
}
function getDiv(id:string):HTMLDivElement{
    return getElementWithTag(id, "DIV") as HTMLDivElement
}
function getRangeInput(id:string):HTMLInputElement{
    const element = getElementWithTag(id, "INPUT") as HTMLInputElement
    if((element as HTMLInputElement).type!=="range"){
        throw Error("#"+id+" not a range element")
    }
    
    return element as HTMLInputElement
}
function doBinds(game:Game){
    getDiv("rgbSwitchTab").onclick= function(){
        switchTab(game, "RGB", 0)
    }
    getDiv("spectrumSwitchTab").onclick = function(){
        switchTab(game, "Spectrum", 1)
    }
    getDiv("settingsSwitchTab").onclick = function(){
        switchTab(game, "Settings", 2)
    }
    getDiv("statsSwitchTab").onclick = function(){
        switchTab(game, "Stats", 3)
    }
    /*
        //TODO what the hell is reduce intended to do?
        getDiv("greenReduce").onclick = function(){
            reduceProd("green")
        }
        getDiv("redReduce").onclick = function(){
            reduceProd("red")
        }
        getDiv("blueReduce").onclick = function(){
            reduceProd("blue")
        }
    */
    getDiv("greenButton").onclick = function(){
        buyUpgrade(game, "green")
    }
    
    getDiv("redButton").onclick=function(){
        buyUpgrade(game, "red")
    }
    getDiv("blueButton0").onclick = function(){
        buyUpgrade(game, "blue", 0)
    }
    getDiv("blueButton1").onclick = function(){
        buyUpgrade(game, "blue", 1)
    }
    getDiv("blueButton2").onclick = function(){
        buyUpgrade(game, "blue", 2)
    }
    getDiv("blueButton3").onclick = function(){
        buyUpgrade(game, "blue", 3)
    }
    getDiv("redSplice").onclick=function(){
        spliceColor(game, "red")
    }
    getDiv("greenSplice").onclick=function(){
        spliceColor(game, "green")
    }
    getDiv("blueSplice").onclick=function(){
        spliceColor(game, "blue")
    }
    
    for(let i=0; i<21; i++){
        getDiv("spectrumButton"+i).onclick = function(){
            buyUpgrade(game, "spectrum", i)
        }
    }
    getDiv("subtabUpgrades").onclick=function(){
        switchTab(game, "Upgrades", 0, "spectrum")
    }
    getDiv("subtabPrism").onclick=function(){
        switchTab(game, "Prism", 1, "spectrum")
    }
    getDiv("subtabProgress").onclick=function(){
        switchTab(game, "Progress", 2, "spectrum")
    }

    getRangeInput("rangeInput").onchange = function(){
        CalcSRgain(game)
    }
    
    const popupDivs = Array.from(document.getElementsByClassName("popup"))
    if(popupDivs.length!==4){
        throw Error("unexpected count of popdivs")
    }
    const returns={
        unlockBtn: getDiv("unlockBtn"),
        spectrumReset: getDiv("spectrumReset"),
        potencyBtn: getDiv("potencyBtn"),
        mixButton: getDiv("mixButton"),
        popupDivs: {
            prismRise:popupDivs[0] as HTMLDivElement,
            limit:popupDivs[1] as HTMLDivElement,
            saveCopy:popupDivs[2] as HTMLDivElement,
            progressFinish:popupDivs[3] as HTMLDivElement
        }
    }
    returns.unlockBtn.onclick=function(){
        unlockBlue(game.player, game.domBindings)
    }
    returns.spectrumReset.onclick = function(){
        reset(game, 1)
    }
    returns.potencyBtn.onclick = function(){
        prismUpgrade(game, "potency")
    }
    returns.mixButton.onclick = function(){
        mix(game)
    }
    for(let addSub of ["add" as const, "sub" as const, "specbar" as const]){
        for(let color of ["red" as const, "green" as const, "blue" as const]){
            getElement(addSub+color).onclick=function(){
                prismUpgrade(game, addSub, color)
            }
        }
    }
    getElement("costReset").onclick = function(){
        prismUpgrade(game, "cost")
    }

    getElement("onclicksave").onclick=function(){
        save(game.player)
    }
    getElement("onclickflip").onclick=function(){flip(game, "fast")}
    getElement("onclickExport").onclick=function(){exportSave(game)}
    getElement("onclickFlipFps").onclick=function(){flip(game, "fps")}
    getElement("onclickimport").onclick=function(){loadImport()}
    getElement("onclickreset").onclick=function(){reset(game, 0)}
    getElement("onclickflipnotation").onclick=function(){flip(game, 'notation')}
    return returns
}

type DomBindings = ReturnType<typeof doBinds>