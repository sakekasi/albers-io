# albers.io

Albers.io is an interactive web workspace made for doing exercises from Josef Albers' book "The Interaction of Color." The project seeks to bring some elements of the book into a digital environment, in order to make the work more easily accessible, and to make learners aware of differences between color on screens and color in print.

##The Book

In his book, Albers recommends that readers acquire a wide range of colored paper by cutting up magazines. Readers then use this palette of colored paper to demonstrate the relative properties of color by completing various excercises.

##The Workspace

The albers.io workspace provides a palette of colors scraped from tumblr, and a canvas on which exercises are conducted. Click any color on the color palette to create a rectangle of that color in the canvas environment. Click and drag to move rectangles; ctrl+click and drag to resize rectangles, and shift+click and drag to rotate rectangles. Rectangles inserted later are drawn above rectangles inserted earlier.

##Quick Setup

To setup and run the current albers.io workspace, execute the following commands:

```
git clone https://github.com/sakekasi/albers-io.git
cd albers-io
python -m SimpleHTTPServer
```

The workspace should be running at [localhost:8000](http://localhost:8000)

##The Implementation

To get a list of colors, `utils/colorgenerator.js` uses the dominant-color library to get the dominant color of an image and outputs a list of these colors to `colors.json`. 

The workspace is written using React, with the canvas environment written as a custom component using the Easel-JS canvas drawing library.

##Building

To build albers.io, execute the following from the project directory:

```
npm install
gulp build_browser
```

##Generating Colors for the Palette

In order to scrape colors from a directory of images, edit the [`dirName` variable in `util/colorgenerator.js`](https://github.com/sakekasi/albers-io/blob/master/util/colorgenerator.js#L6) to point to a directory of PNG images that you would like to scrape. [`tumblr-photo-ripper.rb`](https://github.com/sakekasi/albers-io/blob/master/tumblr-photo-ripper.rb) is useful for this task.

Running `node colorgenerator.js` should output the scraped colors to  [`colors.json`](https://github.com/sakekasi/albers-io/blob/master/util/colors.json). Copy this file to the root directory of the project to have the workspace use the scraped colors in its palette.
