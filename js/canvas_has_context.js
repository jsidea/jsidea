/**
 * Copyright 2014 Ken Fyrstenberg
 */

// store old call
HTMLCanvasElement.prototype._getContext = HTMLCanvasElement.prototype.getContext;

// store type if requested
HTMLCanvasElement.prototype._contextType = null;

// wrapper for old call allowing to register type
HTMLCanvasElement.prototype.getContext = function(type) {
    this._contextType = type;
    return this._getContext(type);
};

// check if has context
HTMLCanvasElement.prototype.hasContext = function() {
    return this._contextType;
};