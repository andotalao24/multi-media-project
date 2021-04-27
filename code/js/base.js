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
        switch (channel){
            case "gray":
                for (var i = 0; i < inputData.data.length; i += 4 ){
                    var intensity = (inputData.data[i] + inputData.data[i+1] + inputData.data[i+2]) / 3;
                    intensity = Math.floor(intensity);
                    histogram[intensity] ++;
                }
                console.log(histogram.slice(0, 10).join(","));
                break;
            case "red":
                for (var i = 0; i < inputData.data.length; i += 4 ){
                    histogram[inputData.data[i] ]  ++;
                }
                break;
            case "green":
                for (var i = 0; i < inputData.data.length; i += 4 ){
                    histogram[inputData.data[i+1] ]  ++;
                }
                break;
            case "blue": 
                for (var i = 0; i < inputData.data.length; i += 4 ){
                    histogram[inputData.data[i+2] ]  ++;
                }
                break;
        }
        
        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        
        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {
        var min , max ;

        /**
         * TODO: You need to build the histogram here
         */
        var sum =0 ;
        // Find the minimum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        if (pixelsToIgnore == 0) {
            for (min = 0; min < 256; min++) {
                if (histogram[min] > 0) break;
            }
        }
        else {
            for(min =0; min < 256; min ++){
                sum = sum + histogram[min];
                if (sum > pixelsToIgnore){
                    break;
                }
            }
        }


        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore
        sum = 0;
        if (pixelsToIgnore == 0) {
            for (max = 255; max >= 0; max--){
                if (histogram[max] > 0) break;
            }
        }
        else {
            for(max = 255; max >= 0; max --){
                sum = sum + histogram[max];
                if (sum > pixelsToIgnore){
                    break;
                }
            }
        }
        console.log(min ,"and", max);

        
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

    imageproc.Equalization = function(inputData, outputData, type, percentage){
        console.log("Applying histogram equalization");
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;
        console.log("pixels to ignore is :",pixelsToIgnore);
        var minMax;
        var histogram, cdfhistogram = [];
        if (type == "gray"){
            histogram = buildHistogram(inputData, "gray");
            minMax = findMinMax(histogram, pixelsToIgnore);
            cdfhistogram[0] = histogram[0];
            for (var i = 1; i < 256; i ++){
                cdfhistogram[i] = cdfhistogram[i-1] + histogram[i];
            }
            for (var i = 0; i < inputData.data.length; i += 4) {
                var r, g, b;
                r = inputData.data[i];
                g = inputData.data[i+1];
                b = inputData.data[i+2];
                outputData.data[i] = cdfhistogram[r] / cdfhistogram[255] * minMax.max;
                outputData.data[i+1] = cdfhistogram[g] / cdfhistogram[255] * minMax.max;
                outputData.data[i+2] = cdfhistogram[b] / cdfhistogram[255] * minMax.max;
            }
            console.log(cdfhistogram[255]);
        }
        
        else  {
            var histogram_r = buildHistogram(inputData, "red");
            var histogram_g = buildHistogram(inputData, "green");
            var histogram_b = buildHistogram(inputData, "blue");
            var cdfhistogram_r = [], cdfhistogram_g = [], cdfhistogram_b =[];
            cdfhistogram_r[0] = histogram_r[0];
            for (var i = 1; i < 256; i ++){
                cdfhistogram_r[i] = cdfhistogram_r[i-1] + histogram_r[i];
            }
            cdfhistogram_g[0] = histogram_g[0];
            for (var i = 1; i < 256; i ++){
                cdfhistogram_g[i] = cdfhistogram_g[i-1] + histogram_g[i];
            }
            cdfhistogram_b[0] = histogram_b[0];
            for (var i = 1; i < 256; i ++){
                cdfhistogram_b[i] = cdfhistogram_b[i-1] + histogram_b[i];
            }
            
            
            var minMax_r = findMinMax(histogram_r, pixelsToIgnore);
            var minMax_g = findMinMax(histogram_g, pixelsToIgnore);
            var minMax_b = findMinMax(histogram_b, pixelsToIgnore);
            
            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one

                r = inputData.data[i];
                g = inputData.data[i+1];
                b = inputData.data[i+2];
                outputData.data[i] = cdfhistogram_r[r] / cdfhistogram_r[255] * minMax_r.max;
                outputData.data[i+1] = cdfhistogram_g[g] / cdfhistogram_g[255] * minMax_g.max;
                outputData.data[i+2] = cdfhistogram_b[b] / cdfhistogram_b[255] * minMax_b.max;
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
