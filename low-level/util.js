export const repeat = function(r,n){
    let arr = [];
    for(let i = 0; i < n; i++){
        arr.push(r);
    }
    return arr;
};


export const arrmap = function(n,cb){
    let arr = [];
    for(let i = 0; i < n; i++){
        arr.push(cb(i));
    }
    return arr;
};

export const setArray = function(arr1,arr2,idx){
    for(let i = 0; i < arr2.length; i++){
        arr1[idx+i] = arr2[i];
    }
};


export const darr = new Float64Array(1);
export const farr = new Float32Array(darr.buffer);
export const iarr = new Int32Array(darr.buffer);
export const barr = new Uint8Array(darr.buffer);

export const bytesToBits = function(bytes){
    const arr = [];
    for(let i = 0; i < bytes.length; i++){
        for(let j = 0; j < 8; j++){
            arr.push((bytes[i]>>>j)&1);
        }
    }
    return arr;
};

export const doubleToBits = function(n){
    darr[0] = n;
    return bytesToBits(barr.slice(0,8));
};

export const floatToBits = function(n){
    farr[0] = n;
    return bytesToBits(barr.slice(0,4));
};

export const intToBits = function(n){
    iarr[0] = n;
    return bytesToBits(barr.slice(0,4));
};



export class InputArray{
    constructor(n){
        this.arr = [];
        for(let i = 0; i < n; i++){
            this.arr.push(new Input);
        }
    }
    setBits(bits){
        //console.log(bits);
        let max = bits.length > this.arr.length ? this.arr.length : bits.length;
        for(let i = 0; i < max; i++){
            this.arr[i].value = bits[i];
        }
    }
    static fromInt(n,r=32){
        let res = new InputArray(r);
        res.setInt(n);
        return res;
    }
    setInt(n){
        this.setBits(intToBits(n));
    }
    static fromFloat(n){
        let res = new InputArray(32);
        res.setFloat(n);
        return res;
    }
    setFloat(n){
        this.setBits(floatToBits(n));
    }
    static fromDouble(n){
        let res = new InputArray(64);
        res.setDouble(n);
        return res;
    }
    setDouble(n){
        this.setBits(doubleToBits(n));
    }
}



export const recursiveMap = function(arr,cb,path=[]){
    if(!(arr instanceof Array))return cb(arr,path.at(-1),[...path]);
    let res = [];
    for(let i = 0; i < arr.length; i++){
        path.push(i);
        res[i] = recursiveMap(arr[i],cb,path);
        path.pop(i);
    }
    return res;
};

export const recursiveZip = function(v1,v2,cb,path=[]){
    let res = [];
    const v1arr = v1 instanceof Array;
    const v2arr = v2 instanceof Array;
    if(v1arr !== v2arr)
        throw new Error("Recursive zip failed because of type mismatch");
    if(!v1arr && !v2arr)
        return cb(v1,v2,path.at(-1),[...path]);
    if(v1.length !== v2.length)
        throw new Error("Recursive zip failed because of length difference");
    for(let i = 0; i < v1.length; i++){
        path.push(i);
        res[i] = recursiveZip(v1[i],v2[i],cb,path);
        path.pop(i);
    }
    return res;
};


