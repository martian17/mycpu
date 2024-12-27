import {test,expect} from "./myjest.js";


import {
    InputArray,
    arrmap,
    intToBits,
    bytesToBits,
    recursiveMap,
    recursiveZip
} from "./util.js";

import {
    Input,
} from "gatekeeper";


import {
    nand,
    xor,
    fullAdd,
    add,
    select,
    mul,
    bitMemory,
    byteMemory,
    mux,
    wordMemory,
    memory,
    countGates,
} from "./gates.js";

const zeroOut = function(...vals){
    vals.map(v=>v.value = 0);
};

const V = function(...vals){
    if(vals[0] instanceof Array){
        vals = vals[0];
    }
    return vals.map(v=>v.value);
};

const testByTable = async function(title,comp,table,outputSize = 1, verbose = false){
    await test(title,()=>{
        const inputSize = table[0].length-outputSize;
        const inputs = arrmap(inputSize,i=>new Input);
        let outs = comp(...inputs);
        if(!(outs instanceof Array)){
            outs = [outs];
        }
        zeroOut(...inputs);
        for(let row of table){
            const ivals = row.slice(0,inputSize);
            const ovals = row.slice(inputSize);
            for(let i = 0; i < inputSize; i++){
                inputs[i].value = ivals[i];
            }
            expect(V(outs)).toStrictlyEqual(ovals);
            if(verbose)console.log(ivals,V(outs),ovals);
        }
    });
};

const testByInputs = async function(title,comp,table,opts={}){
    await test(title,()=>{
        const inputSchema = table[0][0];
        const outputSchema = table[0][1];
        const inputs = recursiveMap(inputSchema,()=>new Input);
        const outs = comp(...inputs);
        if(opts.countGates)console.log(`N Gates: ${countGates(outs)}`)
        recursiveMap(inputs,v=>v.value = 0);
        for(let [ivals,ovals] of table){
            recursiveZip(inputs,ivals,(input,val)=>{
                input.value = val;
            });
            const result = recursiveMap(outs,out=>out.value);
            expect(result).toStrictlyEqual(ovals);
            if(opts.verbose)console.log(...[ivals,result,ovals].map(v=>JSON.stringify(v).replace(/[0-9]/g,(m)=>`\x1b[33m${m}\x1b[0m`)));
        }
    });
};



await testByTable("nand",nand,[
    [0,0,1],
    [0,1,1],
    [1,0,1],
    [1,1,0]
]);

await testByTable("xor",xor,[
    [0,0,0],
    [0,1,1],
    [1,0,1],
    [1,1,0]
]);

await testByTable("fullAdd",fullAdd,[
    [0,0,0, 0,0],
    [0,0,1, 1,0],
    [0,1,0, 1,0],
    [0,1,1, 0,1],
    [1,0,0, 1,0],
    [1,0,1, 0,1],
    [1,1,0, 0,1],
    [1,1,1, 1,1]
],2);

await testByInputs("add",add,(()=>{
    const rows = [];
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            rows.push([
                [
                    intToBits(i).slice(0,3),
                    intToBits(j).slice(0,3),
                ],
                intToBits(i+j).slice(0,4),
            ]);
        }
    }
    return rows;
})());

await testByInputs("select",select,(()=>{
    const rows = [];
    for(let i = 0; i < 8; i++){
        rows.push([
            [
                intToBits(i).slice(0,3),
                1,
            ],
            intToBits(i).slice(0,3),
        ]);
        rows.push([
            [
                intToBits(i).slice(0,3),
                0,
            ],
            [0,0,0],
        ]);
    }
    return rows;
})());

await testByInputs("mul",mul,(()=>{
    const rows = [];
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            rows.push([
                [
                    intToBits(i).slice(0,3),
                    intToBits(j).slice(0,3),
                ],
                intToBits(i*j).slice(0,6),
            ]);
        }
    }
    return rows;
})());

await testByInputs("bitMemory",bitMemory,[
    [[1,1,1],1],
    [[0,1,0],1],// active with clock down => still outputs
    [[0,0,0],1],
    [[1,1,0],0],
    [[0,0,0],0],
    [[1,1,0],0],
    [[0,0,0],0],
    [[1,1,1],1],
    [[0,0,0],1],
]);


await testByInputs("byteMemory",byteMemory,[
    [[1,1,1,bytesToBits([42])],bytesToBits([42])],
    [[0,0,0,bytesToBits([0 ])],bytesToBits([0 ])],
    [[1,1,0,bytesToBits([23])],bytesToBits([42])],
    [[1,1,1,bytesToBits([51])],bytesToBits([51])],
    [[1,1,0,bytesToBits([0 ])],bytesToBits([51])],
]);


await testByInputs("mux format 1",mux,[
    [[[0,1,0,1],[0,1,1,0],0],[0,1,0,1]],
    [[[0,1,0,1],[0,1,1,0],1],[0,1,1,0]],
]);

await testByInputs("mux format 2",mux,[
    [[1,0,0],1],
    [[1,0,1],0],
]);

await testByInputs("wordMemory",wordMemory,[
    [[1,1,1,1,0,bytesToBits([69,42])],bytesToBits([69,42])],
    [[0,0,0,0,0,bytesToBits([23,74])],bytesToBits([0, 0 ])],
    [[1,1,0,0,0,bytesToBits([19,99])],bytesToBits([69,0 ])],
    [[1,1,0,0,1,bytesToBits([55,34])],bytesToBits([42,0 ])],
    [[1,1,0,1,0,bytesToBits([51,86])],bytesToBits([69,42])],
    //before write the lines need to update
    [[0,1,0,0,1,bytesToBits([88, 0])],bytesToBits([42, 0])],
    [[1,1,1,0,1,bytesToBits([88, 0])],bytesToBits([88, 0])],
    [[1,1,0,1,0,bytesToBits([11,11])],bytesToBits([69,88])],
]);


await testByInputs("memory (test 8/16 bit IO)",memory,[
    [[1,1,1,0,bytesToBits([23,0]),bytesToBits([69,0])],bytesToBits([69,0])],
    [[0,1,1,0,bytesToBits([53,0]),bytesToBits([42,0])],bytesToBits([0,0])],
    [[1,1,1,0,bytesToBits([53,0]),bytesToBits([42,0])],bytesToBits([42,0])],
    [[1,1,0,0,bytesToBits([23,0]),bytesToBits([0,0])],bytesToBits([69,0])],
    [[0,1,1,0,bytesToBits([22,0]),bytesToBits([77,0])],bytesToBits([0,0])],
    [[1,1,1,0,bytesToBits([22,0]),bytesToBits([77,0])],bytesToBits([77,0])],
    [[1,1,0,1,bytesToBits([22,0]),bytesToBits([0,0])],bytesToBits([77,69])],
],{countGates:true});











