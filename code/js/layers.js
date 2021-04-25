(function(imageproc) {
    "use strict";
//layers.js will handle the processing operations
//But the algorithm part is in base.js
    /*
     * Apply the basic processing operations
     */
    function applyBasicOp(inputImage, outputImage) {
        switch (currentBasicOp) {

            // Apply automatic contrast
            case "auto-contrast":
                var type = $("#auto-contrast-type").val();
                var percentage = parseInt($("#auto-contrast-percentage").val()) / 100.0;
                imageproc.autoContrast(inputImage, outputImage, type, percentage);
                break;
        }
    }


    /*
     * The image processing operations are set up for the different layers.
     * Operations are applied from the base layer to the outline layer. These
     * layers are combined appropriately when required.
     */
    imageproc.operation = function(inputImage, outputImage) {
        // Apply the basic processing operations
        var processedImage = inputImage;
        if (currentBasicOp != "no-op") {
            processedImage = imageproc.createBuffer(outputImage);
            applyBasicOp(inputImage, processedImage);
        }


        imageproc.copyImageData(processedImage, outputImage);
    }
 
}(window.imageproc = window.imageproc || {}));
