namespace jsidea.plugins {
    interface ISimboxData {
        active: boolean;
        camDynamicHandle: number[];
        camDynamicTip: number[];
        camEgo: number[];
        camStatic: number[];
        path: number[];
        positionHandle: number[];
        positionInjection: number[];
        positionNearest: number[];
        positionNext: number[];
        positionTip: number[];
        progress: number;
        transformNeedle: number[];
    }
    export class Simbox extends Plugin {
        
        //model/data stuff
        private _host: string = "ws://192.168.1.8:9989";
        private _socket: WebSocket;
        private _data: ISimboxData = null;
        
        //actual data representation
        private _camera: geom.Matrix3D = new geom.Matrix3D();
        private _tip: geom.Point3D = new geom.Point3D();
        private _handle: geom.Point3D = new geom.Point3D();

        //dom-elements
        private _crosshair: HTMLElement;
        private _tipElement: HTMLElement;
        private _handleElement: HTMLElement;
        private _cameraSelect: HTMLSelectElement;
        private _tipSelect: HTMLSelectElement;
        private _handleSelect: HTMLSelectElement;
        private _scale: geom.Point3D = new geom.Point3D(2, 2, 2);

        constructor() {
            super();

            this._crosshair = document.getElementById("crosshair");
            this._tipElement = document.getElementById("tip");
            this._handleElement = document.getElementById("handle");
            this._cameraSelect = <HTMLSelectElement>document.getElementById("camera-select");
            this._tipSelect = <HTMLSelectElement>document.getElementById("tip-select");
            this._handleSelect = <HTMLSelectElement>document.getElementById("handle-select");

            this._socket = new WebSocket(this._host);
            this._socket.onopen = () => console.log("OPEN");
            this._socket.onerror = (e) => console.log("ERROR", e);
            this._socket.onmessage = (m) => this.setData(JSON.parse(m.data));
            this._socket.onclose = () => console.log("CLOSE");

            //TODO: using an array/jquery or something else here
            //or is the event bubbling????
            //            this._cameraSelect.onchange = () => this.refresh();
            //            this._cameraSelect.onkeyup = () => this.refresh();
            //            this._tipSelect.onchange = () => this.refresh();
            //            this._tipSelect.onkeyup = () => this.refresh();
            //            this._handleSelect.onchange = () => this.refresh();
            //            this._handleSelect.onkeyup = () => this.refresh();
            document.documentElement.addEventListener("keyup", () => this.refresh());
            document.documentElement.addEventListener("change", () => this.refresh());
        }

        private refresh(): void {
            if (!this._data)
                return;
            this.setData(this._data);
        }

        private setData(data: ISimboxData): void {
            //set for possible reseting
            this._data = data;
            
            //camera matrix
            var camSelect = this._cameraSelect;
            var opt: HTMLOptionElement = camSelect.options[camSelect.selectedIndex];
            var mat: number[] = (<any>data)[opt.value];
            this._camera.setData(mat);
            
            //tip position
            var tipSelect = this._tipSelect;
            var opt: HTMLOptionElement = tipSelect.options[tipSelect.selectedIndex];
            var mat: number[] = (<any>data)[opt.value];
            this._tip.setData(mat);
            this._camera.transform(this._tip, this._tip);
            
            //handle position
            var handleSelect = this._handleSelect;
            var opt: HTMLOptionElement = handleSelect.options[handleSelect.selectedIndex];
            var mat: number[] = (<any>data)[opt.value];
            this._handle.setData(mat);
            this._camera.transform(this._handle, this._handle);

            //update the dom-elements layout
            this.layout();
        }

        private layout(): void {
            //the center of the crosshair
            var cenX: number = this._crosshair.offsetWidth * 0.5;
            var cenY: number = this._crosshair.offsetHeight * 0.5;

            var offX: number = this._tipElement.offsetWidth * -0.5 + cenX;
            var offY: number = this._tipElement.offsetHeight * -0.5 + cenY;
            offX -= this._tip.x * this._scale.x;
            offY -= this._tip.y * this._scale.y;
            this._tipElement.style.transform = "translate(" + offX + "px, " + offY + "px)";

            offX = this._handleElement.offsetWidth * -0.5 + cenX;
            offY = this._handleElement.offsetHeight * -0.5 + cenY;
            offX -= this._handle.x * this._scale.x;
            offY -= this._handle.y * this._scale.y;
            this._handleElement.style.transform = "translate(" + offX + "px, " + offY + "px)";
        }
    }
}