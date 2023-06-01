statsComponent = {
    currentPage: 1,
    pages: 10,

    init: function () {

        let next = document.getElementById("next");
        let prev = document.getElementById("prev");

        next.addEventListener("click", function() {statsComponent.nextPage(this)});
        prev.addEventListener("click", function () {statsComponent.prevPage(this)});


        const template = document.getElementById('stats').innerHTML;
        eventsMediator.on("moviesLoaded", function(data) {
            let [pages, movies] = data;
            statsComponent.updatePages(pages);
            let [rating, name] = statsComponent.getTopRatedMovie(movies);
            let rendered = Mustache.render(template, { page: statsComponent.currentPage, rating: rating, top: name });
            document.getElementById('stats-parent').innerHTML = rendered;    
        });
    },

    updatePages: function(pages) {
        this.pages = pages;
    },

    getTopRatedMovie: function (data) {
        let currentPageMovies = data;
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

    nextPage: function (button) {
        if (this.currentPage == 1) {
            document.getElementById("prev").classList.remove("d-none");
        }

        this.currentPage = this.currentPage + 1;

        let current = this.currentPage;
        let max = this.pages;

        if (current == max) {
            button.classList.add("d-none");
        }


        
        eventsMediator.emit("pageChanged", current);


    },

    prevPage: function (button) {


        this.currentPage = this.currentPage - 1;

        let current = this.currentPage;
        let max = this.pages;


        if (current == 1) {
            button.classList.add("d-none");
        }


        if (current < max) {
            document.getElementById("next").classList.remove("d-none");
        }
        
        eventsMediator.emit("pageChanged", this.currentPage);
        
    },


}


moviesComponent = {
    movieList: [],
    currentPage: 1,
    init: function () {

        let max = this.pages;
        let currentPage = 1;

        $(".container").on("click", ".movie-card", function() {
            moviesComponent.movieClicked(this);
        });


        eventsMediator.on("pageChanged", function(page) {
            moviesComponent.clearAll();
            moviesComponent.getMovies(page);
        });
        this.getMovies(currentPage);

    },

    getMovies: function(currentPage) {

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
                data['results'].forEach(element => {
                    movieInfo = { "title": element["title"], "overview": element["overview"], "picture": "https://image.tmdb.org/t/p/w500" + element["poster_path"], "rating": element["vote_average"], "count": element["vote_count"] }
                    list.push(movieInfo);
                });
                moviesComponent.setData(list, data['total_pages'])
                $("#loading").addClass("d-none");


            }
        });

    },


    setData: function (data, page) {
        this.movieList = data;
        eventsMediator.emit("moviesLoaded", [page, data]);
        this.render();
    },

    clearAll: function () {
        document.getElementById('parent').innerHTML = "";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    render: function () {
        const template = document.getElementById('card-template').innerHTML;
        let currentMovies = this.movieList;
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
        
        let movie = this.movieList[current];
        
        img.src = movie["picture"];
        title.innerHTML = movie["title"];
        rating.innerHTML = "IMDB Rating: " + movie["rating"] + "/10 ("+movie["count"]+" votes)";
        desc.innerHTML = movie["overview"];


    }

    
}



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


// controller.init()
statsComponent.init();
moviesComponent.init();

