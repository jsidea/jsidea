namespace jsidea.geom {
    /**
    *  
    * @author Jöran Benker
    * 
    */
    export class MatrixFit {
        public static quad(from: IQuadValue, to: IQuadValue): Matrix2D {
            var s = MatrixFit.basis(from);
            var d = MatrixFit.basis(to);
            var ad = Matrix2D.adjugate(s);
            return d.append(ad).normalize();
        }

        public static fromQuad(origin: IPoint2DValue, width: number, height: number, to: IQuadValue): Matrix2D {
            var from = new geom.Quad();
            from.setRect(-origin.x, -origin.y, width, height);
            var m = MatrixFit.quad(from, to);
            m.prependPositionRaw(-origin.x, -origin.y);
            return m;
        }

        private static basis(quad: IQuadValue): Matrix2D {
            var m = new Matrix2D();
            m.m11 = quad.p1.x;
            m.m12 = quad.p1.y;
            m.m13 = 1;
            m.m21 = quad.p2.x;
            m.m22 = quad.p2.y;
            m.m23 = 1;
            m.m31 = quad.p3.x;
            m.m32 = quad.p3.y;
            m.m33 = 1;
            var adj = Matrix2D.adjugate(m);
            var v = adj.transform(quad.p4);
            var ma = new Matrix2D();
            ma.m11 = v.x;
            ma.m22 = v.y;
            ma.m33 = v.w;
            return m.append(ma);
        }
        
        /**
         * @param from Vector of 2D points in source coordinate system
         * @param to Vector of 2D points in target coordinate system
         * @return A 2D matrix which transform from source to target.
         */
        public static affine2D(from: IPoint2DValue[], to: IPoint2DValue[]): Matrix2D {
            if (from.length != to.length || from.length < 1)
                throw new Error("Size missmatch: 'from' and 'to' must be of same size.");

            var from_pt: number[][] = []
            var to_pt: number[][] = [];
            var l: number = from.length;
            for (var i: number = 0; i < l; ++i) {
                from_pt.push([from[i].x, from[i].y]);
                to_pt.push([to[i].x, to[i].y]);
            }

            var sol: number[][] = this.solve(from_pt, to_pt);
            var matrix = new geom.Matrix2D();
            return matrix.setData(
                [//column_0
                    sol[0][0],
                    sol[0][1],
                
                    //column_1
                    sol[1][0],
                    sol[1][1],
                
                    //column_2
                    sol[2][0],
                    sol[2][1]]
            );
        }
        
        /**
         * @param from Vector of 3D points in source coordinate system
         * @param to Vector of 3D points in target coordinate system
         * @return A 3D matrix which transform from source to target.
         */
        public static affine3D(from: IPoint3DValue[], to: IPoint3DValue[]): Matrix3D {
            if (from.length != to.length || from.length < 1)
                throw new Error("Size missmatch: 'from' and 'to' must be of same size.");

            var from_pt: number[][] = [];
            var to_pt: number[][] = [];
            var l: number = from.length;
            for (var i: number = 0; i < l; ++i) {
                from_pt.push([from[i].x, from[i].y, from[i].z]);
                to_pt.push([to[i].x, to[i].y, to[i].z]);
            }

            var sol: number[][] = this.solve(from_pt, to_pt);
            var matrix = new geom.Matrix3D();
            return matrix.setData(
                [
                    //column_0
                    sol[0][0],
                    sol[0][1],
                    sol[0][2],
                    0,
                    
                    //column_1
                    sol[1][0],
                    sol[1][1],
                    sol[1][2],
                    0,
                    
                    //column_2
                    sol[2][0],
                    sol[2][1],
                    sol[2][2],
                    0,
                    
                    //column_3
                    sol[3][0],
                    sol[3][1],
                    sol[3][2],
                    1
                ]);
        }
        
        /**
         * Based on "Fit an affine transformation to given points", by Jarno Elonen (2007)
         * http://elonen.iki.fi/code/misc-notes/affine-fit/.
         * That code based on the paper "Fitting affine and orthogonal transformations
         * between two sets of points" by Helmuth Späth (2003).
         * 
         * Its ordered by columns. To access an entry use this format 'matrix[column_index][row_index]'.
         * @param from Vector of N-dimensional points in source coordinate system
         * @param to Vector of N-dimensional points in target coordinate system
         * @return A reduced (N+1)x(N) matrix which transform N-dimensional vectors from source to target.
         */
        private static solve(from: number[][], to: number[][]): number[][] {
            //check pre-conditions
            if (from.length != to.length || from.length < 1)
                throw new Error("Size missmatch: 'from' and 'to' must be of same size.");
            if (from[0].length != to[0].length)
                throw new Error("Dimension missmatch: 'from' has the dimension " + from[0].length + " and 'to' " + to[0].length + ".");
            if (from.length < from[0].length + 1)
                throw new Error("Too few points: under-determined system, you need " + (from[0].length + 1 - from.length) + " more reference points for a 'overconstrained' system.");
            
            //the dimensions to solve (point: 2, vector3D: 3, ...)
            var dim: number = from[0].length;
            
            //re-usable variables
            var i: number;
            var j: number;
            var k: number;
            var e: number[];
            
            //create "acc": empty (N)x(N+1) matrix
            var acc: number[][] = [];
            for (i = 0; i < dim + 1; ++i) {
                acc[i] = [];
                for (j = 0; j < dim; ++j)
                    acc[i][j] = 0;
            }
            
            //fill "acc" matrix
            for (i = 0; i < dim + 1; ++i)
                for (j = 0; j < dim; ++j)
                    for (k = 0; k < from.length; ++k) {
                        e = from[k].slice();
                        e.push(1);
                        acc[i][j] += e[i] * to[k][j];
                    }   
            
            //create "Q": empty (N+1)x(N+1) matrix
            var Q: number[][] = [];
            for (i = 0; i < dim + 1; ++i) {
                Q[i] = [];
                for (j = 0; j < dim + 1; ++j)
                    Q[i][j] = 0;
            }
            
            //fill "Q" matrix
            for (k = 0; k < from.length; ++k) {
                e = from[k].slice();
                e.push(1);
                for (i = 0; i < dim + 1; ++i)
                    for (j = 0; j < dim + 1; ++j)
                        Q[i][j] += e[i] * e[j];
            }
            
            //concat "Q" with "acc" by each entry pair
            var matrix: number[][] = [];
            for (i = 0; i < dim + 1; ++i) {
                matrix[i] = Q[i].slice();
                for (j = 0; j < dim; ++j)
                    matrix[i].push(acc[i][j]);
            }
            
            //solve Q * a' = acc with by Gauss-Jordan
            var solved: Boolean = this.gaussJordan(matrix);
            if (!solved)
                throw new Error("Could not solve affine transformation. Singular matrix: points are probably coplanar.");
            
            //remove unnecessary entries
            var l: number = matrix.length;
            var off: number = matrix[0].length - dim;
            for (i = 0; i < l; ++i)
                matrix[i] = matrix[i].slice(off);

            return matrix;
        }
        
        /**
         * Transforms a N-dimensional vector to a N-dimensional vector using the given matrix.
         * @param matrix A (N+1)x(N) matrix to tranform a vector.
         * @param vector A N-dimensional vector. 
         * @param result A pointer for the result to write in.
         * @return The transformed vector.         * 
         */
        private static transform(
            matrix: number[][],
            vector: number[],
            result: number[] = null): number[] {
            var dim: number = vector.length;
            result = result || [];
            for (var i: number = 0; i < dim; ++i)
                result[i] = 0;
            for (i = 0; i < dim; ++i) {
                for (var j: number = 0; j < dim; ++j)
                    result[i] += vector[j] * matrix[j][i];
                result[i] += matrix[dim][i]
            }
            return result;
        }

        private static gaussJordan(matrix: number[][]): Boolean {
            //re-usable index variables
            var i: number;
            var j: number;
            var k: number

            var h: number = matrix.length;
            var w: number = matrix[0].length;
            for (i = 0; i < h - 1; ++i) {
                //find max pivot
                var maxrow: number = i;
                for (j = i + 1; j < h; ++j)
                    if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxrow][i]))
                        maxrow = j;
                
                //swap...?
                var tmp: number[] = matrix[maxrow];
                matrix[maxrow] = matrix[i];
                matrix[i] = tmp;
                
                //if singular return false
                if (Math.abs(matrix[i][i]) <= 1e-10)
                    return false;
                
                //eliminate column y
                for (j = i + 1; j < h; ++j) {
                    var c: number = matrix[j][i] / matrix[i][i];
                    for (k = i; k < w; ++k)
                        matrix[j][k] -= matrix[i][k] * c;
                }
            }
            
            //backsubstitute
            for (i = h - 1; i >= 0; --i) {
                c = matrix[i][i];
                for (j = 0; j < i; ++j)
                    for (k = w - 1; k >= i; --k)
                        matrix[j][k] -= matrix[i][k] * matrix[j][i] / c;
                matrix[i][i] /= c;
                //normalize row y
                for (k = h; k < w; ++k)
                    matrix[i][k] /= c;
            }

            return true;
        }
    }
}