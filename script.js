const leftClick = document.getElementById("left");
const rightClick = document.getElementById("right");
const trendingMovie = document.getElementById("trendingMovie");
const movieGrid = document.getElementById("moviesGrid");

let scrollAmount = 0;

function displayMovies(movies,container){
    container.innerHTML = "";
    movies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container")
        const image = document.createElement("img");
        image.src = movie.poster;
        image.alt = movie.title;
        imageContainer.append(image);
        const title = document.createElement("h2")
        const rating = document.createElement("p");
        const getMoreDetailsBtn = document.createElement("button");
        getMoreDetailsBtn.classList.add("get-details");
        getMoreDetailsBtn.innerHTML = "Get More Details";
        title.textContent = movie.genre_names;
        rating.textContent = `⭐ ${movie.user_rating}`;
        card.append(imageContainer,title,rating,getMoreDetailsBtn)
        container.append(card)

        getMoreDetailsBtn.addEventListener("click", () => {
            showMovieDetails(movie)
        });
    });

const movieCard = document.querySelector(".movie-card");
const cardWidth = movieCard.offsetWidth;
const gap = parseInt(getComputedStyle(trendingMovie).gap);
scrollAmount = cardWidth + gap;
}

leftClick.addEventListener('click', () =>{
    updateArrows(trendingMovie,leftClick,rightClick)
    trendingMovie.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
    });
});

rightClick.addEventListener('click', () =>{
    updateArrows(trendingMovie,leftClick,rightClick)
    trendingMovie.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
    });
});

trendingMovie.addEventListener("scroll", () => {
    updateArrows(trendingMovie, leftClick, rightClick);
});

function updateArrows(container,leftArrow,rightArrow) {

    if (container.scrollLeft <= 1) {
        leftArrow.classList.add("arrow-hidden");
    } else {
        leftArrow.classList.remove("arrow-hidden");
    }

    if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 1
    ) {
        rightArrow.classList.add("arrow-hidden");
    } else {
        rightArrow.classList.remove("arrow-hidden");
    }
}

fetch(`https://api.watchmode.com/v1/list-titles/?apiKey=${API_KEY}&types=movie`);

const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${API_KEY}&types=movie`;

const trendingMovieCatch = localStorage.getItem("trendingMovie");
const CACHE_TIME = 30 * 24 * 60 *60 * 1000;

// trending movie ka section

if(trendingMovieCatch){
    const data = JSON.parse(trendingMovieCatch);
    const currentTime = Date.now();
    if(currentTime - data.time < CACHE_TIME){
        displayMovies(data.movies,trendingMovie);
    }
   
} else{
fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error(`Error html: ${response.status}`);
        }
        return response.json();
    })
    .then(async data => {
        const movies = data.titles.slice(0,10);

        const movieDetails = await Promise.all(
            movies.map(movie => {

                const detailUrl = `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${API_KEY}`;
                return fetch(detailUrl).then(response => response.json());
            })
        );

        const cacheData = {
            movies: movieDetails,
            time: Date.now()
        };
        localStorage.setItem(
            "trendingMovie",JSON.stringify(cacheData)
        );

        displayMovies(cacheData.movies,trendingMovie);

    }).catch(error => {
        console.log("Trending movies error:",error);
    });

}
// latest movies ka section 
const latestMovieCatch = localStorage.getItem("latestMovie");

if(latestMovieCatch){
    const data = JSON.parse(latestMovieCatch);

    const currentTime = Date.now();

    if(currentTime - data.time < CACHE_TIME){
        console.log("latest se catch aa raha hai...");
        displayMovies(data.movies,movieGrid);
    }
}else{

const latestUrl =
    `https://api.watchmode.com/v1/list-titles/?apiKey=${API_KEY}&types=movie&release_date_start=20260101&release_date_end=20260822&sort_by=release_date_desc`;

    fetch(latestUrl).then(response => {
        if(!response.ok){
            throw new Error(`Error html: ${response.status}`);    
        }
        return response.json();
    })
    .then(async data => {
        
        const latestMovies = data.titles.slice(10,20);

        const latestMoviesDetails = await Promise.all(
            latestMovies.map(movie => {
                const latestUrlDetail = 
                    `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${API_KEY}`;
                return fetch(latestUrlDetail).then(response => response.json());
            })
        );

        const cacheData = {
            movies: latestMoviesDetails,
            time: Date.now()
        }
        localStorage.setItem(
            "movieGrid",JSON.stringify(cacheData)

        );
            displayMovies(cacheData.movies,movieGrid);

    }).catch(error => {
        console.log(`Latest movies error:`, error);
    });

}

// search movie ka section
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchMovie = document.getElementById("searchMovie");
const searchResults = document.getElementById("searchResults");

async function searchMovies() {
    const searchValue = searchInput.value.trim();
    if(searchValue === '') return;

    const cacheKey = `search_${searchValue.toLowerCase()}`;
    const cachedSearch = localStorage.getItem(cacheKey);

    if(cachedSearch){
        const cacheData = JSON.parse(cachedSearch);
        const currentTime = Date.now();
        if(currentTime - cacheData.time < CACHE_TIME){
        console.log("Search cache se data aa raha hai");

        searchMovie.innerHTML = "";
        searchResults.style.display = "block";

        displayMovies(cacheData.movies, searchMovie);

        searchInput.value = "";
            return;
        }  
    }
        console.log("Search API se data aa raha hai");


    const searchUrl =
    `https://api.watchmode.com/v1/search/?apiKey=${API_KEY}&search_field=name&search_value=${encodeURIComponent(searchValue)}&types=movie`;

    try{
        const response = await fetch(searchUrl);
        if(!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();

        const results = data.title_results.slice(0,10);
        const searchMovieDetails = await Promise.all(
            results.map(movie => {
                const detailSearchUrl = 
                `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${API_KEY}`;
                return fetch(detailSearchUrl).then(response => response.json());
            })
        );
        const cacheData = {
            movies: searchMovieDetails,
            time: Date.now()
        };

        localStorage.setItem(
        cacheKey,
        JSON.stringify(cacheData)
        );
        searchMovie.innerHTML = "";
        searchResults.style.display = 'block';
        displayMovies(searchMovieDetails, searchMovie);
        searchInput.value = "";
    }
    catch(error){
        console.log("Search error:",error);
    }

}

searchBtn.addEventListener("click", searchMovies);

searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchMovies();
    }

});


// search arrow key
const searchLeftClick = document.getElementById("searchLeft");
const searchRightClick = document.getElementById("searchRight");

searchLeftClick.addEventListener('click',() => {
    searchMovie.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
     });
});
searchRightClick.addEventListener('click',() => {
    searchMovie.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
     });
});

searchMovie.addEventListener("scroll", () => {
    updateArrows(searchMovie, searchLeftClick, searchRightClick);
});

// latest arrow key
const latestLeftClick = document.getElementById("latestLeft");
const latestRightClick = document.getElementById("latestRight");

latestLeftClick.addEventListener('click',() => {
    movieGrid.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
     });
});
latestRightClick.addEventListener('click',() => {
    movieGrid.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
     });
});

movieGrid.addEventListener("scroll", () => {
    updateArrows(movieGrid, latestLeftClick, latestRightClick);
});

// show one movie in details 
const movieDetailContainer = document.querySelector(".movie-detail-container")
const movieDetailOverlay = document.getElementById("movieDetailOverlay");
const movieDetailContent = document.getElementById("movieDetailContent");
const closeDetail = document.getElementById("closeDetail");

function showMovieDetails(movie){
    movieDetailContent.innerHTML = "";

    const details = document.createElement("div");
    details.className = "details";
    const image = document.createElement("div");
    image.className = "image";
    const poster = document.createElement("img");
    poster.src = movie.poster;
    poster.alt = "Image title";
    image.appendChild(poster);
    
    const description = document.createElement("div");
    description.className = "description";
    const name = document.createElement("h3");

    name.textContent = movie.title;
    const releaseDate = document.createElement("p");
    releaseDate.textContent = `Release Date :-  ${movie.release_date} `;
    const userRating = document.createElement("p");
    userRating.textContent = `Movie rating :-  ⭐ ${movie.user_rating}`;
    const runtime = document.createElement("p");
    runtime.textContent = `Duration :-  ${movie.runtime_minutes} Minutes`;
    const typeOfAudience = document.createElement("p");
    typeOfAudience.innerText = `Audience :-  ${movie.will_you_like_this}`;
    const location = document.createElement("div");
    location.className = "location";

    const trailer = document.createElement("div");
    trailer.className = "movie-link";

    const trailerLink = document.createElement("a");
    if (movie.trailer) {

        trailerLink.textContent = "Trailer";
        trailerLink.href = movie.trailer;
        trailerLink.target = "_blank";
    } else {
        trailerLink.textContent = "Trailer not available";
    }

trailer.append(trailerLink);
    const streaming = document.createElement("div");
    streaming.className = "movie-link";
    const streamingLink = document.createElement("a");
    if (movie.network_names?.length > 0) {
        streamingLink.textContent = movie.network_names.join(", ");
    } else {
        streamingLink.textContent = "Streaming info not available";
    }
    streaming.append(streamingLink);
    location.append(trailer,streaming);

    description.append(
        name,releaseDate,userRating,runtime,typeOfAudience,location
    );

    details.append(image,description);
    movieDetailContent.appendChild(details);
    movieDetailOverlay.style.display = "flex";   
}

closeDetail.addEventListener('click', () => {
    movieDetailOverlay.style.display = "none";   
})

