module jsidea.layout {
    export interface IDragMode {
        invertX?: boolean;
        invertY?: boolean;
        positionMode: IPositionMode;
        boxModel: IBoxModel;
    }
    export class DragMode {
        public static TRANSFORM: IDragMode = {
            positionMode: PositionMode.TRANSFORM,
            boxModel: BoxModel.BORDER
        };
        public static CLIP: IDragMode = {
            positionMode: PositionMode.CLIP,
            boxModel: BoxModel.CLIP
        };
        public static CLIP_BOTTOM_RIGHT: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: PositionMode.CLIP_BOTTOM_RIGHT,
            boxModel: BoxModel.CLIP
        };
        public static TOP_LEFT: IDragMode = {
            positionMode: PositionMode.TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_LEFT_CLAMPED: IDragMode = {
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
            invertY: true,
            positionMode: PositionMode.BOTTOM_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_RIGHT: IDragMode = {
            invertX: true,
            positionMode: PositionMode.TOP_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_TOP_LEFT: IDragMode = {
            positionMode: PositionMode.MARGIN_TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_BOTTOM_RIGHT: IDragMode = {
            positionMode: PositionMode.MARGIN_BOTTOM_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static BORDER_TOP_LEFT: IDragMode = {
            positionMode: PositionMode.BORDER_TOP_LEFT,
            boxModel: BoxModel.PADDING
        };
        public static BORDER_BOTTOM_RIGHT_INNER: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: PositionMode.BORDER_BOTTOM_RIGHT_INNER,
            boxModel: BoxModel.PADDING
        };
        public static BORDER_BOTTOM_RIGHT_OUTER: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: PositionMode.BORDER_BOTTOM_RIGHT_OUTER,
            boxModel: BoxModel.BORDER
        };
        public static BACKGROUND: IDragMode = {
            positionMode: PositionMode.BACKGROUND,
            boxModel: BoxModel.BACKGROUND
        };
        public static SCROLL: IDragMode = {
            positionMode: PositionMode.SCROLL,
            boxModel: BoxModel.SCROLL
        };
    }
}