const check = "\x1b[32mv\x1b[0m"
const xmark = "\x1b[31mx\x1b[0m"
const succ  = "\x1b[32mSuccess\x1b[0m"
const fail  = "\x1b[31mFail   \x1b[0m"

const reportObject = {
    reset(title){
        this.title = title;
        this.resstr = "";
        console.log(`Test: ${this.title}`);
    },
    log(){
        const success = !this.resstr.match("x");
        console.log(`${success?succ:fail} ${this.resstr}\n`);
    }
};

export const test = async function(title,cb){
    reportObject.reset(title);
    await cb();
    reportObject.log();
}


export const expect = function(val1){
    return {
        toStrictlyEqual:(val2)=>{
            let res = JSON.stringify(val1) === JSON.stringify(val2);
            reportObject.resstr += (res?check:xmark);
        },
        toBe:(val2)=>{
            let res = JSON.stringify(val1) === JSON.stringify(val2);
            reportObject.resstr += (res?check:xmark);
        }
    }
}
