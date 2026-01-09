export async function loadView(viewName) {
    const response = await fetch(`static/js/views/${viewName}.html`);

    if (!response.ok) {
        return "<h1>ERROR 404 Page not found.</h1>";
    }

    return await response.text();
}
