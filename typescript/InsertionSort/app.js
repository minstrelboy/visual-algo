var Graphics;
(function (Graphics) {
    var Rectangle = (function () {
        function Rectangle(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
        }
        Rectangle.prototype.draw = function (contex) {
            contex.fillStyle = this.color;
            contex.fillRect(this.x, this.y, this.width, this.height);
        };
        return Rectangle;
    }());
    Graphics.Rectangle = Rectangle;
    var Line = (function () {
        function Line(x, y, x1, y1, color) {
            this.x = x;
            this.y = y;
            this.x1 = x1;
            this.y1 = y1;
            this.color = color;
        }
        Line.prototype.draw = function (contex) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 2.0;
            contex.beginPath();
            contex.moveTo(this.x, this.y);
            contex.lineTo(this.x1, this.y1);
            contex.closePath();
            contex.stroke();
        };
        return Line;
    }());
    Graphics.Line = Line;
    var DashedLine = (function () {
        function DashedLine(x1, y1, x2, y2, color) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.color = color;
            this.line_peace_len = 10;
        }
        DashedLine.prototype.setpointxy = function (xx1, yy1, xx2, yy2) {
            this.x1 = xx1;
            this.y1 = yy1;
            this.x2 = xx2;
            this.y2 = yy2;
        };
        DashedLine.prototype.draw = function (contex) {
            contex.strokeStyle = this.color;
            contex.fillStyle = this.color;
            contex.lineWidth = 1.0;
            contex.beginPath();
            var len = Math.sqrt(Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2));
            if ((this.line_peace_len / 2) >= len) {
                contex.moveTo(this.x1, this.y1);
                contex.lineTo(this.x2, this.y2);
            }
            else if (this.line_peace_len >= len) {
                contex.moveTo(this.x1, this.y1);
                contex.lineTo((this.x2 + this.x1) / 2, (this.y1 + this.y2) / 2);
            }
            else {
                var x_up = this.line_peace_len * ((this.x2 - this.x1) / len); //沿x轴变化值
                var y_up = this.line_peace_len * ((this.y2 - this.y1) / len); //沿y轴变化值
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
                        }
                        else {
                            contex.moveTo(px1, py1);
                            contex.lineTo(this.x2, this.y2);
                        }
                    }
                } while (templen <= len);
            }
            contex.closePath();
            contex.stroke();
        };
        return DashedLine;
    }());
    Graphics.DashedLine = DashedLine;
    var DashedRectangle = (function () {
        function DashedRectangle(x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            var x1 = this.x + this.width;
            var y1 = this.y + this.height;
            this.l1 = new DashedLine(x, y, x1, y, color);
            this.l2 = new DashedLine(x1, y, x1, y1, color);
            this.l3 = new DashedLine(x1, y1, x, y1, color);
            this.l4 = new DashedLine(x, y1, x, y, color);
        }
        DashedRectangle.prototype.draw = function (contex) {
            var x1 = this.x + this.width;
            var y1 = this.y + this.height;
            this.l1.setpointxy(this.x, this.y, x1, this.y);
            this.l2.setpointxy(x1, this.y, x1, y1);
            this.l3.setpointxy(x1, y1, this.x, y1);
            this.l4.setpointxy(this.x, y1, this.x, this.y);
            this.l1.draw(contex);
            this.l2.draw(contex);
            this.l3.draw(contex);
            this.l4.draw(contex);
        };
        return DashedRectangle;
    }());
    Graphics.DashedRectangle = DashedRectangle;
    var Sprite = (function () {
        function Sprite(context, grapeinterface, startx, starty, endx, endy, xspeed, yspeed, starttime, actiontime, arrived) {
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
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.arrived = false;
        }
        Sprite.prototype.setstartxy = function (x, y) {
            this.startx = x;
            this.starty = y;
            this.currentx = this.startx;
            this.currenty = this.starty;
            this.arrived = false;
        };
        Sprite.prototype.redraw = function () {
            if (this.currentx != this.endx) {
                this.currentx = this.currentx + this.xspeed;
            }
            if (this.currenty != this.endy) {
                this.currenty = this.currenty + this.yspeed;
            }
            if ((this.currentx != this.endx) || (this.currenty != this.endy)) {
                this.arrived = false;
            }
            else {
                this.arrived = true;
                this.startx = this.endx;
                this.starty = this.endy;
            }
            this.grapeinterface.x = this.currentx;
            this.grapeinterface.y = this.currenty;
            this.grapeinterface.draw(this.context);
        };
        return Sprite;
    }());
    Graphics.Sprite = Sprite;
})(Graphics || (Graphics = {}));
var SortState;
(function (SortState) {
    SortState[SortState["Init"] = 0] = "Init";
    SortState[SortState["NewNode"] = 1] = "NewNode";
    SortState[SortState["Insert"] = 2] = "Insert";
    SortState[SortState["Running"] = 3] = "Running";
    SortState[SortState["End"] = 4] = "End";
})(SortState || (SortState = {}));
var TNode = (function () {
    function TNode(value, context) {
        this.value = value;
        this.context = context;
        this.column = 0;
        this.row = 0;
        this.rect = new Graphics.Rectangle(0, (250 - value), 10, value, "red");
        this.sprite = new Graphics.Sprite(context, this.rect, 0, (250 - value), 20, (250 - value), 2, 2, null, 1, false);
    }
    TNode.prototype.arrived = function () {
        return this.sprite.arrived;
    };
    Object.defineProperty(TNode.prototype, "currentx", {
        get: function () {
            return this.sprite.currentx;
        },
        enumerable: true,
        configurable: true
    });
    TNode.prototype.moveToNext = function () {
        this.movetopoint(this.column + 1, this.row);
    };
    TNode.prototype.movetopoint = function (column, row) {
        this.column = column;
        this.row = row;
        this.sprite.endx = 30 * column + 20;
        if (this.sprite.startx < this.sprite.endx) {
            this.sprite.xspeed = 2;
        }
        else {
            this.sprite.xspeed = -2;
        }
        if (row == 0) {
            this.sprite.endy = 250 - this.value;
        }
        else {
            this.sprite.endy = 500 - this.value;
        }
        if (this.sprite.starty < this.sprite.endy) {
            this.sprite.yspeed = 5;
        }
        else {
            this.sprite.yspeed = -5;
        }
        this.sprite.arrived = false;
    };
    TNode.prototype.redarw = function () {
        if (this.value > 0) {
            this.sprite.redraw();
        }
    };
    return TNode;
}());
var State = (function () {
    function State(width, height) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.nodes = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
        this.sortstate = SortState.Init;
        this.insertNode = null;
        this.currentindex = 0;
        this.totalnodes = 0;
        this.start = function () {
            _this.drawbackground();
            var isnodescompleted = _this.drawNodes();
            var insertnodecompleted = _this.drawInsertNode();
            var isallcompleted = insertnodecompleted && isnodescompleted;
            if (isallcompleted) {
                switch (_this.sortstate) {
                    case SortState.Init: {
                        _this.addNewTNode();
                        _this.start();
                        break;
                    }
                    case SortState.NewNode: {
                        if (_this.currentindex > 19) {
                            _this.sortstate = SortState.End;
                            break;
                        }
                        if ((_this.nodes[_this.currentindex] == null) || (_this.nodes[_this.currentindex] != null && _this.nodes[_this.currentindex].value > _this.insertNode.value)) {
                            _this.moveafter(_this.currentindex);
                            _this.insertNode.movetopoint(_this.currentindex, 1);
                            _this.sortstate = SortState.Insert;
                            _this.start();
                        }
                        else {
                            _this.currentindex++;
                            _this.insertNode.movetopoint(_this.currentindex, 0);
                            _this.start();
                        }
                        break;
                    }
                    case SortState.Insert: {
                        _this.nodes[_this.currentindex] = _this.insertNode;
                        _this.insertNode = null;
                        if (_this.totalnodes < 20) {
                            _this.sortstate = SortState.Init;
                            _this.currentindex = 0;
                            _this.start();
                            break;
                        }
                        _this.sortstate = SortState.End;
                        _this.start();
                        break;
                    }
                    case SortState.End: {
                        console.debug("End");
                    }
                }
            }
            else {
                window.requestAnimationFrame(_this.start);
            }
        };
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.border = "1px solid gray";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.line = new Graphics.Line(20, 502, 780, 500, "black");
        this.shadowInsertNode = new Graphics.DashedRectangle(20, 500, 100, 100, "black");
        this.background = new Graphics.Rectangle(0, 0, 800, 600, "white");
        //this.canvas.addEventListener("click", () => {
        //    this.start();
        //});
    }
    State.prototype.drawbackground = function () {
        this.background.draw(this.ctx);
        this.line.draw(this.ctx);
    };
    State.prototype.drawNodes = function () {
        var tnode = null;
        var i;
        var isallcompleted = true;
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
    };
    State.prototype.drawInsertNode = function () {
        if ((this.insertNode != null) && (!this.insertNode.arrived())) {
            this.insertNode.redarw();
            if ((this.sortstate != SortState.Init) || (this.sortstate != SortState.End)) {
                this.shadowInsertNode.x = this.insertNode.currentx;
                this.shadowInsertNode.draw(this.ctx);
            }
            return false;
        }
        else {
            return true;
        }
    };
    State.prototype.addNewTNode = function () {
        var random = Math.ceil(Math.random() * 30) * 5;
        this.insertNode = new TNode(random, this.ctx);
        this.shadowInsertNode.x = this.insertNode.currentx;
        this.shadowInsertNode.y = (500 - this.insertNode.value);
        this.shadowInsertNode.width = 10;
        this.shadowInsertNode.height = this.insertNode.value;
        this.sortstate = SortState.NewNode;
        this.totalnodes++;
    };
    State.prototype.moveafter = function (index) {
        var i = 19;
        for (i = 19; i > index; i--) {
            if (this.nodes[i - 1] != null) {
                this.nodes[i] = this.nodes[i - 1];
                this.nodes[i].moveToNext();
            }
        }
    };
    return State;
}());
window.onload = function () {
    var state = new State(800, 600);
    state.start();
};
//# sourceMappingURL=app.js.map