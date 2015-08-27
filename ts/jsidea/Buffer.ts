module jsidea {
   
    /**
    * Global Buffer for instance-reuse. Helps to avoid heap allocations.
    *  
    * @author Jöran Benker
    * 
    */
    export class Buffer {
        //jsidea.geom.Matrix3D
        public static _APPEND_POSITION_3D = new geom.Matrix3D();
        public static _PREPEND_POSITION_3D = new geom.Matrix3D();
        public static _APPEND_PERSPECTIVE_3D = new geom.Matrix3D();
        public static _PREPEND_PERSPECTIVE_3D = new geom.Matrix3D();
        public static _APPEND_SCALE_3D = new geom.Matrix3D();
        public static _PREPEND_SCALE_3D = new geom.Matrix3D();
        public static _APPEND_SCALE_RAW_3D = new geom.Point3D();
        public static _PREPEND_SCALE_RAW_3D = new geom.Point3D();
        public static _APPEND_SKEW_3D = new geom.Matrix3D();
        public static _PREPEND_SKEW_3D = new geom.Matrix3D();
        public static _GET_ROTATION_3D = new geom.Matrix3D();
        public static _DELTA_TRANSFORM_RAW_3D = new geom.Point3D();
        public static _TRANSFORM_RAW_3D = new geom.Point3D();
        public static _APPEND_POSITION_RAW_3D= new geom.Point3D();
        public static _PREPEND_POSITION_RAW_3D = new geom.Point3D();
        public static _SET_SKEW_RAW_3D: geom.Point3D = new geom.Point3D();        
        public static _SET_CSS_3D = new geom.Matrix2D();
        public static _APPEND_CSS_3D = new geom.Matrix3D();
        public static _PREPEND_CSS_3D = new geom.Matrix3D();
        public static _INVERT_PROJECT_3D = new geom.Matrix3D();
        
        //jsidea.geom.Matrix2D
        public static _SET_CSS_2D = new geom.Matrix3D();
        public static _PREPEND_ROTATION_RAW_2D = new geom.Matrix2D();
        public static _APPEND_POSITION_2D = new geom.Matrix2D();
        public static _PREPEND_POSITION_2D = new geom.Matrix2D();
        public static _APPEND_POSITON_RAW_2D = new geom.Point2D();
        public static _PREPEND_POSITION_RAW_2D = new geom.Point2D();
        public static _APPEND_SCALE_2D = new geom.Matrix2D();
        public static _PREPEND_SCALE_2D = new geom.Matrix2D();
        public static _APPEND_SCALE_RAW_2D = new geom.Point2D();
        public static _PREPEND_SCALE_RAW_2D = new geom.Point2D();
        public static _APPEND_SKEW_2D = new geom.Matrix2D();
        public static _PREPEND_SKEW_2D = new geom.Matrix2D();
        public static _APPEND_SKEW_RAW_2D = new geom.Point2D();
        public static _PREPEND_SKEW_RAW_2D = new geom.Point2D();
        
        //jsidea.layout.Position
        public static _APPLY_POSITION = new geom.Matrix3D();
        public static _APPLY_POSITION_SIZE_FROM = new geom.Rect2D();
        public static _APPLY_POSITION_SIZE_TO = new geom.Rect2D();
        
        //jsidea.layout.BoxModel
        public static _POINT_MODEL = new geom.Rect2D();
    }
}