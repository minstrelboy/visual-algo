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
    Switch,
    End
}

class TNode {
    private sprite: Graphics.Sprite;
    private rect: Graphics.Rectangle;
    private currentpoint: number = 0;
    constructor(public value: number, public point: number, public context: CanvasRenderingContext2D) {
        this.currentpoint = point;
        let x = 20 + this.currentpoint * 20;
        let y = 250 - value;
        this.rect = new Graphics.Rectangle(x, y, 10, value, "red");
        this.sprite = new Graphics.Sprite(context, this.rect, x, y, x, y, 2, 2, null, 1, false);
    }
    public arrived(): boolean {
        return this.sprite.arrived;
    }

    get currentx(): number {
        return this.sprite.currentx;
    }

    public moveToNext(): void {
        this.movetopoint(this.currentpoint + 1);
    }

    public moveToBefore(): void {
        this.movetopoint(this.currentpoint - 1);
    }

    public movetopoint(topoint: number) {
        this.currentpoint = topoint;
        this.sprite.endx = 20 * topoint + 20;
        if (this.sprite.startx < this.sprite.endx) {
            this.sprite.xspeed = 2;
        } else {
            this.sprite.xspeed = -2;
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
    private nodes: TNode[] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
    private sortstate: SortState = SortState.Init;
    private currentindex: number = 0;
    constructor(public width: number, public height: number) {
        this.canvas = <HTMLCanvasElement>document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.border = "1px solid gray";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.background = new Graphics.Rectangle(0, 0, 840, 300, "white");
        this.initnodes();
         this.canvas.addEventListener("click", () => {
            this.start();
        });
    }

    private initnodes() {
        var i;
        for (i = 0; i < 40; i++) {
            let random = Math.ceil(Math.random() * 100)*2 + 10;
            this.nodes[i] = new TNode(random, i,this.ctx);
        }
    }

    private drawNodes(): boolean {
        var iscompleted = true;
        var i;
        for (i = 0; i < 40; i++) {
            this.nodes[i].redarw();
            if (!this.nodes[i].arrived()) {
                iscompleted = false;
            }
        }
        return iscompleted;
    }

    private drawbackground() {
        this.background.draw(this.ctx);
    }

    private exchange(x: number, y: number) {
        let na = this.nodes[x];
        let nb = this.nodes[y];
        na.movetopoint(y);
        nb.movetopoint(x);
        this.nodes[x] = nb;
        this.nodes[y] = na;
    }

    private isSortCompleted(): boolean {
        var iscompleted: boolean = true;
        var i;
        for (i = 0; i < 39; i++) {
            if (this.nodes[i].value > this.nodes[i+1].value) {
                iscompleted = false;
                break;
            }
        }
        return iscompleted;
    }

    public start = () => {
        this.drawbackground();
        let iscompled = this.drawNodes();
       
        if (iscompled) {
            //if (this.sortstate == SortState.Init) {
            //    this.exchange(0, 1);
            //    this.sortstate = SortState.Switch;
            //    this.start();
            //}
            switch (this.sortstate) {
                case SortState.Init:
                    if (this.isSortCompleted()) {
                        this.sortstate = SortState.End;
                        break;
                    } else {
                        this.sortstate = SortState.Switch;
                        this.start();
                    }
                    break;
                case SortState.Switch:
                    while (this.currentindex < 39) {
                        if (this.nodes[this.currentindex].value > this.nodes[this.currentindex + 1].value) {
                            this.exchange(this.currentindex, this.currentindex + 1);
                            this.start();
                            break;
                        }
                        this.currentindex++;
                    }
                    if (this.currentindex == 39) {
                        if (this.isSortCompleted()) {
                            this.sortstate = SortState.End;
                            this.start();
                        } else {
                            this.currentindex = 0;
                            this.start();
                        }
                    }
                    break;
                case SortState.End:
                    console.debug("End");
                    break;
            }
        } else {
            window.requestAnimationFrame(this.start);
        }
    }
}

window.onload = () => {
    let state = new State(840, 300);
};