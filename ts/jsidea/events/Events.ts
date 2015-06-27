module jsidea.events {
    export class Events {
        //element events
        public static BLUR: string = "blur";
        
        //image events
        public static IMAGE_LOAD: string = "load";
        
        //keyboard events
        public static KEY_DOWN: string = "keydown";
        public static KEY_UP: string = "keyup";
        public static KEY_PRESS: string = "keypress";
        
        //mouse events
        public static MOUSE_CLICK: string = "click";
        public static MOUSE_DOUBLE_CLICK: string = "dblclick";
        public static MOUSE_DOWN: string = "mousedown";
        public static MOUSE_MOVE: string = "mousemove";
        public static MOUSE_UP: string = "mouseup";
        public static MOUSE_OUT: string = "mouseout";
        public static MOUSE_OVER: string = "mouseover";
        public static MOUSE_DRAG: string = "mousedrag";
    }
}