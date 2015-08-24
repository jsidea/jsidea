module jsidea.layout {
    export interface IDragMode {
        invertX: boolean;
        invertY: boolean;
        positionMode: IPositionMode;
        boxModel: IBoxModel;
    }
    export class DragMode {
        public static TRANSFORM: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.TRANSFORM,
            boxModel: BoxModel.BORDER
        };
        public static TOP_LEFT: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_LEFT_CLAMPED: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.TOP_LEFT_CLAMPED,
            boxModel: BoxModel.BORDER
        };
        public static BOTTOM_RIGHT: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: PositionMode.BOTTOM_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static BOTTOM_LEFT: IDragMode = {
            invertX: false,
            invertY: true,
            positionMode: PositionMode.BOTTOM_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_RIGHT: IDragMode = {
            invertX: true,
            invertY: false,
            positionMode: PositionMode.TOP_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_TOP_LEFT: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.MARGIN_TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_BOTTOM_RIGHT: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.MARGIN_BOTTOM_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static BORDER_TOP_LEFT: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.BORDER_TOP_LEFT,
            boxModel: BoxModel.PADDING
        };
        public static BORDER_BOTTOM_RIGHT: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: PositionMode.BORDER_BOTTOM_RIGHT,
            boxModel: BoxModel.PADDING
        };
        public static BACKGROUND: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.BACKGROUND,
            boxModel: BoxModel.BACKGROUND
        };
        public static SCROLL: IDragMode = {
            invertX: false,
            invertY: false,
            positionMode: PositionMode.SCROLL,
            boxModel: BoxModel.SCROLL
        };
    }
}