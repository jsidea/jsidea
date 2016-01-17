namespace jsidea.action {
    export class Drag extends jsidea.events.EventDispatcher {

        public filter: string = ".symbol";
        private target: HTMLElement = null;
        private pivot = new geom.Point3D();
        private box = new geom.Rect2D();
        private transform = layout.Transform.create();
        private size: layout.Box = layout.Box.create();
        private cursor = new geom.Point3D();
        private pos = new layout.Position();

        constructor() {
            super();

            document.addEventListener("mousedown", (evt) => this.onMouseDown(evt));
            document.addEventListener("mousemove", (evt) => this.onMouseMove(evt));
            document.addEventListener("mouseup", (evt) => this.onMouseUp(evt));
        }

        private onMouseDown(evt: MouseEvent): void {
            var target = <HTMLElement>evt.target;
            if(this.filter && !target.matches(this.filter))
                return;
            this.target = target;
            
            evt.preventDefault();
            evt.stopImmediatePropagation();

            var mode = this.pos.move.mode || layout.MoveMode.TRANSFORM;
            target.style.willChange = mode.willChange;

            this.cursor.setTo(evt.pageX, evt.pageY, 0);
            this.transform.update(target);

            var mode = this.pos.move.mode || layout.MoveMode.TRANSFORM;

            var loc = this.transform.globalToLocalPoint(this.cursor, layout.BoxModel.BORDER, this.pos.to.boxModel);
            this.box = this.transform.size.bounds(this.pos.to.boxModel, null, this.box);
            this.pivot.x = mode.invertX ? (this.box.width - loc.x) : loc.x;
            this.pivot.y = mode.invertY ? (this.box.height - loc.y) : loc.y;

        }

        private onMouseMove(evt: MouseEvent): void {
            if (!this.target)
                return;

            evt.preventDefault();
            evt.stopImmediatePropagation();

            var mode = this.pos.move.mode || layout.MoveMode.TRANSFORM;

            this.cursor.setTo(evt.pageX, evt.pageY, 0);
            this.size.update(this.target, window.getComputedStyle(this.target));
            this.box = this.size.bounds(this.pos.to.boxModel, null, this.box);
            this.pos.to.x = mode.invertX ? (this.box.width - this.pivot.x) : this.pivot.x;
            this.pos.to.y = mode.invertY ? (this.box.height - this.pivot.y) : this.pivot.y;

            this.pos.from.x = this.cursor.x;
            this.pos.from.y = this.cursor.y;
            layout.Position.apply(this.pos, this.target);
        }

        private onMouseUp(evt: MouseEvent): void {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            
            if (this.target)
                this.target.style.willChange = "auto";
            this.target = null;

        }
    }
}