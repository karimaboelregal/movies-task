model = {
    pages: 8,
    movieList: [],
    currentPage: 1,
    init: function () {

        let max = this.pages;

        let currentPage = this.currentPage;
        let list = [];
        $("#loading").removeClass("d-none");
        $.ajax({
            url: "https://api.themoviedb.org/3/discover/movie?page=" + currentPage + "&api_key=654b273e7b99af3e35235a90619a90e0",
            method: "GET",
            error: function () {
            },
            success: function (data) {

                //title
                //vote_average
                //poster_path
                //overview

                let movieInfo;
                model.updatePages(data['total_pages']);
                data['results'].forEach(element => {
                    movieInfo = { "title": element["title"], "overview": element["overview"], "picture": "https://image.tmdb.org/t/p/w500" + element["poster_path"], "rating": element["vote_average"], "count": element["vote_count"] }
                    list.push(movieInfo);
                });
                model.setData(list)
                $("#loading").addClass("d-none");



            }
        });
    },

    updatePages: function(pages) {
        this.pages = pages;
    },

    setData: function (data) {
        this.movieList = data;
        eventsMediator.emit("moviesLoaded");
    },


    getData: function () {
        return this.movieList;
    }

};


statsView = {
    clearStats: function () {
        document.getElementById('stats-parent').innerHTML = "";
    },
    render: function () {
        this.clearStats();
        const template = document.getElementById('stats').innerHTML;
        let [rating, name] = controller.getTopRatedMovie();
        let rendered = Mustache.render(template, { page: model.currentPage, rating: rating, top: name });
        document.getElementById('stats-parent').innerHTML += rendered;
    }
};


moviesView = {
    clearAll: function () {
        document.getElementById('parent').innerHTML = "";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    render: function () {
        this.clearAll();
        const template = document.getElementById('card-template').innerHTML;
        let currentMovies = controller.getAllMovies();
        console.log(currentMovies);
        for (let i = 0; i < currentMovies.length; i++) {

            let rendered = Mustache.render(template, { title: currentMovies[i]["title"], rating: currentMovies[i]["rating"], image: currentMovies[i]["picture"], dataid: i });
            document.getElementById('parent').innerHTML += rendered;
        }
    },

    movieClicked: function(thisMovie) {
        $(".bd-example-modal-lg").modal('show');
        let current = $(thisMovie).attr("data-id");

        let img = document.getElementById("modal-img");
        let title = document.getElementById("modal-title");
        let rating = document.getElementById("modal-rating");
        let desc = document.getElementById("modal-desc");
        
        let movie = controller.getMovie(current);

        img.src = movie["picture"];
        title.innerHTML = movie["title"];
        rating.innerHTML = "IMDB Rating: " + movie["rating"] + "/10 ("+movie["count"]+" votes)";
        desc.innerHTML = movie["overview"];


    }

};



controller = {
    init: function () {
        model.init();

        eventsMediator.on("moviesLoaded", function() {
            moviesView.render();
            statsView.render();

        });

        let next = document.getElementById("next");
        let prev = document.getElementById("prev");

        $(".container").on("click", ".movie-card", function() {
            eventsMediator.emit("movieClicked", this);
        });


        eventsMediator.on("movieClicked", moviesView.movieClicked)
        
        next.addEventListener("click", this.nextPage);
        prev.addEventListener("click", this.prevPage);
        

        eventsMediator.on("pageChanged", function() {
            model.init();
        });

    },

    nextPage: function () {

        if (model.currentPage == 1) {
            document.getElementById("prev").classList.remove("d-none");
        }

        model.currentPage = model.currentPage + 1;

        let current = model.currentPage;
        let max = model.pages;

        if (current == max) {
            this.classList.add("d-none");
        }

        eventsMediator.emit("pageChanged");


    },

    prevPage: function () {


        model.currentPage = model.currentPage - 1;

        let current = model.currentPage;
        let max = model.pages;


        if (current == 1) {
            this.classList.add("d-none");
        }


        if (current < max) {
            document.getElementById("next").classList.remove("d-none");
        }
        
        eventsMediator.emit("pageChanged");
        
    },

    getTopRatedMovie: function () {
        let currentPageMovies = model.movieList;
        let highest = currentPageMovies[0]["rating"];
        let highestname = currentPageMovies[0]["title"];
        for (let i = 1; i < currentPageMovies.length; i++) {
            if (currentPageMovies[i]["rating"] > highest) {
                highest = currentPageMovies[i]["rating"];
                highestname = currentPageMovies[i]["title"];
            }
        }
        return [highest, highestname];
    },

    getAllMovies: function() {
        return model.movieList;
    },

    getMovie: function(i) {
        return model.movieList[i];
    }

};




var eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};


controller.init()
