import { loadView } from "./views/load_view.js";

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}

const router = async () => {
    const routes = [
        { path: "/", view: "main_menu"},
        { path: "/startGame", view: "game"},
        { path: "/setDifficulty", view: "set_difficulty"},
        { path: "/loadPlayerData", view: "load_player_data"},
        {path: "/gameDetails", view: "game_details"},
    ];

    // test each route for potential matches
    const potentialMatches = routes.map(route => {
        return {
            route,
            isMatch: location.pathname === route.path
        };
    });

    // store match
    let match = potentialMatches.find(m => m.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    await loadView(match.route.view);

}

window.addEventListener('popstate', router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if(e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    })
    router();
});