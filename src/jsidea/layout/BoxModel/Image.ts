namespace jsidea.layout.BoxModel {
    class Image implements IBoxModel {
        public name: string = "image-box";
        private check(size: Box): boolean {
            return size.element && size.element instanceof HTMLImageElement;
        }
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLImageElement>size.element;
                point.x *= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y *= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                point.x += size.paddingLeft + size.borderLeft;
                point.y += size.paddingTop + size.borderTop;
            }
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLImageElement>size.element;
                point.x -= size.paddingLeft + size.borderLeft;
                point.y -= size.paddingTop + size.borderTop;
                point.x /= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y /= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
            }
        }
        public width(size: Box): number {
            return this.check(size) ? (<HTMLImageElement>size.element).width : size.offsetWidth;
        }
        public height(size: Box): number {
            return this.check(size) ? (<HTMLImageElement>size.element).height : size.offsetWidth;
        }
    }
    export var IMAGE: IBoxModel = new Image();
}