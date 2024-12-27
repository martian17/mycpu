import {
    and,
    or,
    not,
    High,
    Low,
    Input,
    PrimitiveGate,
} from "gatekeeper";

import {
    repeat,
    arrmap,
    setArray,
    darr,
    farr,
    iarr,
    barr,
    bytesToBits,
    doubleToBits,
    floatToBits,
    intToBits,
    InputArray
} from "./util.js"



export const nand = function(...vals){
    return not(and(...vals));
};

export const xor = function(a,b){
    let an = not(a);
    let bn = not(b);
    return or(and(a,bn),and(an,b));
};

export const fullAdd = function(a,b,c){
    let xorab = xor(a,b);
    // digit, carry
    return [xor(xorab,c),or(and(a,b),and(xorab,c))];
};

export const add = function(arr1,arr2){
    let out = [];
    let carry = Low;
    for(let i = 0; i < arr1.length; i++){
        let digit;
        [digit,carry] = fullAdd(arr1[i],arr2[i],carry);
        out.push(digit);
    }
    out.push(carry);
    return out;
};

export const select = function(arr,flag){
    if(arr instanceof Array){
        return arr.map(v=>select(v,flag));
    }
    return and(arr,flag);
};

export const mul = function(arr1,arr2){
    let out = repeat(Low,arr1.length+arr2.length);
    for(let i = 0; i < arr2.length; i++){
        let res = add(select(arr1,arr2[i]),out.slice(i,i+arr1.length));
        setArray(out,res,i);
    }
    return out;
};

// write on rising edge
export const bitMemory = function(clk, write, value){
    const isWrite = and(clk,write);
    const i1 = nand(isWrite,value);
    const i2 = nand(isWrite,not(value));
    const o1 = nand(i1,Low);
    const o2 = nand(i2,Low);

    o1.inputs[0].inputs[1] = o2;
    o2.connections.push(o1.inputs[0]);

    o2.inputs[0].inputs[1] = o1;
    o1.connections.push(o2.inputs[0]);
    return o1;
};


export const byteMemory = function(clk, active, writeFlag, values){
    return values.map(value=>and(bitMemory(clk, and(writeFlag,active), value), active));
};



export const mux = function(a,b,flg){
    return or(
        select(a,not(flg)),
        select(b,flg)
    );
};

export const _if = function(cond,a,b){
    if(!b){
        return select(a,cond);
    }
    return mux(b,a,cond);
};

// write on rising edge
export const wordMemory = function(clk, active, writeFlag, f16, shift, data/*: input[]*/){
    const leftActive = and(active,or(f16,not(shift)));
    const leftByte = byteMemory(clk,leftActive,writeFlag,data.slice(0,8));
    const rightActive = and(active,or(f16,shift));
    const rightByte = byteMemory(clk,rightActive,writeFlag,
        _if(
            shift,
            data.slice(0,8),
            data.slice(8,16),
        )
    );
    return [
        ..._if(shift,rightByte,leftByte),
        ..._if(not(shift),rightByte)
    ]
};

//recursive memory builder
export const memory = function(clk, active, writeFlag, f16, address, data/*, currentAddress, maxAddress*/){
    const memorySpan = 2**address.length;
    if(memorySpan === 2){
        return wordMemory(clk, active, writeFlag, f16, address[0], data);
    }
    const subAddress = [...address];
    const choice = subAddress.pop();
    const left = memory(...select([clk, active, writeFlag, f16, subAddress, data], not(choice))/*, currentAddress, maxAddress*/);
    const right = memory(...select([clk, active, writeFlag, f16, subAddress, data], choice)/*, currentAddress+memorySpan/2, maxAddress*/);
    return _if(choice,right,left);
};



export const countGates = function(outs){
    const gates = new Set;
    const traverse = function(outs){
        for(let gate of outs){
            if(gate instanceof PrimitiveGate){
                if(gates.has(gate))continue;
                gates.add(gate);
                traverse(gate.inputs);
            }
        }
    }
    traverse(outs);
    return gates.size;
};


export const bakeGates = function(inputs,outputs){
    //backtrack the output
    const inputs = new Set(inputs);
    const gates = new Set;
    const traverse = function(gate){
        if(gate === High || gate === Low){
            return gate;
        }
        if(gate instanceof Input){
            return gate;
        }
        if(gate instanceof PrimitiveGate){

        }
        
        for(let gate of outs){
            if(gate instanceof PrimitiveGate){
                if(gates.has(gate))continue;
                if(gate === )
                gates.add(gate);
                traverse(gate.inputs);
            }
        }
    }
    traverse(outs);
}


// 1,1,1,1,0,
// [1,0,1,0,0,0,1,0,0,1,0,1,0,1,0,0]
// [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0]
// [1,0,1,0,0,0,1,0,0,1,0,1,0,1,0,0]
// 
// [1,1,0,0,1,1,0,0,0,0,0,1,1,0,1,0]
// [1,0,1,0,0,0,1,0,0,0,0,1,1,0,1,0]


// // 16 bits memory
// export const wordMemory = function(clk, active, writeFlag, f16, shift, data/*: input[]*/){
//     const leftActive = and(active,nand(not(f16),shift));
//     const rightActive = and(active,or(f16,shift));
//     const leftTraces = select(data.slice(0,8),leftActive);
//     const rightTraces = select(mux(data.slice(8,16),data.slice(0,8),shift),rightActive);
//     let left = byteMemory(clk,leftActive,writeFlag,leftTraces);
//     let right = byteMemory(clk,rightActive,writeFlag,rightTraces);
//     left = mux(left,right,shift);
//     right = select(right,f16);
//     return [...left,...right];
// };


