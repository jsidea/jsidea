module jsidea.layout.MoveMode {
   class TopLeft implements IMoveMode {
        public willChange: string = "top, left";
        private _sizeParent: Box = Box.create();
        private _size: Box = Box.create();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            //!IMPORTANT: style needs to be an computed style not the element's style-property
            
            var leftAuto = style.left == "auto";
            var topAuto = style.top == "auto";
            if (leftAuto || topAuto) {
                if (system.Engine.isWebKit) {
                    var node = StyleNode.create(element);
                    var position = new geom.Point3D();
                    if (node.isRelative) {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        position.x = node.position.x - node.parent.clientLeft;
                        position.y = node.position.y - node.parent.clientTop;
                        position.x -= this._sizeParent.paddingLeft;
                        position.y -= this._sizeParent.paddingTop;
                        position.x -= this._size.marginLeft;
                        position.y -= this._size.marginTop;
                    }
                    else if (node.isSticked) {
                        //get the offset to body
                        position.x = node.offset.x;
                        position.y = node.offset.y;
                        //subtract body's margin and scroll values
                        this._size.update(node.element, node.style);
                        position.x -= element.ownerDocument.body.scrollLeft + this._size.marginLeft;
                        position.y -= element.ownerDocument.body.scrollTop + this._size.marginTop;
                    }
                    else if (node.isAbsolute) {
                        //get the offset to offsetParent
                        var par = node.offsetParent ? node.offsetParent : node.first;
                        position.x = node.offset.x - par.offset.x;
                        position.y = node.offset.y - par.offset.y;
                        //subtract the parent's border
                        position.x -= node.parent.clientLeft;
                        position.y -= node.parent.clientTop;
                    }
                    else {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        position.x = node.position.x + this._sizeParent.paddingLeft - this._size.marginLeft;
                        position.y = node.position.y + this._sizeParent.paddingTop - this._size.marginTop;
                        this._sizeParent.transform(position, BoxModel.BORDER, BoxModel.CONTENT);
                    }
                    return offset.add(
                        position.x,
                        position.y,
                        0);
                }
                //TODO: its not running fine...
                else if (system.Browser.isInternetExplorer) {
                    this._size.update(element, style);
                    var dx = element.offsetLeft;
                    var dy = element.offsetTop;
                    if (style.position == "relative") {
                        this._sizeParent.update(element.parentElement);
                        if (element.parentElement == element.ownerDocument.body) {
                            dx -= this._size.marginLeft + this._sizeParent.borderLeft;
                            dy -= this._size.marginTop + this._sizeParent.borderRight;
                        }
                        else {
                            dx -= this._size.marginLeft + this._sizeParent.paddingLeft;
                            dy -= this._size.marginTop + this._sizeParent.paddingTop;
                        }
                    }
                    else if (style.position == "fixed") {
                        this._sizeParent.update(element.ownerDocument.body);
                        dx -= this._size.marginLeft + this._sizeParent.paddingLeft;
                        dy -= this._size.marginTop + this._sizeParent.paddingTop;
                    }
                    else if (style.position == "absolute") {
                        dx -= this._size.marginLeft;
                        dy -= this._size.marginTop;
                    }
                    return offset.add(
                        math.Number.parse(style.left, dx),
                        math.Number.parse(style.top, dy),
                        0);
                }
                else if (system.Browser.isFirefox) {
                    //nice: firefox reflects the top left in any case
                    //i think this is not w3c conform, but its the best solution
                }
            }

            return offset.add(
                math.Number.parse(style.left, 0),
                math.Number.parse(style.top, 0),
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply TopLeftMode to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.left = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.top = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
   export var TOP_LEFT: IMoveMode = new TopLeft();
}