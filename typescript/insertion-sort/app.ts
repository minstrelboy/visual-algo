module Graphics {
    export interface GraphInterface {
        x: number;
        y: number;
        color: string;
        draw(ctx: CanvasRenderingContext2D): void;
    }
    // 矩形
    export class Rectangle implements GraphInterface {

        constructor(public x: number, public y: number, public width: number, public height: number, public color: string) {
        }
        public draw(contex: CanvasRenderingContext2D) {
            contex.fillStyle = this.color;
            contex.fillRect(this.x, this.y, this.width, this.height);
            contex.fillText(this.height.toString(), this.x, this.y - 10);
        }
    }

    // 直线
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

    // 圆形
    export class Circle implements GraphInterface {
        constructor(public x: number, public y: number, public radius: number, public color: string) {
        }
        public draw(contex: CanvasRenderingContext2D) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 2.0;
            contex.beginPath();
            contex.arc(this.x, this.y, this.radius, 0, 360);
            contex.closePath();
            contex.stroke();
        }
    }

   

    // 精灵
    export class Sprite {
        currentx: number;
        currenty: number;
        public changed: boolean = false;
        private arrivedx: boolean = false;
        private arrivedy: boolean = false;
        constructor(public context: CanvasRenderingContext2D, public grapeinterface: GraphInterface, public startx: number, public starty: number, public endx: number, public endy: number, public xspeed: number, public yspeed: number, public starttime: Date, public actiontime: number, public arrived: boolean) {
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.initArrived();
        }

        public setChanged() {
            this.changed = true;
            this.arrived = false;
            this.arrivedx = false;
            this.arrivedy = false;
        }

        public setstartxy(x: number, y: number) {
            this.startx = x;
            this.starty = y;
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.initArrived();
        }

        public redraw() {
            if (this.changed) {
                if (!this.arrivedx) {
                    this.currentx = this.currentx + this.xspeed;
                    if (this.xspeed > 0) {
                        if (this.currentx >= this.endx) {
                            this.arrivedx = true;
                        }
                    } else {
                        if (this.currentx <= this.endx) {
                            this.arrivedx = true;
                        }
                    }
                }
                if (!this.arrivedy) {
                    this.currenty = this.currenty + this.yspeed;
                    if (this.yspeed > 0) {
                        if (this.currenty >= this.endy) {
                            this.arrivedy = true;
                        }
                    } else {
                        if (this.currenty <= this.endy) {
                            this.arrivedy = true;
                        }
                    }
                }

                if (this.arrivedx && this.arrivedy) {
                    this.arrived = true;
                    this.changed = false;
                    this.startx = this.endx;
                    this.currentx = this.endx;
                    this.starty = this.endy;
                    this.currenty = this.endy;
                }
            }
            this.grapeinterface.x = this.currentx;
            this.grapeinterface.y = this.currenty;
            this.grapeinterface.draw(this.context);
        }
        private initArrived() {
            this.arrived = false;
            this.arrivedx = false;
            this.arrivedy = false;
        }

        public toString() {
            return "changed:" + this.changed + "startx:" + this.startx + "  currentx:" + this.currentx + " endx:" + this.endx + " xspeed:" + this.xspeed + "  starty:" + this.starty + " currenty:" + this.currenty + "  endy:" + this.endy + "  yspeed:" + this.yspeed + " arrived arrivedx arrivedy:" + this.arrived + this.arrivedx + this.arrivedy;
        }
    }
    // 节点
    export class TNode {
        public sprite: Graphics.Sprite;
        public rect: Graphics.Rectangle;
        public column: number = 0;
        public row: number = 0;
        constructor(public value: number, public index: number, public context: CanvasRenderingContext2D) {
            this.rect = new Graphics.Rectangle(index * 30 + 20, (250 - value), 10, value, "black");
            this.column = index;
            this.row = 0;
            this.sprite = new Graphics.Sprite(context, this.rect, index * 30 + 20, (250 - value), 20, (250 - value), 2, 2, new Date(), 1, false);
        }
        public arrived(): boolean {
            if (this.sprite.changed) {
                return this.sprite.arrived;
            } else {
                return true;
            }
        }

        public setColor(color: string) {
            this.rect.color = color;
        }

        get currentx(): number {
            return this.sprite.currentx;
        }

        public moveToNext(): void {
            this.movetopoint(this.column + 1, this.row);
        }

        public moveToPrev(): void {
            if (this.column > 0) {
                this.movetopoint(this.column - 1, this.row);
            } else {
                this.movetopoint(0, this.row);
            }
        }

        public initToPoint(column: number, row: number, value: number): void {
            this.column = column;
            this.row = row;
            this.value = value;
            this.sprite.startx = 30 * column + 20
            this.sprite.endx = this.sprite.startx;
            this.rect.height = value;
            if (row == 0) {
                this.sprite.endy = 250 - this.value;
            } else {
                this.sprite.endy = 500 - this.value;
            }
            this.sprite.starty = this.sprite.endy;
        }

        public movetopoint(column: number, row: number) {
            this.sprite.setChanged();
            this.column = column;
            this.row = row;
            this.sprite.endx = 30 * column + 20;
            if (this.sprite.startx === this.sprite.endx) {
                this.sprite.xspeed = 0;
            } else if (this.sprite.startx < this.sprite.endx) {
                this.sprite.xspeed = 1;
            } else {
                this.sprite.xspeed = -1;
            }
            if (row == 0) {
                this.sprite.endy = 250 - this.value;
            } else {
                this.sprite.endy = 500 - this.value;
            }
            if (this.sprite.starty === this.sprite.endy) {
                this.sprite.yspeed = 0;
            } else if (this.sprite.starty < this.sprite.endy) {
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

    // 自定义事件
    export interface ILiteEvent<T> {
        on(handler: { (data?: T): void }): void;
        off(handler: { (data?: T): void }): void;
    }

    export class LiteEvent<T> implements ILiteEvent<T> {
        private handlers: { (data?: T): void; }[] = [];

        public on(handler: { (data?: T): void }): void {
            this.handlers.push(handler);
        }

        public off(handler: { (data?: T): void }): void {
            this.handlers = this.handlers.filter(h => h !== handler);
        }

        public trigger(data?: T) {
            this.handlers.slice(0).forEach(h => h(data));
        }

        public expose(): ILiteEvent<T> {
            return this;
        }
    }

    //动画
    export class NAnimation {
        private readonly completed = new LiteEvent<void>();
        public get OnCompleted() {
            return this.completed.expose();
        }
        constructor(private state: State) { }

        public run = () => {
            const b = this.state.loop();
            if (!b) {
                requestAnimationFrame(this.run)
            } else {
                this.completed.trigger();
            }
        }
    }

    export class NAnimationWapper {
        public resolves: any;
        public rejects: any;
        public animaition: NAnimation;
        constructor(state: State) {
            this.animaition = new NAnimation(state);
            this.animaition.OnCompleted.on(() => {
                if (this.resolves) {
                    this.resolves();
                }
            });
        }
        public sendMsg(playload: any, animaition: NAnimation) {
            return new Promise((res, rej) => {
                this.resolves = res;
                this.rejects = rej;
                animaition.run();
            });
        }
        public async start() {
            return this.sendMsg("helloNeo", this.animaition);
        }
    }

    //启动界面
    export class SplashScreen {
        private ctx: CanvasRenderingContext2D;
        private circle: Circle;
        constructor(public width: number, public height: number, public canvas: HTMLCanvasElement) {
            const context = this.canvas.getContext("2d");
            if (context != null) {
                this.ctx = context;
            }
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.circle = new Circle(380, 130, 40, "black");
            
        }
        private drawTriangle(contex: CanvasRenderingContext2D, color: string) {
            contex.strokeStyle = color;
            contex.fillStyle = color;
            contex.lineWidth = 2.0;
            contex.beginPath();
            contex.moveTo(370, 113);
            contex.lineTo(400, 130);
            contex.lineTo(370, 147);
            contex.lineTo(370, 113);
            contex.closePath();
            contex.stroke();
        }
        public writeTitle() {
            this.ctx.font = "bold 30px Arial";
            this.ctx.fillText("点击开始", 320, 210);
        }
        public Show() {
            this.circle.draw(this.ctx);
            this.drawTriangle(this.ctx,"black");
            this.writeTitle();
        }
    }

    // 舞台
    export class State {
        private MAX_NODE_LEN = 25;
        private line: Graphics.Line;
        private ctx: CanvasRenderingContext2D;
        private background: Graphics.Rectangle;
        private nodes: TNode[] = [];
        private insertArray: number[] = [];
        private wapper: NAnimationWapper;
        private currentIndex: number = 0;
        constructor(public width: number, public height: number, public canvas: HTMLCanvasElement) {
            const context = this.canvas.getContext("2d");
            if (context != null) {
                this.ctx = context;
            }
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.line = new Graphics.Line(20, 260, 780, 260, "black");
            this.background = new Graphics.Rectangle(0, 0, 800, 300, "white");
            this.wapper = new Graphics.NAnimationWapper(this);
        }

        

        public setFont(font: string) {
            this.ctx.font = font;
        }

        public initNodes(): void {
            this.nodes = [];
            this.insertArray = [];
            for (let i = 0; i < this.MAX_NODE_LEN; i++) {
                let random = Math.ceil(Math.random() * 30) * 5;
                const node = new TNode(random, i, this.ctx);
                this.nodes.push(node);
                this.insertArray.push(i);
            }
        }

        public loop(): boolean {
            this.drawbackground();
            this.drawNodes();
            return this.isNodesArrived();
        }

        private drawbackground(): void {
            this.background.draw(this.ctx);
            this.line.x1 = 30 + this.currentIndex * 30;
            this.line.draw(this.ctx);
            this.ctx.fillText("插入排序", 10, 20);
        }

        private isNodesArrived(): boolean {
            for (let i = 0; i < this.nodes.length; i++) {
                if (!this.nodes[i].arrived()) {
                    return false;
                }
            }
            return true;
        }
        private drawNodes(): void {
            for (let i = 0; i < this.MAX_NODE_LEN; i++) {
                const node = this.nodes[i];
                node.redarw();
            }
        }

        public async insertion() {
            this.initNodes();
            for (let i = 1; i < this.MAX_NODE_LEN; i++) {
                this.currentIndex = i;
                for (let j = i; j > 0; j--) {
                    if (this.less(j, j - 1)) {
                        await this.swap(j, j - 1);
                    }
                }
            }
        }

        public less(a: number, b: number): boolean {
            const ia = this.insertArray[a];
            const ib = this.insertArray[b];
            const na = this.nodes[ia].value;
            const nb = this.nodes[ib].value;
            // console.log("ia:" + ia + " value:" + na + " ib" + ib + " value:" + nb);
            if (na < nb) {
                return true;
            } else {
                return false;
            }
        }

        public async swap(a: number, b: number) {
            const ia = this.insertArray[a];
            const ib = this.insertArray[b];
            const na = this.nodes[ia];
            const nb = this.nodes[ib];
            const na_col = na.column;
            const nb_col = nb.column;
            na.setColor("red");
            nb.setColor("red");
            na.movetopoint(nb_col, 0);
            nb.movetopoint(na_col, 0);
            await this.wapper.start();
            na.setColor("black");
            nb.setColor("black");
            this.drawbackground();
            this.drawNodes();
            this.insertArray[a] = ib;
            this.insertArray[b] = ia;
        }
    }
}


window.onload = async () => {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    const splash: Graphics.SplashScreen = new Graphics.SplashScreen(800, 300, canvas);
    splash.Show();
    canvas.onclick = () => {
        const state = new Graphics.State(800, 300, canvas);
        state.setFont("bold 12px Arial");
        state.insertion();
    };
}