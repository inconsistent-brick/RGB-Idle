type numSerl = {val:number, typ:"num"|"log"}
class num {
    val:number
    typ:"num"|"log"
    constructor(input:number|num|string, force?:"log"|"num"){ //TODO: force="num" does nothing is that just the default?
        if(typeof input==="number"){
            this.val = 0
            this.typ="num"
    
            if (force === "log") {
                if (input <= 308) {
                    this.typ = "num";
                    this.val = Math.pow(10, input);
                } else {
                    this.typ = "log";
                    this.val = input;
                }
            }else if(isFinite(input)){
                this.typ = "num";
                this.val = input;
            }else{
                throw Error("invalid num initialization")
            }
        }else if(typeof input==="string"){    
            if(input.charAt(0).toLowerCase() === "e" && isFinite(parseFloat(input.replace(/e/i,"")))){
                this.typ = "log";
                this.val = parseFloat(input.replace(/e/i, ""));
            } else if (isFinite(parseFloat(input))) {
                this.typ = "num";
                this.val = parseFloat(input);
            }else{
                throw Error("invalid num initialization")
            }
        }else if(input.typ === "log" || input.typ === "num"){
            this.typ = input.typ;
            this.val = input.val;
        } else {    
            console.error("Invalid input, can not create a number! Setting value to 0.", input);
            throw new Error("logmath has receved invalid input check console log")
        }
    }
    toJSON():numSerl{
        return {val:this.val, typ:this.typ}
    }
}
function deserlNum(v:numSerl){
    return new num(v.val, v.typ)
}

type checkReturn = {typ:"num"|"log", n1:number, n2:number}|{typ:"null", n1:string|0, n2:string|0}
function checkHelperIsZero(item:num|number){
    if(typeof item==="number"){
        return item===0
    }
    return item.val===0
}

/*
* gets any number and a standard number in the same form for comparison. Doesn't matter if it's both value or both log because we're comparing
*/
function cmpHelper(n1:number|num|string, b:number):[number, number]{
    if(typeof n1==="number"){
        return [n1, b]
    }
    if(typeof n1==="string"){
        n1 = new num(n1)
    }
    if(n1.typ==="num"){
        return [n1.val, b]
    }
    return [n1.val, Math.log10(b)]
}

class LogSingleton {
    get(input:number|num|string, type:"log"|"l"):number
    get(input:number|num, type:"num"|"n"):number|string
    get(input:number|num, type?:"num"|"log"|"n"|"l"):number|string {
        if (typeof input === "number") {
            if (type === "num" || type === "n" || type === undefined){
                return input;
            } 
            if (type === "log" || type === "l"){ 
                if(input<=0){
                    throw Error("logs don't work this way. stop trying to get NaN and -Inf")
                }
                return Math.log10(input);
            }
            const nothing:never = type
            throw new Error("invalid get paremters type="+nothing)
        }
        if (input.typ === type || type === input.typ.charAt(0) || type === undefined){
            return input.val;
        }
        if (type === "num" || type === "n") {
            if(isFinite(Math.pow(10,input.val))){
                return Math.pow(10,input.val)
            }
            return Math.pow(10,input.val % 1) + "e" + Math.floor(input.val);
        }
        if(type === "log" || type === "l"){
            return Math.log10(input.val)
        }
        const nothing:never = type
        throw new Error("invalid get paremters type="+nothing)
    }

    //noramlize two numbers so they can directly interact with each other, something about null detection too
    check(in1:num|number, in2:num|number):checkReturn{
        if((typeof in1==="number" || in1.typ==="num") && (typeof in2 === "number" || in2.typ==="num")){
            return {
                typ:"num",
                n2: typeof in2==="number"?in2:in2.val,
                n1: typeof in1==="number"?in1:in1.val
            }
        }
        
        if (checkHelperIsZero(in1) || checkHelperIsZero(in2)){
            const [n1, n2] = [in1, in2].map(function(inp){
                if(checkHelperIsZero(inp)){
                    return 0 as const
                }
                return "e" + (typeof inp==="number"?inp:inp.val)

            })
            return {
                typ:"null",
                n1,
                n2
            }
        }

        const [n1, n2] = [in1, in2].map(function(inp){
            let n:number
            if(typeof inp==="number"){
                n = Math.log10(inp);
            }else if(inp.typ === "log"){
                n = inp.val;
            }else if(inp.typ === "num"){
                n = Math.log10(inp.val);
            }else{
                const nothing:never = inp.typ
                throw Error("invalid typ "+nothing)
            }
            return n
        })

        return {
            typ:"log",
            n1,
            n2
        }
        
        
    }

    max(in1:num|number, in2:num|number) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ
        
        if (typ === "null") {
            const n1 = checkResult.n1
            const n2 = checkResult.n2
            if (n1 === 0 && n2 === 0){
                return new num(0);
            }
            let tn1 = 0;
            let tn2 = 0;
            if (n1 === 0) {
                if(typeof n2!=="string"){
                    throw Error("unhandled case")
                }
                tn2 = parseFloat(n2.replace(/e/i, ""));
            } else  {
                tn1 = parseFloat(n1.replace(/e/i, ""));
            }
            if (tn1 >= tn2){
                return new num(n1);
            }
            return new num(n2);
        }
        let n1 = checkResult.n1
        let n2 = checkResult.n2
        if (typ === "num") {
            if (isFinite(Math.max(n1, n2))){
                return new num(Math.max(n1, n2));
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        
        return new num(Math.max(n1, n2), "log");
    }

    min(in1:num|number, in2:num|number) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null"){
            return new num(0);
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2;
        if (typ === "num") {
            if (isFinite(Math.max(n1, n2))){
                return new num(Math.min(n1, n2))
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        
        return new num(Math.min(n1, n2), "log");
    }

    ceil(in1:number|num) {
        let n;
        let typ = "num";
        if(typeof in1 === "number"){
             n = in1;
        }else{
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.ceil(n))){
                 return new num(Math.ceil(n));
            }
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.ceil(Math.pow(10,n))), "log");
        }
        return new num(n,"log")
    }

    floor(in1:number|num) {
        let n:number;
        let typ = "num";
        if (typeof in1 === "number"){
             n = in1;
        }else {
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.floor(n))){
                 return new num(Math.floor(n));
            }
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.floor(Math.pow(10, n))), "log");
        }
        return new num(n, "log")
    }

    round(in1:number|num) {
        let n;
        let typ = "num";
        if (typeof in1 === "number"){
            n = in1;
        }else {
            typ = in1.typ;
            n = in1.val;
        }
        if (typ === "num") {
            if (isFinite(Math.ceil(n))){
                return new num(Math.ceil(n));
            }
            n = Math.log10(n);
        }
        if (n < 25) {
            return new num(Math.log10(Math.round(Math.pow(10, n))), "log");
        }
        return new num(n, "log")
    }

    mod(in1:number|num, in2:number|num) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if(typ==="null"){
            throw Error("this case is not handled")
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2;
        if (typ === "num") {
            if (isFinite(n1%n2)){
                return new num(n1%n2)
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        if (n1 < 25 && n2 < 25) {
            return new num(Math.pow(10,n1) % Math.pow(10,n2), "num")
        }
        return new num(0, "num")
    }


    log(in1:number|num, in2:number|num) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null" || checkResult.n1 === 0 || checkResult.n2 === 0){
            return new num(0);
        }
        let n = checkResult.n1;
        let base = checkResult.n2;
        if (typ === "num") {
            if (isFinite(Math.log(n) / Math.log(base))){
                return new num(Math.log(n) / Math.log(base));
            }
            n = Math.log10(n);
            base = Math.log10(base);
        }
        return new num(n/base,"num")
    }

    log10(in1:number|num) {
        return(this.log(in1, 10));
    }

    ln(in1:number|num) {
        return(this.log(in1, Math.E));
    }

    pow(in1:number|num, in2:number|num) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ
        
        if (typ === "null") {
            let base = checkResult.n1
            let exp = checkResult.n2
            if (exp === 0){ 
                return new num(1)
            }
            if (base === 0){
                return new num(0)
            }
            throw Error("unhandled case")
        }
        let base = checkResult.n1
        let exp = checkResult.n2
        if (typ === "num") {
            if (isFinite(Math.pow(base, exp))){
                return new num(Math.pow(base,exp))
            }
            base = Math.log10(base);
            exp = Math.log10(exp);
        }
        return new num(base * Math.pow(10,exp), "log");
    }

    root(in1:number|num, in2:number|num) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null"){
            return new num(0)
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2;
        if (typ === "num") {
            if (isFinite(Math.pow(n1, 1/n2))){
                return new num(Math.pow(n1, 1/n2))
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        
        return new num(n1 / Math.pow(10,n2), "log");
    }

    sqrt (in1:number|num) {
        return this.root(in1, 2)
    }

    cbrt (in1:number|num) {
        return this.root(in1, 3)
    }

    multi(in1:number|num, in2:number|num){
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ
        if (typ === "null"){
            return new num(0);
        }
        let n1 = checkResult.n1
        let n2 = checkResult.n2
        if(typ === "num"){
            if(isFinite(n1 * n2)){
                return new num(n1 * n2)
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        return new num(n1 + n2, "log");
    }
    
    div(in1:number|num,in2:number|num){
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null"){ 
            return new num(0);
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2;
        if(typ === "num"){
            if(isFinite(n1 / n2)) return new num(n1 / n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        return new num(n1 - n2,"log");
    }

    add(in1:number|num, in2:number|num):num {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null") {
            let n1 = checkResult.n1;
            if (n1 === 0){
                return new num(checkResult.n2);
            }
            return new num(n1);
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2
        if(typ === "num"){
            if(isFinite(n1 + n2)) return new num(n1 + n2);
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        let m1 = Math.pow(10, n1 % 1);
        let e1 = Math.floor(n1);
        let m2 = Math.pow(10, n2 % 1);
        let e2 = Math.floor(n2)
        if (e1 >= e2) {
            let y = m1 + m2 / Math.pow(10, e1 - e2);
            return new num (Math.log10(y) + e1,"log");
        } else if (e1 < e2) {
            let y = m2 + m1 / Math.pow(10, e2 - e1);
            return new num(Math.log10(y) + e2,"log");
        }
        throw Error("this should be unreachable")
    }

    sub(in1:number|num, in2:number|num) {
        const checkResult = this.check(in1, in2)
        const typ = checkResult.typ;
        if (typ === "null") { 
            if (checkResult.n1 === 0){
                return new num(checkResult.n2);//TODO this looks wrong given that we cap the lower bound at 0 this should probably be 0
            }
            return new num(checkResult.n1);
        }
        let n1 = checkResult.n1;
        let n2 = checkResult.n2;
        
        if(typ === "num"){
            if(isFinite(n1 - n2)){
                return new num(n1 - n2)
            }
            n1 = Math.log10(n1);
            n2 = Math.log10(n2);
        }
        let m1 = Math.pow(10, n1 % 1);
        let e1 = Math.floor(n1);
        let m2 = Math.pow(10, n2 % 1);
        let e2 = Math.floor(n2);
        let y = m1 - m2 / Math.pow(10, e1 - e2);
        if (y < 0){
            return new num(0)
        }
        return new num (Math.log10(y) + e1,"log");
    }
    
    lt(in1:number|num|string, b:number):boolean{
        const [a,b_] = cmpHelper(in1, b)
        return a < b_
    }
    gt(in1:number|num|string, b:number):boolean{
        const [a,b_] = cmpHelper(in1, b)
        return a > b_
    }
    gte(in1:number|num|string, b:number):boolean{
        const [a,b_] = cmpHelper(in1, b)
        return a >= b_
    }


}
const Log = new LogSingleton()