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
function getSpan(id:string):HTMLSpanElement{
    return getElementWithTag(id, "SPAN") as HTMLSpanElement
}
function getRangeInput(id:string):HTMLInputElement{
    const element = getElementWithTag(id, "INPUT") as HTMLInputElement
    if((element as HTMLInputElement).type!=="range"){
        throw Error("#"+id+" not a range element")
    }
    
    return element as HTMLInputElement
}
function getTable(id:string){
    return getElementWithTag(id, "TBODY") as HTMLTableSectionElement
}


function spectrumTable(game:Game){
    const target = document.getElementById("spectrumUpgradesTable")
    
    if(target===null){
        throw Error("cant find spectrum upgrades table")
    }
    target.innerHTML = "" //TODO fixme when I finally release this just remove the thing from the dom instead
    let nextRow = document.createElement("tr")
    const rows:Array<HTMLTableRowElement> = []
    const divs:Array<{description:HTMLDivElement, info:HTMLDivElement, price:HTMLDivElement, rowDiv:HTMLDivElement}> = []
    for(let index=0; index<spectrumUpgrades.length; index++){
        if(index%3==0){
            nextRow = document.createElement("tr")
            if(index>=15){
                nextRow.className="hidden"
            }
            target.appendChild(nextRow)
            rows.push(nextRow)
        }
        const td = document.createElement("td")
        
        const rowDiv = document.createElement("div")
        rowDiv.onclick = function(){
            buySpectrumUpgrade(game, index)
        }
        const description = document.createElement("div")
        const info = document.createElement("div")
        const price = document.createElement("div")
        description.textContent = spectrumUpgrades[index].description
        info.textContent = ""
        price.textContent = "Price 5 Spectrum"
        rowDiv.appendChild(description)
        rowDiv.appendChild(info)
        divs.push({
            description,
            info: info,
            price,
            rowDiv
        })
        rowDiv.appendChild(price)
        rowDiv.className = "button spec"
        td.appendChild(rowDiv)
        nextRow.appendChild(td)
        
    }
    return {
        row5:rows[5],
        row6:rows[6],
        divs
    }
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
        buyBlueUpgrade(game, 0)
    }
    getDiv("blueButton1").onclick = function(){
        buyBlueUpgrade(game, 1)
    }
    getDiv("blueButton2").onclick = function(){
        buyBlueUpgrade(game, 2)
    }
    getDiv("blueButton3").onclick = function(){
        buyBlueUpgrade(game, 3)
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
        },
        blueDiv: getDiv("blueDiv"),
        tabSettings: getDiv("tabSettings"),
        blackCountRGB: getDiv("blackCountRGB"),
        newupgrades: getDiv("newupgrades"),
        spectrumCountRGB: getDiv("spectrumCountRGB"),
        advSpectrumReset:getDiv("advSpectrumReset"),
        spectrumDiv:getDiv("spectrumDiv"),
        blackCount:getDiv("blackCount"),
        potencydiv:getDiv("potencydiv"),
        specpot:getDiv("specpot"),
        costReset:getDiv("costReset"),
        blackCostInfo:getSpan("blackCostInfo"),
        spectrumCount:getDiv("spectrumCount"),
        specstat:getDiv("specstat"),
        timestat:getDiv("timestat"),
        achieves:getTable("achieves"),
        spectrumTable:spectrumTable(game),
        tabSpectrumUnspeced:getDiv("tabSpectrumUnspeced"),
        tabSpectrumSpeced:getDiv("tabSpectrumSpeced")
    }
    const acheivementTable = getTable("achieves")
    for (let a of achievements){
        a.mount(acheivementTable)
    }
    returns.unlockBtn.onclick=function(){
        unlockBlue(game, game.domBindings)
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