"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Graphics;
(function (Graphics) {
    // 矩形
    class Rectangle {
        constructor(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
        }
        draw(contex) {
            contex.fillStyle = this.color;
            contex.fillRect(this.x, this.y, this.width, this.height);
            contex.fillText(this.height.toString(), this.x, this.y - 10);
        }
    }
    Graphics.Rectangle = Rectangle;
    // 直线
    class Line {
        constructor(x, y, x1, y1, color) {
            this.x = x;
            this.y = y;
            this.x1 = x1;
            this.y1 = y1;
            this.color = color;
        }
        draw(contex) {
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
    Graphics.Line = Line;
    // 圆形
    class Circle {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
        }
        draw(contex) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 2.0;
            contex.beginPath();
            contex.arc(this.x, this.y, this.radius, 0, 360);
            contex.closePath();
            contex.stroke();
        }
    }
    Graphics.Circle = Circle;
    // 精灵
    class Sprite {
        constructor(context, grapeinterface, startx, starty, endx, endy, xspeed, yspeed, starttime, actiontime, arrived) {
            this.context = context;
            this.grapeinterface = grapeinterface;
            this.startx = startx;
            this.starty = starty;
            this.endx = endx;
            this.endy = endy;
            this.xspeed = xspeed;
            this.yspeed = yspeed;
            this.starttime = starttime;
            this.actiontime = actiontime;
            this.arrived = arrived;
            this.changed = false;
            this.arrivedx = false;
            this.arrivedy = false;
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.initArrived();
        }
        setChanged() {
            this.changed = true;
            this.arrived = false;
            this.arrivedx = false;
            this.arrivedy = false;
        }
        setstartxy(x, y) {
            this.startx = x;
            this.starty = y;
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.initArrived();
        }
        redraw() {
            if (this.changed) {
                if (!this.arrivedx) {
                    this.currentx = this.currentx + this.xspeed;
                    if (this.xspeed > 0) {
                        if (this.currentx >= this.endx) {
                            this.arrivedx = true;
                        }
                    }
                    else {
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
                    }
                    else {
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
        initArrived() {
            this.arrived = false;
            this.arrivedx = false;
            this.arrivedy = false;
        }
        toString() {
            return "changed:" + this.changed + "startx:" + this.startx + "  currentx:" + this.currentx + " endx:" + this.endx + " xspeed:" + this.xspeed + "  starty:" + this.starty + " currenty:" + this.currenty + "  endy:" + this.endy + "  yspeed:" + this.yspeed + " arrived arrivedx arrivedy:" + this.arrived + this.arrivedx + this.arrivedy;
        }
    }
    Graphics.Sprite = Sprite;
    // 节点
    class TNode {
        constructor(value, index, context) {
            this.value = value;
            this.index = index;
            this.context = context;
            this.column = 0;
            this.row = 0;
            this.rect = new Graphics.Rectangle(index * 30 + 20, (250 - value), 10, value, "black");
            this.column = index;
            this.row = 0;
            this.sprite = new Graphics.Sprite(context, this.rect, index * 30 + 20, (250 - value), 20, (250 - value), 2, 2, new Date(), 1, false);
        }
        arrived() {
            if (this.sprite.changed) {
                return this.sprite.arrived;
            }
            else {
                return true;
            }
        }
        setColor(color) {
            this.rect.color = color;
        }
        get currentx() {
            return this.sprite.currentx;
        }
        moveToNext() {
            this.movetopoint(this.column + 1, this.row);
        }
        moveToPrev() {
            if (this.column > 0) {
                this.movetopoint(this.column - 1, this.row);
            }
            else {
                this.movetopoint(0, this.row);
            }
        }
        initToPoint(column, row, value) {
            this.column = column;
            this.row = row;
            this.value = value;
            this.sprite.startx = 30 * column + 20;
            this.sprite.endx = this.sprite.startx;
            this.rect.height = value;
            if (row == 0) {
                this.sprite.endy = 250 - this.value;
            }
            else {
                this.sprite.endy = 500 - this.value;
            }
            this.sprite.starty = this.sprite.endy;
        }
        movetopoint(column, row) {
            this.sprite.setChanged();
            this.column = column;
            this.row = row;
            this.sprite.endx = 30 * column + 20;
            if (this.sprite.startx === this.sprite.endx) {
                this.sprite.xspeed = 0;
            }
            else if (this.sprite.startx < this.sprite.endx) {
                this.sprite.xspeed = 1;
            }
            else {
                this.sprite.xspeed = -1;
            }
            if (row == 0) {
                this.sprite.endy = 250 - this.value;
            }
            else {
                this.sprite.endy = 500 - this.value;
            }
            if (this.sprite.starty === this.sprite.endy) {
                this.sprite.yspeed = 0;
            }
            else if (this.sprite.starty < this.sprite.endy) {
                this.sprite.yspeed = 5;
            }
            else {
                this.sprite.yspeed = -5;
            }
            this.sprite.arrived = false;
        }
        redarw() {
            if (this.value > 0) {
                this.sprite.redraw();
            }
        }
    }
    Graphics.TNode = TNode;
    class LiteEvent {
        constructor() {
            this.handlers = [];
        }
        on(handler) {
            this.handlers.push(handler);
        }
        off(handler) {
            this.handlers = this.handlers.filter(h => h !== handler);
        }
        trigger(data) {
            this.handlers.slice(0).forEach(h => h(data));
        }
        expose() {
            return this;
        }
    }
    Graphics.LiteEvent = LiteEvent;
    //动画
    class NAnimation {
        constructor(state) {
            this.state = state;
            this.completed = new LiteEvent();
            this.run = () => {
                const b = this.state.loop();
                if (!b) {
                    requestAnimationFrame(this.run);
                }
                else {
                    this.completed.trigger();
                }
            };
        }
        get OnCompleted() {
            return this.completed.expose();
        }
    }
    Graphics.NAnimation = NAnimation;
    class NAnimationWapper {
        constructor(state) {
            this.animaition = new NAnimation(state);
            this.animaition.OnCompleted.on(() => {
                if (this.resolves) {
                    this.resolves();
                }
            });
        }
        sendMsg(playload, animaition) {
            return new Promise((res, rej) => {
                this.resolves = res;
                this.rejects = rej;
                animaition.run();
            });
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.sendMsg("helloNeo", this.animaition);
            });
        }
    }
    Graphics.NAnimationWapper = NAnimationWapper;
    //启动界面
    class SplashScreen {
        constructor(width, height, canvas) {
            this.width = width;
            this.height = height;
            this.canvas = canvas;
            const context = this.canvas.getContext("2d");
            if (context != null) {
                this.ctx = context;
            }
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.circle = new Circle(380, 130, 40, "black");
        }
        drawTriangle(contex, color) {
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
        writeTitle() {
            this.ctx.font = "bold 30px Arial";
            this.ctx.fillText("点击开始", 320, 210);
        }
        Show() {
            this.circle.draw(this.ctx);
            this.drawTriangle(this.ctx, "black");
            this.writeTitle();
        }
    }
    Graphics.SplashScreen = SplashScreen;
    // 舞台
    class State {
        constructor(width, height, canvas) {
            this.width = width;
            this.height = height;
            this.canvas = canvas;
            this.MAX_NODE_LEN = 25;
            this.nodes = [];
            this.insertArray = [];
            this.currentIndex = 0;
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
        setFont(font) {
            this.ctx.font = font;
        }
        initNodes() {
            this.nodes = [];
            this.insertArray = [];
            for (let i = 0; i < this.MAX_NODE_LEN; i++) {
                let random = Math.ceil(Math.random() * 30) * 5;
                const node = new TNode(random, i, this.ctx);
                this.nodes.push(node);
                this.insertArray.push(i);
            }
        }
        loop() {
            this.drawbackground();
            this.drawNodes();
            return this.isNodesArrived();
        }
        drawbackground() {
            this.background.draw(this.ctx);
            this.line.x1 = 30 + this.currentIndex * 30;
            this.line.draw(this.ctx);
            this.ctx.fillText("冒泡排序", 10, 20);
        }
        isNodesArrived() {
            for (let i = 0; i < this.nodes.length; i++) {
                if (!this.nodes[i].arrived()) {
                    return false;
                }
            }
            return true;
        }
        drawNodes() {
            for (let i = 0; i < this.MAX_NODE_LEN; i++) {
                const node = this.nodes[i];
                node.redarw();
            }
        }
        bublle() {
            return __awaiter(this, void 0, void 0, function* () {
                this.initNodes();
                this.currentIndex = this.MAX_NODE_LEN - 1;
                for (let i = 0; i < this.MAX_NODE_LEN; i++) {
                    for (let j = (this.MAX_NODE_LEN - 1); j > i; j--) {
                        if (this.less(j, j - 1)) {
                            yield this.swap(j, j - 1);
                        }
                    }
                }
                // this.currentIndex = this.MAX_NODE_LEN -1;
            });
        }
        less(a, b) {
            const ia = this.insertArray[a];
            const ib = this.insertArray[b];
            const na = this.nodes[ia].value;
            const nb = this.nodes[ib].value;
            // console.log("ia:" + ia + " value:" + na + " ib" + ib + " value:" + nb);
            if (na < nb) {
                return true;
            }
            else {
                return false;
            }
        }
        swap(a, b) {
            return __awaiter(this, void 0, void 0, function* () {
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
                yield this.wapper.start();
                na.setColor("black");
                nb.setColor("black");
                this.drawbackground();
                this.drawNodes();
                this.insertArray[a] = ib;
                this.insertArray[b] = ia;
            });
        }
    }
    Graphics.State = State;
})(Graphics || (Graphics = {}));
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = document.getElementById("canvas");
    const splash = new Graphics.SplashScreen(800, 300, canvas);
    splash.Show();
    canvas.onclick = () => {
        const state = new Graphics.State(800, 300, canvas);
        state.setFont("bold 12px Arial");
        state.bublle();
    };
});
