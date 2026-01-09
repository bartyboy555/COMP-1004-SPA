// function for loading views into main page for router
export async function loadView(view) {
    const app = document.querySelector("#app");

    // load html for view
    const response = await fetch(`static/js/views/${view}.html`);

    if (!response.ok) {
        app.innerHTML = "<h1>ERROR 404 Page not found.</h1>";
    }

    app.innerHTML = await response.text();

    // load page specific javascript
   try {
    const jscheck = await fetch(`/static/js/views/${view}.js`, {
        method: "HEAD"
    });

    const contentType = jscheck.headers.get("content-type");

    // check if there is a js file before loading
    if (jscheck.ok && contentType?.includes("javascript")) {
        const module = await import(`/static/js/views/${view}.js`);
        module.default?.();
    }
   } catch {
    // if no js file do nothing
   }
}
