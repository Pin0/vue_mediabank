var mediabankApiConfig = {
    baseUrl: 'https://webservices.picturae.com/mediabank/',
    apiKey: '84fb6dde-1718-11e4-abe0-fff30396f5b7'
};

const vm = new Vue({
    el: '#app',
    data: {
        tileSources: [], //images as shown on OpenSeadragon viewer in collectionMode
        metadata: [], //metadata for tileSources metadata[x] corresponds to tileSources[x]
        currentRecord: null, //filled when image is clicked
        currentPage: 1, //startpage for pagination (@todo refactor this, is not needed since pagination object is in mediabank response)
        q: null, //search query for mediabank
        viewer: null, //OpenSeadragon instance, initialized in mounted()
        pagination: null, //pagination object
        message: null, //used for status messages, errors etc.
        mediabankConfig: null //for facets config etc.
    },
    mounted() {
        this.getConfig(); //get mediabank config for facets etc.
        this.initViewer(); //loads viewer
        this.getMedia(); //gets first media result.
    },
    methods: {


        initViewer: function()
        {
            var self = this;

            //init OPenSeadragon viewer on div with id="osd"
            this.viewer = OpenSeadragon({
                id:              "osd",
                prefixUrl:       "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
                viewportMargins: {top:10, left: 10, right: 10, bottom: 10},
                collectionColumns: 6, //used by justified plugin for number of images on first row
                collectionMode: true,
                preserveViewport: false,
                //homeFillsViewer: true,
                //showNavigator: true,
                debugMode: true,
                //visibilityRatio: 0.1,

                gestureSettingsMouse : {
                    clickToZoom: false
                },
               // visibilityRatio: 1.0,
                constrainDuringPan: true
                //panHorizontal: false
                //minZoomImageRatio: 3
                //minZoomLevel: 8
                //fitHorizontally: true
            });

           // var v = this.viewer;

            //add fillTop function to home button.
            this.viewer.homeButton.removeAllHandlers('release');
            this.viewer.homeButton.addHandler('release', function() {
                self.fillTop();
            });

            //add click event to canvas to zoom in on clicked image (todo fix this)
            this.viewer.addHandler('canvas-click', function(event) {
                var selfClick = this;
                if (!event.quick) {
                    return;
                }
                var count = self.viewer.world.getItemCount();

                selfClick.getClickedImage = function(pixel) {
                    var pos = self.viewer.viewport.pointFromPixel(pixel);
                    for (var i = 0; i < count; i++) {
                        var tiledImage = self.viewer.world.getItemAt(i);
                        var box = tiledImage.getBounds(true);

                        if (pos.x > box.x && pos.y > box.y && pos.x < box.x + box.width && pos.y < box.y + box.height) {
                            self.currentRecord = self.metadata[i];
                            $('#metadataModal').modal('show');

                            return tiledImage;
                        }
                    }
                };

                selfClick.fitImage = function(image, buffer) {
                    //var box = image.getBounds(true);
                    // box.x -= buffer;
                    // box.y -= buffer;
                    // box.width += buffer * 2;
                    // box.height += buffer * 2;
                    //self.viewer.viewport.fitBounds(box,false);
                };

                var image = selfClick.getClickedImage(event.position);
                if (image) {
                    selfClick.fitImage(image, 0.3);
                }
            });


        },

        //fit first row of images to width of screen to have a nice filled gallery
        fillTop: function() {
            //this.viewer.viewport.goHome(true);
           //  var bounds = this.viewer.world.getHomeBounds();
           //  console.log(bounds);
           //  // var bounds = this.viewer.viewport.getBounds();
           //  // console.log(bounds);
           //  // // bounds.y = 0; //to top row of images
           //  // var rect = new OpenSeadragon.Rect(-4, 0, 16, 17);
           //  this.viewer.viewport.fitHorizontally(true);
           //  var point = new OpenSeadragon.Point(bounds.width/2,0);
           //  this.viewer.viewport.panTo(point, true);
           // // // this.viewer.world.arrange();

            // var oldBounds = this.viewer.viewport.getBounds();
            // console.log(oldBounds);
            // var newBounds = new OpenSeadragon.Rect(0, 0, 1, oldBounds.height / oldBounds.width);
            // this.viewer.viewport.fitBounds(newBounds, true);
            //
            // var rect = new OpenSeadragon.Rect(0, 0, 1, 8);
            // this.viewer.viewport.fitBoundsWithConstraints(rect,true);

            // var bounds = this.viewer.world.getHomeBounds();
            // console.log(bounds);
            //
            // var viewPortBounds = this.viewer.viewport.getBounds();
            // console.log(viewPortBounds);
            //
            //
            // var aspect = bounds.height/bounds.width;
            //
            // console.log(aspect);
            //
            // var box = new OpenSeadragon.Rect(0, bounds.y + (viewPortBounds.height/2),bounds.width, 0);
            //
            // console.log(box);
            // this.viewer.viewport.fitBounds( box, true );


            var homeBounds = this.viewer.world.getHomeBounds();
            var viewerBounds = this.viewer.viewport.getBounds();
            var box = new OpenSeadragon.Rect(homeBounds.x, homeBounds.y, homeBounds.width, viewerBounds.height * (homeBounds.width / viewerBounds.width));
            this.viewer.viewport.fitBounds( box, true );

            //
            // this.viewer.viewport.fitHorizontally(true);
            //     console.log(this.viewer.world.getHomeBounds());
            //     console.log(this.viewer.world.getContentFactor());


        },

        home: function() {
            this.fillTop();
        },

        nextPage: function() {
            this.currentPage++;
            this.getMedia();
        },

        previousPage: function() {
            this.currentPage--;
            this.getMedia();
        },

        search: function() {
           // this.initViewer();
            $('#searchModal').modal('hide');
            this.currentPage = 1;
            this.getMedia();
        },

        showMesage: function(message) {
            this.message = message;
            setTimeout(()=>{ this.message = null;}, 2000);
        },

        getConfig: function ()
        {
            axios.get(mediabankApiConfig.baseUrl + "config",
                {
                    params: {
                        apiKey: mediabankApiConfig.apiKey
                    }
                }
            ).then(
                response => {

                    if(response.data) {
                        this.mediabankConfig = response.data.config.default;

                    } else {
                        this.showMesage('Your search query produced no records. Shown records are still the same.');
                    }

            }).catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            });
        },

        getMedia: function()
        {
            if(this.currentPage < 1 || (this.pagination !== null && this.currentPage > this.pagination.pages)) {
                 this.currentPage = 1;
            }


            axios.get(mediabankApiConfig.baseUrl + "media",
                {
                    params: {
                        apiKey: mediabankApiConfig.apiKey,
                        page: this.currentPage,
                        q: this.q !== null ? this.q : '*:*'
                    }
                }
            ).then(
                response => {
                    var results = response.data.media;

                    if(results.length) {
                        this.viewer.world.removeAll();
                        this.tileSources = [];
                        this.metadata = [];
                        this.pagination = response.data.metadata.pagination;



                        for (var i = 0; i < results.length; i++) {
                            if(typeof results[i].asset !== 'undefined') {
                                this.tileSources.push(results[i].asset[0].deepzoom);

                                this.metadata.push(results[i].metadata);

                                //this.tileSources.push('https://images.memorix.nl/sra/deepzoom/c8824950-bd69-5f0a-a7ba-f388172ee1e0.dzi');

                            }
                        }

                        for (var i = 0; i < this.tileSources.length; i++) {
                            if(typeof this.tileSources[i] !== 'undefined') {
                                var v = this.viewer;
                                var self = this;

                                this.viewer.addTiledImage({tileSource: this.tileSources[i], success: function (item) {
                                        v.viewport.goHome(true);
                                        self.fillTop();
                                    }});

                            }

                        }
                    } else {
                        this.showMesage('Your search query produced no records. Shown records are still the same.');
                    }

            }).catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
                // always executed
            });
        }
    }
});
