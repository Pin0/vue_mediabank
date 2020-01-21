<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <script src="https://unpkg.com/vue"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/openseadragon@2.3.1/build/openseadragon/openseadragon.min.js"></script>
    <script src="https://cdn.rawgit.com/Pin0/openseadragon-justified-collection/1.0.2/dist/openseadragon-justified-collection.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <title>VUE Mediabank</title>
    <style>
        html, body, #app {
            height: 100%;
        }
        #osd {
            height: 90%;
            outline: 0;
        }
        .openseadragon-container :focus {
            /*remove ugly blue line*/
            outline: none;
        }
        #header {
            height: 10%;
        }
    </style>
</head>
<body>
    <div id="app">
    <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
      <a class="navbar-brand" href="#">Fixed navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#">Disabled</a>
          </li>
        </ul>
        <form class="form-inline mt-2 mt-md-0">
        <input type="text" class="form-control mr-sm-2" id="q" aria-describedby="qHelp" placeholder="Search..." v-model="q" v-on:keydown.enter.prevent="search">
        <button type="button" class="btn btn-outline-success my-2 my-sm-0" v-on:click="search">Search</button>
        </form>
      </div>
    </nav>
        <div id="header" class="container-fluid">
            <div id="message" class="container-fluid">{{ message }}</div>
            <div id="pagination" class="container-fluid">
                <div v-if="!pagination">Loading Please wait...</div>
                <div v-else>
                    <a v-on:click="previousPage" class="link">Previous</a> - <a v-on:click="nextPage" class="link">Next</a>

                    {{ pagination.total }} results, page {{ pagination.currentPage }} of {{ pagination.pages }}</div>
                <div v-if="q">Searched for: {{ q }}</div>
            </div>
            <div class="container-fluid">
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#searchModal">
                    Search
                </button>

                <!-- Search Modal -->
                <div class="modal fade" id="searchModal" tabindex="-1" role="dialog" aria-labelledby="searchModal" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="searchModal">Search</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="form-group">
                                        <label for="q">Search query</label>
                                        <input type="text" class="form-control" id="q" aria-describedby="qHelp" placeholder="Search..." v-model="q" v-on:keydown.enter.prevent="search">
                                        <small id="qHelp" class="form-text text-muted">Search for keywords like: church or windmill</small>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" v-on:click="search">Search</button>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- metadata Modal -->
                <div class="modal fade" id="metadataModal" tabindex="-1" role="dialog" aria-labelledby="metadataModal" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="metadataModal">Metadata</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <ul id="metadata">
                                    <li v-for="field in currentRecord">
                                        {{ field.label }}: {{ field.value }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

<!--        <div class="columns medium-3" v-for="result in results">-->
<!--            <div class="card">-->
<!--                <div class="card-divider">-->
<!--                    {{ result.title }}-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
        <div id="osd" class="container-fluid"></div>
    </div>

    <script src="app.js"></script>

</body>
</html>