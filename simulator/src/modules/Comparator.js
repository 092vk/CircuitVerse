import CircuitElement from "../circuitElement";
import Node, { findNode } from "../node";
import simulationArea from "../simulationArea";
import { correctWidth, fillText, drawCircle2 } from "../canvasApi";
import { colors } from "../themer/themer";

/**
 * @class
 * Comparator
 * @extends CircuitElement
 * @param {number} x - x coordinate of element.
 * @param {number} y - y coordinate of element.
 * @param {Scope=} scope - Circuit on which element is drawn
 * @param {string=} dir - direction of element
 * @param {number=} bitWidth - bit width per node.
 * @category modules
 */
export default class Comparator extends CircuitElement {
    constructor(x, y, scope = globalScope, dir = "RIGHT", bitWidth = 1) {
        super(x, y, scope, dir, bitWidth);
        this.setDimensions(20, 20);
        this.rectangleObject = true;
        this.directionFixed = true;
        this.fixedBitWidth = true;

        // Input nodes
        this.inpA = new Node(-20, -10, 0, this, this.bitWidth, "A");
        this.inpB = new Node(-20, 10, 0, this, this.bitWidth, "B");

        // Output nodes - always 1 bit
        this.equalOutput = new Node(20, -10, 1, this, 1, "A=B");
        this.greaterOutput = new Node(20, 0, 1, this, 1, "A>B");
        this.lessOutput = new Node(20, 10, 1, this, 1, "A<B");
    }

    /**
     * @memberof Comparator
     * Checks if the element is resolvable
     * @return {boolean}
     */
    isResolvable() {
        return this.inpA.value !== undefined && this.inpB.value !== undefined;
    }

    /**
     * @memberof Comparator
     * resolve output values based on inputData
     */
    resolve() {
        if (this.isResolvable() === false) {
            return;
        }

        // Get input values with sign extension
        const valueA = ((this.inpA.value) << (32 - this.bitWidth)) >> (32 - this.bitWidth);
        const valueB = ((this.inpB.value) << (32 - this.bitWidth)) >> (32 - this.bitWidth);

        // Reset all outputs first
        this.equalOutput.value = 0;
        this.greaterOutput.value = 0;
        this.lessOutput.value = 0;

        // Compare values using if-else
        if (valueA === valueB) {
            this.equalOutput.value = 1;
        } else if (valueA > valueB) {
            this.greaterOutput.value = 1;
        } else {
            this.lessOutput.value = 1;
        }

        // Add outputs to simulation queue
        simulationArea.simulationQueue.add(this.equalOutput);
        simulationArea.simulationQueue.add(this.greaterOutput);
        simulationArea.simulationQueue.add(this.lessOutput);

        this.setOutputsUpstream(true);
    }

    /**
     * @memberof Comparator
     * function to draw element
     */
    customDraw() {
        const ctx = simulationArea.context;
        const xx = this.x;
        const yy = this.y;

        ctx.beginPath();
        ctx.strokeStyle = colors["stroke"];
        ctx.fillStyle = colors["fill"];
        ctx.lineWidth = correctWidth(3);
        ctx.rect(xx - 20, yy - 20, 40, 40);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "20px Helvetica";
        ctx.textAlign = "center";
        ctx.fillStyle = colors["text"];
        fillText(ctx, "C", xx, yy + 5);
        ctx.fill();

        // Draw node labels
        ctx.beginPath();
        ctx.font = "12px Helvetica";
        ctx.textAlign = "center";
        ctx.fillStyle = colors["text"];
        fillText(ctx, "A", xx - 12, yy - 12);
        fillText(ctx, "B", xx - 12, yy + 12);
        fillText(ctx, "=", xx + 12, yy - 12);
        fillText(ctx, ">", xx + 12, yy);
        fillText(ctx, "<", xx + 12, yy + 12);
        ctx.fill();
    }

    /**
     * @memberof Comparator
     * function to generate verilog for comparator
     * @return {string}
     */
    generateVerilog() {
        return `
    assign ${this.equalOutput.verilogLabel} = $signed(${this.inpA.verilogLabel}) == $signed(${this.inpB.verilogLabel});
    assign ${this.greaterOutput.verilogLabel} = $signed(${this.inpA.verilogLabel}) > $signed(${this.inpB.verilogLabel});
    assign ${this.lessOutput.verilogLabel} = $signed(${this.inpA.verilogLabel}) < $signed(${this.inpB.verilogLabel});`;
    }

    /**
     * @memberof Comparator
     * function to save state of the component
     * @return {JSON}
     */
    customSave() {
        const data = {
            constructorParamaters: [this.direction, this.bitWidth],
            nodes: {
                inpA: findNode(this.inpA),
                inpB: findNode(this.inpB),
                equalOutput: findNode(this.equalOutput),
                greaterOutput: findNode(this.greaterOutput),
                lessOutput: findNode(this.lessOutput)
            }
        };
        return data;
    }
} 