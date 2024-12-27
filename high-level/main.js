class CPU{
    // partially implements the RISC V instruction set
    // for now, this CPU is 32 bit, because javascript supports it right off the bat
    rss = new Int32Array(32);
    rsu = new Uint32Array(this.rss.buffer);
    pc = 0;
    constructor(memsize){
        this.memory = new UInt8Array(memsize);
    }
    execute(program){
        
    }
    add(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] + this.rss[rs2]; 
    }
    sub(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] - this.rss[rs2]; 
    }
    sll(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] << this.rss[rs2]; 
    }
    slt(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] < this.rss[rs2] ? 1 : 0; 
    }
    sltu(rd, rs1, rs2){
        this.rss[rd] = this.rsu[rs1] < this.rsu[rs2] ? 1 : 0; 
    }
    xor(rd, rs1, rs2){
        this.rss[rd] = this.rsu[rs1] ^ this.rsu[rs2]; 
    }
    srl(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] >>> this.rss[rs2]; 
    }
    sra(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] >> this.rss[rs2]; 
    }
    or(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] | this.rss[rs2]; 
    }
    and(rd, rs1, rs2){
        this.rss[rd] = this.rss[rs1] & this.rss[rs2]; 
    }
    lb(rd, offset, rs1){
        this.res[rd] = this.memory[this.res[rs1] + offset];
    }



}




