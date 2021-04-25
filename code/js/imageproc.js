(function(imageproc) {
    "use strict";
// imageproc.js will be used by main.js
// imageproc.js will call functions in layers.js to handle specific processment of images
    var input, output;
    var inputHisto,outputHisto;
    var inputImage, outputImage;
    var outputHistogram, inputHistogram;
    var imageSelector;

    imageproc.operation = null;

    /*
     * Init the module and update the input image
     */
    imageproc.init = function(inputCanvasId,
                              outputCanvasId,
                              inputHistogramId,
                              outputHistogramId,
                              inputImageId) {
        //get the canvas 
        input  = $("#" + inputCanvasId).get(0).getContext("2d");
        output = $("#" + outputCanvasId).get(0).getContext("2d");
        inputHisto  = $("#" + inputHistogramId).get(0).getContext("2d");
        outputHisto = $("#" + outputHistogramId).get(0).getContext("2d");

        //get the content of the input image 
        inputImage = input.getImageData(0, 0,
                         input.canvas.clientWidth, input.canvas.clientHeight);
        //buffer to store actual values to show on each canvas
        //
        outputImage = output.createImageData(input.canvas.clientWidth,
                                                 input.canvas.clientHeight);


        inputHistogram = inputHisto.createImageData(input.canvas.clientWidth,
                                                 input.canvas.clientHeight);
        outputHistogram = outputHisto.createImageData(input.canvas.clientWidth,
                                                 input.canvas.clientHeight);


        imageSelector = $("#" + inputImageId);
        imageproc.updateInputImage();
    }

    /*
     * Update the input image canvas
     */
    imageproc.updateInputImage = function() {
        var image = new Image();
        image.onload = function () {
            input.drawImage(image, 0, 0);
        }
        image.src = "images/" + imageSelector.val();
    }



    /*
     * show the histogram of the input Image 
     */
    imageproc.showInputHistogram =function(){
        
        //function call to fill up inputHistogram 
        imageproc.getHistogram(inputImage,inputHistogram);
        //how to show histogram on canvas with js
        //inputHisto.putImageData(inputHistogram,0,0);
    }




    
    /*
     * Apply an image processing operation to an input image and
     * then put the output image in the output canvas
     * ***new feature***
     * we also need to put the output histogram in another output canvas
     */
    imageproc.apply = function() {
       

        // Update the alpha values of the newly created image
        for (var i = 0; i < outputImage.data.length; i+=4)
            outputImage.data[i + 3] = 255;

        if (imageproc.operation) {
            // Apply the operation
            imageproc.operation(inputImage, outputImage);
            imageproc.getHistogram(outputImage,outputHistogram)
        }

        // Put the output image in the canvas
        //output is canvas, start from the left top corner
        output.putImageData(outputImage, 0, 0);

        //outputHisto.putImageData(outputHistogram,0,0);
    }

    /*
     * Convert RGB to HSV
     * Modified from https://gist.github.com/mjackson/5311256
     */
    imageproc.fromRGBToHSV = function(r, g, b) {
        r /= 255, g /= 255, b /= 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h *= 60;
        }

        return {"h": h, "s": s, "v": v};
    }

    /*
     * Convert HSV to RGB
     * Modified from https://gist.github.com/mjackson/5311256
     */
    imageproc.fromHSVToRGB = function(h, s, v) {
        var r, g, b;

        var i = Math.floor(h / 60.0);
        var f = h / 60.0 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return {"r": Math.round(r * 255),
                "g": Math.round(g * 255),
                "b": Math.round(b * 255)};
    }

    /*
     * Get a pixel colour from an ImageData object
     * 
     * The parameter border can be either "extend" (default) and "wrap"
     */
    imageproc.getPixel = function(imageData, x, y, border) {
        // Handle the boundary cases
        if (x < 0)
            x = (border=="wrap")? imageData.width + (x % imageData.width) : 0;
        if (x >= imageData.width)
            x = (border=="wrap")? x % imageData.width : imageData.width - 1;
        if (y < 0)
            y = (border=="wrap")? imageData.height + (y % imageData.height) : 0;
        if (y >= imageData.height)
            y = (border=="wrap")? y % imageData.height : imageData.height - 1;

        var i = (x + y * imageData.width) * 4;
        return {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
            a: imageData.data[i + 3]
        };
    }

    /*
     * Get an empty buffer of the same size as the image dat
     */
    imageproc.createBuffer = function(imageData) {
        // Create the buffer
        var buffer = {
            width: imageData.width,
            height: imageData.height,
            data: []
        };

        // Initialize the buffer
        for (var i = 0; i < imageData.data.length; i+=4) {
            buffer.data[i]     = 0;
            buffer.data[i + 1] = 0;
            buffer.data[i + 2] = 0;
            buffer.data[i + 3] = 255;
        }

        return buffer;
    }

    /*
     * Copy a source data to an destination data
     */
    imageproc.copyImageData = function(src, dest) {
        if (src.data.length != dest.data.length)
            return;

        // Copy the data
        for (var i = 0; i < src.data.length; i+=4) {
            dest.data[i]     = src.data[i];
            dest.data[i + 1] = src.data[i + 1];
            dest.data[i + 2] = src.data[i + 2];
            dest.data[i + 3] = src.data[i + 3];
        }
    }
 
}(window.imageproc = window.imageproc || {}));
