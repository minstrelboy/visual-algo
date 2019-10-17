var Graphics;
(function (Graphics) {
    var Rectangle = /** @class */ (function () {
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
    var Line = /** @class */ (function () {
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
    var Sprite = /** @class */ (function () {
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
    SortState[SortState["Switch"] = 1] = "Switch";
    SortState[SortState["End"] = 2] = "End";
})(SortState || (SortState = {}));
var TNode = /** @class */ (function () {
    function TNode(value, point, context) {
        this.value = value;
        this.point = point;
        this.context = context;
        this.currentpoint = 0;
        this.currentpoint = point;
        var x = 20 + this.currentpoint * 20;
        var y = 250 - value;
        this.rect = new Graphics.Rectangle(x, y, 10, value, "red");
        this.sprite = new Graphics.Sprite(context, this.rect, x, y, x, y, 2, 2, null, 1, false);
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
        this.movetopoint(this.currentpoint + 1);
    };
    TNode.prototype.moveToBefore = function () {
        this.movetopoint(this.currentpoint - 1);
    };
    TNode.prototype.movetopoint = function (topoint) {
        this.currentpoint = topoint;
        this.sprite.endx = 20 * topoint + 20;
        if (this.sprite.startx < this.sprite.endx) {
            this.sprite.xspeed = 2;
        }
        else {
            this.sprite.xspeed = -2;
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
var State = /** @class */ (function () {
    function State(width, height) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.nodes = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
        this.sortstate = SortState.Init;
        this.currentindex = 0;
        this.start = function () {
            _this.drawbackground();
            var iscompled = _this.drawNodes();
            if (iscompled) {
                //if (this.sortstate == SortState.Init) {
                //    this.exchange(0, 1);
                //    this.sortstate = SortState.Switch;
                //    this.start();
                //}
                switch (_this.sortstate) {
                    case SortState.Init:
                        if (_this.isSortCompleted()) {
                            _this.sortstate = SortState.End;
                            break;
                        }
                        else {
                            _this.sortstate = SortState.Switch;
                            _this.start();
                        }
                        break;
                    case SortState.Switch:
                        while (_this.currentindex < 39) {
                            if (_this.nodes[_this.currentindex].value > _this.nodes[_this.currentindex + 1].value) {
                                _this.exchange(_this.currentindex, _this.currentindex + 1);
                                _this.start();
                                break;
                            }
                            _this.currentindex++;
                        }
                        if (_this.currentindex == 39) {
                            if (_this.isSortCompleted()) {
                                _this.sortstate = SortState.End;
                                _this.start();
                            }
                            else {
                                _this.currentindex = 0;
                                _this.start();
                            }
                        }
                        break;
                    case SortState.End:
                        console.debug("End");
                        break;
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
        this.background = new Graphics.Rectangle(0, 0, 840, 300, "white");
        this.initnodes();
        this.canvas.addEventListener("click", function () {
            _this.start();
        });
    }
    State.prototype.initnodes = function () {
        var i;
        for (i = 0; i < 40; i++) {
            var random = Math.ceil(Math.random() * 100) * 2 + 10;
            this.nodes[i] = new TNode(random, i, this.ctx);
        }
    };
    State.prototype.drawNodes = function () {
        var iscompleted = true;
        var i;
        for (i = 0; i < 40; i++) {
            this.nodes[i].redarw();
            if (!this.nodes[i].arrived()) {
                iscompleted = false;
            }
        }
        return iscompleted;
    };
    State.prototype.drawbackground = function () {
        this.background.draw(this.ctx);
    };
    State.prototype.exchange = function (x, y) {
        var na = this.nodes[x];
        var nb = this.nodes[y];
        na.movetopoint(y);
        nb.movetopoint(x);
        this.nodes[x] = nb;
        this.nodes[y] = na;
    };
    State.prototype.isSortCompleted = function () {
        var iscompleted = true;
        var i;
        for (i = 0; i < 39; i++) {
            if (this.nodes[i].value > this.nodes[i + 1].value) {
                iscompleted = false;
                break;
            }
        }
        return iscompleted;
    };
    return State;
}());
window.onload = function () {
    var state = new State(840, 300);
};
//# sourceMappingURL=app.js.map