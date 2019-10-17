module Graphics {
    export interface GraphInterface {
        x: number;
        y: number;
        draw(contex: CanvasRenderingContext2D): void;
    }

    export class Rectangle implements GraphInterface {

        constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
        }
        public draw(contex: CanvasRenderingContext2D) {
            contex.fillStyle = this.color;
            contex.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    export class Line implements GraphInterface {
        constructor(public x: number, public y: number, public x1: number, public y1: number, public color: string) {
        }
        public draw(contex: CanvasRenderingContext2D) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 2.0;
            contex.beginPath();
            contex.moveTo(this.x, this.y);
            contex.lineTo(this.x1, this.y1);
            contex.closePath();
            contex.stroke();
        }
    }

    export class DashedLine {
        private line_peace_len: number = 10;
        constructor(public x1: number, public y1: number, public x2: number, public y2: number, public color: string) {
        }

        public setpointxy(xx1: number, yy1: number, xx2: number, yy2: number) {
            this.x1 = xx1;
            this.y1 = yy1;
            this.x2 = xx2;
            this.y2 = yy2;
        }

        public draw(contex: CanvasRenderingContext2D) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 1.0;
            contex.beginPath()
            let len = Math.sqrt(Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2));
            if ((this.line_peace_len / 2) >= len) {
                contex.moveTo(this.x1, this.y1);
                contex.lineTo(this.x2, this.y2);
            } else if (this.line_peace_len >= len) {
                contex.moveTo(this.x1, this.y1);
                contex.lineTo((this.x2 + this.x1) / 2, (this.y1 + this.y2) / 2);
            } else {
                let x_up = this.line_peace_len * ((this.x2 - this.x1) / len); //沿x轴变化值
                let y_up = this.line_peace_len * ((this.y2 - this.y1) / len); //沿y轴变化值
                var px1 = this.x1;
                var py1 = this.y1;
                var px2 = px1 + x_up;
                var py2 = py1 + y_up;
                var templen = this.line_peace_len;
                do {
                    contex.moveTo(px1, py1);
                    contex.lineTo((px2 + px1) / 2, (py2 + py1) / 2);
                    px1 = px2;
                    py1 = py2;
                    templen += this.line_peace_len;
                    px2 = px1 + x_up;
                    py2 = py1 + y_up;
                    if (templen > len) {
                        if ((templen - len) <= (this.line_peace_len / 2)) {
                            contex.moveTo(px1, py1);
                            contex.lineTo((px2 + px1) / 2, (py2 + py1) / 2);
                        } else {
                            contex.moveTo(px1, py1);
                            contex.lineTo(this.x2, this.y2);
                        }
                    }
                } while (templen <= len);
            }
            contex.closePath();
            contex.stroke();
        }
    }

    export class DashedRectangle {
        private l1: DashedLine;
        private l2: DashedLine;
        private l3: DashedLine;
        private l4: DashedLine;
        constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
            let x1 = this.x + this.width;
            let y1 = this.y + this.height;
            this.l1 = new DashedLine(x, y, x1, y, color);
            this.l2 = new DashedLine(x1, y, x1, y1, color);
            this.l3 = new DashedLine(x1, y1, x, y1, color);
            this.l4 = new DashedLine(x, y1, x, y, color);
        }

        public draw(contex: CanvasRenderingContext2D) {
            let x1 = this.x + this.width;
            let y1 = this.y + this.height;
            this.l1.setpointxy(this.x, this.y, x1, this.y);
            this.l2.setpointxy(x1, this.y, x1, y1);
            this.l3.setpointxy(x1, y1, this.x, y1);
            this.l4.setpointxy(this.x, y1, this.x, this.y);
            this.l1.draw(contex);
            this.l2.draw(contex);
            this.l3.draw(contex);
            this.l4.draw(contex);
        }
    }

    export class Sprite {
        currentx: number;
        currenty: number;
        constructor(public context: CanvasRenderingContext2D, public grapeinterface: GraphInterface, public startx: number, public starty: number, public endx: number, public endy: number, public xspeed: number, public yspeed: number, public starttime: Date, public actiontime: number, public arrived: boolean) {
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.arrived = false;
        }

        public setstartxy(x: number, y: number) {
            this.startx = x;
            this.starty = y;
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.arrived = false;
        }

        public redraw() {
            if (this.currentx != this.endx) {
                this.currentx = this.currentx + this.xspeed;
            }
            if (this.currenty != this.endy) {
                this.currenty = this.currenty + this.yspeed;
            }
            if ((this.currentx != this.endx) || (this.currenty != this.endy)) {
                this.arrived = false;
            } else {
                this.arrived = true;
                this.startx = this.endx;
                this.starty = this.endy;
            }
            this.grapeinterface.x = this.currentx;
            this.grapeinterface.y = this.currenty;
            this.grapeinterface.draw(this.context);
        }
    }
}


enum SortState {
    Init,
    NewNode,
    Insert,
    Running,
    End
}

class TNode {
    private sprite: Graphics.Sprite;
    private rect: Graphics.Rectangle;
    private column: number = 0;
    private row: number = 0;
    constructor(public value: number, public context: CanvasRenderingContext2D) {
        this.rect = new Graphics.Rectangle(0, (250-value), 10, value, "red");
        this.sprite = new Graphics.Sprite(context, this.rect, 0, (250-value), 20, (250-value), 2, 2, null, 1, false);
    }
    public arrived(): boolean {
        return this.sprite.arrived;
    }

    get currentx(): number {
        return this.sprite.currentx;
    }

    public moveToNext(): void {
        this.movetopoint(this.column + 1,this.row);
    }

    public movetopoint(column: number, row: number) {
        this.column = column;
        this.row = row;
        this.sprite.endx = 30 * column + 20;
        if (this.sprite.startx < this.sprite.endx) {
            this.sprite.xspeed = 2;
        } else {
            this.sprite.xspeed = -2;
        }
        if (row == 0) {
            this.sprite.endy = 250-this.value;
        } else {
            this.sprite.endy = 500-this.value;
        }
        if (this.sprite.starty < this.sprite.endy) {
            this.sprite.yspeed = 5;
        } else {
            this.sprite.yspeed = -5;
        }
        this.sprite.arrived = false;
    }

    public redarw() {
        if (this.value > 0) {
            this.sprite.redraw();
        }
    }
}



class State {
    private canvas: HTMLCanvasElement;
    private line: Graphics.Line;
    private ctx: CanvasRenderingContext2D;
    private background: Graphics.Rectangle;
    private shadowInsertNode: Graphics.DashedRectangle;
    private nodes: TNode[] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
    private sortstate: SortState = SortState.Init;
    private insertNode: TNode = null;
    private currentindex: number = 0;
    private totalnodes: number = 0;
    constructor(public width: number, public height: number) {
        this.canvas = <HTMLCanvasElement>document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.border = "1px solid gray";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.line = new Graphics.Line(20, 502, 780, 500, "black");
        this.shadowInsertNode = new Graphics.DashedRectangle(20, 500, 100, 100, "black");
        this.background = new Graphics.Rectangle(0, 0, 800, 600, "white");
        this.ctx.font = "bold 40px Arial";
        this.ctx.fillText("点击开始", 100, 100);
        this.canvas.onclick = () => {
            this.start();
        };
    }

    private drawbackground(): void{
        this.background.draw(this.ctx);
        this.line.draw(this.ctx);
    }

    private drawNodes(): boolean {
        var tnode: TNode = null;
        var i: number;
        var isallcompleted: boolean = true;
        for (i = 0; i < 20; i++) {
            tnode = this.nodes[i];
            if (tnode == null) {
                break;
            }
            tnode.redarw();
            if (!tnode.arrived()) {
                isallcompleted = false;
            }
        }
        return isallcompleted;
    }

    private drawInsertNode(): boolean {
        if ((this.insertNode != null) && (!this.insertNode.arrived())) {
            this.insertNode.redarw();
            if ((this.sortstate != SortState.Init) || (this.sortstate != SortState.End)) {
                this.shadowInsertNode.x = this.insertNode.currentx;
                this.shadowInsertNode.draw(this.ctx);
            }
            return false;
        } else {
            return true;
        }
        
    }

    public addNewTNode(): void {
        let random = Math.ceil(Math.random() * 30) * 5;
        this.insertNode = new TNode(random, this.ctx);
        this.shadowInsertNode.x = this.insertNode.currentx;
        this.shadowInsertNode.y = (500 - this.insertNode.value);
        this.shadowInsertNode.width = 10;
        this.shadowInsertNode.height = this.insertNode.value;
        this.sortstate = SortState.NewNode;
        this.totalnodes++;
    }

    private moveafter(index: number): void {
        var i = 19;
        for (i = 19; i >index; i--) {
            if (this.nodes[i - 1] != null) {
                this.nodes[i] = this.nodes[i - 1];
                this.nodes[i].moveToNext();
            }
        }
    }

    public start = () => {
        this.drawbackground();
        let isnodescompleted = this.drawNodes();
        let insertnodecompleted = this.drawInsertNode();
        let isallcompleted = insertnodecompleted && isnodescompleted;
        if (isallcompleted) {
            switch (this.sortstate) {
                case SortState.Init: {
                    this.addNewTNode();
                    this.start();
                    break;
                }
                case SortState.NewNode: {
                    if (this.currentindex > 19) {
                        this.sortstate = SortState.End;
                        break;
                    }
                    if ((this.nodes[this.currentindex] == null) || (this.nodes[this.currentindex] != null && this.nodes[this.currentindex].value > this.insertNode.value)) {
                        this.moveafter(this.currentindex);
                        this.insertNode.movetopoint(this.currentindex, 1);
                        this.sortstate = SortState.Insert;
                        this.start();
                    } else {
                        this.currentindex++;
                        this.insertNode.movetopoint(this.currentindex, 0);
                        this.start();
                    }
                    break;
                }
                case SortState.Insert: {
                    this.nodes[this.currentindex] = this.insertNode;
                    this.insertNode = null;
                    if (this.totalnodes < 20) {
                        this.sortstate = SortState.Init;
                        this.currentindex = 0;
                        this.start();
                        break;
                    }
                    this.sortstate = SortState.End;
                    this.start();
                    break;
                }
                case SortState.End: {
                    console.debug("End");
                }
            }
        } else {
            window.requestAnimationFrame(this.start);
        }
    }
}

window.onload = () => {
    //const btn = document.createElement("input");
    //btn.type = "button";
    //btn.value = "click me start";
    //btn.onclick = () => {
        let state: State = new State(800, 600);
        //state.start();
    //};
    //document.body.appendChild(btn);
};
