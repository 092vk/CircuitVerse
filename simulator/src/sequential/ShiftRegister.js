import CircuitElement from '../circuitElement';
import Node, { findNode } from '../node';
import simulationArea from '../simulationArea';
import { correctWidth, lineTo, moveTo, fillText } from '../canvasApi';
import { colors } from '../themer/themer';

export default class ShiftRegister extends CircuitElement {
    constructor(x, y, scope = globalScope, dir = 'RIGHT', bitWidth = 4) {
        super(x, y, scope, dir, bitWidth);
        this.direction = dir;
        this.bitWidth = bitWidth;

        this.clockInp = new Node(-20, 0, 1, this, 'Clock');
        this.dataInp = new Node(-20, 20, 1, this, 'Data Input');
        this.outputs = [];

        for (let i = 0; i < this.bitWidth; i++) {
            this.outputs.push(new Node(20 + i * 20, 0, 1, this, `Q${i}`));
        }

        this.state = Array(this.bitWidth).fill(0);
        this.prevClockState = 0;
    }

    customSave() {
        const data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                clockInp: findNode(this.clockInp),
                dataInp: findNode(this.dataInp),
                outputs: this.outputs.map(findNode),
            },
            state: this.state,
        };
        return data;
    }

    customDraw() {
        // custom shape for the shift register
        const ctx = simulationArea.context;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineWidth = correctWidth(3);
        const rectWidth = 20 * this.bitWidth;
        rect(ctx, -rectWidth / 2, -30, rectWidth, 60);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.font = '14px Raleway';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Shift Register', 0, 5);
        ctx.fill();
    }

    isResolvable() {
        return this.clockInp.value !== undefined && this.dataInp.value !== undefined;
    }

    resolve() {
        if (this.clockInp.value === 1 && this.prevClockState === 0) {
            // this checks for rising edge of the clock signal
            this.state.pop();
            // remove the last bit
            this.state.unshift(this.dataInp.value || 0);
            // add the last bit shifting towards left
        }
        this.prevClockState = this.clockInp.value;

        for (let i = 0; i < this.bitWidth; i++) {
            this.outputs[i].value = this.state[i];
            // each output is connected to each state bit
        }
    }
}

ShiftRegister.prototype.tooltipText = 'Shift Register';
ShiftRegister.prototype.helplink = 'https://docs.circuitverse.org/#/sequential?id=shift-register';
ShiftRegister.prototype.objectType = 'ShiftRegister';