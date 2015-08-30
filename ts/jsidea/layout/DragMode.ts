module jsidea.layout {
    export interface IDragMode {
        invertX?: boolean;
        invertY?: boolean;
        positionMode: IMoveMode;
        boxModel: IBoxModel;
    }
    export class DragMode {
        public static TRANSFORM: IDragMode = {
            positionMode: MoveMode.TRANSFORM,
            boxModel: BoxModel.BORDER
        };
        public static CLIP: IDragMode = {
            positionMode: MoveMode.CLIP,
            boxModel: BoxModel.CLIP
        };
        public static CLIP_BOTTOM_RIGHT: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: MoveMode.CLIP_BOTTOM_RIGHT,
            boxModel: BoxModel.CLIP
        };
        public static TOP_LEFT: IDragMode = {
            positionMode: MoveMode.TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_LEFT_CLAMPED: IDragMode = {
            positionMode: MoveMode.TOP_LEFT_CLAMPED,
            boxModel: BoxModel.BORDER
        };
        public static BOTTOM_RIGHT: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: MoveMode.BOTTOM_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static BOTTOM_LEFT: IDragMode = {
            invertY: true,
            positionMode: MoveMode.BOTTOM_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static TOP_RIGHT: IDragMode = {
            invertX: true,
            positionMode: MoveMode.TOP_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_TOP_LEFT: IDragMode = {
            positionMode: MoveMode.MARGIN_TOP_LEFT,
            boxModel: BoxModel.BORDER
        };
        public static MARGIN_BOTTOM_RIGHT: IDragMode = {
            positionMode: MoveMode.MARGIN_BOTTOM_RIGHT,
            boxModel: BoxModel.BORDER
        };
        public static BORDER_TOP_LEFT: IDragMode = {
            positionMode: MoveMode.BORDER_TOP_LEFT,
            boxModel: BoxModel.PADDING
        };
        public static BORDER_BOTTOM_RIGHT_INNER: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: MoveMode.BORDER_BOTTOM_RIGHT_INNER,
            boxModel: BoxModel.PADDING
        };
        public static BORDER_BOTTOM_RIGHT_OUTER: IDragMode = {
            invertX: true,
            invertY: true,
            positionMode: MoveMode.BORDER_BOTTOM_RIGHT_OUTER,
            boxModel: BoxModel.BORDER
        };
        public static BACKGROUND: IDragMode = {
            positionMode: MoveMode.BACKGROUND,
            boxModel: BoxModel.BACKGROUND
        };
        public static SCROLL: IDragMode = {
            positionMode: MoveMode.SCROLL,
            boxModel: BoxModel.SCROLL
        };
    }
}