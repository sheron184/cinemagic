const { createApp, ref, nextTick } = Vue

function getData() {
    let movieElemVal = document.getElementById("movies").value;
    let tvElemVal = document.getElementById("tv").value;

    if (movieElemVal !== "" && tvElemVal !== "") {
        let moviesInp = JSON.parse(movieElemVal.replace(/(&quot\;)/g, "\""));
        let tvInp = JSON.parse(tvElemVal.replace(/(&quot\;)/g, "\""));

        return {
            tv: tvInp,
            movies: moviesInp
        }
    } else {
        return {
            tv: undefined,
            movies: undefined
        }
    }

}

function init() {
    let data = getData();

    if (data.movies === undefined || data.tv === undefined) {
        window.setTimeout(() => {
            init();
        }, 5);
    } else {
        const app = createApp({
            setup() {
                const renderComponent = ref(true);
                const movies = ref(data.movies);
                const tvshows = ref(data.tv);
                const loading = ref(false);
                const showMovies = ref(true);
                const showTvs = ref(false);


                let movieElem = document.getElementById("movies");

                const config = { attributes: true, childList: true, subtree: true };

                const callback = async (mutationList, observer) => {
                    for (const mutation of mutationList) {
                        if (mutation.type === "childList") {
                            renderComponent.value = false;
                            renderComponent.value = true;
                        } else if (mutation.type === "attributes") {
                            renderComponent.value = false;
                            renderComponent.value = true;
                        }
                    }
                };
                const observer = new MutationObserver(callback);

                observer.observe(movieElem, config);

                function displayMovies() {
                    showTvs.value = false;
                    showMovies.value = true;
                }

                function displayTv() {
                    console.log('tvs vue')
                    showMovies.value = false;
                    showTvs.value = true;
                }

                return {
                    movies,
                    tvshows,
                    loading,
                    renderComponent,
                    displayMovies,
                    displayTv,
                    showMovies,
                    showTvs
                }

            }
        });

        app.mount('#app');
    }
}

init();
