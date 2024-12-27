import {and,or,not,High,Low,Input,PrimitiveGate} from "./gates.js";





let n1 = 114514;
let n2 = 1919;

let input1 = InputArray.fromInt(n1);
let input2 = InputArray.fromInt(n2);
let res = mul(input1.arr,input2.arr);




const select = function(data, flg){
    return data.map(v=>and(v,flg));
};

const testSelect = function(){
    const data = arrmap(4,i=>new Input);
    const flg = new Input;
    const everything = [...data,flg];

    const res = select(data,flg);
    everything.map(v=>v.value = 0);
    data[1].value = 1;
    data[3].value = 1;
    console.log(res.map(v=>v.value));
    flg.value = 1;
    console.log(res.map(v=>v.value));
};

//testSelect();

// const mux2 = function(data, flag){
//     const nflag = not(flag);
//     const o1 = data.map(v=>and(v,flag));
//     const o2 = data.map(v=>and(v,nflag));
//     return [o1,o2];
// };


const testVecor = function(a, b){
    const data1 = arrmap(4,i=>new Input);
    const data2 = arrmap(4,i=>new Input);
    const everything = [...data1,...data2];

    const res = vecor(data1,data2);
    everything.map(v=>v.value = 0);
    console.log(res.map(v=>v.value));
    data1[1].value = 1;
    data1[3].value = 1;
    data2[3].value = 1;
    console.log(res.map(v=>v.value)); 
}

testVecor()


const vecand = function(a, b){
    const res = [];
    for(let i = 0; i < a.length; i++){
        res.push(and(a[i],b[i]));
    }
    return res;
};


const mux = function(a,b,flg){
    if(a instanceof Array){
        return vecor(
            select(a,flg),
            select(b,not(flg))
        );
    }
    return or(
        and(a,flg),
        and(b,not(flg))
    );
}


// 16 bits memory
const wordMemory = function(clk, active, writeFlag, f16, shift, data/*: input[]*/){
    const leftActive = and(active,nand(not(f16),shift));
    const rightActive = and(active,or(f16,shift));
    const leftTraces = select(data.slice(0,8),leftActive);
    const rightTraces = select(mux(data.slice(0,8),data.slice(8,16),shift),rightActive);
    let left = byteMemory(clk,leftActive,writeFlag,leftTraces);
    const right = byteMemory(clk,rightActive,writeFlag,rightTraces);
    left = mux(left,right,shift);
    return [...left,...right];
};


// test 16 bit memory segment
const test16 = function(){
    const clk = new Input;
    const active = new Input;
    const writeFlag = new Input;
    const f16 = new Input;
    const shift = new Input;
    const data = arrmap(16,i=>new Input);
    const out = wordMemory(clk,active,writeFlag,f16,shift,data);
    const everything = [clk,active,writeFlag,f16,shift,data];
    console.log(out.map(v=>v.value));
    everything.map(v=>v.value = 0);
    console.log(out.map(v=>v.value));

    active.value = 1;
    writeFlag.value = 1;
    f16.value = 0;
    shift.value = 0;
    data[1].value = 1;
    data[3].value = 1;
    clk.value = 1;
    console.log(out.map(v=>v.value));
};




//test16();

// 
// const memory = function(clk, write_flag, f16, ...rest){
//     // clk - clock
//     // write_flag - write flag
//     // f16 - 16 bit flag
//     // recursively mux until no address left
//     const accum = [];
//     const maxAddress = Infinity;
//     //writeout traces
//     const recursiveMux = function(traces){
//         const addrlen = 16-(rest.length-traces.length);
//         if(addrlen === 0){
//             accum.push(traces);
//             return;
//         }
//         const [o1,o2] = nux(...traces);
//         if(accum.length >= maxAddress)return;
//         recursiveMux(o1);
//         if(accum.length >= maxAddress)return;
//         recursiveMux(o2);
//     }
//     //connect memory modules
//     accum = accum.map(([active,write,...values])=>{
//         return byteMemory(clk, active, write, b16);
//     });
// 
// 
//     
//     const memArray = 
// }
// 
// 
// 
// const marc16 = function(){
// }
// 








