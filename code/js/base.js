(function(imageproc) {
    "use strict";
//we write all algorithms for processing images here
    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;
        console.log("building histogram");
        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        switch(channel){
            case"red":
                    for (var y = 0; y < inputData.height; y++) {
                                            for (var x = 0; x < inputData.width; x++) {
                                                var pixel = imageproc.getPixel(inputData, x, y);
                                                var value = pixel.r;
                                                histogram[value]++;
                                                }
                            }
                break;
            case"green":
                    for (var y = 0; y < inputData.height; y++) {
                                            for (var x = 0; x < inputData.width; x++) {
                                                var pixel = imageproc.getPixel(inputData, x, y);
                                                var value =  pixel.g;
                                                histogram[value]++;
                                                }
                            }
                break;
            case"blue":
                        for (var y = 0; y < inputData.height; y++) {
                                                for (var x = 0; x < inputData.width; x++) {
                                                    var pixel = imageproc.getPixel(inputData, x, y);
                                                    var value =  pixel.b;
                                                    histogram[value]++;
                                                    }
                                }
                break;
            case"gray":

                       for (var y = 0; y < inputData.height; y++) {
                                for (var x = 0; x < inputData.width; x++) {
                                    var pixel = imageproc.getPixel(inputData, x, y);
                                    var value = (pixel.r + pixel.g + pixel.b) / 3;
                                    histogram[value]++;
                                    }
                }
                console.log(histogram.slice(0, 10).join(","));
                break;


        }


        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min = 0, max = 255;
        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        var start=0;
        for(;min<255;min++){

               start+=histogram[min];
               if(start>pixelsToIgnore)
                    break;

        }
        console.log("ignore %d,%d",start,pixelsToIgnore);
        start=0;
        for(;max>0;max--){

                        start+=histogram[max];
                        if(start>pixelsToIgnore)
                           break;

                }
        console.log("ignore %d,%d",start,pixelsToIgnore);

        console.log("%d,%d",min,max);
        
        return {"min": min, "max": max};
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);

            var min = minMax.min, max = minMax.max, range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each pixel based on the minimum and maximum values

                outputData.data[i]     = (inputData.data[i]-min)/(max-min)*255;
                outputData.data[i + 1] = (inputData.data[i+1]-min)/(max-min)*255;
                outputData.data[i + 2] = (inputData.data[i+2]-min)/(max-min)*255;
            }
        }
        else {

            /**
             * TODO: You need to apply the same procedure for each0z RGB channel
             *       based on what you have done for the grayscale version
             */
             histogram = buildHistogram(inputData, "red");
             minMax = findMinMax(histogram, pixelsToIgnore);
             var minr = minMax.min, maxr = minMax.max, ranger = maxr - minr;

             histogram = buildHistogram(inputData, "green");
             minMax = findMinMax(histogram, pixelsToIgnore);
             var ming = minMax.min, maxg = minMax.max, rangeg = maxg - ming;

            histogram = buildHistogram(inputData, "blue");
            minMax = findMinMax(histogram, pixelsToIgnore);
            var minb = minMax.min, maxb = minMax.max, rangeb = maxb - minb;

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one

                outputData.data[i]     = (inputData.data[i]-minr)/ranger*255;
                outputData.data[i + 1] = (inputData.data[i + 1]-ming)/rangeg*255;
                outputData.data[i + 2] = (inputData.data[i + 2]-minb)/rangeb*255;
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
